const express = require('express');
const router = express.Router();
const chatController = require('../../controllers/client/chat.controller');

router.get('/', chatController.getChatPage);

router.post('/message', chatController.handleMessage);

module.exports = router;