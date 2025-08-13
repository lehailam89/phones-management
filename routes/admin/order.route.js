const express = require('express');
const router = express.Router();

const controller = require('../../controllers/admin/order.controller.js');
const authMiddleware = require("../../middlewares/admin/auth.middleware.js");

router.get("/", authMiddleware.requireAuth, controller.index);
router.get("/detail/:id", authMiddleware.requireAuth, controller.detail);

module.exports = router;