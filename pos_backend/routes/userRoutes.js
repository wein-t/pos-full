const express = require("express");
const { register, login, getUserData, logout, getAllUsers, deleteUser, updateUserRole } = require("../controllers/userController");
const { isVerifiedUser, isAdmin } = require("../middlewares/tokenVerification");
const router = express.Router();

// Public Routes
router.route("/register").post(register);
router.route("/login").post(login);

// Protected Routes
router.route("/logout").post(isVerifiedUser, logout);
router.route("/").get(isVerifiedUser, getUserData);

// Admin Routes for User Management
router.route("/all").get(isVerifiedUser, isAdmin, getAllUsers);
router.route("/:id").delete(isVerifiedUser, isAdmin, deleteUser);
router.route("/role/:id").put(isVerifiedUser, isAdmin, updateUserRole);

module.exports = router;