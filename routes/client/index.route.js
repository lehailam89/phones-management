const categoryMiddleware = require('../../middlewares/client/category.middleware.js')
const cartMiddleware = require('../../middlewares/client/cart.middleware.js')
const userMiddleware = require('../../middlewares/client/user.middleware.js')
const settingMiddleware = require('../../middlewares/client/setting.middleware.js')

const homeRoutes = require("./home.route");
const productRoutes = require("./product.route");
const searchRoutes = require("./search.route");
const cartRoutes = require("./cart.route");
const checkoutRoutes = require("./checkout.route");
const userRoutes = require("./user.route");
const chatRoutes = require("./chat.route");
const postRoutes = require("./post.route");

module.exports = (app) => {
  app.use(categoryMiddleware.category)

  app.use(cartMiddleware.cartId)

  app.use(userMiddleware.infoUser)

  app.use(settingMiddleware.settingGeneral)

  app.use("/", homeRoutes);
  
  app.use("/products", productRoutes);

  app.use("/search", searchRoutes);

  app.use("/cart", cartRoutes);

  app.use("/checkout", checkoutRoutes);

  app.use("/user", userRoutes);

  app.use("/chat", chatRoutes);

  app.use(`/posts`, postRoutes);
}