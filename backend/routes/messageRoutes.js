const express = require('express');
const { allMessages, sendMessage } = require('../controllers/messageControllers');
const auth = require('../middleware/auth');
const router = express.Router();

router.route("/").post(auth, sendMessage);
router.route("/:chatId").get(auth, allMessages);

module.exports = router;
