const md5 = require("md5");
const Account = require("../../models/account.model.js");
const Role = require("../../models/role.model.js");

const SystemConfig = require("../../config/system");

//[GET] /admin/accounts
module.exports.index = async (req, res) => {
    const records = await Account.find({
        deleted: false
    });

    for (const record of records) {
        const role = await Role.findOne({ _id: record.role_id });
        record.role = role;
    }

    res.render("admin/pages/accounts/index", {
        pageTitle: "Danh sách tài khoản",
        records: records
    });
}

// [GET] /admin/accounts/create
module.exports.create = async (req, res) => {
    const roles = await Role.find({
      deleted: false,
    });
  
    res.render("admin/pages/accounts/create", {
      pageTitle: "Tạo mới tài khoản",
      roles: roles,
    });
  };

//[POST] /admin/account/create
module.exports.createPost = async (req, res) => {
    const data = req.body;
    data.password = md5(req.body.password);
    const record = new Account(data);

    await record.save();

    res.redirect(`${SystemConfig.prefixAdmin}/accounts`);
}

//[GET] /admin/accounts/edit/:id
module.exports.edit = async (req, res) => {
    let find = {
        _id: req.params.id,
        deleted: false
    }

    try {
        const data = await Account.findOne(find);
        const roles = await Role.find({
            deleted: false
        });

        res.render("admin/pages/accounts/edit", {
            pageTitle: "Chỉnh sửa tài khoản",
            data: data,
            roles: roles
        });
    } catch (error) {
        res.redirect(`${SystemConfig.prefixAdmin}/accounts`);
    }
};

//[PATCH] /admin/accounts/edit/:id
module.exports.editPatch = async (req, res) => {
    if(req.body.password) {
        req.body.password = md5(req.body.password);
    } else {
        delete req.body.password;
    }
    
    await Account.updateOne({ _id: req.params.id }, req.body);

    req.flash("success", "Cập nhật thành công!");

    res.redirect("back");
};