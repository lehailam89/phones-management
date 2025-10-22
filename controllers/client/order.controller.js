const Order = require('../../models/order.model');
const Product = require('../../models/product.model');
const productsHelper = require('../../helpers/products.js');

// [GET] /user/orders - Danh sách đơn hàng
module.exports.index = async (req, res) => {
    try {
        const userId = res.locals.user.id;
        
        // Lấy đơn hàng theo user_id
        const orders = await Order.find({
            user_id: userId
        }).sort({ createdAt: -1 });

        // Lấy thông tin sản phẩm cho mỗi đơn hàng
        for (const order of orders) {
            for (const product of order.products) {
                const productInfo = await Product.findOne({
                    _id: product.product_id
                }).select("title thumbnail");
                
                if (productInfo) {
                    product.productInfo = productInfo;
                    // Thêm thông tin giá gốc và giá khuyến mãi
                    product.priceNew = productsHelper.priceNewProduct(product);
                    product.priceOld = product.price; // Giá gốc
                    product.discountAmount = product.price - product.priceNew; // Số tiền được giảm
                    product.totalPrice = product.priceNew * product.quantity;
                    product.totalPriceOld = product.priceOld * product.quantity; // Tổng tiền theo giá gốc
                }
            }
            
            // Tính tổng giá trị đơn hàng
            order.totalPrice = order.products.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
            // Thêm tổng tiền theo giá gốc
            order.totalPriceOld = order.products.reduce((sum, item) => sum + (item.totalPriceOld || 0), 0);
            order.totalDiscount = order.totalPriceOld - order.totalPrice; // Tổng số tiền được giảm
        }

        res.render("client/pages/user/orders", {
            pageTitle: "Lịch sử mua hàng",
            orders: orders
        });
    } catch (error) {
        console.error(error);
        req.flash("error", "Có lỗi xảy ra");
        res.redirect("/user/info");
    }
};

// [GET] /user/orders/detail/:orderId - Chi tiết đơn hàng
module.exports.detail = async (req, res) => {
    try {
        const orderId = req.params.orderId;
        const userId = res.locals.user.id;
        
        const order = await Order.findOne({
            _id: orderId,
            user_id: userId
        });

        if (!order) {
            req.flash("error", "Không tìm thấy đơn hàng");
            return res.redirect("/user/orders");
        }

        // Lấy thông tin chi tiết sản phẩm
        for (const product of order.products) {
            const productInfo = await Product.findOne({
                _id: product.product_id
            });
            
            if (productInfo) {
                product.productInfo = productInfo;
                // Thêm thông tin giá gốc và giá khuyến mãi
                product.priceNew = productsHelper.priceNewProduct(product);
                product.priceOld = product.price; // Giá gốc
                product.discountAmount = product.price - product.priceNew; // Số tiền được giảm
                product.totalPrice = product.priceNew * product.quantity;
                product.totalPriceOld = product.priceOld * product.quantity; // Tổng tiền theo giá gốc
            }
        }

        // Tính tổng giá trị đơn hàng
        order.totalPrice = order.products.reduce((sum, item) => sum + (item.totalPrice || 0), 0);
        // Thêm tổng tiền theo giá gốc
        order.totalPriceOld = order.products.reduce((sum, item) => sum + (item.totalPriceOld || 0), 0);
        order.totalDiscount = order.totalPriceOld - order.totalPrice; // Tổng số tiền được giảm

        res.render("client/pages/user/order-detail", {
            pageTitle: "Chi tiết đơn hàng",
            order: order
        });
    } catch (error) {
        console.error(error);
        req.flash("error", "Có lỗi xảy ra");
        res.redirect("/user/orders");
    }
};
