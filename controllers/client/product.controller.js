const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const productsHelper = require("../../helpers/products.js");
const paginationHelper = require("../../helpers/pagination.js");
const Account = require('../../models/account.model');

//[GET] /products
module.exports.index = async (req, res) => {
    let initPagination = {
        currentPage: 1,
        limitItems: 8
    }

    const count = await Product.countDocuments({
        deleted: false,
        status: "active"
    });

    const objectPagination = paginationHelper(initPagination, req.query, count);

    const products = await Product.find({
        deleted: false,
        status: "active"
    })
    .sort({ position: "desc" })
    .skip(objectPagination.skip)
    .limit(objectPagination.limitItems);

    const newProducts = productsHelper.priceNewProducts(products);

    res.render("client/pages/products/index.pug", {
        pageTitle: "Danh sách sản phẩm",
        products: newProducts,
        pagination: objectPagination
    })
}

//[GET] /products/:slugCategory
module.exports.category = async (req, res) => {
    let initPagination = {
        currentPage: 1,
        limitItems: 4
    }

    const slugCategory = req.params.slugCategory;

    const category = await ProductCategory.findOne({
        slug: slugCategory,
        deleted: false,
        status: "active"
    });

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

    const count = await Product.countDocuments({
        product_category_id: { $in: [category.id, ...listSubCategoryId] },
        status: "active",
        deleted: false
    });

    const objectPagination = paginationHelper(initPagination, req.query, count);

    const products = await Product.find({
        product_category_id: { $in: [category.id, ...listSubCategoryId] },
        status: "active",
        deleted: false
    })
    .sort({ position: "desc"})
    .skip(objectPagination.skip)
    .limit(objectPagination.limitItems);

    const newProducts = productsHelper.priceNewProducts(products);

    res.render("client/pages/products/index.pug", {
        pageTitle: category.title,
        products: newProducts,
        pagination: objectPagination
    })
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