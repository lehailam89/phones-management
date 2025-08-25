const Product = require('../models/product.model');
const ProductCategory = require('../models/product-category.model');
const Blog = require('../models/post.model');
const SettingGeneral = require('../models/settings-general.model');
const User = require('../models/user.model');

class RAGHelper {
    // Định nghĩa các preset limit
    static LIMITS = {
        DEFAULT: 5,
        PRICE_SEARCH: 8,
        PROMOTION: 10,
        COMPARISON: 3,
        FEATURED: 6
    };

    // Tìm kiếm sản phẩm theo từ khóa với nhiều tiêu chí
    static async searchProducts(keyword, limit = this.LIMITS.DEFAULT, filters = {}) {
        try {
            let query = {
                deleted: false,
                status: 'active'
            };

            // Tìm kiếm theo từ khóa
            if (keyword && keyword.trim()) {
                const regex = new RegExp(keyword.trim(), 'i');
                query.$or = [
                    { title: regex },
                    { description: regex }
                ];
            }

            // Lọc theo khoảng giá
            if (filters.minPrice || filters.maxPrice) {
                query.price = {};
                if (filters.minPrice) query.price.$gte = filters.minPrice;
                if (filters.maxPrice) query.price.$lte = filters.maxPrice;
            }

            // Lọc theo danh mục
            if (filters.categoryId) {
                query.product_category_id = filters.categoryId;
            }

            const products = await Product.find(query)
                .populate('product_category_id')
                .sort(filters.sortBy || { position: 'desc' })
                .limit(limit)
                .select('title price discountPercentage stock description thumbnail slug featured');

            return products.map(product => {
                const discountPrice = product.discountPercentage > 0 
                    ? product.price * (1 - product.discountPercentage / 100)
                    : product.price;
                
                return {
                    name: product.title,
                    price: product.price,
                    discountPrice: Math.round(discountPrice),
                    discountPercentage: product.discountPercentage,
                    stock: product.stock,
                    description: product.description,
                    image: product.thumbnail,
                    slug: product.slug,
                    category: product.product_category_id?.title || 'Chưa phân loại',
                    featured: product.featured === '1',
                    available: product.stock > 0
                };
            });
        } catch (error) {
            console.error('Error searching products:', error);
            return [];
        }
    }

    // Lấy sản phẩm theo các tiêu chí đặc biệt
    static async getSpecialProducts(type, limit = 5) {
        try {
            let query = { deleted: false, status: 'active' };
            let sort = {};

            switch (type) {
                case 'featured':
                    query.featured = '1';
                    sort = { position: 'desc' };
                    break;
                case 'newest':
                    sort = { createdAt: -1 };
                    break;
                case 'bestseller':
                case 'popular':
                    sort = { position: 'desc' };
                    break;
                case 'cheapest':
                    sort = { price: 1 };
                    break;
                case 'expensive':
                    sort = { price: -1 };
                    break;
                case 'sale':
                    query.discountPercentage = { $gt: 0 };
                    sort = { discountPercentage: -1 };
                    break;
                default:
                    sort = { position: 'desc' };
            }

            const products = await Product.find(query)
                .populate('product_category_id')
                .sort(sort)
                .limit(limit)
                .select('title price discountPercentage stock description thumbnail slug');

            return this.formatProductData(products);
        } catch (error) {
            console.error('Error getting special products:', error);
            return [];
        }
    }

    // Format dữ liệu sản phẩm
    static formatProductData(products) {
        return products.map(product => {
            const discountPrice = product.discountPercentage > 0 
                ? product.price * (1 - product.discountPercentage / 100)
                : product.price;
            
            return {
                name: product.title,
                price: product.price,
                discountPrice: Math.round(discountPrice),
                discountPercentage: product.discountPercentage,
                savings: product.price - Math.round(discountPrice),
                stock: product.stock,
                description: product.description?.substring(0, 150) + (product.description?.length > 150 ? '...' : ''),
                image: product.thumbnail,
                slug: product.slug,
                category: product.product_category_id?.title || 'Chưa phân loại',
                available: product.stock > 0
            };
        });
    }

