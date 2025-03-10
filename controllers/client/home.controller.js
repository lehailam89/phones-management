const Product = require("../../models/product.model.js");
const productsHelper = require("../../helpers/products.js");

//[GET] /
module.exports.index = async (req, res) => {
//code hiển thị danh sách sản phẩm nổi bật
const productsFeatured = await Product.find({
    featured: "1",
    deleted: false,
    status: "active"
}).limit(6);

const newProductsFeatured = productsHelper.priceNewProducts(productsFeatured);

//end code hiển thị danh sách sản phẩm nổi bật

//Hiển thị sản phẩm mới nhất
const productsNew = await Product.find({
    deleted: false,
    status: "active",
}).sort({ position: "desc" }).limit(6);
const newProductsNew= productsHelper.priceNewProducts(productsNew);
//End hiển thị sản phẩm mới nhất

// Mảng hình ảnh
const images = [
    'https://bestpricegh.com/cdn/shop/files/apple-iphone-16-pro-max-2_2048x.jpg?v=1730148544',
    'https://cdn.tgdd.vn/Products/Images/42/307174/Slider/samsung-galaxy-s24-ultra-5g-thumb-youtube-1020x570.jpg',
    'https://cdn.tgdd.vn/Products/42/307174/samsung-galaxy-s24-ultra-5g-1-1020x570.jpg'
];

    res.render("client/pages/home/index.pug", {
        pageTitle: "Trang chủ",
        productsFeatured: newProductsFeatured,
        productsNew: newProductsNew,
        images: images
    })
}