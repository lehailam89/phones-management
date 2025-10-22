const express = require('express');
const router = express.Router();

const controller = require("../../controllers/client/user.controller.js");
const validate = require("../../validates/client/user.validate.js");
const authMiddleware = require("../../middlewares/client/auth.middleware.js");
const orderController = require("../../controllers/client/order.controller.js");

router.get("/register", controller.register);

router.post("/register", validate.registerPost ,controller.registerPost);

router.get("/login", controller.login);

router.post("/login", validate.loginPost, controller.loginPost);

router.get("/logout", controller.logout);

router.get("/password/forgot", controller.forgotPassword);

router.post("/password/forgot", validate.forgotPasswordPost, controller.forgotPasswordPost);

router.get("/password/otp", controller.otpPassword);

router.post("/password/otp", controller.otpPasswordPost);

router.get("/password/reset", controller.resetPassword);

router.post("/password/reset", validate.resetPasswordPost ,controller.resetPasswordPost);

router.get("/info", authMiddleware.requireAuth ,controller.info);

router.get("/edit", authMiddleware.requireAuth, controller.edit);

router.post("/edit", authMiddleware.requireAuth, validate.editPost, controller.editPost);

router.get("/change-password", authMiddleware.requireAuth, controller.changePassword);

router.post("/change-password", authMiddleware.requireAuth, validate.changePasswordPost, controller.changePasswordPost);

router.get("/orders", authMiddleware.requireAuth, orderController.index);

router.get("/orders/detail/:orderId", authMiddleware.requireAuth, orderController.detail);

module.exports = router;