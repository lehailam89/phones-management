const express = require("express");
const router = express.Router();
const multer = require('multer');//để upload ảnh lên
const upload = multer();//để úp ảnh lên
const controller = require("../../controllers/admin/account.controller.js");

const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware.js");

router.get("/", controller.index);

router.get("/create", controller.create);

router.post("/create",
    upload.single("avatar"),
    uploadCloud.upload,
    controller.createPost
);

router.get("/edit/:id", controller.edit);

router.patch("/edit/:id", 
    upload.single("avatar"),
    uploadCloud.upload,
    controller.editPatch
);

module.exports = router;