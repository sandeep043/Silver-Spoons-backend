const express = require('express');
const router = express.Router();
const addressController = require('../controllers/address.controller');
const { authenticate } = require('../middlewares/authMiddleware');

// All routes require authentication
router.post('/', authenticate, addressController.createAddress);
router.get('/', authenticate, addressController.getAddresses);
router.get('/default', authenticate, addressController.getDefault);
router.get('/:id', authenticate, addressController.getAddress);
router.put('/:id', authenticate, addressController.updateAddress);
router.delete('/:id', authenticate, addressController.deleteAddress);
router.post('/:id/default', authenticate, addressController.setDefault);

module.exports = router;
