const Order = require('../../models/order.model');
const Product = require('../../models/product.model');

module.exports.index = async (req, res) => {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    res.render("admin/pages/orders/index", {
        pageTitle: "Quản lý đơn hàng",
        orders: orders
    });
};

// [GET] /admin/orders/detail/:id - Chi tiết đơn hàng
module.exports.detail = async (req, res) => {
    try {
        const orderId = req.params.id;
        
        const order = await Order.findOne({
            _id: orderId
        });

        if (!order) {
            req.flash("error", "Không tìm thấy đơn hàng");
            return res.redirect("/admin/orders");
        }

        // Lấy thông tin chi tiết sản phẩm
        for (const product of order.products) {
            const productInfo = await Product.findOne({
                _id: product.product_id
            });
            
            if (productInfo) {
                product.productInfo = productInfo;
                product.priceNew = ((product.price * (100 - product.discountPercentage)) / 100);
                product.totalPrice = product.priceNew * product.quantity;
            }
        }

        // Tính tổng giá trị đơn hàng
        order.totalPrice = order.products.reduce((sum, item) => sum + (item.totalPrice || 0), 0);

        res.render("admin/pages/orders/detail", {
            pageTitle: "Chi tiết đơn hàng",
            order: order
        });
    } catch (error) {
        console.error(error);
        req.flash("error", "Có lỗi xảy ra");
        res.redirect("/admin/orders");
    }
};