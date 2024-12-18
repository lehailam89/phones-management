const Order = require('../../models/order.model');

module.exports.index = async (req, res) => {
    const orders = await Order.find({}).sort({ createdAt: -1 });

    res.render("admin/pages/orders/index", {
        pageTitle: "Quản lý đơn hàng",
        orders: orders
    });
};