const Menu = require("../models/menuModel");
const createHttpError = require("http-errors");

// Get all menus
const getMenus = async (req, res, next) => {
    try {
        const menus = await Menu.find();
        res.status(200).json({ success: true, data: menus });
    } catch (error) {
        next(error);
    }
};

// Add a Category
const addCategory = async (req, res, next) => {
    try {
        const { name, icon, bgColor } = req.body;
        if (!name) return next(createHttpError(400, "Category name is required"));
        
        const newCategory = new Menu({ name, icon, bgColor, items: [] });
        await newCategory.save();
        res.status(201).json({ success: true, message: "Category added!", data: newCategory });
    } catch (error) {
        next(error);
    }
};

// Delete a Category
const deleteCategory = async (req, res, next) => {
    try {
        await Menu.findByIdAndDelete(req.params.id);
        res.status(200).json({ success: true, message: "Category deleted!" });
    } catch (error) {
        next(error);
    }
};

// Add Item to Category
const addItem = async (req, res, next) => {
    try {
        const { name, price } = req.body;
        const categoryId = req.params.id;

        const category = await Menu.findById(categoryId);
        if (!category) return next(createHttpError(404, "Category not found"));

        category.items.push({ name, price });
        await category.save();

        res.status(200).json({ success: true, message: "Item added!", data: category });
    } catch (error) {
        next(error);
    }
};

// Delete Item from Category
const deleteItem = async (req, res, next) => {
    try {
        const { categoryId, itemId } = req.params;
        
        const category = await Menu.findById(categoryId);
        if (!category) return next(createHttpError(404, "Category not found"));

        // Filter out the item to delete
        category.items = category.items.filter(item => item._id.toString() !== itemId);
        await category.save();

        res.status(200).json({ success: true, message: "Item deleted!", data: category });
    } catch (error) {
        next(error);
    }
};

// Update Item Price
const updateItemPrice = async (req, res, next) => {
    try {
        const { categoryId, itemId } = req.params;
        const { price } = req.body;

        if (price === undefined || price === null || price < 0) {
            return next(createHttpError(400, "A valid price is required"));
        }

        const category = await Menu.findById(categoryId);
        if (!category) return next(createHttpError(404, "Category not found"));

        // Mongoose subdocuments have an .id() method to find them easily
        const item = category.items.id(itemId);
        if (!item) return next(createHttpError(404, "Dish not found"));

        item.price = price;
        await category.save();

        res.status(200).json({ success: true, message: "Price updated!", data: category });
    } catch (error) {
        next(error);
    }
};

module.exports = { 
    getMenus, 
    addCategory, 
    deleteCategory, 
    addItem, 
    deleteItem, 
    updateItemPrice 
};