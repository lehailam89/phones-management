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

    res.render("client/pages/home/index.pug", {
        pageTitle: "Trang chủ",
        productsFeatured: newProductsFeatured,
        productsNew: newProductsNew
    })
}