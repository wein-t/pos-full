const express = require('express');
const router = express.Router();
const { getAuditLogs } = require('../controllers/auditController');

// In a real app, you should add middleware here like: verifyToken, verifyAdmin
router.get('/', getAuditLogs);

module.exports = router;