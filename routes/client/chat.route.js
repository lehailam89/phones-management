const express = require('express');
const router = express.Router();

const controller = require('../../controllers/client/chat.controller');

router.get('/', controller.getChatPage);
router.post('/message', controller.handleMessage);

module.exports = router;