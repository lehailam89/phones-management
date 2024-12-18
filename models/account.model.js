const mongoose = require('mongoose');
const generate = require("../helpers/generate.js");

const acountSchema = new mongoose.Schema({
    fullName: String,
    email: String,
    password: String,
    token: {
        type: String,
        default: generate.generateRandomString(30)
    },//là một String random để check đăng nhập
    phone: String,
    avatar: String,
    role_id: String,
    status: String,
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

const Account = mongoose.model('Account', acountSchema, 'accounts');

module.exports = Account;