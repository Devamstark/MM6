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
import { ToastProvider } from './context/ToastContext';
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
import { FAQ } from './pages/FAQ';
import { AboutUs } from './pages/AboutUs';
import { Cart } from './pages/Cart';
import { Blog } from './pages/Blog';
import { BlogPostDetail } from './pages/BlogPostDetail';
import { BloggerDashboard } from './pages/BloggerDashboard';
import { MarketingDashboard } from './pages/MarketingDashboard';
import { SecurityDashboard } from './pages/SecurityDashboard';
import ScrollToTop from './components/ScrollToTop';
import { TelegramInitializer } from './components/TelegramInitializer';

function App() {
    return (
        <AuthProvider>
            <TelegramInitializer>
                <ToastProvider>
                    <CartProvider>
                        <BrowserRouter>
                            <ScrollToTop />
                            <Routes>
                                <Route path="/" element={<Layout><Outlet /></Layout>}>
                                    <Route index element={<Home />} />
                                    <Route path="products" element={<Shop />} />
                                    <Route path="product/:slug" element={<ProductDetail />} />
                                    <Route path="cart" element={<Cart />} />
                                    <Route path="login" element={<Auth />} />
                                    <Route path="register" element={<Auth />} />
                                    <Route path="forgot-password" element={<ForgotPassword />} />
                                    <Route path="reset-password" element={<ResetPassword />} />
                                    <Route path="contact" element={<Contact />} />
                                    <Route path="faq" element={<FAQ />} />
                                    <Route path="about" element={<AboutUs />} />
                                    <Route path="page/about-us" element={<Navigate to="/about" replace />} />
                                    <Route path="page/:slug" element={<StaticPage />} />
                                    <Route path="terms" element={<StaticPage page="terms-of-service" />} />
                                    <Route path="privacy" element={<StaticPage page="privacy-policy" />} />
                                    <Route path="blog" element={<Blog />} />
                                    <Route path="blog/:slug" element={<BlogPostDetail />} />
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
                                    <Route element={<ProtectedRoute allowedRoles={['blogger', 'admin']} />}>
                                        <Route path="blogger" element={<BloggerDashboard />} />
                                    </Route>
                                    <Route element={<ProtectedRoute allowedRoles={['admin']} />}>
                                        <Route path="admin" element={<AdminDashboard />} />
                                        <Route path="marketing" element={<MarketingDashboard />} />
                                        <Route path="security" element={<SecurityDashboard />} />
                                    </Route>
                                    <Route path="*" element={<Navigate to="/" replace />} />
                                </Route>
                            </Routes>
                        </BrowserRouter>
                    </CartProvider>
                </ToastProvider>
            </TelegramInitializer>
        </AuthProvider>
    );
}

export default App;
