const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

// --- User Model ---
const User = sequelize.define('User', {
  name: { type: DataTypes.STRING, allowNull: false },
  email: { type: DataTypes.STRING, allowNull: false, unique: true },
  password: { type: DataTypes.STRING, allowNull: false },
  role: { type: DataTypes.ENUM('admin', 'seller', 'user'), defaultValue: 'user' },
  isActive: { type: DataTypes.BOOLEAN, defaultValue: true }
});

// --- Product Model ---
const Product = sequelize.define('Product', {
  name: { type: DataTypes.STRING, allowNull: false },
  description: { type: DataTypes.TEXT },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  category: { type: DataTypes.STRING },
  brand: { type: DataTypes.STRING, defaultValue: 'Generic' },
  imageUrl: { type: DataTypes.STRING },
  stock: { type: DataTypes.INTEGER, defaultValue: 0 },
  isFeatured: { type: DataTypes.BOOLEAN, defaultValue: false },
  isPopular: { type: DataTypes.BOOLEAN, defaultValue: false }
});

// --- Order Model ---
const Order = sequelize.define('Order', {
  totalPrice: { type: DataTypes.DECIMAL(10, 2), allowNull: false },
  status: { type: DataTypes.ENUM('pending', 'shipped', 'delivered', 'cancelled'), defaultValue: 'pending' },
  customerName: { type: DataTypes.STRING },
  shippingAddress: { type: DataTypes.TEXT }
});

// --- OrderItem Model ---
const OrderItem = sequelize.define('OrderItem', {
  quantity: { type: DataTypes.INTEGER, allowNull: false },
  price: { type: DataTypes.DECIMAL(10, 2), allowNull: false } // Price at time of purchase
});

// Relationships
User.hasMany(Order);
Order.belongsTo(User);

// Seller Relationship
User.hasMany(Product, { foreignKey: 'userId' });
Product.belongsTo(User, { foreignKey: 'userId' });

// Order Items Relationship
Order.hasMany(OrderItem);
OrderItem.belongsTo(Order);
Product.hasMany(OrderItem);
OrderItem.belongsTo(Product);

module.exports = { sequelize, User, Product, Order, OrderItem };