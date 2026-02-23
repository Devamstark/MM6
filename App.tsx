import { BrowserRouter, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import { Layout } from './components/Layout';
import { Home } from './pages/Home';
import { ProductList as Shop } from './pages/ProductList';
import { ProductDetail } from './pages/ProductDetail';
import { Auth } from './pages/Auth';
import { Checkout } from './pages/Checkout';
import { SellerDashboard } from './pages/SellerDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { ProtectedRoute } from './components/ProtectedRoute';
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
import { OrderHistory } from './pages/OrderHistory';
import { OrderDetail } from './pages/OrderDetail';
import ScrollToTop from './components/ScrollToTop';

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <ScrollToTop />
                    <Routes>
                        <Route path="/" element={<Layout><Outlet /></Layout>}>
                            <Route index element={<Home />} />
                            <Route path="products" element={<Shop />} />
                            <Route path="product/:slug" element={<ProductDetail />} />

                            <Route path="login" element={<Auth />} />
                            <Route path="register" element={<Auth />} />
                            <Route path="forgot-password" element={<ForgotPassword />} />
                            <Route path="reset-password" element={<ResetPassword />} />

                            <Route path="contact" element={<Contact />} />
                            <Route path="page/:slug" element={<StaticPage />} />
                            <Route path="about" element={<StaticPage page="about-us" />} />
                            <Route path="terms" element={<StaticPage page="terms" />} />
                            <Route path="privacy" element={<StaticPage page="privacy" />} />

                            <Route element={<ProtectedRoute allowedRoles={['user', 'seller', 'admin']} />}>
                                <Route path="checkout" element={<Checkout />} />
                                <Route path="orders" element={<OrderHistory />} />
                                <Route path="orders/:id" element={<OrderDetail />} />
                                <Route path="wishlist" element={<Wishlist />} />
                                <Route path="points" element={<BonusPoints />} />
                                <Route path="affiliate" element={<Affiliate />} />
                                <Route path="profile" element={<UserProfile />} />
                            </Route>

                            <Route element={<ProtectedRoute allowedRoles={['seller', 'admin']} />}>
                                <Route path="seller" element={<SellerDashboard />} />
                            </Route>

                            <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                <Route path="admin" element={<AdminDashboard />} />
                            </Route>

                            <Route path="*" element={<Navigate to="/" replace />} />
                        </Route>
                    </Routes>
                </BrowserRouter>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;
