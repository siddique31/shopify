const express = require('express');
const auth = require('../middleware/auth');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Get user's cart
router.get('/', auth, async (req, res) => {
  try {
    let cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    if (!cart) {
      cart = new Cart({ userId: req.user.userId, items: [] });
      await cart.save();
    }
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Add item to cart
router.post('/add', auth, async (req, res) => {
  try {
    const { productId, quantity } = req.body;
    const product = await Product.findById(productId);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    
    let cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) {
      cart = new Cart({ userId: req.user.userId, items: [] });
    }
    
    const existingIndex = cart.items.findIndex(item => item.productId.toString() === productId);
    if (existingIndex > -1) {
      cart.items[existingIndex].quantity += quantity;
    } else {
      cart.items.push({ productId, quantity });
    }
    cart.updatedAt = Date.now();
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Remove item from cart
router.delete('/remove/:productId', auth, async (req, res) => {
  try {
    const cart = await Cart.findOne({ userId: req.user.userId });
    if (!cart) return res.status(404).json({ message: 'Cart not found' });
    cart.items = cart.items.filter(item => item.productId.toString() !== req.params.productId);
    await cart.save();
    res.json(cart);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
