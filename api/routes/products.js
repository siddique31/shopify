const express = require('express');
const auth = require('../middleware/auth');
const Product = require('../models/Product');
const router = express.Router();

// Add product (vendor only)
router.post('/', auth, async (req, res) => {
  try {
    const { name, description, price, stock, images } = req.body;
    const product = new Product({
      name,
      description,
      price,
      stock,
      images,
      vendorId: req.user.userId
    });
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get all products (public)
router.get('/', async (req, res) => {
  try {
    const products = await Product.find().populate('vendorId', 'name storeName');
    res.json(products);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// Get single product
router.get('/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
