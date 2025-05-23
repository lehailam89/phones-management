const express = require('express');
const router = express.Router();
const controller = require('../../controllers/client/product.controller');
const { requireAuth } = require('../../middlewares/client/auth.middleware.js');

router.get('/', controller.index);   

router.get('/detail/:slugProduct', controller.detail);

router.get('/:slugCategory', controller.category);

router.post('/detail/:id/comments', requireAuth, controller.addComment); 


module.exports = router;