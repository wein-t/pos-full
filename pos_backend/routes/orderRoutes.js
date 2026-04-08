const express = require("express");
const { 
    addOrder, 
    getOrders, 
    getOrderById, 
    updateOrder, 
    importOrders 
} = require("../controllers/orderController");
const { isVerifiedUser } = require("../middlewares/tokenVerification");

const router = express.Router();

// ==================================================================
// 🚨 CRITICAL FIX: The "/bulk-import" route MUST be defined FIRST.
// ==================================================================
router.post("/bulk-import", isVerifiedUser, importOrders);

// --- Standard Routes ---
router.route("/")
    .post(isVerifiedUser, addOrder)
    .get(isVerifiedUser, getOrders);

// ==================================================================
// 🚨 ID Routes MUST be at the BOTTOM.
// If /:id is above /bulk-import, the server thinks "bulk-import" is an ID.
// ==================================================================
router.route("/:id")
    .get(isVerifiedUser, getOrderById)
    .put(isVerifiedUser, updateOrder);

module.exports = router;