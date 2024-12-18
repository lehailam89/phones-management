const Cart = require('../../models/cart.model.js')

module.exports.cartId = async (req, res, next) => {

  try {
    if (!req.cookies.cartId) {
      const cart = await Cart.create({})
  
      const expiresTime = 1000 * 60 * 60 * 24 * 365;
  
      res.cookie("cartId", cart.id, {
        expires: new Date(Date.now() + expiresTime)
      })
    } else {
      const cart = await Cart.findById(req.cookies.cartId).lean()
      if (!cart) {
        res.clearCookie("cartId")
        return res.redirect('back')
      }

      cart.totalQuantity = cart.products.reduce((sum, item) => sum + item.quantity, 0)

      res.locals.miniCart = cart
    }
    next()
  } catch (error) {
    res.clearCookie("cartId")
    return res.redirect('back')
  }

}