const mongoose = require("mongoose");

const saleSchema = new mongoose.Schema({
    orderId: { type: String, required: true },
    date: { type: Date, required: true },
    month: { type: String, required: true },
    productName: { type: String, required: true },
    quantity: { type: Number, required: true },
    price: { type: Number, required: true },
    total: { type: Number, required: true },
}, { timestamps: true });

module.exports = mongoose.model("Sale", saleSchema);