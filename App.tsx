import React from 'react';
import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductList } from './pages/ProductList';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { AdminDashboard } from './pages/AdminDashboard';
import { SellerDashboard } from './pages/SellerDashboard';
import { Checkout } from './pages/Checkout';

const ProtectedRoute = ({ children, requiredRole }: { children: React.ReactNode, requiredRole?: 'admin' | 'seller' }) => {
  const { isAuthenticated, user } = useAuth();

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  if (requiredRole && user?.role !== requiredRole) {
    // If user is admin, they can access seller routes generally
    if (requiredRole === 'seller' && user?.role === 'admin') return <>{children}</>;
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

import { StaticPage } from './pages/StaticPage';
import { Contact } from './pages/Contact';
import { Affiliate } from './pages/Affiliate';
import { BonusPoints } from './pages/BonusPoints';

const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/products" element={<ProductList />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/checkout" element={<Checkout />} />
      <Route path="/contact" element={<Contact />} />
      <Route path="/page/:slug" element={<StaticPage />} />
      <Route path="/affiliate" element={<Affiliate />} />
      <Route path="/bonus-points" element={<BonusPoints />} />
      <Route
        path="/admin"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminDashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/seller"
        element={
          <ProtectedRoute requiredRole="seller">
            <SellerDashboard />
          </ProtectedRoute>
        }
      />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <HashRouter>
          <Layout>
            <AppRoutes />
          </Layout>
        </HashRouter>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;