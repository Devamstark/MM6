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

// Simple placeholder for pages we mapped but files were missing or renamed
const OrderHistory = () => (
    <div className="p-10 max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Order History</h1>
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 text-center py-12">
            <p className="text-gray-500">Your order history is empty or loading...</p>
            <p className="text-xs text-gray-400 mt-2">Implementation pending backend integration.</p>
        </div>
    </div>
);

function App() {
    return (
        <AuthProvider>
            <CartProvider>
                <BrowserRouter>
                    <Routes>
                        {/* Public Routes with Layout */}
                        <Route path="/" element={<Layout><Outlet /></Layout>}>
                            <Route index element={<Home />} />
                            <Route path="shop" element={<Shop />} />
                            <Route path="product/:id" element={<ProductDetail />} />
                            <Route path="login" element={<Login />} />
                            <Route path="register" element={<Register />} />
                            <Route path="contact" element={<Contact />} />
                            <Route path="forgot-password" element={<ForgotPassword />} />
                            <Route path="reset-password" element={<ResetPassword />} />
                            <Route path="about" element={<StaticPage page="about" />} />
                            <Route path="terms" element={<StaticPage page="terms" />} />
                            <Route path="privacy" element={<StaticPage page="privacy" />} />

                            {/* Protected User Routes */}
                            {/* Note: ProtectedRoute likely expects Outlet or children */}
                            {/* Assuming simple auth check */}
                            <Route path="checkout" element={<Checkout />} />
                            <Route path="orders" element={<OrderHistory />} />
                            <Route path="wishlist" element={<Wishlist />} />
                            <Route path="points" element={<BonusPoints />} />
                            <Route path="affiliate" element={<Affiliate />} />

                            {/* Protected Seller Routes */}
                            <Route path="seller" element={<SellerDashboard />} />

                            {/* Protected Admin Routes */}
                            <Route path="admin" element={<AdminDashboard />} />

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
