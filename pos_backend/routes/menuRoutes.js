const express = require("express");
const router = express.Router();
const { 
    getMenus, 
    addCategory, 
    deleteCategory, 
    addItem, 
    deleteItem, 
    updateItemPrice // <-- Imported the new function
} = require("../controllers/menuController");
const { isVerifiedUser } = require("../middlewares/tokenVerification"); 

// Read (Public/User)
router.get("/", isVerifiedUser, getMenus);

// Write & Update (Admin/Manager)
router.post("/category", isVerifiedUser, addCategory);
router.delete("/category/:id", isVerifiedUser, deleteCategory);
router.post("/category/:id/items", isVerifiedUser, addItem);
router.delete("/category/:categoryId/items/:itemId", isVerifiedUser, deleteItem);

// NEW: Update Item Price
router.put("/category/:categoryId/items/:itemId", isVerifiedUser, updateItemPrice);

module.exports = router;