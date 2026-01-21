const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { sequelize, User, Product, Order, OrderItem } = require('./models');
const { Op } = require('sequelize');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// --- Middleware ---
const authenticate = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ message: 'Unauthorized' });
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    res.status(403).json({ message: 'Invalid token' });
  }
};

const isAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') return res.status(403).json({ message: 'Admin access required' });
  next();
};

const isSellerOrAdmin = (req, res, next) => {
  if (req.user.role !== 'admin' && req.user.role !== 'seller') {
    return res.status(403).json({ message: 'Seller access required' });
  }
  next();
};

// --- Auth Routes ---
app.post('/api/auth/register', async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const finalRole = (role === 'seller') ? 'seller' : 'user';
    
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await User.create({ name, email, password: hashedPassword, role: finalRole });
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.status(201).json({ user: { id: user.id, name, email, role: user.role }, token });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ where: { email } });
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ message: 'Invalid credentials' });
    }
    if (!user.isActive) {
      return res.status(403).json({ message: 'Account is disabled. Contact admin.' });
    }
    const token = jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET);
    res.json({ user: { id: user.id, name: user.name, email, role: user.role }, token });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// --- Product Routes ---
app.get('/api/products', async (req, res) => {
  try {
    const { search, category, brand, minPrice, maxPrice, sort, isFeatured, isPopular, sellerId } = req.query;
    const whereClause = {};

    if (search) {
      whereClause[Op.or] = [
        { name: { [Op.like]: `%${search}%` } },
        { description: { [Op.like]: `%${search}%` } }
      ];
    }
    if (category) whereClause.category = category;
    if (brand) whereClause.brand = brand;
    if (sellerId) whereClause.userId = sellerId;
    if (isFeatured === 'true') whereClause.isFeatured = true;
    if (isPopular === 'true') whereClause.isPopular = true;

    if (minPrice || maxPrice) {
      whereClause.price = {};
      if (minPrice) whereClause.price[Op.gte] = parseFloat(minPrice);
      if (maxPrice) whereClause.price[Op.lte] = parseFloat(maxPrice);
    }

    let order = [['createdAt', 'DESC']];
    if (sort === 'price_asc') order = [['price', 'ASC']];
    if (sort === 'price_desc') order = [['price', 'DESC']];

    const products = await Product.findAll({ where: whereClause, order: order });
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Add Product (Admin or Seller)
app.post('/api/products', authenticate, isSellerOrAdmin, async (req, res) => {
  try {
    const productData = { ...req.body, userId: req.user.id };
    const product = await Product.create(productData);
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.put('/api/products/:id', authenticate, isSellerOrAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'admin' && product.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only edit your own products' });
    }
    await product.update(req.body);
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:id', authenticate, isSellerOrAdmin, async (req, res) => {
  try {
    const product = await Product.findByPk(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    if (req.user.role !== 'admin' && product.userId !== req.user.id) {
      return res.status(403).json({ message: 'You can only delete your own products' });
    }
    await product.destroy();
    res.json({ message: 'Product deleted' });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Order Routes ---
app.post('/api/orders', authenticate, async (req, res) => {
  const t = await sequelize.transaction();
  try {
    const { items, shippingAddress, totalPrice } = req.body; // items: [{ productId, quantity, price }]
    
    // Create Order
    const order = await Order.create({
      UserId: req.user.id,
      customerName: req.user.name || 'Customer', // In real app, might come from profile
      totalPrice,
      shippingAddress,
      status: 'pending'
    }, { transaction: t });

    // Create Order Items
    const orderItemsData = items.map(item => ({
      OrderId: order.id,
      ProductId: item.productId,
      quantity: item.quantity,
      price: item.price
    }));

    await OrderItem.bulkCreate(orderItemsData, { transaction: t });

    // Update Stock (Optional: Basic implementation)
    for (const item of items) {
      const product = await Product.findByPk(item.productId);
      if (product) {
         await product.update({ stock: product.stock - item.quantity }, { transaction: t });
      }
    }

    await t.commit();
    res.status(201).json(order);
  } catch (err) {
    await t.rollback();
    res.status(400).json({ error: err.message });
  }
});

// --- Admin/Dashboard Routes ---
app.get('/api/admin/stats', authenticate, isAdmin, async (req, res) => {
  const totalRevenue = await Order.sum('totalPrice') || 0;
  const totalOrders = await Order.count();
  const totalProducts = await Product.count();
  const totalUsers = await User.count();
  res.json({ totalRevenue, totalOrders, totalProducts, totalUsers });
});

app.get('/api/admin/users', authenticate, isAdmin, async (req, res) => {
  const users = await User.findAll({ attributes: { exclude: ['password'] } });
  res.json(users);
});

app.put('/api/admin/users/:id/status', authenticate, isAdmin, async (req, res) => {
  try {
    const user = await User.findByPk(req.params.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    user.isActive = req.body.isActive;
    await user.save();
    res.json({ message: 'User status updated', user: { id: user.id, isActive: user.isActive } });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// --- Start Server ---
const PORT = process.env.PORT || 5000;
sequelize.sync({ alter: true }).then(() => {
  app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
}).catch(err => console.error('Database connection error:', err));