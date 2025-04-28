const User = require('../../models/user.model');

module.exports.requireAuth = async (req, res, next) => {
    if (!req.cookies.tokenUser) {
        res.redirect(`/user/login`);
        return;
    }

    const user = await User.findOne({
        tokenUser: req.cookies.tokenUser,
    });

    if(!user){
        res.redirect(`/user/login`);
        return;
    }

    req.user = user; // Thêm dòng này để lưu thông tin người dùng vào req.user
    res.locals.user = user; // Thêm dòng này để lưu thông tin người dùng vào biến cục bộ
    next();
}