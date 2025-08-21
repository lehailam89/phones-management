const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const productsHelper = require("../../helpers/products.js");
const paginationHelper = require("../../helpers/pagination.js");
const Account = require('../../models/account.model');

//[GET] /products
module.exports.index = async (req, res) => {
    try {
        // Build filter query
        let filter = {
            deleted: false,
            status: "active"
        };

        // Category filter với hỗ trợ danh mục cha-con
        if (req.query.category && req.query.category !== 'all') {
            const selectedCategory = await ProductCategory.findOne({
                _id: req.query.category,
                deleted: false,
                status: 'active'
            });
            
            if (selectedCategory) {
                // Tìm tất cả danh mục con (recursive)
                const getSubCategories = async (parentId) => {
                    const subs = await ProductCategory.find({
                        parent_id: parentId,
                        status: "active",
                        deleted: false,
                    });

                    let allSubs = [...subs];
                    for (const sub of subs) {
                        const childSubs = await getSubCategories(sub._id);
                        allSubs = allSubs.concat(childSubs);
                    }
                    return allSubs;
                };
                
                const subCategories = await getSubCategories(req.query.category);
                const categoryIds = [req.query.category, ...subCategories.map(cat => cat._id)];
                
                filter.product_category_id = { $in: categoryIds };
            }
        }

        // Search keyword
        if (req.query.keyword) {
            filter.$or = [
                { title: new RegExp(req.query.keyword, 'i') },
                { description: new RegExp(req.query.keyword, 'i') }
            ];
        }

        // Sort options - Sắp xếp TRƯỚC khi phân trang
        let sort = {};
        let needsPriceSort = false;

        switch (req.query.sort) {
            case 'price_asc':
            case 'price_desc':
                // Đánh dấu cần sort theo giá sau khi tính discount
                needsPriceSort = true;
                break;
            case 'name_asc':
                sort = { title: 1 };
                break;
            case 'name_desc':
                sort = { title: -1 };
                break;
            case 'newest':
                sort = { createdAt: -1 };
                break;
            default:
                sort = { position: "desc" };
        }

        let allProducts = [];
        
        if (needsPriceSort) {
            // Nếu cần sort theo giá, lấy TẤT CẢ sản phẩm trước
            const allProductsRaw = await Product.find(filter)
                .populate('product_category_id');
                
            // Tính giá mới cho tất cả sản phẩm
            const allProductsWithPrice = productsHelper.priceNewProducts(allProductsRaw);
            
            // Sort theo giá mới
            if (req.query.sort === 'price_asc') {
                allProductsWithPrice.sort((a, b) => parseInt(a.priceNew) - parseInt(b.priceNew));
            } else if (req.query.sort === 'price_desc') {
                allProductsWithPrice.sort((a, b) => parseInt(b.priceNew) - parseInt(a.priceNew));
            }
            
            allProducts = allProductsWithPrice;
        } else {
            // Sort bình thường trong database
            allProducts = await Product.find(filter)
                .populate('product_category_id')
                .sort(sort);
            
            // Tính giá mới
            allProducts = productsHelper.priceNewProducts(allProducts);
        }

        // Count total
        const totalProducts = allProducts.length;

        // Pagination sau khi đã sort
        let initPagination = {
            currentPage: 1,
            limitItems: 8
        };

        const objectPagination = paginationHelper(initPagination, req.query, totalProducts);

        // Lấy sản phẩm cho trang hiện tại
        const startIndex = objectPagination.skip;
        const endIndex = startIndex + objectPagination.limitItems;
        const paginatedProducts = allProducts.slice(startIndex, endIndex);

        // Get categories for filter
        const categories = await ProductCategory.find({
            deleted: false,
            status: "active"
        }).select('title parent_id').sort({ title: 1 });

        res.render("client/pages/products/index.pug", {
            pageTitle: "Danh sách sản phẩm",
            products: paginatedProducts,
            pagination: objectPagination,
            categories: categories,
            currentFilters: req.query,
            totalProducts: totalProducts
        });

    } catch (error) {
        console.error('Error in products index:', error);
        res.redirect("/");
    }
}

