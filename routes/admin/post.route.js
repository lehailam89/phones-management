const express = require("express");
const router = express.Router();
const multer = require('multer');

const controller = require("../../controllers/admin/post.controller");
const validate = require("../../validates/admin/post.validate");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware");

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

router.get("/", controller.index);

router.get("/create", controller.create);

router.post(
    "/create",
    upload.fields([{ name: 'thumbnail', maxCount: 1 }]),
    uploadCloud.upload,
    validate.createPost,
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch(
    "/edit/:id",
    upload.fields([{ name: 'thumbnail', maxCount: 1 }]),
    uploadCloud.upload,
    validate.editPatch,
    controller.editPatch
);

router.patch("/change-status/:status/:id", controller.changeStatus);

router.delete("/delete/:id", controller.deleteItem);

router.patch("/change-multi", controller.changeMulti);

router.get("/detail/:id", controller.detail);

module.exports = router;
