const Account = require("../../models/account.model");
const Role = require("../../models/role.model");
const systemConfig = require("../../config/system");

module.exports.requireAuth = async (req, res, next) => {

    if (!req.cookies.token) {
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
        return;
    }

    const user = await Account.findOne({
        token: req.cookies.token,
    });

    if(!user){
        res.redirect(`${systemConfig.prefixAdmin}/auth/login`);
        return;
    }

    const role = await Role.findOne({
        _id: user.role_id
    }).select("title permissions");
    
    // Thêm quyền truy cập posts nếu chưa có
    if (role && role.permissions && !role.permissions.includes('posts_view')) {
        role.permissions.push('posts_view');
        role.permissions.push('posts_create');
        role.permissions.push('posts_edit');
        role.permissions.push('posts_delete');
    }
    
    res.locals.user = user;
    res.locals.role = role;
    next();
}