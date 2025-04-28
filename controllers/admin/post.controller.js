const Post = require("../../models/post.model");
const Account = require("../../models/account.model");

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");

// [GET] /admin/posts
module.exports.index = async (req, res) => {
    // Tạo các biến bộ lọc, tìm kiếm, phân trang
    const filterStatus = filterStatusHelper(req.query);
    const objectSearch = searchHelper(req.query);

    let find = {
        deleted: false,
    };

    // Xử lý trạng thái
    if (req.query.status) {
        find.status = req.query.status;
    }

    // Xử lý tìm kiếm
    if (req.query.keyword) {
        find.title = objectSearch.regex;
    }

    // Xử lý phân trang
    let initPagination = {
        currentPage: 1,
        limitItems: 4
    };
    const countPosts = await Post.countDocuments(find);
    const objectPagination = paginationHelper(initPagination, req.query, countPosts);

    // Xử lý sắp xếp
    let sort = {};
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue;
    } else {
        sort.createdAt = "desc";
    }

    // Lấy dữ liệu bài viết
    const posts = await Post.find(find)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
        .sort(sort);

    // Lấy thông tin người tạo/cập nhật
    for (const post of posts) {
        // Người tạo
        const userCreated = await Account.findOne({ _id: post.createdBy.account_id });
        if (userCreated) {
            post.createdBy.accountFullName = userCreated.fullName;
        }

        // Người cập nhật
        const userUpdatedId = post.updatedBy.slice(-1)[0];
        if (userUpdatedId) {
            const userUpdated = await Account.findOne({
                _id: userUpdatedId.account_id
            });
            if (userUpdated) {
                userUpdatedId.accountFullName = userUpdated.fullName;
            }
        }
    }

    // Render trang
    res.render("admin/pages/posts/index", {
        pageTitle: 'Danh sách bài viết',
        posts: posts,
        filterStatus: filterStatus,
        keyword: objectSearch.keyword,
        pagination: objectPagination
    });
};

// [GET] /admin/posts/create
module.exports.create = async (req, res) => {
    res.render("admin/pages/posts/create", {
        pageTitle: "Thêm mới bài viết"
    });
};

// [POST] /admin/posts/create
module.exports.createPost = async (req, res) => {
    // Chuẩn bị dữ liệu
    if (req.body.thumbnail) {
        req.body.thumbnail = req.body.thumbnail[0];
    }

    req.body.createdBy = {
        account_id: res.locals.user.id
    };

    // Lưu vào database
    const post = new Post(req.body);
    await post.save();

    req.flash("success", "Tạo mới bài viết thành công");
    res.redirect(`${systemConfig.prefixAdmin}/posts`);
};

// [GET] /admin/posts/edit/:id
module.exports.edit = async (req, res) => {
    try {
        const id = req.params.id;
        const post = await Post.findOne({ _id: id, deleted: false });

        res.render("admin/pages/posts/edit", {
            pageTitle: "Chỉnh sửa bài viết",
            post: post
        });
    } catch (error) {
        req.flash("error", "Không tồn tại bài viết này!");
        res.redirect(`${systemConfig.prefixAdmin}/posts`);
    }
};

// [PATCH] /admin/posts/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    // Xử lý thumbnail
    if (req.body.thumbnail) {
        req.body.thumbnail = req.body.thumbnail[0];
    }

    // Thêm thông tin người cập nhật
    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    };

    // Cập nhật dữ liệu
    await Post.updateOne({ _id: id }, {
        ...req.body,
        $push: { updatedBy: updatedBy }
    });

    req.flash("success", "Cập nhật bài viết thành công");
    res.redirect("back");
};

// [PATCH] /admin/posts/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    };

    await Post.updateOne({ _id: id }, { status: status, $push: { updatedBy: updatedBy } });

    req.flash("success", "Cập nhật trạng thái bài viết thành công!");
    res.redirect("back");
};

// [DELETE] /admin/posts/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;

    await Post.updateOne({ _id: id },
        {
            deleted: true,
            deletedBy: {
                account_id: res.locals.user.id,
                deletedAt: new Date()
            }
        }
    );

    req.flash("success", "Xóa bài viết thành công!");
    res.redirect("back");
};

// [PATCH] /admin/posts/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    };

    switch (type) {
        case "active":
            await Post.updateMany(
                { _id: { $in: ids } },
                { status: "active", $push: { updatedBy: updatedBy } }
            );
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} bài viết`);
            break;
        case "inactive":
            await Post.updateMany(
                { _id: { $in: ids } },
                { status: "inactive", $push: { updatedBy: updatedBy } }
            );
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} bài viết`);
            break;
        case "delete-all":
            await Post.updateMany(
                { _id: { $in: ids } },
                {
                    deleted: true,
                    deletedBy: {
                        account_id: res.locals.user.id,
                        deletedAt: new Date()
                    }
                }
            );
            req.flash("success", `Đã xóa thành công ${ids.length} bài viết`);
            break;
        default:
            break;
    }

    res.redirect("back");
};

// [GET] /admin/posts/detail/:id
module.exports.detail = async (req, res) => {
    try {
        const id = req.params.id;
        const post = await Post.findOne({ _id: id, deleted: false });

        res.render("admin/pages/posts/detail", {
            pageTitle: "Chi tiết bài viết",
            post: post
        });
    } catch (error) {
        req.flash("error", "Không tồn tại bài viết này!");
        res.redirect(`${systemConfig.prefixAdmin}/posts`);
    }
};
