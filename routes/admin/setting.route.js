const express = require("express");
const router = express.Router();
const multer = require("multer");
const upload = multer();

const controller = require("../../controllers/admin/setting.controller.js");
const uploadCloud = require("../../middlewares/admin/uploadCloud.middleware.js");

router.get("/general", controller.general);

router.patch(
    "/general", 
    upload.single("logo"),
    uploadCloud.upload,
    controller.generalPatch
);

module.exports = router;