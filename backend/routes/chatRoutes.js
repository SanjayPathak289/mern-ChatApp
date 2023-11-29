const express = require("express");
const auth = require("../middleware/auth");
const {accessChat, fetchChats, createGroupChat, renameGroup, addToGroup, removefromGroup} = require("../controllers/chatControllers");
const router = express.Router();

router.route("/").post(auth,accessChat).get(auth,fetchChats);
router.route("/groups").post(auth,createGroupChat);
router.route("/rename").put(auth,renameGroup);
router.route("/groupremove").put(auth,removefromGroup);
router.route("/groupadd").put(auth,addToGroup);

module.exports = router;
