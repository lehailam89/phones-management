const express = require("express");
const router = express.Router();

const controller = require("../../controllers/client/post.controller");

router.get("/", controller.index);

router.get("/detail/:slug", controller.detail);

router.post("/comment/:id", controller.comment);

module.exports = router;
