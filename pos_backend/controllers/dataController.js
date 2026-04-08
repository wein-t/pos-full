const Order = require('../models/orderModels');
const User = require('../models/userModels');
const Menu = require('../models/menuModel');
const Sale = require('../models/saleModel');
const xlsx = require('xlsx');
const createHttpError = require('http-errors');

// 1. IMPORT SALES DATA 
const importSalesData = async (req, res, next) => {
    try {
        if (!req.file || !req.file.buffer) {
            return next(createHttpError(400, "No file uploaded or file buffer missing."));
        }

        const workbook = xlsx.read(req.file.buffer, { type: 'buffer' });
        const sheetName = workbook.SheetNames[0]; 
        const worksheet = workbook.Sheets[sheetName];
        
        const data = xlsx.utils.sheet_to_json(worksheet);

        if (data.length === 0) {
            return next(createHttpError(400, "The uploaded file is empty."));
        }

        // Grab the user ID from your token middleware, or use a valid dummy ObjectId
        const adminId = req.user?._id || req.user?.id || "000000000000000000000000";

        // Map the rows to match your exact ORDER MODEL structure
        const ordersToSave = data
            .map(row => {
                // Skip invalid rows
                if (!row['Order ID'] || !row['Date'] || !row['Product Name']) {
                    return null; 
                }
                
                const rowDate = new Date(row['Date']);
                if (isNaN(rowDate.getTime())) {
                    return null; 
                }
                
                const rowTotal = Number(row['Total']) || 0;

                return {
                    orderId: String(row['Order ID']).trim(),
                    customerDetails: {
                        name: 'Imported Customer',
                        contact: 'N/A'
                    },
                    items: [{
                        name: String(row['Product Name']).trim(),
                        quantity: Number(row['Quantity']) || 1,
                        price: Number(row['Price']) || rowTotal
                    }],
                    bills: {
                        total: rowTotal,
                        subTotal: rowTotal,
                        tax: 0,               // <--- ADDED FIX HERE
                        totalWithTax: rowTotal // <--- ADDED FIX HERE
                    },
                    paymentMode: 'Import',
                    orderStatus: 'Completed',
                    createdAt: rowDate,
                    
                    // Required schema fields to prevent MongoDB 500 Errors
                    orderType: 'Take-out',
                    tableNo: 1,
                    cashier: adminId, 
                    user: adminId
                };
            })
            .filter(order => order !== null); 
        
        if (ordersToSave.length === 0) {
            return next(createHttpError(400, "No valid data found. Check your column names."));
        }

        // Save directly to the Order collection so it shows in the UI
        await Order.insertMany(ordersToSave);
        res.status(200).json({ message: `Successfully imported ${ordersToSave.length} records into Orders.` });

    } catch (error) {
        console.error("IMPORT FAILED:", error);
        res.status(500).json({ success: false, message: error.message || "Server error during import process." });
    }
};

// 2. EXPORT ORDERS DATA
const exportOrdersData = async (req, res, next) => {
    try {
        const orders = await Order.find({}).lean();
        if (orders.length === 0) {
            return res.status(404).json({ message: "No orders found to export." });
        }
        
        const totalRevenue = orders.reduce((sum, order) => sum + (order.bills?.total ?? 0), 0);
        const totalItemsSold = orders.reduce((sum, order) => sum + (order.items?.length ?? 0), 0);
        const totalOrders = orders.length;

        const flattenedData = orders.flatMap(order => {
            const orderDate = new Date(order.createdAt ?? Date.now());
            return (order.items ?? []).map(item => ({
                'Order ID': order._id.toString().slice(-6),
                'Date': orderDate.toLocaleDateString(),
                'Month': orderDate.toLocaleString('default', { month: 'long' }),
                'Product Name': item.name ?? 'Unknown Item',
                'Quantity': item.quantity ?? 0,
                'Unit Price': `₱${(item.pricePerQuantity ?? 0).toFixed(2)}`,
                'Total Price': `₱${(item.price ?? 0).toFixed(2)}`,
                'Status': order.orderStatus ?? 'Unknown'
            }));
        });
        
        const workbook = xlsx.utils.book_new();
        const worksheet = xlsx.utils.json_to_sheet([]);
        xlsx.utils.sheet_add_aoa(worksheet, [
            ["Metanoia Snack House - Orders Export"], [], ["SUMMARY"],
            ["Total Orders:", totalOrders], ["Total Items Sold:", totalItemsSold], ["Total Revenue:", `₱${totalRevenue.toFixed(2)}`], [],
        ], { origin: "A1" });
        xlsx.utils.sheet_add_json(worksheet, flattenedData, { origin: "A8" });

        worksheet["!cols"] = [
            { wch: 15 }, { wch: 12 }, { wch: 12 }, { wch: 30 }, { wch: 10 },
            { wch: 15 }, { wch: 15 }, { wch: 15 },
        ];
        
        xlsx.utils.book_append_sheet(workbook, worksheet, "Orders");
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader("Content-Disposition", "attachment; filename=" + "Metanoia-Orders-Export.xlsx");
        
        const buffer = xlsx.write(workbook, { type: 'buffer', bookType: 'xlsx' });
        res.send(buffer);
    } catch (error) {
        console.error("EXPORT FAILED:", error);
        next(error);
    }
};

// 3. GET DASHBOARD STATS
const getDashboardStats = async (req, res, next) => {
    try {
        const totalUsers = await User.countDocuments();
        
        const categories = await Menu.find();
        const totalCategories = categories.length;
        const totalDishes = categories.reduce((acc, cat) => acc + cat.items.length, 0);

        const today = new Date();
        today.setHours(0, 0, 0, 0);
        
        const todaysOrders = await Order.find({ createdAt: { $gte: today } });

        const totalOrdersToday = todaysOrders.length;
        const totalRevenueToday = todaysOrders.reduce((sum, order) => sum + (order.bills?.total || 0), 0);
        
        const pendingOrders = await Order.countDocuments({ orderStatus: "Pending" });
        const inProgressOrders = await Order.countDocuments({ orderStatus: "In Progress" });

        const recentOrders = await Order.find()
            .sort({ createdAt: -1 })
            .limit(5)
            .select('customerDetails orderStatus bills createdAt');

        res.status(200).json({
            success: true,
            data: {
                users: totalUsers,
                menu: { categories: totalCategories, dishes: totalDishes },
                orders: { today: totalOrdersToday, pending: pendingOrders, inProgress: inProgressOrders },
                revenue: { today: totalRevenueToday },
                recentOrders
            }
        });
    } catch (error) {
        next(error);
    }
};

module.exports = { importSalesData, exportOrdersData, getDashboardStats };