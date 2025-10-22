module.exports.registerPost  = (req, res, next) => {
    if(!req.body.fullName) {
        req.flash("error", "Họ tên không được để trống!");
        res.redirect("back");   
        return;
    }
    if(!req.body.email) {
        req.flash("error", "Email không được để trống!");
        res.redirect("back");   
        return;
    }
    if(!req.body.password) {
        req.flash("error", "Mật khẩU không được để trống!");
        res.redirect("back");   
        return;
    }

    next();
}

//[POST] /login
module.exports.loginPost  = (req, res, next) => {
    if(!req.body.email) {
        req.flash("error", "Email không được để trống!");
        res.redirect("back");   
        return;
    }
    if(!req.body.password) {
        req.flash("error", "Mật khẩU không được để trống!");
        res.redirect("back");   
        return;
    }

    next();
}

module.exports.forgotPasswordPost  = (req, res, next) => {
    if(!req.body.email) {
        req.flash("error", "Email không được để trống!");
        res.redirect("back");   
        return;
    }
    next();
}

module.exports.resetPasswordPost  = (req, res, next) => {
    if(!req.body.password) {
        req.flash("error", "Mật khẩu không được để trống!");
        res.redirect("back");   
        return;
    }

    if(!req.body.confirmPassword) {
        req.flash("error", "Vui lòng nhập lại mật khẩu!");
        res.redirect("back");   
        return;
    }

    if(req.body.password != req.body.confirmPassword) {
        req.flash("error", "Xác nhận mật khẩu không đúng!");
        res.redirect("back");   
        return;
    }

    next();
}

module.exports.changePasswordPost = (req, res, next) => {
    if(!req.body.currentPassword) {
        req.flash("error", "Vui lòng nhập mật khẩu hiện tại!");
        res.redirect("back");
        return;
    }

    if(!req.body.newPassword) {
        req.flash("error", "Vui lòng nhập mật khẩu mới!");
        res.redirect("back");
        return;
    }

    if(req.body.newPassword.length < 6) {
        req.flash("error", "Mật khẩu mới phải có ít nhất 6 ký tự!");
        res.redirect("back");
        return;
    }

    if(!req.body.confirmPassword) {
        req.flash("error", "Vui lòng xác nhận mật khẩu mới!");
        res.redirect("back");
        return;
    }

    if(req.body.newPassword !== req.body.confirmPassword) {
        req.flash("error", "Xác nhận mật khẩu không khớp!");
        res.redirect("back");
        return;
    }

    if(req.body.currentPassword === req.body.newPassword) {
        req.flash("error", "Mật khẩu mới phải khác mật khẩu hiện tại!");
        res.redirect("back");
        return;
    }

    next();
}

module.exports.editPost = (req, res, next) => {
    if(!req.body.fullName) {
        req.flash("error", "Vui lòng nhập họ tên!");
        res.redirect("back");
        return;
    }

    if(req.body.fullName.length < 2) {
        req.flash("error", "Họ tên phải có ít nhất 2 ký tự!");
        res.redirect("back");
        return;
    }

    if(req.body.phone) {
        const phoneRegex = /^[0-9]{10,11}$/;
        if(!phoneRegex.test(req.body.phone)) {
            req.flash("error", "Số điện thoại không hợp lệ!");
            res.redirect("back");
            return;
        }
    }

    next();
}