    // So sánh sản phẩm
    static async compareProducts(productNames) {
        try {
            const products = [];
            for (const name of productNames) {
                const regex = new RegExp(name.trim(), 'i');
                const product = await Product.findOne({
                    title: regex,
                    deleted: false,
                    status: 'active'
                }).populate('product_category_id');
                
                if (product) {
                    products.push(product);
                }
            }

            return this.formatProductData(products);
        } catch (error) {
            console.error('Error comparing products:', error);
            return [];
        }
    }

    // Lấy thông tin danh mục với số lượng sản phẩm
    static async getCategories() {
        try {
            const categories = await ProductCategory.find({
                deleted: false,
                status: 'active'
            }).select('title description');

            const categoriesWithCount = [];
            for (const category of categories) {
                const productCount = await Product.countDocuments({
                    product_category_id: category._id,
                    deleted: false,
                    status: 'active'
                });

                categoriesWithCount.push({
                    id: category._id,
                    name: category.title,
                    description: category.description,
                    productCount: productCount
                });
            }

            return categoriesWithCount;
        } catch (error) {
            console.error('Error getting categories:', error);
            return [];
        }
    }

    // Tìm kiếm bài viết blog chi tiết
    static async searchBlogs(keyword, limit = 3) {
        try {
            const regex = new RegExp(keyword, 'i');
            const blogs = await Blog.find({
                $or: [
                    { title: regex },
                    { content: regex }
                ],
                deleted: false,
                status: 'published'
            })
            .sort({ createdAt: -1 })
            .limit(limit)
            .select('title content slug createdAt');

            return blogs.map(blog => ({
                title: blog.title,
                content: blog.content.substring(0, 300) + '...',
                slug: blog.slug,
                date: blog.createdAt,
                url: `/blogs/${blog.slug}`
            }));
        } catch (error) {
            console.error('Error searching blogs:', error);
            return [];
        }
    }

    // Lấy thống kê cửa hàng
    static async getStoreStats() {
        try {
            const totalProducts = await Product.countDocuments({ deleted: false, status: 'active' });
            const totalCategories = await ProductCategory.countDocuments({ deleted: false, status: 'active' });
            const outOfStock = await Product.countDocuments({ deleted: false, status: 'active', stock: 0 });
            const onSale = await Product.countDocuments({ deleted: false, status: 'active', discountPercentage: { $gt: 0 } });

            return {
                totalProducts,
                totalCategories,
                outOfStock,
                onSale,
                inStock: totalProducts - outOfStock
            };
        } catch (error) {
            console.error('Error getting store stats:', error);
            return null;
        }
    }

    // Lấy thông tin cửa hàng chi tiết
    static async getStoreInfo() {
        try {
            const settings = await SettingGeneral.findOne({});
            const stats = await this.getStoreStats();
            
            return settings ? {
                name: settings.websiteName || 'Lâm Mobile',
                phone: settings.phone || 'Chưa cập nhật',
                email: settings.email || 'Chưa cập nhật',
                address: settings.address || 'Chưa cập nhật',
                logo: settings.logo,
                copyright: settings.copyright,
                stats: stats
            } : {
                name: 'Lâm Mobile',
                phone: 'Chưa cập nhật',
                email: 'Chưa cập nhật',
                address: 'Chưa cập nhật',
                stats: stats
            };
        } catch (error) {
            console.error('Error getting store info:', error);
            return {
                name: 'Lâm Mobile',
                phone: 'Chưa cập nhật',
                email: 'Chưa cập nhật',
                address: 'Chưa cập nhật'
            };
        }
    }

