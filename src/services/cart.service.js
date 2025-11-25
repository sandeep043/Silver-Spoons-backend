
const Cart = require('../models/cart.model');


const addItemToCart = async (userId, productId, quantity = 1) => {
    // Find the cart document for the user (one doc per user)
    let cart = await Cart.findOne({ userId });

    if (!cart) {
        // Create a new cart document for the user
        cart = new Cart({ userId, cartitems: [{ productId, quantity }] });
        await cart.save();
        return cart;
    }

    // Find product in products array
    const prodIndex = cart.cartitems.findIndex(p => p.productId.toString() === productId.toString());
    if (prodIndex > -1) {
        // Update existing product quantity
        cart.cartitems[prodIndex].quantity += quantity;
    } else {
        // Add new product entry
        cart.cartitems.push({ productId, quantity });
    }

    await cart.save();
    return cart;
};

const removeItemFromCart = async (userId, productId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) return false;

    const originalLength = cart.cartitems.length;
    cart.cartitems = cart.cartitems.filter(p => p._id.toString() !== productId.toString());

    if (cart.cartitems.length === 0) {
        // remove entire cart document if no items left
        await Cart.deleteOne({ userId });
    } else {
        await cart.save();
    }

    return cart.cartitems.length !== originalLength;
};

const decreaseItemQuantity = async (userId, productId) => {
    const cart = await Cart.findOne({ userId });
    if (!cart) return { success: false, message: 'Cart not found' };

    const prodIndex = cart.cartitems.findIndex(p => p.productId._id.toString() === productId.toString());
    if (prodIndex === -1) return { success: false, message: 'Item not found in cart' };

    if (cart.cartitems[prodIndex].quantity > 1) {
        cart.cartitems[prodIndex].quantity -= 1;
        await cart.save();
        return { success: true, message: 'Quantity decreased', cart };
    }

    // quantity == 1 -> remove the item
    cart.cartitems.splice(prodIndex, 1);
    if (cart.cartitems.length === 0) {
        await Cart.deleteOne({ userId });
    } else {
        await cart.save();
    }

    return { success: true, message: 'Item removed from cart', removed: true };
};

const getCartItems = async (userId) => {
    try {
        // Populate product details for each cart item
        const cart = await Cart.findOne({ userId }).populate({
            path: 'cartitems.productId',
            select: 'name  ImageUrl description  price  category type  calories  grams' // Adjust fields as needed
        });
        if (!cart) return [];
        return cart.cartitems;
    } catch (error) {
        console.error('Error fetching cart items:', error);
        // Fallback: return cart without product details populated
        const cart = await Cart.findOne({ userId });
        if (!cart) return [];
        return cart.cartitems;
    }
};

const clearCart = async (userId) => {
    try {
        const result = await Cart.deleteOne({ userId });
        return {
            success: true,
            message: 'Cart cleared successfully',
            deletedCount: result.deletedCount
        };
    } catch (error) {
        console.error('Error clearing cart:', error);
        throw new Error(`Failed to clear cart: ${error.message}`);
    }
};

module.exports = {
    addItemToCart,
    removeItemFromCart,
    decreaseItemQuantity,
    getCartItems,
    clearCart
};