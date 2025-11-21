const addressService = require('../services/address.service');

// Create address
const createAddress = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const addressData = req.body;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const address = await addressService.addAddress(userId, addressData);
        res.status(201).json({ success: true, data: address });
    } catch (error) {
        console.error('Create address error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get all addresses for authenticated user
const getAddresses = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const addresses = await addressService.getAddressesByUser(userId);
        res.status(200).json({ success: true, data: addresses });
    } catch (error) {
        console.error('Get addresses error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get single address
const getAddress = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { id } = req.params;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const address = await addressService.getAddressById(userId, id);
        if (!address) return res.status(404).json({ success: false, message: 'Address not found' });
        res.status(200).json({ success: true, data: address });
    } catch (error) {
        console.error('Get address error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Update address
const updateAddress = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { id } = req.params;
        const addressData = req.body;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const updated = await addressService.updateAddress(userId, id, addressData);
        if (!updated) return res.status(404).json({ success: false, message: 'Address not found' });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Update address error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Delete address
const deleteAddress = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { id } = req.params;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const deleted = await addressService.deleteAddress(userId, id);
        if (!deleted) return res.status(404).json({ success: false, message: 'Address not found' });
        res.status(200).json({ success: true, data: deleted });
    } catch (error) {
        console.error('Delete address error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Set default address
const setDefault = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { id } = req.params;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const updated = await addressService.setDefaultAddress(userId, id);
        if (!updated) return res.status(404).json({ success: false, message: 'Address not found' });
        res.status(200).json({ success: true, data: updated });
    } catch (error) {
        console.error('Set default address error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

// Get default address
const getDefault = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(401).json({ success: false, message: 'Authentication required' });

        const addr = await addressService.getDefaultAddress(userId);
        if (!addr) return res.status(404).json({ success: false, message: 'No default address set' });
        res.status(200).json({ success: true, data: addr });
    } catch (error) {
        console.error('Get default address error:', error);
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = {
    createAddress,
    getAddresses,
    getAddress,
    updateAddress,
    deleteAddress,
    setDefault,
    getDefault
};