    // Phân tích intent chi tiết hơn
    static analyzeIntent(message) {
        const lowerMessage = message.toLowerCase();
        
        // Intent tìm kiếm sản phẩm cụ thể
        if (lowerMessage.includes('tìm') || lowerMessage.includes('có') || 
            lowerMessage.includes('điện thoại') || lowerMessage.includes('phone') ||
            lowerMessage.includes('iphone') || lowerMessage.includes('samsung') ||
            lowerMessage.includes('xiaomi') || lowerMessage.includes('oppo') ||
            lowerMessage.includes('vivo') || lowerMessage.includes('realme')) {
            return 'search_product';
        }

        // Intent hỏi về giá cả
        if (lowerMessage.includes('giá') || lowerMessage.includes('bao nhiêu') ||
            lowerMessage.includes('tiền') || lowerMessage.includes('cost') ||
            lowerMessage.includes('rẻ') || lowerMessage.includes('đắt')) {
            return 'price_inquiry';
        }

        // Intent so sánh sản phẩm
        if (lowerMessage.includes('so sánh') || lowerMessage.includes('khác') ||
            lowerMessage.includes('nào tốt hơn') || lowerMessage.includes('chọn') ||
            lowerMessage.includes('compare') || lowerMessage.includes('vs')) {
            return 'product_comparison';
        }

        // Intent khuyến mãi/giảm giá
        if (lowerMessage.includes('khuyến mãi') || lowerMessage.includes('giảm giá') ||
            lowerMessage.includes('sale') || lowerMessage.includes('ưu đãi') ||
            lowerMessage.includes('discount') || lowerMessage.includes('promotion')) {
            return 'promotion_inquiry';
        }

        // Intent tồn kho
        if (lowerMessage.includes('còn hàng') || lowerMessage.includes('tồn kho') ||
            lowerMessage.includes('available') || lowerMessage.includes('stock') ||
            lowerMessage.includes('hết hàng')) {
            return 'stock_inquiry';
        }

        // Intent thông tin cửa hàng
        if (lowerMessage.includes('địa chỉ') || lowerMessage.includes('liên hệ') ||
            lowerMessage.includes('số điện thoại') || lowerMessage.includes('email') ||
            lowerMessage.includes('cửa hàng') || lowerMessage.includes('shop')) {
            return 'store_info';
        }

        // Intent về danh mục
        if (lowerMessage.includes('loại') || lowerMessage.includes('danh mục') ||
            lowerMessage.includes('phân loại') || lowerMessage.includes('category')) {
            return 'category_info';
        }

        // Intent hỏi về bài viết/hướng dẫn
        if (lowerMessage.includes('hướng dẫn') || lowerMessage.includes('cách') ||
            lowerMessage.includes('review') || lowerMessage.includes('đánh giá') ||
            lowerMessage.includes('bài viết') || lowerMessage.includes('blog')) {
            return 'blog_search';
        }

        // Intent về giao hàng/thanh toán
        if (lowerMessage.includes('giao hàng') || lowerMessage.includes('ship') ||
            lowerMessage.includes('thanh toán') || lowerMessage.includes('payment') ||
            lowerMessage.includes('mua') || lowerMessage.includes('order')) {
            return 'purchase_info';
        }

        // Intent về bảo hành/hỗ trợ
        if (lowerMessage.includes('bảo hành') || lowerMessage.includes('warranty') ||
            lowerMessage.includes('hỗ trợ') || lowerMessage.includes('support') ||
            lowerMessage.includes('sửa chữa') || lowerMessage.includes('lỗi')) {
            return 'support_info';
        }

        // Intent về sản phẩm mới/nổi bật
        if (lowerMessage.includes('mới') || lowerMessage.includes('hot') ||
            lowerMessage.includes('nổi bật') || lowerMessage.includes('bestseller') ||
            lowerMessage.includes('popular') || lowerMessage.includes('trending')) {
            return 'featured_products';
        }

        return 'general';
    }

