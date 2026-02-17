import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductList as Shop } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Checkout } from './pages/Checkout';
import { SellerDashboard } from './pages/SellerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute'; // Assuming this exists or will enable simple
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { Wishlist } from './pages/Wishlist';
import { Contact } from './pages/Contact';
import { ForgotPassword } from './pages/ForgotPassword';
import { ResetPassword } from './pages/ResetPassword';
import { BonusPoints } from './pages/BonusPoints';
import { Affiliate } from './pages/Affiliate';
import { StaticPage } from './pages/StaticPage';
import { UserProfile } from './pages/UserProfile';

// Simple placeholder for pages we mapped but files were missing or renamed
import { OrderHistory } from './pages/OrderHistory';

import ScrollToTop from './components/ScrollToTop';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <Routes>
                        {/* Public Routes with Layout */}
                        <Route path="/" element={<Layout><Outlet /></Layout>}>
                            <Route index element={<Home />} />
                            <Route path="products" element={<Shop />} />
                            <Route path="product/:id" element={<ProductDetail />} />
                            <Route path="login" element={<Login />} />
                            <Route path="register" element={<Register />} />
                            <Route path="contact" element={<Contact />} />
                            <Route path="forgot-password" element={<ForgotPassword />} />
                            <Route path="reset-password" element={<ResetPassword />} />

                            {/* Static Pages */}
                            <Route path="page/:slug" element={<StaticPage />} />

                            {/* Explicit Static Page Routes if needed */}
                            <Route path="about" element={<StaticPage page="about-us" />} />
                            <Route path="terms" element={<StaticPage page="terms" />} />
                            <Route path="privacy" element={<StaticPage page="privacy" />} />

                            {/* Protected User Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['user', 'seller', 'admin']} />}>
                                <Route path="checkout" element={<Checkout />} />
                                <Route path="orders" element={<OrderHistory />} />
                                <Route path="wishlist" element={<Wishlist />} />
                                <Route path="points" element={<BonusPoints />} />
                                <Route path="affiliate" element={<Affiliate />} />
                                <Route path="profile" element={<UserProfile />} />
                            </Route>

                            {/* Protected Seller Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
                                <Route path="seller" element={<SellerDashboard />} />
                            </Route>

                            {/* Protected Admin Routes */}
                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route path="admin" element={<AdminDashboard />} />
                            </Route>

                            {/* Catch-all for 404 */}
                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
