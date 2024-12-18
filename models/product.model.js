const mongoose = require('mongoose');
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);


const productSchema = new mongoose.Schema({
    title: String, //Sản phẩm 1
    product_category_id: {
        type: String,
        default: ""
    },
    description: String,
    price: Number,
    discountPercentage: Number,
    stock: Number,
    thumbnail: String,
    status: String,
    featured: String,
    position: Number,
    slug: {
        type: String,
        slug: "title",//san-pham-1
        unique: true
    },
    deleted: {
        type: Boolean,
        default: false
    },
    // deletedAt: Date,
    createdBy: {
        account_id: String,
        createdAt: {
            type: Date,
            default: Date.now()
        }
    },
    updatedBy: [
        {
            account_id: String,
            updatedAt: Date
        }
    ],
    deletedBy: {
        account_id: String,
        deletedAt: Date
    }
},
{
    timestamps: true
}
);

const Product = mongoose.model('Product', productSchema, "products");
//products ở trên chính là tên của collection trong MongoDB

module.exports = Product;