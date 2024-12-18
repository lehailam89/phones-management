const Product = require("../../models/product.model");
const ProductCategory = require("../../models/product-category.model");
const Account = require('../../models/account.model.js')

const filterStatusHelper = require("../../helpers/filterStatus");
const searchHelper = require("../../helpers/search");
const paginationHelper = require("../../helpers/pagination");
const systemConfig = require("../../config/system");
const createTree = require("../../helpers/createTree");


//[GET] /admin/products
module.exports.index = async (req, res) => {

    //!filterStatus
    const filterStatus = filterStatusHelper(req.query);
    //!search
    const objectSearch = searchHelper(req.query);

    let find = {
        deleted: false,
    };

    //! status
    if (req.query.status) {
        find.status = req.query.status;
    };

    //! search
    if (req.query.keyword) {
        find.title = objectSearch.regex;
    };

    //! Pagination
    let initPagination = {
        currentPage: 1,
        limitItems: 4
    };
    const countProduct = await Product.countDocuments(find);
    const objectPagination = paginationHelper(initPagination, req.query, countProduct);
    //! end pagination

    //! sort

    let sort = {}
    if (req.query.sortKey && req.query.sortValue) {
        sort[req.query.sortKey] = req.query.sortValue
    } else {
        sort.position = 'desc'
    }

    //! end sort

    const products = await Product.find(find)
        .limit(objectPagination.limitItems)
        .skip(objectPagination.skip)
        .sort(sort);

    for (const product of products) {
        //Lấy ra người tạo
        const userCreated = await Account.findOne({ _id: product.createdBy.account_id });
        if(userCreated){
            product.createdBy.accountFullName = userCreated.fullName;
        }   

        //Lấy ra người cập nhật
        const userUpdatedId = product.updatedBy.slice(-1)[0]
        if (userUpdatedId) {
            const userUpdated = await Account.findOne({
                _id: userUpdatedId.account_id
            })
            if (userUpdated) {
                userUpdatedId.accountFullName = userUpdated.fullName
            }
        }
        
    }
        
    if (products.length > 0 || countProduct == 0) {
        res.render("./admin/pages/products/index.pug", {
            pageTitle: 'Danh sách sản phẩm',
            products: products,
            filterStatus: filterStatus,
            keyword: objectSearch.keyword,
            pagination: objectPagination
        });
    } else {
        let stringQuery = "";

        for (const key in req.query) {
            if (key != "page") {
                stringQuery += `&${key}=${req.query[key]}`
            }
        }
        const href = `${req.baseUrl}?page=1${stringQuery}`
        res.redirect(href)
    }
}

// Controler Change Status
//[PATCH] /admin/products/change-status/:status/:id
module.exports.changeStatus = async (req, res) => {
    const status = req.params.status;
    const id = req.params.id;

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }
    
    await Product.updateOne({_id: id}, {status: status, $push: {updatedBy: updatedBy}});
    //updateOne là 1 chức năng của mongoose để update 1 bản ghi trong database, tự đọc doc của nó

    req.flash("success", "Cập nhật trạng thái sản phẩm thành công!");


    res.redirect("back"); 
}

