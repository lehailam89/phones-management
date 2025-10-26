const mongoose = require('mongoose');
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);

const replySchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    parentReply: {
        type: mongoose.Schema.Types.ObjectId,
        default: null
    },
    replyTo: {
        type: String,
        default: ""
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const commentSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    content: {
        type: String,
        required: true
    },
    replies: [replySchema],
    createdAt: {
        type: Date,
        default: Date.now
    }
});

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
    images: [String], // Thêm trường này để lưu trữ nhiều ảnh
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
    },
    comments: [commentSchema] // Thêm trường comments
},
{
    timestamps: true
}
);

const Product = mongoose.model('Product', productSchema, "products");
//products ở trên chính là tên của collection trong MongoDB

module.exports = Product;