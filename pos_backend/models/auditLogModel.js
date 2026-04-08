const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    user: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: 'User', // Links to your User model
        required: true 
    },
    action: { 
        type: String, 
        required: true 
    }, // e.g., "CREATE_ORDER", "DELETE_ITEM", "LOGIN"
    details: { 
        type: String, 
        required: true 
    }, // e.g., "Created Order #12345 worth ₱500"
    timestamp: { 
        type: Date, 
        default: Date.now 
    }
});

module.exports = mongoose.model('AuditLog', auditLogSchema);