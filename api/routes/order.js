const express = require('express');
const auth = require('../middleware/auth');
const Order = require('../models/Order');
const Cart = require('../models/Cart');
const Product = require('../models/Product');
const router = express.Router();

// Place an order
router.post('/', auth, async (req, res) => {
  try {
    const { paymentMethod, address } = req.body;
    const cart = await Cart.findOne({ userId: req.user.userId }).populate('items.productId');
    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ message: 'Cart is empty' });
    }
    
    let total = 0;
    const orderItems = [];
    for (const item of cart.items) {
      const product = item.productId;
      if (product.stock < item.quantity) {
        return res.status(400).json({ message: `${product.name} out of stock` });
      }
      total += product.price * item.quantity;
      orderItems.push({
        productId: product._id,
        name: product.name,
        price: product.price,
        quantity: item.quantity
      });
      // reduce stock
      product.stock -= item.quantity;
      await product.save();
    }
    
    const order = new Order({
      userId: req.user.userId,
      items: orderItems,
      totalAmount: total,
      paymentMethod,
      address
    });
    await order.save();
    
    // clear cart
    cart.items = [];
    await cart.save();
    
    res.status(201).json(order);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get user's orders
router.get('/my-orders', auth, async (req, res) => {
  try {
    const orders = await Order.find({ userId: req.user.userId }).sort('-createdAt');
    res.json(orders);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
