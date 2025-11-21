const Address = require('../models/address.model');


const addAddress = async (userId, addressData) => {
    // If new address should be default, unset other defaults for this user
    if (addressData.isDefault || addressData.default) {
        await Address.updateMany({ userId }, { $set: { default: false } });
    }

    const address = new Address({ userId, ...addressData });
    return await address.save();
};

const getAddressesByUser = async (userId) => {

    try {
        const addresses = await Address.find({ userId }).sort({ isDefault: -1, createdAt: -1 });
        return addresses;
    }

    catch (error) {
        console.error('Error fetching addresses:', error);
        throw error;
    }
};

const getAddressById = async (userId, addressId) => {
    return await Address.findOne({ _id: addressId, userId });
};

const updateAddress = async (userId, addressId, addressData) => {
    if (addressData.isDefault || addressData.default) {
        await Address.updateMany({ userId }, { $set: { default: false } });
    }

    return await Address.findOneAndUpdate({ _id: addressId, userId }, { $set: addressData }, { new: true });
};

const deleteAddress = async (userId, addressId) => {
    const addr = await Address.findOneAndDelete({ _id: addressId, userId });
    if (!addr) return null;

    // If deleted address was default, set another address as default (if any)
    if (addr.default) {
        const another = await Address.findOne({ userId }).sort({ createdAt: -1 });
        if (another) {
            another.default = true;
            await another.save();
        }
    }

    return addr;
};

const setDefaultAddress = async (userId, addressId) => {
    await Address.updateMany({ userId }, { $set: { default: false } });
    const addr = await Address.findOneAndUpdate({ _id: addressId, userId }, { $set: { default: true } }, { new: true });
    return addr;
};

const getDefaultAddress = async (userId) => {
    return await Address.findOne({ userId, default: true });
};

module.exports = {
    addAddress,
    getAddressesByUser,
    getAddressById,
    updateAddress,
    deleteAddress,
    setDefaultAddress,
    getDefaultAddress
};
