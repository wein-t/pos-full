const express = require('express');
const router = express.Router();
const multer = require('multer');
const { importSalesData, exportOrdersData, getDashboardStats } = require('../controllers/dataController');
const { isVerifiedUser, isAdmin } = require('../middlewares/tokenVerification');

// 1. Configure Multer to hold the uploaded file in memory temporarily
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 2. Import Sales Data 
// 'spreadsheet' matches the formData.append('spreadsheet', file) in React
router.post('/import', isVerifiedUser, isAdmin, upload.single('spreadsheet'), importSalesData);

// 3. Export Orders
router.get('/export/orders', isVerifiedUser, isAdmin, exportOrdersData);

// 4. Dashboard Statistics 
router.get('/stats', isVerifiedUser, isAdmin, getDashboardStats);

module.exports = router;