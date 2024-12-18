const mongoose = require('mongoose');
const slug = require("mongoose-slug-updater");

mongoose.plugin(slug);


const productSchema = new mongoose.Schema({
    title: String, 
    description: String,
    permissions: {
        type: Array,
        default: []
    },
    deleted: {
        type: Boolean,
        default: false
    },
    deletedAt: Date
},
{
    timestamps: true
}
);

const Role = mongoose.model("Role", productSchema, "roles");
//products ở trên chính là tên của collection trong MongoDB

module.exports = Role;