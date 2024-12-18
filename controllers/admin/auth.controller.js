const Account = require("../../models/account.model.js");
const md5 = require("md5");
const SystemConfig = require("../../config/system");

//[GET] /auth/login
module.exports.login = (req, res) => {
    res.render("admin/pages/auth/login", {
        pageTitle: "Đăng nhập"
    });
}

//[POST] /auth/login
module.exports.loginPost = async (req, res) => {
    const email = req.body.email;
    const password = req.body.password;
    const user = await Account.findOne({
        email: email,
        deleted: false
    });

    if (!user) {
        req.flash("error", "Tài khoản không tồn tại");
        res.redirect("back");
        return;
    }
    if(md5(password) !== user.password) {
        req.flash("error", "Mật khẩu không chính xác");
        res.redirect("back");
        return;
    }
    if(user.status == "inactive") {
        req.flash("error", "Tài khoản đang bị khoá");
        res.redirect("back");
        return;
    }

    res.cookie("token", user.token);
    res.redirect(`${SystemConfig.prefixAdmin}/dashboard`);
}

//[GET] /auth/logout
module.exports.logout = (req, res) => {
    res.clearCookie("token");
    res.redirect(`${SystemConfig.prefixAdmin}/auth/login`);
}