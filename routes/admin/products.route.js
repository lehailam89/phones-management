const express = require("express");
const multer = require('multer');
const router = express.Router();

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware.js");

const controller = require("../../controllers/admin/product.controller");
const validate = require("../../validates/admin/product.validate.js");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", controller.index);

router.patch("/change-status/:status/:id", controller.changeStatus);
router.patch("/change-multi", controller.changeMulti);
router.delete("/delete/:id", controller.deleteItem);
router.get("/create", controller.create);

router.post(
    "/create",
    upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 10 }]), // Cho phép upload tối đa 10 ảnh
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
    "/edit/:id",
    upload.fields([{ name: 'thumbnail', maxCount: 1 }, { name: 'images', maxCount: 10 }]), // Cho phép upload tối đa 10 ảnh
    uploadCloud.upload,
    validate.editPatch,
    controller.editPatch
);

router.get("/detail/:id", controller.detail);

module.exports = router;