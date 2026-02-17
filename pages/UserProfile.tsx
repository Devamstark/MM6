import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import { User, Address, Order, Review, Affiliate } from '../types';
import { User as UserIcon, MapPin, Shield, ShoppingBag, Star, DollarSign, Camera, Edit2, Trash2, Plus, LogOut, Loader2, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export const UserProfile = () => {
    const { user, setUser, logout } = useAuth();
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState<'profile' | 'addresses' | 'security' | 'orders' | 'reviews' | 'affiliate'>('profile');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

    // Profile State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phoneNumber: '',
        bio: '',
    });
    const [profileImage, setProfileImage] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string>('');

    // Address State
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [editingAddress, setEditingAddress] = useState<Partial<Address> | null>(null);
    const [showAddressForm, setShowAddressForm] = useState(false);

    // Security State
    const [passwords, setPasswords] = useState({ old: '', new: '', confirm: '' });

    // Data State
    const [orders, setOrders] = useState<Order[]>([]);
    const [reviews, setReviews] = useState<Review[]>([]); // Use Review type
    const [affiliate, setAffiliate] = useState<Affiliate | null>(null);

    useEffect(() => {
        if (user) {
            setFormData({
                firstName: user.firstName || user.name.split(' ')[0] || '',
                lastName: user.lastName || user.name.split(' ').slice(1).join(' ') || '',
                email: user.email || '',
                phoneNumber: user.phoneNumber || '',
                bio: user.bio || '',
            });
            setImagePreview(user.profilePicture || '');
            loadData();
        } else {
            navigate('/login');
        }
    }, [user]);

    const loadData = async () => {
        try {
            const [addr, ord, rev, aff] = await Promise.all([
                api.getAddresses().catch(() => []),
                api.getMyOrders().catch(() => []),
                api.getUserReviews().catch(() => []),
                api.getAffiliate().catch(() => null)
            ]);
            setAddresses(addr);
            setOrders(ord);
            setReviews(rev);
            setAffiliate(aff);
        } catch (error) {
            console.error("Failed to load profile data", error);
        }
    };

    const handleProfileUpdate = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);
        try {
            const data = new FormData();
            data.append('first_name', formData.firstName);
            data.append('last_name', formData.lastName);
            data.append('email', formData.email);
            data.append('phone_number', formData.phoneNumber);
            data.append('bio', formData.bio);

            if (profileImage) {
                // Convert to Base64
                const reader = new FileReader();
                reader.readAsDataURL(profileImage);
                await new Promise((resolve) => {
                    reader.onloadend = () => {
                        data.append('profile_picture', reader.result as string);
                        resolve(null);
                    };
                });
            }

            const updatedUser = await api.updateProfile(data);
            setUser(updatedUser);
            setMessage({ type: 'success', text: 'Profile updated successfully!' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to update profile.' });
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            setProfileImage(file);
            // Create a temporary URL for preview
            setImagePreview(URL.createObjectURL(file));
        }
    };

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault();
        if (passwords.new !== passwords.confirm) {
            setMessage({ type: 'error', text: 'New passwords do not match.' });
            return;
        }
        setLoading(true);
        try {
            await api.changePassword(passwords.old, passwords.new);
            setMessage({ type: 'success', text: 'Password changed successfully!' });
            setPasswords({ old: '', new: '', confirm: '' });
        } catch (error) {
            setMessage({ type: 'error', text: 'Failed to change password. check old password.' });
        } finally {
            setLoading(false);
        }
    };

    const handleAddressSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingAddress) return;
        setLoading(true);
        try {
            if (editingAddress.id) {
                await api.updateAddress(editingAddress.id, editingAddress);
            } else {
                // @ts-ignore - id is optional for new address
                await api.addAddress(editingAddress);
            }
            const updated = await api.getAddresses();
            setAddresses(updated);
            setShowAddressForm(false);
            setEditingAddress(null);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    const deleteAddress = async (id: string) => {
        if (!confirm('Are you sure?')) return;
        try {
            await api.deleteAddress(id);
            setAddresses(addresses.filter(a => a.id !== id));
        } catch (error) {
            console.error(error);
        }
    };

    return (
        <div className="max-w-7xl mx-auto px-4 py-12 flex flex-col md:flex-row gap-8">
            {/* Sidebar */}
            <aside className="w-full md:w-64 flex-shrink-0 space-y-2">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 mb-6 dark:bg-gray-800 dark:border-gray-700">
                    <div className="flex flex-col items-center text-center">
                        <div className="w-20 h-20 rounded-full bg-gray-100 mb-4 overflow-hidden dark:bg-gray-700">
                            {imagePreview ? (
                                <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                            ) : (
                                <UserIcon className="w-full h-full p-4 text-gray-400" />
                            )}
                        </div>
                        <h2 className="font-bold text-lg dark:text-white">{user?.name}</h2>
                        <p className="text-sm text-gray-500 dark:text-gray-400">{user?.email}</p>
                    </div>
                </div>

                <nav className="space-y-1">
                    {[
                        { id: 'profile', icon: UserIcon, label: 'Profile Info' },
                        { id: 'addresses', icon: MapPin, label: 'Addresses' },
                        { id: 'security', icon: Shield, label: 'Security' },
                        user?.role !== 'admin' ? { id: 'orders', icon: ShoppingBag, label: 'My Orders' } : null,
                        user?.role !== 'admin' ? { id: 'reviews', icon: Star, label: 'My Reviews' } : null,
                        user?.isAffiliate ? { id: 'affiliate', icon: DollarSign, label: 'Affiliate Dashboard' } : null,
                    ].filter(Boolean).map((item: any) => (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium ${activeTab === item.id
                                ? 'bg-black text-white dark:bg-white dark:text-black'
                                : 'text-gray-600 hover:bg-gray-50 dark:text-gray-300 dark:hover:bg-gray-800'
                                }`}
                        >
                            <item.icon className="w-5 h-5" />
                            {item.label}
                        </button>
                    ))}
                    <button
                        onClick={logout}
                        className="w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20"
                    >
                        <LogOut className="w-5 h-5" />
                        Log Out
                    </button>
                </nav>
            </aside>

            {/* Main Content */}
            <main className="flex-1 bg-white rounded-3xl shadow-sm border border-gray-100 p-8 min-h-[600px] dark:bg-gray-800 dark:border-gray-700">
                {message && (
                    <div className={`p-4 rounded-xl mb-6 ${message.type === 'success' ? 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-300' : 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-300'}`}>
                        {message.text}
                    </div>
                )}

                {activeTab === 'profile' && (
                    <div className="max-w-xl animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">Personal Information</h2>
                        <form onSubmit={handleProfileUpdate} className="space-y-6">
                            <div className="flex items-center gap-6">
                                <div className="w-24 h-24 rounded-full bg-gray-100 overflow-hidden relative group dark:bg-gray-700">
                                    {imagePreview ? (
                                        <img src={imagePreview} alt="Profile" className="w-full h-full object-cover" />
                                    ) : (
                                        <UserIcon className="w-full h-full p-6 text-gray-400" />
                                    )}
                                    <label className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer">
                                        <Camera className="w-8 h-8 text-white" />
                                        <input type="file" className="hidden" accept="image/*" onChange={handleImageChange} />
                                    </label>
                                </div>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    <p>Allowed: JPG, PNG, WEBP</p>
                                    <p>Max size: 2MB</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">First Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.firstName}
                                        onChange={e => setFormData({ ...formData, firstName: e.target.value })}
                                        required
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium mb-2 dark:text-gray-300">Last Name</label>
                                    <input
                                        type="text"
                                        className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                        value={formData.lastName}
                                        onChange={e => setFormData({ ...formData, lastName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Email Address</label>
                                <input
                                    type="email"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 bg-gray-50 cursor-not-allowed dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300"
                                    value={formData.email}
                                    readOnly
                                />
                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                    <Shield className="w-3 h-3" /> Verified Account
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Phone Number</label>
                                <input
                                    type="tel"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={formData.phoneNumber}
                                    onChange={e => setFormData({ ...formData, phoneNumber: e.target.value })}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Bio</label>
                                <textarea
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    rows={3}
                                    value={formData.bio}
                                    onChange={e => setFormData({ ...formData, bio: e.target.value })}
                                ></textarea>
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 dark:bg-white dark:text-black dark:hover:bg-gray-200"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Save Changes'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'addresses' && (
                    <div className="animate-fade-in">
                        <div className="flex justify-between items-center mb-6">
                            <h2 className="text-2xl font-bold dark:text-white">Address Book</h2>
                            <button
                                onClick={() => { setEditingAddress({ type: 'shipping', isDefault: false }); setShowAddressForm(true); }}
                                className="flex items-center gap-2 px-4 py-2 bg-black text-white rounded-lg text-sm font-bold dark:bg-white dark:text-black"
                            >
                                <Plus className="w-4 h-4" /> Add Address
                            </button>
                        </div>

                        {showAddressForm && (
                            <form onSubmit={handleAddressSubmit} className="bg-gray-50 p-6 rounded-2xl mb-6 dark:bg-gray-700">
                                <h3 className="font-bold mb-4 dark:text-white">{editingAddress?.id ? 'Edit Address' : 'New Address'}</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <input placeholder="Full Name" required className="p-3 rounded-lg border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={editingAddress?.fullName || ''} onChange={e => setEditingAddress({ ...editingAddress, fullName: e.target.value })} />
                                    <input placeholder="Phone" required className="p-3 rounded-lg border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={editingAddress?.phone || ''} onChange={e => setEditingAddress({ ...editingAddress, phone: e.target.value })} />
                                    <input placeholder="Street Address" required className="p-3 rounded-lg border col-span-2 dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={editingAddress?.street || ''} onChange={e => setEditingAddress({ ...editingAddress, street: e.target.value })} />
                                    <input placeholder="City" required className="p-3 rounded-lg border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={editingAddress?.city || ''} onChange={e => setEditingAddress({ ...editingAddress, city: e.target.value })} />
                                    <input placeholder="State" required className="p-3 rounded-lg border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={editingAddress?.state || ''} onChange={e => setEditingAddress({ ...editingAddress, state: e.target.value })} />
                                    <input placeholder="Zip Code" required className="p-3 rounded-lg border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={editingAddress?.postalCode || ''} onChange={e => setEditingAddress({ ...editingAddress, postalCode: e.target.value })} />
                                    <input placeholder="Country" required className="p-3 rounded-lg border dark:bg-gray-600 dark:border-gray-500 dark:text-white" value={editingAddress?.country || ''} onChange={e => setEditingAddress({ ...editingAddress, country: e.target.value })} />
                                    <div className="flex items-center gap-2">
                                        <input type="checkbox" checked={editingAddress?.isDefault} onChange={e => setEditingAddress({ ...editingAddress, isDefault: e.target.checked })} />
                                        <label className="dark:text-gray-300">Set as default</label>
                                    </div>
                                </div>
                                <div className="flex gap-2">
                                    <button type="submit" disabled={loading} className="px-4 py-2 bg-black text-white rounded-lg font-bold dark:bg-white dark:text-black">Save</button>
                                    <button type="button" onClick={() => setShowAddressForm(false)} className="px-4 py-2 bg-gray-200 rounded-lg font-bold text-gray-700 dark:bg-gray-600 dark:text-gray-200">Cancel</button>
                                </div>
                            </form>
                        )}

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {addresses.map(addr => (
                                <div key={addr.id} className="border border-gray-200 rounded-xl p-6 relative group dark:border-gray-700 dark:bg-gray-700/50">
                                    {addr.isDefault && (
                                        <span className="absolute top-4 right-4 text-xs bg-black text-white px-2 py-1 rounded-full dark:bg-white dark:text-black">Default</span>
                                    )}
                                    <h3 className="font-bold dark:text-white">{addr.fullName}</h3>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-1">{addr.street}</p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">{addr.city}, {addr.state} {addr.postalCode}</p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm">{addr.country}</p>
                                    <p className="text-gray-600 dark:text-gray-300 text-sm mt-2">{addr.phone}</p>
                                    <div className="mt-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button onClick={() => { setEditingAddress(addr); setShowAddressForm(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg dark:text-blue-400 dark:hover:bg-blue-900/30"><Edit2 className="w-4 h-4" /></button>
                                        <button onClick={() => deleteAddress(addr.id)} className="p-2 text-red-600 hover:bg-red-50 rounded-lg dark:text-red-400 dark:hover:bg-red-900/30"><Trash2 className="w-4 h-4" /></button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'security' && (
                    <div className="max-w-xl animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">Security Settings</h2>

                        <div className="bg-blue-50 p-4 rounded-xl mb-8 dark:bg-blue-900/20">
                            <h3 className="font-bold text-blue-800 mb-2 dark:text-blue-300">Login Activity</h3>
                            <p className="text-sm text-blue-600 dark:text-blue-400">
                                Last login: <span className="font-mono font-bold">{user?.lastLogin ? new Date(user.lastLogin).toLocaleString() : 'N/A'}</span>
                            </p>
                        </div>

                        <form onSubmit={handlePasswordChange} className="space-y-6">
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Current Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={passwords.old}
                                    onChange={e => setPasswords({ ...passwords, old: e.target.value })}
                                    required
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={passwords.new}
                                    onChange={e => setPasswords({ ...passwords, new: e.target.value })}
                                    required
                                />
                                {/* Simple strength indicator */}
                                {passwords.new && (
                                    <div className="mt-2 h-1 bg-gray-200 rounded-full overflow-hidden">
                                        <div
                                            className={`h-full transition-all duration-300 ${passwords.new.length > 8 ? 'bg-green-500 w-full' : passwords.new.length > 5 ? 'bg-yellow-500 w-2/3' : 'bg-red-500 w-1/3'}`}
                                        />
                                    </div>
                                )}
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2 dark:text-gray-300">Confirm New Password</label>
                                <input
                                    type="password"
                                    className="w-full px-4 py-2 rounded-xl border border-gray-200 dark:bg-gray-700 dark:border-gray-600 dark:text-white"
                                    value={passwords.confirm}
                                    onChange={e => setPasswords({ ...passwords, confirm: e.target.value })}
                                    required
                                />
                            </div>
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-6 py-2 bg-black text-white rounded-lg font-bold hover:bg-gray-800 transition-colors disabled:opacity-50 dark:bg-white dark:text-black"
                            >
                                {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Update Password'}
                            </button>
                        </form>
                    </div>
                )}

                {activeTab === 'orders' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">Order History</h2>
                        <div className="space-y-4">
                            {orders.map(order => (
                                <div key={order.id} className="border border-gray-200 rounded-2xl p-6 dark:border-gray-700 dark:bg-gray-700/30">
                                    <div className="flex flex-wrap justify-between items-start gap-4 mb-4 border-b border-gray-100 pb-4 dark:border-gray-600">
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Order Placed</p>
                                            <p className="font-bold dark:text-white">{new Date(order.createdAt).toLocaleDateString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Total</p>
                                            <p className="font-bold dark:text-white">${order.totalPrice.toFixed(2)}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-500 dark:text-gray-400">Order #</p>
                                            <p className="font-mono dark:text-gray-300">{order.id.slice(0, 8)}</p>
                                        </div>
                                        <div className="ml-auto">
                                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${order.status === 'delivered' ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-300' :
                                                order.status === 'cancelled' ? 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-300' :
                                                    'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                                }`}>
                                                {order.status}
                                            </span>
                                        </div>
                                    </div>
                                    <div className="space-y-3">
                                        {order.items?.map((item: any, idx: number) => (
                                            <div key={idx} className="flex gap-4">
                                                <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden dark:bg-gray-600">
                                                    {item.imageUrl && <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />}
                                                </div>
                                                <div>
                                                    <h4 className="font-bold dark:text-white">{item.name}</h4>
                                                    <p className="text-sm text-gray-500 dark:text-gray-400">Qty: {item.quantity}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {orders.length === 0 && (
                                <div className="text-center py-12 text-gray-500 dark:text-gray-400">
                                    No orders found.
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'reviews' && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">My Reviews</h2>
                        <div className="space-y-6">
                            {reviews.map(review => (
                                <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 dark:border-gray-700">
                                    <div className="flex gap-4">
                                        {/* Assuming review has product image/name populated */}
                                        <div className="w-16 h-16 bg-gray-100 rounded-lg overflow-hidden flex-shrink-0 dark:bg-gray-700">
                                            {/* In a real app we'd need product details here. Assuming api.getUserReviews returns enhanced data */}
                                            {/* @ts-ignore */}
                                            {review.productImage && <img src={review.productImage} className="w-full h-full object-cover" />}
                                        </div>
                                        <div className="flex-1">
                                            {/* @ts-ignore */}
                                            <h4 className="font-bold dark:text-white">{review.productName || 'Product'}</h4>
                                            <div className="flex items-center text-yellow-400 my-1">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} className={`w-3 h-3 ${i < review.rating ? 'fill-current' : 'text-gray-300'}`} />
                                                ))}
                                            </div>
                                            <p className="text-gray-600 dark:text-gray-300 text-sm">{review.comment}</p>
                                            <p className="text-xs text-gray-400 mt-2">{new Date(review.createdAt).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {reviews.length === 0 && <p className="text-gray-500 dark:text-gray-400">No reviews yet.</p>}
                        </div>
                    </div>
                )}

                {activeTab === 'affiliate' && affiliate && (
                    <div className="animate-fade-in">
                        <h2 className="text-2xl font-bold mb-6 dark:text-white">Affiliate Dashboard</h2>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                            <div className="bg-purple-50 p-6 rounded-2xl dark:bg-purple-900/20">
                                <p className="text-sm text-purple-600 font-bold uppercase dark:text-purple-400">Earnings</p>
                                <h3 className="text-3xl font-black text-purple-900 mt-2 dark:text-white">${affiliate.earnings.toFixed(2)}</h3>
                            </div>
                            <div className="bg-blue-50 p-6 rounded-2xl dark:bg-blue-900/20">
                                <p className="text-sm text-blue-600 font-bold uppercase dark:text-blue-400">Clicks</p>
                                <h3 className="text-3xl font-black text-blue-900 mt-2 dark:text-white">{affiliate.clicks}</h3>
                            </div>
                        </div>
                        <div className="bg-gray-50 p-6 rounded-2xl dark:bg-gray-700">
                            <h3 className="font-bold mb-2 dark:text-white">Your Referral Code</h3>
                            <div className="flex gap-4">
                                <code className="block bg-white px-4 py-2 rounded-lg border border-gray-200 font-mono text-lg dark:bg-gray-800 dark:border-gray-600 dark:text-white">
                                    {affiliate.referralCode}
                                </code>
                                <button
                                    onClick={() => navigator.clipboard.writeText(`?ref=${affiliate.referralCode}`)} // Simplified copy
                                    className="px-4 py-2 bg-black text-white rounded-lg text-sm font-bold dark:bg-white dark:text-black"
                                >
                                    Copy Link
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
};
