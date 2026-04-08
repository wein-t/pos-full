const mongoose = require("mongoose");

const menuItemSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
});

const menuCategorySchema = new mongoose.Schema({
    name: { type: String, required: true },
    bgColor: { type: String, default: "#1f1f1f" }, 
    icon: { type: String, default: "🍽️" },
    items: [menuItemSchema] 
}, { timestamps: true });

module.exports = mongoose.model("Menu", menuCategorySchema);