    // Trích xuất từ khóa và thông tin chi tiết
    static extractKeywords(message) {
        const lowerMessage = message.toLowerCase();
        
        // Trích xuất thương hiệu
        const brands = ['iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'realme', 'nokia', 'huawei'];
        const foundBrands = brands.filter(brand => lowerMessage.includes(brand));
        
        // Trích xuất khoảng giá
        const pricePatterns = [
            /(\d+)\s*triệu/g,
            /dưới\s*(\d+)/g,
            /trên\s*(\d+)/g,
            /từ\s*(\d+)\s*đến\s*(\d+)/g
        ];
        
        let priceInfo = {};
        pricePatterns.forEach(pattern => {
            const matches = lowerMessage.match(pattern);
            if (matches) {
                // Xử lý thông tin giá
                if (lowerMessage.includes('dưới')) {
                    priceInfo.maxPrice = parseInt(matches[0].replace(/\D/g, '')) * 1000000;
                } else if (lowerMessage.includes('trên')) {
                    priceInfo.minPrice = parseInt(matches[0].replace(/\D/g, '')) * 1000000;
                } else if (lowerMessage.includes('từ') && lowerMessage.includes('đến')) {
                    const numbers = matches[0].match(/\d+/g);
                    if (numbers && numbers.length >= 2) {
                        priceInfo.minPrice = parseInt(numbers[0]) * 1000000;
                        priceInfo.maxPrice = parseInt(numbers[1]) * 1000000;
                    }
                }
            }
        });

        // Loại bỏ stop words và từ khóa đặc biệt
        const stopWords = ['là', 'của', 'và', 'có', 'cho', 'tôi', 'bạn', 'này', 'đó', 'được', 'sẽ', 'với', 'trong', 'một', 'các', 'để', 'như', 'khi', 'nào', 'thì'];
        const words = message.toLowerCase()
            .replace(/[^\w\s]/g, ' ')
            .split(/\s+/)
            .filter(word => word.length > 2 && !stopWords.includes(word) && !brands.includes(word));
        
        return {
            keywords: words.join(' '),
            brands: foundBrands,
            priceInfo: priceInfo
        };
    }

    // Tổng hợp context chi tiết cho AI
    static async buildContext(message, conversationHistory = []) {
        const intent = this.analyzeIntent(message);
        const { keywords, brands, priceInfo } = this.extractKeywords(message);
        
        // Phân tích ngữ cảnh từ lịch sử cuộc trò chuyện
        const contextFromHistory = this.analyzeConversationContext(conversationHistory);
        
        let context = {};

        try {
            switch (intent) {
                case 'search_product':
                    // Ưu tiên thương hiệu từ lịch sử nếu tin nhắn hiện tại không rõ ràng
                    let searchKeyword = brands.length > 0 ? brands[0] : keywords;
                    if (!searchKeyword && contextFromHistory.recentBrands.length > 0) {
                        searchKeyword = contextFromHistory.recentBrands[0];
                    }
                    context.products = await this.searchProducts(searchKeyword, 5, priceInfo);
                    if (brands.length > 0) {
                        context.searchBrand = brands[0];
                    }
                    // Thêm thông tin từ ngữ cảnh
                    context.conversationContext = contextFromHistory;
                    break;

                case 'price_inquiry':
                    // Kết hợp thông tin giá từ tin nhắn hiện tại và lịch sử
                    const combinedPriceInfo = {
                        ...contextFromHistory.priceRanges,
                        ...priceInfo
                    };
                    if (combinedPriceInfo.minPrice || combinedPriceInfo.maxPrice) {
                        context.products = await this.searchProducts('', 8, combinedPriceInfo);
                        context.priceRange = combinedPriceInfo;
                    } else {
                        const searchTerm = keywords || contextFromHistory.recentProducts[0] || '';
                        context.products = await this.searchProducts(searchTerm, 5);
                    }
                    break;

                case 'product_comparison':
                    // Trích xuất tên sản phẩm từ tin nhắn hiện tại và lịch sử
                    let productNames = message.match(/[a-zA-Z0-9\s]+/g)?.filter(name => 
                        name.length > 3 && !['so sánh', 'với', 'và', 'hay', 'tốt hơn'].includes(name.toLowerCase())
                    ) || [];
                    
                    // Nếu không đủ sản phẩm, lấy từ lịch sử
                    if (productNames.length < 2 && contextFromHistory.recentProducts.length > 0) {
                        productNames = [...productNames, ...contextFromHistory.recentProducts];
                    }
                    
                    if (productNames.length >= 2) {
                        context.comparisonProducts = await this.compareProducts(productNames.slice(0, 3));
                    } else {
                        context.products = await this.searchProducts(keywords, 3);
                    }
                    break;

                case 'promotion_inquiry':
                    context.saleProducts = await this.getSpecialProducts('sale', 8);
                    break;

                case 'stock_inquiry':
                    context.products = await this.searchProducts(keywords, 5);
                    context.storeStats = await this.getStoreStats();
                    break;

                case 'store_info':
                    context.storeInfo = await this.getStoreInfo();
                    break;

                case 'category_info':
                    context.categories = await this.getCategories();
                    break;

                case 'blog_search':
                    context.blogs = await this.searchBlogs(keywords, 5);
                    break;

                case 'featured_products':
                    context.featuredProducts = await this.getSpecialProducts('featured', 6);
                    context.newestProducts = await this.getSpecialProducts('newest', 6);
                    break;

                case 'purchase_info':
                    context.storeInfo = await this.getStoreInfo();
                    context.policies = {
                        shipping: 'Giao hàng toàn quốc, freeship đơn từ 500k',
                        payment: 'Thanh toán COD, chuyển khoản, thẻ tín dụng',
                        return: 'Đổi trả trong 7 ngày nếu lỗi nhà sản xuất'
                    };
                    break;

                case 'support_info':
                    context.storeInfo = await this.getStoreInfo();
                    context.support = {
                        warranty: 'Bảo hành chính hãng 12 tháng',
                        repair: 'Hỗ trợ sửa chữa tại cửa hàng',
                        hotline: context.storeInfo?.phone || '1900-xxxx'
                    };
                    break;

                default:
                    context.storeInfo = await this.getStoreInfo();
                    context.featuredProducts = await this.getSpecialProducts('featured', 3);
                    context.categories = await this.getCategories();
                    // Thêm ngữ cảnh từ lịch sử
                    context.conversationContext = contextFromHistory;
                    break;
            }

            // Thêm thông tin bổ sung
            context.intent = intent;
            context.extractedInfo = { keywords, brands, priceInfo };
            context.historyContext = contextFromHistory;

        } catch (error) {
            console.error('Error building context:', error);
            context = {
                error: 'Có lỗi xảy ra khi tải thông tin',
                storeInfo: await this.getStoreInfo(),
                conversationContext: contextFromHistory
            };
        }

        return { intent, context };
    }

    // Phân tích ngữ cảnh từ lịch sử cuộc trò chuyện
    static analyzeConversationContext(conversationHistory) {
        if (!conversationHistory || conversationHistory.length === 0) {
            return {
                recentProducts: [],
                recentBrands: [],
                priceRanges: {},
                topics: [],
                userPreferences: {}
            };
        }

        const recentProducts = [];
        const recentBrands = [];
        const topics = [];
        let priceRanges = {};
        const userPreferences = {};

        // Phân tích 10 tin nhắn gần nhất
        const recentMessages = conversationHistory.slice(-10);
        
        recentMessages.forEach(msg => {
            if (msg.role === 'user') {
                const content = msg.content.toLowerCase();
                
                // Trích xuất tên sản phẩm đã đề cập
                const productMatches = content.match(/(iphone|samsung|xiaomi|oppo|vivo|realme|nokia|huawei)[\s\w]*/g);
                if (productMatches) {
                    productMatches.forEach(product => {
                        if (!recentProducts.includes(product) && recentProducts.length < 5) {
                            recentProducts.push(product);
                        }
                    });
                }

                // Trích xuất thương hiệu
                const brands = ['iphone', 'samsung', 'xiaomi', 'oppo', 'vivo', 'realme', 'nokia', 'huawei'];
                brands.forEach(brand => {
                    if (content.includes(brand) && !recentBrands.includes(brand)) {
                        recentBrands.push(brand);
                    }
                });

                // Trích xuất khoảng giá
                const priceMatches = content.match(/(\d+)\s*triệu/g);
                if (priceMatches) {
                    priceMatches.forEach(match => {
                        const price = parseInt(match.replace(/\D/g, '')) * 1000000;
                        if (content.includes('dưới')) {
                            priceRanges.maxPrice = price;
                        } else if (content.includes('trên')) {
                            priceRanges.minPrice = price;
                        }
                    });
                }

                // Phân tích chủ đề quan tâm
                if (content.includes('gaming') || content.includes('chơi game')) {
                    topics.push('gaming');
                }
                if (content.includes('camera') || content.includes('chụp ảnh')) {
                    topics.push('photography');
                }
                if (content.includes('pin') || content.includes('battery')) {
                    topics.push('battery');
                }
                if (content.includes('học sinh') || content.includes('sinh viên')) {
                    userPreferences.userType = 'student';
                }
            }
        });

        return {
            recentProducts: [...new Set(recentProducts)],
            recentBrands: [...new Set(recentBrands)],
            priceRanges,
            topics: [...new Set(topics)],
            userPreferences
        };
    }
}

module.exports = RAGHelper;
