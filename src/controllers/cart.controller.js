const cartService = require('../services/cart.service');

// Add item to cart (+ button)
const addToCart = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { productId, quantity = 1 } = req.body;
        console.log(req.user);
        if (!userId || !productId) {
            return res.status(400).json({ success: false, message: 'userId and productId are required' });
        }

        const cart = await cartService.addItemToCart(userId, productId, quantity);

        res.status(200).json({ success: true, message: 'Item added to cart', data: cart });
    } catch (error) {
        console.error('Add to cart error:', error);
        res.status(500).json({ success: false, message: 'Error adding item to cart', error: error.message });
    }
};

// Decrease item quantity (- button)
const decreaseQuantity = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { productId } = req.body;

        if (!userId || !productId) return res.status(400).json({ success: false, message: 'userId and productId are required' });

        const result = await cartService.decreaseItemQuantity(userId, productId);
        if (!result.success) return res.status(404).json(result);

        res.status(200).json({ success: true, message: result.message, data: result });
    } catch (error) {
        console.error('Decrease quantity error:', error);
        res.status(500).json({ success: false, message: 'Error decreasing item quantity', error: error.message });
    }
};

// Remove entire item from cart
const removeFromCart = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        const { productId } = req.body;

        if (!userId || !productId) return res.status(400).json({ success: false, message: 'userId and productId are required' });

        const isRemoved = await cartService.removeItemFromCart(userId, productId);
        if (!isRemoved) return res.status(404).json({ success: false, message: 'Item not found in cart' });

        res.status(200).json({ success: true, message: 'Item removed from cart' });
    } catch (error) {
        console.error('Remove from cart error:', error);
        res.status(500).json({ success: false, message: 'Error removing item from cart', error: error.message });
    }
};

// Get all cart items for a user
const getCart = async (req, res) => {
    try {
        const userId = req.user && req.user.id;
        if (!userId) return res.status(400).json({ success: false, message: 'userId is required' });

        const cartItems = await cartService.getCartItems(userId);
        res.status(200).json({ success: true, message: 'Cart items fetched', data: cartItems });
    } catch (error) {
        console.error('Get cart error:', error);
        res.status(500).json({ success: false, message: 'Error fetching cart items', error: error.message });
    }
};

module.exports = {
    addToCart,
    decreaseQuantity,
    removeFromCart,
    getCart
};
