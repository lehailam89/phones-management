const Cart = require('../../models/cart.model');
const Product = require('../../models/product.model');
const Order = require('../../models/order.model');
const productsHelper = require('../../helpers/products.js');

//[GET] /checkout/
module.exports.index = async (req, res) => {
    const cartId = req.cookies.cartId;

    const cart = await Cart.findOne({
        _id: cartId
    });

    if(cart.products.length > 0){
        for(const item of cart.products){
            const productId = item.product_id;

            const productInfo = await Product.findOne({
                _id: productId
            });

            // Thêm giá gốc và giá khuyến mãi
            productInfo.priceNew = productsHelper.priceNewProduct(productInfo);
            productInfo.priceOld = productInfo.price; // Giá gốc
            productInfo.discountAmount = productInfo.price - productInfo.priceNew; // Số tiền được giảm

            item.productInfo = productInfo;

            // Tính tổng tiền dựa trên giá khuyến mãi
            item.totalPrice = item.quantity * productInfo.priceNew;
            // Thêm tổng tiền theo giá gốc để so sánh
            item.totalPriceOld = item.quantity * productInfo.priceOld;
        }
    }

    cart.totalPrice = cart.products.reduce((sum, item) => sum + item.totalPrice,0);
    // Thêm tổng tiền theo giá gốc
    cart.totalPriceOld = cart.products.reduce((sum, item) => sum + item.totalPriceOld,0);
    cart.totalDiscount = cart.totalPriceOld - cart.totalPrice; // Tổng số tiền được giảm

    res.render("client/pages/checkout/index", 
    {
        pageTitle: "Đặt hàng",
        cartDetail: cart
    });
}

//[POST] /checkout/order
module.exports.order = async (req, res) => {
    const cartId = req.cookies.cartId;
    const userInfo = req.body;
    const cart = await Cart.findOne({
        _id: cartId
    });

    let products = [];

    for(const product of cart.products){
        const objectProduct = {
            product_id: product.product_id,
            price: 0,
            discountPercentage: 0,
            quantity: product.quantity
        };
        const productInfo = await Product.findOne({
            _id: product.product_id
        });

        objectProduct.price = productInfo.price;
        objectProduct.discountPercentage = productInfo.discountPercentage;

        products.push(objectProduct);
    }

    const objectOrder = {
        cart_id: cartId,
        user_id: res.locals.user ? res.locals.user.id : null, // Lưu user_id
        userInfo: userInfo,
        products: products
    };
     
    const order = new Order(objectOrder);
    await order.save();

    await Cart.updateOne({
        _id: cartId
        },{
            products: []
        }
    );

    res.redirect(`/checkout/success/${order.id}`);
}

//[GET] /checkout/success/:id
module.exports.success = async (req, res) => {
    const order = await Order.findOne({
        _id: req.params.orderId
    });

    for(const product of order.products){
        const productInfo = await Product.findOne({
            _id: product.product_id
        }).select("title thumbnail");

        product.productInfo = productInfo;

        // Thêm thông tin giá gốc và giá khuyến mãi
        product.priceNew = productsHelper.priceNewProduct(product);
        product.priceOld = product.price; // Giá gốc
        product.discountAmount = product.price - product.priceNew; // Số tiền được giảm
        product.totalPrice = product.priceNew * product.quantity;
        product.totalPriceOld = product.priceOld * product.quantity; // Tổng tiền theo giá gốc
    }

    order.totalPrice = order.products.reduce((sum, item) => sum + item.totalPrice, 0);
    // Thêm tổng tiền theo giá gốc
    order.totalPriceOld = order.products.reduce((sum, item) => sum + item.totalPriceOld, 0);
    order.totalDiscount = order.totalPriceOld - order.totalPrice; // Tổng số tiền được giảm

    res.render("client/pages/checkout/success", {
        pageTitle: "Đặt hàng thành công",
        order: order
    });
}