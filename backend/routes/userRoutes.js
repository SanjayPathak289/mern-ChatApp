const express = require("express");
const router = express.Router();
router.use(express.json());
const { registerUser, authUser, allUsers } = require("../controllers/userControllers");
const auth = require("../middleware/auth");
// router.route("/").post(registerUser);
router.route("/").post(registerUser).get(auth, allUsers);
router.post("/login", authUser); //2 Ways
// router.route("/").get(allUsers)

module.exports = router;
