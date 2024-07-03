const express = require("express");
const userController = require("../controllers/user.js")
const auth = require("../auth.js");

const {verify, verifyAdmin} = auth;
const router = express.Router();


router.post("/register", userController.registerUser);
router.post("/register/Admin", userController.registerAdmin);
router.post("/login", userController.loginUser);
router.get("/details", verify, userController.getProfile);


module.exports = router;