const mongoose = require("mongoose");

const orderSchema = new mongoose.Schema(
    {
        cart_id: String,
        userInfo: {
            fullName: String,
            phone: String,
            address: String
        },
        products: [
            {
                product_id: String,
                price: Number,
                discountPercentage: Number,
                quantity: Number,
            }
        ],
        totalPrice: {
            type: Number,
            default: 0
        }
    },
    {
        timestamps: true,
    }
);

orderSchema.pre('save', function(next) {
    this.totalPrice = this.products.reduce((sum, product) => {
        const priceNew = ((product.price * (100 - product.discountPercentage)) / 100).toFixed(0);
        return sum + (priceNew * product.quantity);
    }, 0);
    next();
});

const Order = mongoose.model("Order", orderSchema, "orders");
module.exports = Order;