//[GET] /products/:slugCategory
module.exports.category = async (req, res) => {
    try {
        let initPagination = {
            currentPage: 1,
            limitItems: 8
        }

        const slugCategory = req.params.slugCategory;

        const category = await ProductCategory.findOne({
            slug: slugCategory,
            deleted: false,
            status: "active"
        });

        if (!category) {
            return res.redirect('/products');
        }

        const getSubCategory = async (parentId) => {
            const subs = await ProductCategory.find({
                parent_id: parentId,
                status: "active",
                deleted: false,
            });

            let allSub = [...subs];

            for (const sub of subs) {
                const childs = await getSubCategory(sub.id);
                allSub = allSub.concat(childs);
            }

            return allSub;
        } 
        
        const listSubCategory = await getSubCategory(category.id);
        const listSubCategoryId = listSubCategory.map(item => item.id);

        // Build filter cho category page
        let filter = {
            product_category_id: { $in: [category.id, ...listSubCategoryId] },
            status: "active",
            deleted: false
        };

        // Handle search and sort từ query params
        if (req.query.keyword) {
            filter.$or = [
                { title: new RegExp(req.query.keyword, 'i') },
                { description: new RegExp(req.query.keyword, 'i') }
            ];
        }

        const count = await Product.countDocuments(filter);
        const objectPagination = paginationHelper(initPagination, req.query, count);

        // Get products without initial sort
        let products = await Product.find(filter)
            .populate('product_category_id')
            .skip(objectPagination.skip)
            .limit(objectPagination.limitItems);

        // Calculate new prices first
        const newProducts = productsHelper.priceNewProducts(products);

        // Sort by priceNew or other criteria
        switch (req.query.sort) {
            case 'price_asc':
                newProducts.sort((a, b) => parseInt(a.priceNew) - parseInt(b.priceNew));
                break;
            case 'price_desc':
                newProducts.sort((a, b) => parseInt(b.priceNew) - parseInt(a.priceNew));
                break;
            case 'name_asc':
                newProducts.sort((a, b) => a.title.localeCompare(b.title, 'vi'));
                break;
            case 'name_desc':
                newProducts.sort((a, b) => b.title.localeCompare(a.title, 'vi'));
                break;
            case 'newest':
                newProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
                break;
            default:
                newProducts.sort((a, b) => (b.position || 0) - (a.position || 0));
        }

        // Get all categories for filter dropdown
        const categories = await ProductCategory.find({
            deleted: false,
            status: "active"
        }).select('title parent_id').sort({ title: 1 });

        res.render("client/pages/products/index.pug", {
            pageTitle: category.title,
            products: newProducts,
            pagination: objectPagination,
            categories: categories, // Thêm categories
            currentFilters: req.query || {}, // Thêm currentFilters
            totalProducts: count // Thêm totalProducts
        });

    } catch (error) {
        console.error('Error in category controller:', error);
        res.redirect("/products");
    }
}

//[GET] /products/detail/:slugProduct
module.exports.detail = async (req, res) => {
    try {
        const slug = req.params.slugProduct;
        // console.log("=== DEBUG: Searching for product with slug:", slug);

        let product = await Product.findOne({
            slug: slug,
            deleted: false,
            status: "active"
        }).populate('comments.user', 'fullName');

        // Nếu không tìm thấy bằng slug, thử tìm bằng ID (fallback)
        if (!product && slug) {
            // console.log("Product not found by slug, trying to find by ID...");
            product = await Product.findOne({
                _id: slug,
                deleted: false,
                status: "active"
            }).populate('comments.user', 'fullName');
        }

        if (!product) {
            // console.log("Product not found - redirecting to home");
            return res.redirect('/');
        }

        // console.log("Product found:", product.title, "Slug:", product.slug);

        if (product.product_category_id) {
            const category = await ProductCategory.findOne({
                _id: product.product_category_id,
                deleted: false,
                status: "active"
            });
            if (category) {
                product.category = category;
            }
        }

        product.priceNew = productsHelper.priceNewProduct(product);

        res.render("client/pages/products/detail", {
            pageTitle: 'Chi tiết sản phẩm',
            product
        });
    } catch (error) {
        console.log("Error in product detail:", error);
        res.redirect("/");
    }

}

module.exports.addComment = async (req, res) => {
    try {
        const productId = req.params.id;
        const { content } = req.body;

        const product = await Product.findById(productId);
        if (!product) {
            req.flash('error', 'Sản phẩm không tồn tại');
            return res.redirect('back');
        }

        const comment = {
            user: req.user._id,
            content: content
        };

        product.comments.push(comment);
        await product.save();

        req.flash('success', 'Bình luận thành công');
        res.redirect(`/products/detail/${product.slug}`);
    } catch (error) {
        console.error(error);
        req.flash('error', 'Có lỗi xảy ra');
        res.redirect('back');
    }
};