const AuditLog = require('../models/auditLogModel');

// --- HELPER: Use this in other controllers to save a log ---
const logActivity = async (userId, action, details) => {
    try {
        await AuditLog.create({ user: userId, action, details });
    } catch (error) {
        console.error("Failed to create audit log:", error);
    }
};

// --- API: Get all logs (Admin Only) ---
const getAuditLogs = async (req, res) => {
    try {
        // Fetch logs, populate user details, sort by newest first
        const logs = await AuditLog.find()
            .populate('user', 'name email role') 
            .sort({ timestamp: -1 }); 

        res.status(200).json({ success: true, data: logs });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { logActivity, getAuditLogs };