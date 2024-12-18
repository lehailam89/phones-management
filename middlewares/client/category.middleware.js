const ProductCategory = require('../../models/product-category.model.js');
const createTree = require('../../helpers/createTree.js')


module.exports.category = async (req, res, next) => {
  const categoryProducts = await ProductCategory.find({
    deleted: false
  })

  const newCategoryProducts = createTree(categoryProducts)

  res.locals.layoutCategoryProducts = newCategoryProducts
  next();
}