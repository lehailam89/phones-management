const express = require("express");
const multer = require('multer');
const router = express.Router();

// const storageMulter = require("../../helpers/storageMulter");

const upload = multer();

const controller = require("../../controllers/admin/product.controller");
const validate = require("../../validates/admin/product.validate.js");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware.js");


router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);
//cú pháp : để truyền router động
router.patch("/change-multi", controller.changeMulti);

router.delete("/delete/:id", controller.deleteItem);

router.get("/create", controller.create);

router.post(
    "/create", 
    upload.single("thumbnail"),
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);
    
router.get("/edit/:id", controller.edit);

router.patch(
    "/edit/:id", upload.single("thumbnail"), 
    uploadCloud.upload,
    validate.editPatch,
    controller.editPatch
);

router.get("/detail/:id", controller.detail);

module.exports = router;
