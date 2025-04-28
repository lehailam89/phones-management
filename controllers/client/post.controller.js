const Post = require("../../models/post.model");
const User = require("../../models/user.model");
const Account = require("../../models/account.model"); // Thêm import Account model
const paginationHelper = require("../../helpers/pagination");

// [GET] /posts
module.exports.index = async (req, res) => {
    // Xử lý phân trang
    let find = {
        deleted: false,
        status: "active"
    };

    let initPagination = {
        currentPage: 1,
        limitItems: 6
    };

    const countPosts = await Post.countDocuments(find);
    const objectPagination = paginationHelper(initPagination, req.query, countPosts);

    // Lấy dữ liệu bài viết
    const posts = await Post.find(find)
        .sort({ createdAt: -1 })
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip);

    // Lấy thông tin người tạo bài viết cho mỗi bài viết
    for (const post of posts) {
        if (post.createdBy && post.createdBy.account_id) {
            const accountCreated = await Account.findOne({
                _id: post.createdBy.account_id
            });
            
            if (accountCreated) {
                post.createdBy.accountFullName = accountCreated.fullName;
            }
        }
    }

    // Render trang
    res.render("client/pages/posts/index", {
        pageTitle: "Bài viết",
        posts: posts,
        pagination: objectPagination
    });
};

// [GET] /posts/detail/:slug
module.exports.detail = async (req, res) => {
    try {
        const slug = req.params.slug;
        
        // Tìm bài viết theo slug
        const post = await Post.findOne({
            slug: slug,
            deleted: false,
            status: "active"
        });

        if (!post) {
            return res.redirect("/posts");
        }

        // Lấy thông tin người tạo bài viết
        if (post.createdBy && post.createdBy.account_id) {
            const accountCreated = await Account.findOne({
                _id: post.createdBy.account_id
            });
            
            if (accountCreated) {
                post.createdBy.accountFullName = accountCreated.fullName;
            }
        }

        // Lấy thông tin người comment
        for (const comment of post.comments) {
            const user = await User.findOne({
                _id: comment.user_id
            });
            
            if (user) {
                comment.fullName = user.fullName;
            }
        }

        // Lấy bài viết liên quan
        const relatedPosts = await Post.find({
            deleted: false,
            status: "active",
            _id: { $ne: post._id } // loại trừ bài viết hiện tại
        })
            .sort({ createdAt: -1 })
            .limit(3);

        // Render trang
        res.render("client/pages/posts/detail", {
            pageTitle: post.title,
            post: post,
            relatedPosts: relatedPosts
        });
    } catch (error) {
        console.error(error); // Thêm log lỗi để dễ debug
        res.redirect("/posts");
    }
};

// [POST] /posts/comment/:id
module.exports.comment = async (req, res) => {
    try {
        const postId = req.params.id;
        const content = req.body.content;

        // Kiểm tra xem người dùng đã đăng nhập chưa
        if (!res.locals.user) {
            req.flash("error", "Vui lòng đăng nhập để bình luận!");
            return res.redirect("back");
        }

        // Kiểm tra nội dung bình luận
        if (!content) {
            req.flash("error", "Nội dung bình luận không được để trống!");
            return res.redirect("back");
        }

        // Tìm bài viết
        const post = await Post.findOne({
            _id: postId,
            deleted: false,
            status: "active"
        });

        if (!post) {
            return res.redirect("/posts");
        }

        // Thêm bình luận mới
        const comment = {
            user_id: res.locals.user.id,
            content: content,
            createdAt: new Date()
        };

        // Cập nhật bài viết với bình luận mới
        await Post.updateOne(
            { _id: postId },
            { $push: { comments: comment } }
        );

        req.flash("success", "Bình luận thành công!");
        res.redirect("back");
    } catch (error) {
        res.redirect("/posts");
    }
};
