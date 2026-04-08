const createHttpError = require("http-errors");
const Order = require("../models/orderModels");
// Import the Audit Logger
const { logActivity } = require('./auditController'); 

// --- ADD SINGLE ORDER ---
const addOrder = async (req, res, next) => {
    try {
        const order = new Order(req.body);
        await order.save();

        // 📝 AUDIT LOG: Record who placed this order
        if (req.user) {
            await logActivity(
                req.user._id || req.user.id, 
                "CREATE_ORDER", 
                `Created Order #${order._id} (Amount: ₱${order.bills?.total || 0})`
            );
        }

        res.status(201).json({ success: true, message: "Order created!", data: order });
    } catch (error) {
        console.log("--- ORDER CREATION FAILED ---", error);
        next(error);
    }
}

// --- GET ORDER BY ID ---
const getOrderById = async (req, res, next) => {
    try {
        const order = await Order.findById(req.params.id);
        if (!order) {
            const error = createHttpError(404, "Order not found!");
            return next(error);
        }
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
}

// --- GET ALL ORDERS ---
const getOrders = async (req, res, next) => {
    try {
        const orders = await Order.find();
        res.status(200).json({ data: orders })
    } catch (error) {
        next(error);
    }
}

// --- UPDATE ORDER STATUS ---
const updateOrder = async (req, res, next) => {
    try {
        const { orderStatus } = req.body;
        const order = await Order.findByIdAndUpdate(
            req.params.id,
            { orderStatus },
            { new: true }
        );

        if (!order) {
            const error = createHttpError(404, "Order not found!");
            return next(error);
        }

        // 📝 AUDIT LOG: Record status updates
        if (req.user) {
            await logActivity(
                req.user._id || req.user.id, 
                "UPDATE_STATUS", 
                `Updated Order #${order._id} to '${orderStatus}'`
            );
        }

        res.status(200).json({ success: true, message: "Order updated", data: order });

    } catch (error) {
        next(error);
    }
}

// =====================================================================
// 🚨 BULK IMPORT FUNCTION (Translates CSV Headers to MongoDB Schema)
// =====================================================================
const importOrders = async (req, res, next) => {
    try {
        const { orders } = req.body;

        // 1. Validation
        if (!orders || !Array.isArray(orders) || orders.length === 0) {
            return res.status(400).json({ success: false, message: "No order data provided for import." });
        }

        // 2. GET REAL ID FROM TOKEN
        const currentUser = req.user ? (req.user._id || req.user.id) : null;

        if (!currentUser) {
             return res.status(401).json({ success: false, message: "Unauthorized: User not identified." });
        }

        // 3. CLEAN & PREPARE DATA (Translate CSV Headers to Schema)
        const cleanOrders = orders.map(row => {
            // Extract values using the exact CSV column names from your template
            const customerName = row["CUSTOMER"] || row["customer"] || "Walk-in";
            const paymentMode = row["PAYMENT"] || row["PAYMENT MODE"] || row["payment"] || "Cash";
            
            // Defensively strip the ₱ sign and commas before saving as a Number
            let rawTotal = String(row["TOTAL"] || row["TOTAL AMOUNT"] || row.bills?.total || "0");
            rawTotal = rawTotal.replace(/[^0-9.-]+/g, ""); 
            const totalAmount = Number(rawTotal);
            
            // Parse the "ITEMS SUMMARY" string into a proper array for MongoDB
            let parsedItems = [];
            const itemsString = row["ITEMS SUMMARY"] || row["items_summary"] || "";
            
            if (itemsString) {
                // Split by comma in case there are multiple items
                const parts = itemsString.split(',');
                parts.forEach(part => {
                    parsedItems.push({
                        name: part.trim(),
                        quantity: 1, // Fallback generic quantity
                        price: 0     // Fallback generic price
                    });
                });
            } else if (row.items && Array.isArray(row.items)) {
                parsedItems = row.items; 
            }

            // Create valid Date object from CSV DATE and TIME columns
            let orderDate = new Date();
            if (row["DATE"]) {
                const timeString = row["TIME"] || "12:00 PM";
                orderDate = new Date(`${row["DATE"]} ${timeString}`);
                if (isNaN(orderDate)) orderDate = new Date(); // Safety fallback
            }

            return {
                user: currentUser, 
                cashier: currentUser, 
                customerDetails: {
                    name: customerName,
                },
                items: parsedItems,
                totalItems: parsedItems.length,
                orderStatus: "Completed", // Automatically mark imported data as completed
                paymentMethod: paymentMode,
                bills: {
                    total: totalAmount,
                    subTotal: totalAmount
                },
                createdAt: orderDate
            };
        });

        // 4. INSERT TO DATABASE
        const savedOrders = await Order.insertMany(cleanOrders, { ordered: false });

        // 📝 AUDIT LOG
        await logActivity(
            currentUser, 
            "BULK_IMPORT", 
            `Imported ${savedOrders.length} orders via Excel`
        );

        res.status(201).json({
            success: true,
            message: `Successfully imported ${savedOrders.length} orders!`,
            data: savedOrders
        });

    } catch (error) {
        console.error("IMPORT ERROR:", error);
        
        // Handle Partial Success
        if (error.insertedDocs && error.insertedDocs.length > 0) {
             if(req.user) {
                 await logActivity(req.user._id, "BULK_IMPORT_PARTIAL", `Partially imported ${error.insertedDocs.length} orders (some failed)`);
             }

             return res.status(201).json({
                success: true,
                message: `Partially imported ${error.insertedDocs.length} orders. (Some rows failed validation)`,
                data: error.insertedDocs
            });
        }
        
        if (error.name === 'ValidationError') {
            return res.status(400).json({ 
                success: false, 
                message: "Database rejected data. Make sure the CSV matches the exact template columns." 
            });
        }

        next(error);
    }
}

module.exports = { addOrder, getOrderById, getOrders, updateOrder, importOrders };