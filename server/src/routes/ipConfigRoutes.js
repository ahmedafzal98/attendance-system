const { Router } = require('express');
const {
  getAllIPConfigs,
  createIPConfig,
  updateIPConfig,
  deleteIPConfig,
} = require('../controllers/ipConfigController');
const { authenticate, requireAdmin } = require('../middleware/auth');

const router = Router();

// All IP config routes require admin authentication
router.get('/', authenticate, requireAdmin, getAllIPConfigs);
router.post('/', authenticate, requireAdmin, createIPConfig);
router.put('/:configId', authenticate, requireAdmin, updateIPConfig);
router.delete('/:configId', authenticate, requireAdmin, deleteIPConfig);

module.exports = router;