//[PATCH] /admin/products/change-multi
module.exports.changeMulti = async (req, res) => {
    const type = req.body.type;
    const ids = req.body.ids.split(", ");//split là hàm js để convert thành một mảng

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }

    switch (type){
        case "active":
            await Product.updateMany({ _id: {$in: ids}}, 
                {
                    status: "active"
                });    
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm`);   
            break;
        case "inactive":
            await Product.updateMany({ _id: {$in: ids}}, {status: "inactive", $push: {updatedBy: updatedBy}});
            req.flash("success", `Cập nhật trạng thái thành công ${ids.length} sản phẩm`);   
            break;
        case "delete-all":
            await Product.updateMany(
                { _id: {$in: ids}}, 
                {
                    deleted: true,
                    deletedBy: {
                        deletedAt: new Date(),
                        account_id: res.locals.user.id
                    }  
                }
            );
            req.flash("success", `Đã xoá thành công ${ids.length} sản phẩm`);   
            break;
        case "change-position":
            for(const item of ids){
                let [id, position] = item.split("-");
                position=parseInt(position);
                await Product.updateOne({_id: id}, {position: position, $push: {updatedBy: updatedBy}});
            }
            req.flash("success", "Cập nhật vị trí thành công!");   
            break;
        default:
            break;
    }

    res.redirect("back");
};

//[DELETE] /admin/products/delete/:id
module.exports.deleteItem = async (req, res) => {
    const id = req.params.id;
    // await Product.deleteOne({_id: id}); //deleteOne là hàm của mongoose để xóa 1 bản ghi trong database => xoá cứng

    await Product.updateOne({ _id: id}, 
        {
            deleted: true,
            // deletedAt: new Date()//new Date là hàm của js lấy ra thời gian hiện tại    
            deletedBy: {
                deletedAt: new Date(),
                account_id: res.locals.user.id
            }  
        }
    ); //updateOne là hàm của mongoose để update 1 bản ghi trong database => xoá mềm

    req.flash("success", "Xoá sản phẩm thành công!");   

    res.redirect("back");
}

//[GET] /admin/products/create   tạo mới một sản phẩm
module.exports.create = async (req, res) => {
    let find = {
        deleted: false
    }

    const records = await ProductCategory.find(find);

    const newRecords = createTree(records);

    res.render("admin/pages/products/create", {
        pageTitle: "Thêm mới sản phẩm",
        records: newRecords
    });
}

//[POST] /admin/products/create
module.exports.createPost = async (req, res) => {

    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);

    if(req.body.position === ""){
        const countProducts = await Product.countDocuments();
        req.body.position = countProducts + 1;
    } else {
        req.body.position = parseInt(req.body.position);
    }

    // if(req.file && req.file.filename){
    //     req.body.thumbnail = `/uploads/${req.file.filename}`;
    // }

    req.body.createdBy = {
        account_id: res.locals.user.id
    };

    const product = new Product(req.body);
    await product.save();

    req.flash("success", "Tạo mới sản phẩm thành công")


    res.redirect(`${systemConfig.prefixAdmin}/products`);
};
    
//[GET] /admin/products/edit/:id, edit sản phẩm
module.exports.edit = async (req, res) => { 
    try{
        const id = req.params.id;
        const product = await Product.findOne({_id: id, deleted: false});

        let find = {
            deleted: false
        }
    
        const records = await ProductCategory.find(find);
    
        const newRecords = createTree(records);
    
        res.render("admin/pages/products/edit", {
            pageTitle: "Chỉnh sửa sản phẩm",
            product: product,
            records: newRecords
        })
    }catch (error){
        req.flash("error", "Không tồn tại sản phẩm có id này!");
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}

//[PATCH] /admin/products/edit/:id
module.exports.editPatch = async (req, res) => {
    const id = req.params.id;

    req.body.price = parseInt(req.body.price);
    req.body.discountPercentage = parseInt(req.body.discountPercentage);
    req.body.stock = parseInt(req.body.stock);
    req.body.position = parseInt(req.body.position);

    if(req.file && req.file.filename){
        req.body.thumbnail = `/uploads/${req.file.filename}`;
    }

    const updatedBy = {
        account_id: res.locals.user.id,
        updatedAt: new Date()
    }

    await Product.updateOne({ _id: id}, {
        ...req.body,
        $push: {updatedBy: updatedBy}
    });

    req.flash("success", "Cập nhật sản phẩm thành công!!!!");   

    res.redirect("back");
};

//[GET] /admin/products/detail/:id
module.exports.detail = async (req, res) => {
    try{
        const id = req.params.id;
        const product = await Product.findOne({_id: id, deleted: false});

        res.render("admin/pages/products/detail", {
            pageTitle: "Chi tiết sản phẩm",
            product: product
        })
    } catch (error) {
        req.flash("error", "Không tồn tại sản phẩm có id này!");
        res.redirect(`${systemConfig.prefixAdmin}/products`);
    }
}