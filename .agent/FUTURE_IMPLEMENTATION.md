# CloudMart E-Commerce - Future Implementation Plan

**Document Created:** January 23, 2026  
**Last Updated:** January 23, 2026  
**Status:** Pending Implementation

---

## Table of Contents
1. [Forgot Password for Users](#1-forgot-password-for-users)
2. [Social Media Connection](#2-social-media-connection)
3. [Cart Adjustments (Size & Color)](#3-cart-adjustments-size--color)
4. [Sale/Discount Management (Admin)](#4-salediscount-management-admin)
5. [Smart Filters for Products](#5-smart-filters-for-products)
6. [Search Bar Functionality](#6-search-bar-functionality)
7. [Contact Us Dashboard Integration](#7-contact-us-dashboard-integration)

---

## 1. Forgot Password for Users

### Overview
Implement a password reset flow for regular users (customers) only. Sellers and Admins will use alternative recovery methods.

### User Flow
1. User clicks "Forgot Password?" on login page
2. User enters registered email address
3. System sends password reset link via email
4. User clicks link and is redirected to reset password page
5. User enters new password (with confirmation)
6. Password is updated, user is redirected to login

### Technical Implementation

#### Frontend Changes

**New Components:**
- `pages/ForgotPassword.tsx` - Email input form
- `pages/ResetPassword.tsx` - New password form (with token validation)

**Files to Modify:**
- `pages/Login.tsx` - Add "Forgot Password?" link
- `App.tsx` - Add new routes for forgot/reset password pages

**Example Route Structure:**
```typescript
// In App.tsx
<Route path="/forgot-password" element={<ForgotPassword />} />
<Route path="/reset-password/:token" element={<ResetPassword />} />
```

#### Backend Changes

**New Django Models:**
```python
# In backend/users/models.py
class PasswordResetToken(models.Model):
    user = models.ForeignKey(User, on_delete=models.CASCADE)
    token = models.CharField(max_length=100, unique=True)
    created_at = models.DateTimeField(auto_now_add=True)
    expires_at = models.DateTimeField()
    is_used = models.BooleanField(default=False)
```

**New API Endpoints:**
```python
# In backend/users/views.py
POST /api/auth/forgot-password/
    - Request: { "email": "user@example.com" }
    - Response: { "message": "Reset link sent to email" }
    - Action: Generate token, send email

POST /api/auth/reset-password/
    - Request: { "token": "abc123", "new_password": "newpass123" }
    - Response: { "message": "Password updated successfully" }
    - Action: Validate token, update password
```

**Email Service Integration:**
- Install: `pip install django-sendgrid-v5` or use Django's built-in email
- Configure SMTP settings in `settings.py`
- Create email templates in `backend/templates/emails/`

**Security Considerations:**
- Tokens expire after 1 hour
- Tokens are single-use only
- Rate limit forgot password requests (max 3 per hour per email)
- Use secure random token generation (`secrets.token_urlsafe(32)`)

#### Environment Variables
```env
# Add to .env
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USE_TLS=True
EMAIL_HOST_USER=your-email@gmail.com
EMAIL_HOST_PASSWORD=your-app-password
DEFAULT_FROM_EMAIL=noreply@cloudmart.com
```

---

## 2. Social Media Connection

### Overview
Allow users to sign up/login using Google, Facebook, and GitHub OAuth providers.

### Supported Providers
- Google OAuth 2.0
- Facebook Login
- GitHub OAuth

### Technical Implementation

#### Frontend Changes

**Install Dependencies:**
```bash
npm install @react-oauth/google react-facebook-login
```

**Files to Modify:**
- `pages/Login.tsx` - Add social login buttons
- `pages/Register.tsx` - Add social signup buttons
- `services/api.ts` - Add social auth API calls

**UI Components:**
```typescript
// Social login buttons section
<div className="social-auth">
  <button onClick={handleGoogleLogin}>
    <img src="/icons/google.svg" alt="Google" />
    Continue with Google
  </button>
  <button onClick={handleFacebookLogin}>
    <img src="/icons/facebook.svg" alt="Facebook" />
    Continue with Facebook
  </button>
  <button onClick={handleGitHubLogin}>
    <img src="/icons/github.svg" alt="GitHub" />
    Continue with GitHub
  </button>
</div>
```

#### Backend Changes

**Install Dependencies:**
```bash
pip install social-auth-app-django
```

**Django Settings:**
```python
# In backend/core/settings.py
INSTALLED_APPS += [
    'social_django',
]

AUTHENTICATION_BACKENDS = [
    'social_core.backends.google.GoogleOAuth2',
    'social_core.backends.facebook.FacebookOAuth2',
    'social_core.backends.github.GithubOAuth2',
    'django.contrib.auth.backends.ModelBackend',
]

SOCIAL_AUTH_GOOGLE_OAUTH2_KEY = os.getenv('GOOGLE_CLIENT_ID')
SOCIAL_AUTH_GOOGLE_OAUTH2_SECRET = os.getenv('GOOGLE_CLIENT_SECRET')

SOCIAL_AUTH_FACEBOOK_KEY = os.getenv('FACEBOOK_APP_ID')
SOCIAL_AUTH_FACEBOOK_SECRET = os.getenv('FACEBOOK_APP_SECRET')

SOCIAL_AUTH_GITHUB_KEY = os.getenv('GITHUB_CLIENT_ID')
SOCIAL_AUTH_GITHUB_SECRET = os.getenv('GITHUB_CLIENT_SECRET')
```

**New API Endpoints:**
```python
POST /api/auth/social/google/
POST /api/auth/social/facebook/
POST /api/auth/social/github/
```

#### OAuth App Setup Required

**Google Cloud Console:**
1. Create project at console.cloud.google.com
2. Enable Google+ API
3. Create OAuth 2.0 credentials
4. Add authorized redirect URIs

**Facebook Developers:**
1. Create app at developers.facebook.com
2. Add Facebook Login product
3. Configure OAuth redirect URIs

**GitHub:**
1. Go to Settings > Developer settings > OAuth Apps
2. Create new OAuth app
3. Set authorization callback URL

#### Environment Variables
```env
# Add to .env
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
FACEBOOK_APP_ID=your-facebook-app-id
FACEBOOK_APP_SECRET=your-facebook-app-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

---

## 3. Cart Adjustments (Size & Color)

### Overview
Allow users to modify size and color of products directly in the cart without removing and re-adding items.

### User Flow
1. User views cart with added products
2. Each cart item shows current size and color
3. User can change size/color via dropdowns
4. Cart updates automatically (quantity remains same)
5. Price updates if size/color affects pricing

### Technical Implementation

#### Frontend Changes

**Files to Modify:**
- `pages/Cart.tsx` - Add size/color selectors to cart items
- `context/CartContext.tsx` - Add `updateCartItemVariant` function
- `types.ts` - Update `CartItem` interface if needed

**CartContext Updates:**
```typescript
// In context/CartContext.tsx
interface CartContextType {
  // ... existing methods
  updateCartItemVariant: (
    productId: string, 
    newSize: string, 
    newColor: string
  ) => void;
}

const updateCartItemVariant = (productId: string, newSize: string, newColor: string) => {
  setCartItems(prev => 
    prev.map(item => 
      item.id === productId 
        ? { ...item, selectedSize: newSize, selectedColor: newColor }
        : item
    )
  );
};
```

**Cart UI Component:**
```typescript
// In pages/Cart.tsx
<div className="cart-item-variants">
  <select 
    value={item.selectedSize} 
    onChange={(e) => updateCartItemVariant(item.id, e.target.value, item.selectedColor)}
  >
    {item.availableSizes.map(size => (
      <option key={size} value={size}>{size}</option>
    ))}
  </select>
  
  <select 
    value={item.selectedColor} 
    onChange={(e) => updateCartItemVariant(item.id, item.selectedSize, e.target.value)}
  >
    {item.availableColors.map(color => (
      <option key={color} value={color}>{color}</option>
    ))}
  </select>
</div>
```

#### Backend Changes

**Database Updates:**
- Ensure `CartItem` model stores `selected_size` and `selected_color`
- Update cart serializers to include these fields

**API Endpoints:**
```python
PATCH /api/cart/items/{id}/
    - Request: { "selected_size": "L", "selected_color": "Blue" }
    - Response: Updated cart item object
```

---

## 4. Sale/Discount Management (Admin)

### Overview
Allow admins to put listed products on sale with predefined discount percentages (10%, 20%, 30%, 40%, 50%, 60% max).

### User Flow (Admin)
1. Admin views products list in dashboard
2. Admin selects product(s) to put on sale
3. Admin clicks discount buttons (10%, 20%, etc.)
4. System calculates sale price and updates product
5. Products display "SALE" badge and original/sale prices on frontend

### Technical Implementation

#### Frontend Changes

**Files to Modify:**
- `pages/AdminDashboard.tsx` - Add discount controls to product management
- `components/ProductCard.tsx` - Display sale badge and pricing
- `types.ts` - Add discount fields to Product interface

**Product Interface Update:**
```typescript
// In types.ts
export interface Product {
  // ... existing fields
  isOnSale: boolean;
  discountPercentage: number; // 0-60
  originalPrice: number;
  salePrice: number; // calculated: originalPrice * (1 - discountPercentage/100)
}
```

**Admin Dashboard UI:**
```typescript
// In AdminDashboard.tsx - Product management section
<div className="discount-controls">
  <h4>Set Discount</h4>
  <div className="discount-buttons">
    {[10, 20, 30, 40, 50, 60].map(percent => (
      <button 
        key={percent}
        onClick={() => applyDiscount(product.id, percent)}
        className="discount-btn"
      >
        {percent}% OFF
      </button>
    ))}
    <button 
      onClick={() => removeDiscount(product.id)}
      className="remove-discount-btn"
    >
      Remove Sale
    </button>
  </div>
</div>
```

**ProductCard Display:**
```typescript
// In components/ProductCard.tsx
{product.isOnSale && (
  <div className="sale-badge">
    SALE {product.discountPercentage}% OFF
  </div>
)}

<div className="product-price">
  {product.isOnSale ? (
    <>
      <span className="original-price">${product.originalPrice}</span>
      <span className="sale-price">${product.salePrice}</span>
    </>
  ) : (
    <span className="regular-price">${product.price}</span>
  )}
</div>
```

#### Backend Changes

**Database Migration:**
```python
# In backend/products/models.py
class Product(models.Model):
    # ... existing fields
    is_on_sale = models.BooleanField(default=False)
    discount_percentage = models.IntegerField(
        default=0, 
        validators=[MinValueValidator(0), MaxValueValidator(60)]
    )
    original_price = models.DecimalField(max_digits=10, decimal_places=2)
    
    @property
    def sale_price(self):
        if self.is_on_sale:
            return self.original_price * (1 - self.discount_percentage / 100)
        return self.original_price
```

**New API Endpoints:**
```python
POST /api/admin/products/{id}/apply-discount/
    - Request: { "discount_percentage": 20 }
    - Response: Updated product with sale pricing
    - Validation: Only 10, 20, 30, 40, 50, 60 allowed

POST /api/admin/products/{id}/remove-discount/
    - Response: Product with sale removed
```

**Business Logic:**
```python
# In backend/products/views.py
@action(detail=True, methods=['post'])
def apply_discount(self, request, pk=None):
    product = self.get_object()
    discount = request.data.get('discount_percentage')
    
    # Validate discount percentage
    if discount not in [10, 20, 30, 40, 50, 60]:
        return Response(
            {"error": "Invalid discount. Must be 10, 20, 30, 40, 50, or 60"},
            status=400
        )
    
    product.is_on_sale = True
    product.discount_percentage = discount
    product.save()
    
    return Response(ProductSerializer(product).data)
```

---

## 5. Smart Filters for Products

### Overview
Implement advanced filtering system allowing users to filter products by category, subcategory, price range, size, color, gender, and sale status.

### Filter Options
- **Category** (Women, Men, Kids, Accessories)
- **Subcategory** (Dresses, Tops, Bottoms, etc.)
- **Price Range** (slider: $0 - $500+)
- **Size** (XS, S, M, L, XL, XXL)
- **Color** (multi-select color swatches)
- **Gender** (Unisex, Male, Female)
- **On Sale** (toggle)
- **Sort By** (Price: Low to High, High to Low, Newest, Popular)

### Technical Implementation

#### Frontend Changes

**New Components:**
- `components/ProductFilters.tsx` - Filter sidebar/panel
- `components/PriceRangeSlider.tsx` - Custom price range slider
- `components/ColorFilter.tsx` - Color swatch selector

**Files to Modify:**
- `pages/Products.tsx` - Integrate filters and filtered results
- `services/api.ts` - Add filter parameters to product API calls

**Filter State Management:**
```typescript
// In pages/Products.tsx
interface FilterState {
  category: string[];
  subcategory: string[];
  priceMin: number;
  priceMax: number;
  sizes: string[];
  colors: string[];
  gender: string[];
  onSale: boolean;
  sortBy: 'price_asc' | 'price_desc' | 'newest' | 'popular';
}

const [filters, setFilters] = useState<FilterState>({
  category: [],
  subcategory: [],
  priceMin: 0,
  priceMax: 500,
  sizes: [],
  colors: [],
  gender: [],
  onSale: false,
  sortBy: 'newest'
});
```

**ProductFilters Component:**
```typescript
// components/ProductFilters.tsx
export const ProductFilters: React.FC<{
  filters: FilterState;
  onFilterChange: (filters: FilterState) => void;
  onClearFilters: () => void;
}> = ({ filters, onFilterChange, onClearFilters }) => {
  return (
    <div className="product-filters">
      <div className="filter-header">
        <h3>Filters</h3>
        <button onClick={onClearFilters}>Clear All</button>
      </div>
      
      {/* Category Filter */}
      <FilterSection title="Category">
        {['Women', 'Men', 'Kids', 'Accessories'].map(cat => (
          <Checkbox 
            key={cat}
            label={cat}
            checked={filters.category.includes(cat)}
            onChange={(checked) => handleCategoryChange(cat, checked)}
          />
        ))}
      </FilterSection>
      
      {/* Price Range Filter */}
      <FilterSection title="Price Range">
        <PriceRangeSlider 
          min={0}
          max={500}
          value={[filters.priceMin, filters.priceMax]}
          onChange={(range) => handlePriceChange(range)}
        />
      </FilterSection>
      
      {/* Size Filter */}
      <FilterSection title="Size">
        {['XS', 'S', 'M', 'L', 'XL', 'XXL'].map(size => (
          <SizeButton 
            key={size}
            size={size}
            selected={filters.sizes.includes(size)}
            onClick={() => handleSizeToggle(size)}
          />
        ))}
      </FilterSection>
      
      {/* Color Filter */}
      <FilterSection title="Color">
        <ColorFilter 
          selectedColors={filters.colors}
          onColorToggle={handleColorToggle}
        />
      </FilterSection>
      
      {/* On Sale Toggle */}
      <FilterSection title="Special Offers">
        <Toggle 
          label="On Sale Only"
          checked={filters.onSale}
          onChange={handleSaleToggle}
        />
      </FilterSection>
    </div>
  );
};
```

#### Backend Changes

**API Endpoint Updates:**
```python
GET /api/products/?category=Women&price_min=20&price_max=100&size=M&color=Blue&on_sale=true&sort=price_asc
```

**Django QuerySet Filtering:**
```python
# In backend/products/views.py
class ProductViewSet(viewsets.ModelViewSet):
    def get_queryset(self):
        queryset = Product.objects.all()
        
        # Category filter
        category = self.request.query_params.getlist('category')
        if category:
            queryset = queryset.filter(category__in=category)
        
        # Subcategory filter
        subcategory = self.request.query_params.getlist('subcategory')
        if subcategory:
            queryset = queryset.filter(subcategory__in=subcategory)
        
        # Price range filter
        price_min = self.request.query_params.get('price_min')
        price_max = self.request.query_params.get('price_max')
        if price_min:
            queryset = queryset.filter(price__gte=price_min)
        if price_max:
            queryset = queryset.filter(price__lte=price_max)
        
        # Size filter (products that have at least one of the selected sizes)
        sizes = self.request.query_params.getlist('size')
        if sizes:
            queryset = queryset.filter(sizes__overlap=sizes)
        
        # Color filter
        colors = self.request.query_params.getlist('color')
        if colors:
            queryset = queryset.filter(colors__overlap=colors)
        
        # Gender filter
        gender = self.request.query_params.getlist('gender')
        if gender:
            queryset = queryset.filter(gender__in=gender)
        
        # On sale filter
        on_sale = self.request.query_params.get('on_sale')
        if on_sale == 'true':
            queryset = queryset.filter(is_on_sale=True)
        
        # Sorting
        sort_by = self.request.query_params.get('sort', 'newest')
        if sort_by == 'price_asc':
            queryset = queryset.order_by('price')
        elif sort_by == 'price_desc':
            queryset = queryset.order_by('-price')
        elif sort_by == 'newest':
            queryset = queryset.order_by('-created_at')
        elif sort_by == 'popular':
            queryset = queryset.order_by('-view_count')  # Requires view tracking
        
        return queryset
```

**Performance Optimization:**
- Add database indexes on frequently filtered fields
- Implement pagination for filtered results
- Consider caching popular filter combinations

---

## 6. Search Bar Functionality

### Overview
Fix and enhance the search bar to allow users to search products by name, description, category, and tags with real-time suggestions.

### Features
- Real-time search suggestions (debounced)
- Search by product name, description, category
- Search history (local storage)
- Recent searches display
- "No results" state with suggestions

### Technical Implementation

#### Frontend Changes

**Files to Modify:**
- `components/Navbar.tsx` - Fix search bar functionality
- `pages/SearchResults.tsx` - Create dedicated search results page
- `services/api.ts` - Add search API function

**Search Component:**
```typescript
// In components/Navbar.tsx or new SearchBar.tsx
const SearchBar: React.FC = () => {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const navigate = useNavigate();
  
  // Debounced search for suggestions
  const debouncedSearch = useMemo(
    () => debounce(async (searchQuery: string) => {
      if (searchQuery.length < 2) {
        setSuggestions([]);
        return;
      }
      
      setIsLoading(true);
      try {
        const results = await api.searchProducts(searchQuery, 5); // Get top 5
        setSuggestions(results);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    }, 300),
    []
  );
  
  useEffect(() => {
    debouncedSearch(query);
  }, [query, debouncedSearch]);
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      // Save to search history
      saveSearchHistory(query);
      // Navigate to search results page
      navigate(`/search?q=${encodeURIComponent(query)}`);
      setShowSuggestions(false);
    }
  };
  
  return (
    <div className="search-bar">
      <form onSubmit={handleSearch}>
        <input 
          type="text"
          placeholder="Search products..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setShowSuggestions(true)}
          onBlur={() => setTimeout(() => setShowSuggestions(false), 200)}
        />
        <button type="submit">
          <SearchIcon />
        </button>
      </form>
      
      {showSuggestions && (query.length >= 2) && (
        <div className="search-suggestions">
          {isLoading ? (
            <div className="loading">Searching...</div>
          ) : suggestions.length > 0 ? (
            <>
              {suggestions.map(product => (
                <div 
                  key={product.id}
                  className="suggestion-item"
                  onClick={() => navigate(`/product/${product.id}`)}
                >
                  <img src={product.imageUrl} alt={product.name} />
                  <div>
                    <p className="name">{product.name}</p>
                    <p className="price">${product.price}</p>
                  </div>
                </div>
              ))}
              <div className="view-all">
                <button onClick={handleSearch}>
                  View all results for "{query}"
                </button>
              </div>
            </>
          ) : (
            <div className="no-results">
              No products found for "{query}"
            </div>
          )}
        </div>
      )}
    </div>
  );
};
```

**Search Results Page:**
```typescript
// pages/SearchResults.tsx
const SearchResults: React.FC = () => {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || '';
  const [results, setResults] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchResults = async () => {
      setIsLoading(true);
      try {
        const products = await api.searchProducts(query);
        setResults(products);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsLoading(false);
      }
    };
    
    if (query) {
      fetchResults();
    }
  }, [query]);
  
  return (
    <div className="search-results-page">
      <h1>Search Results for "{query}"</h1>
      <p>{results.length} products found</p>
      
      {isLoading ? (
        <LoadingSpinner />
      ) : results.length > 0 ? (
        <div className="products-grid">
          {results.map(product => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      ) : (
        <div className="no-results">
          <h2>No products found</h2>
          <p>Try different keywords or browse our categories</p>
        </div>
      )}
    </div>
  );
};
```

#### Backend Changes

**API Endpoint:**
```python
GET /api/products/search/?q=blue+dress&limit=10
```

**Django Implementation:**
```python
# In backend/products/views.py
from django.db.models import Q

class ProductViewSet(viewsets.ModelViewSet):
    @action(detail=False, methods=['get'])
    def search(self, request):
        query = request.query_params.get('q', '')
        limit = int(request.query_params.get('limit', 20))
        
        if not query:
            return Response([])
        
        # Search across multiple fields
        products = Product.objects.filter(
            Q(name__icontains=query) |
            Q(description__icontains=query) |
            Q(category__icontains=query) |
            Q(subcategory__icontains=query) |
            Q(tags__icontains=query)
        ).distinct()[:limit]
        
        serializer = self.get_serializer(products, many=True)
        return Response(serializer.data)
```

**Advanced Search (Optional - PostgreSQL Full-Text Search):**
```python
# For better search performance with PostgreSQL
from django.contrib.postgres.search import SearchVector, SearchQuery, SearchRank

products = Product.objects.annotate(
    search=SearchVector('name', 'description', 'category', 'subcategory'),
).filter(search=SearchQuery(query)).order_by('-rank')
```

**Utilities:**
```typescript
// In utils/searchHistory.ts
const SEARCH_HISTORY_KEY = 'cloudmart_search_history';
const MAX_HISTORY_ITEMS = 10;

export const saveSearchHistory = (query: string) => {
  const history = getSearchHistory();
  const updated = [query, ...history.filter(q => q !== query)].slice(0, MAX_HISTORY_ITEMS);
  localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
};

export const getSearchHistory = (): string[] => {
  const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const clearSearchHistory = () => {
  localStorage.removeItem(SEARCH_HISTORY_KEY);
};
```

---

## 7. Contact Us Dashboard Integration

### Overview
When users submit inquiries via the Contact Us form, messages should appear in the Admin dashboard for immediate review. Future enhancement: send email notifications to admin.

### User Flow
1. User fills out Contact Us form (name, email, subject, message)
2. Form submission creates inquiry in database
3. Inquiry appears in Admin dashboard "Inquiries" tab
4. Admin can view, respond, mark as resolved
5. (Future) Admin receives email notification

### Technical Implementation

#### Frontend Changes

**New Components:**
- `pages/ContactUs.tsx` - Contact form page (if not exists)
- Admin Dashboard: Add "Inquiries" tab

**Files to Modify:**
- `pages/AdminDashboard.tsx` - Add inquiries management section
- `services/api.ts` - Add inquiry API functions
- `types.ts` - Add Inquiry interface

**Type Definition:**
```typescript
// In types.ts
export interface Inquiry {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: 'new' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
  adminNotes?: string;
}
```

**Contact Us Form:**
```typescript
// pages/ContactUs.tsx
const ContactUs: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      await api.submitInquiry(formData);
      setSubmitted(true);
      setFormData({ name: '', email: '', subject: '', message: '' });
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (submitted) {
    return (
      <div className="contact-success">
        <h2>Thank you for contacting us!</h2>
        <p>We've received your message and will respond within 24-48 hours.</p>
      </div>
    );
  }
  
  return (
    <div className="contact-us-page">
      <h1>Contact Us</h1>
      <form onSubmit={handleSubmit}>
        <input 
          type="text"
          placeholder="Your Name"
          value={formData.name}
          onChange={(e) => setFormData({...formData, name: e.target.value})}
          required
        />
        <input 
          type="email"
          placeholder="Your Email"
          value={formData.email}
          onChange={(e) => setFormData({...formData, email: e.target.value})}
          required
        />
        <input 
          type="text"
          placeholder="Subject"
          value={formData.subject}
          onChange={(e) => setFormData({...formData, subject: e.target.value})}
          required
        />
        <textarea 
          placeholder="Your Message"
          value={formData.message}
          onChange={(e) => setFormData({...formData, message: e.target.value})}
          rows={6}
          required
        />
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Sending...' : 'Send Message'}
        </button>
      </form>
    </div>
  );
};
```

**Admin Dashboard - Inquiries Tab:**
```typescript
// In AdminDashboard.tsx - Add new tab
const [activeTab, setActiveTab] = useState<'products' | 'orders' | 'users' | 'inquiries'>('products');
const [inquiries, setInquiries] = useState<Inquiry[]>([]);

useEffect(() => {
  if (activeTab === 'inquiries') {
    loadInquiries();
  }
}, [activeTab]);

const loadInquiries = async () => {
  try {
    const data = await api.getInquiries();
    setInquiries(data);
  } catch (error) {
    console.error('Error loading inquiries:', error);
  }
};

const updateInquiryStatus = async (id: string, status: Inquiry['status']) => {
  try {
    await api.updateInquiry(id, { status });
    loadInquiries();
  } catch (error) {
    console.error('Error updating inquiry:', error);
  }
};

// In render section
{activeTab === 'inquiries' && (
  <div className="inquiries-section">
    <h2>Customer Inquiries</h2>
    
    <div className="inquiries-filters">
      <button onClick={() => filterInquiries('all')}>All</button>
      <button onClick={() => filterInquiries('new')}>New</button>
      <button onClick={() => filterInquiries('in_progress')}>In Progress</button>
      <button onClick={() => filterInquiries('resolved')}>Resolved</button>
    </div>
    
    <table className="inquiries-table">
      <thead>
        <tr>
          <th>Date</th>
          <th>Name</th>
          <th>Email</th>
          <th>Subject</th>
          <th>Status</th>
          <th>Actions</th>
        </tr>
      </thead>
      <tbody>
        {inquiries.map(inquiry => (
          <tr key={inquiry.id} className={`status-${inquiry.status}`}>
            <td>{new Date(inquiry.createdAt).toLocaleDateString()}</td>
            <td>{inquiry.name}</td>
            <td>{inquiry.email}</td>
            <td>{inquiry.subject}</td>
            <td>
              <span className={`status-badge ${inquiry.status}`}>
                {inquiry.status.replace('_', ' ')}
              </span>
            </td>
            <td>
              <button onClick={() => viewInquiry(inquiry)}>View</button>
              {inquiry.status !== 'resolved' && (
                <button onClick={() => updateInquiryStatus(inquiry.id, 'resolved')}>
                  Mark Resolved
                </button>
              )}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
)}
```

**Inquiry Detail Modal:**
```typescript
// Modal component for viewing full inquiry
const InquiryModal: React.FC<{ inquiry: Inquiry; onClose: () => void }> = ({ inquiry, onClose }) => {
  const [adminNotes, setAdminNotes] = useState(inquiry.adminNotes || '');
  
  const saveNotes = async () => {
    await api.updateInquiry(inquiry.id, { adminNotes });
    onClose();
  };
  
  return (
    <div className="modal inquiry-modal">
      <div className="modal-content">
        <h2>Inquiry Details</h2>
        <div className="inquiry-info">
          <p><strong>From:</strong> {inquiry.name} ({inquiry.email})</p>
          <p><strong>Subject:</strong> {inquiry.subject}</p>
          <p><strong>Date:</strong> {new Date(inquiry.createdAt).toLocaleString()}</p>
          <p><strong>Status:</strong> {inquiry.status}</p>
        </div>
        
        <div className="inquiry-message">
          <h3>Message:</h3>
          <p>{inquiry.message}</p>
        </div>
        
        <div className="admin-notes">
          <h3>Admin Notes:</h3>
          <textarea 
            value={adminNotes}
            onChange={(e) => setAdminNotes(e.target.value)}
            placeholder="Add internal notes..."
            rows={4}
          />
        </div>
        
        <div className="modal-actions">
          <button onClick={saveNotes}>Save Notes</button>
          <button onClick={onClose}>Close</button>
        </div>
      </div>
    </div>
  );
};
```

#### Backend Changes

**New Django Model:**
```python
# In backend/inquiries/models.py (create new app)
from django.db import models

class Inquiry(models.Model):
    STATUS_CHOICES = [
        ('new', 'New'),
        ('in_progress', 'In Progress'),
        ('resolved', 'Resolved'),
    ]
    
    name = models.CharField(max_length=100)
    email = models.EmailField()
    subject = models.CharField(max_length=200)
    message = models.TextField()
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='new')
    admin_notes = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    resolved_at = models.DateTimeField(blank=True, null=True)
    
    class Meta:
        ordering = ['-created_at']
        verbose_name_plural = 'Inquiries'
    
    def __str__(self):
        return f"{self.subject} - {self.name}"
```

**API Endpoints:**
```python
# In backend/inquiries/views.py
from rest_framework import viewsets, permissions
from .models import Inquiry
from .serializers import InquirySerializer

class InquiryViewSet(viewsets.ModelViewSet):
    queryset = Inquiry.objects.all()
    serializer_class = InquirySerializer
    
    def get_permissions(self):
        # Anyone can create (POST), only admins can view/update
        if self.action == 'create':
            return [permissions.AllowAny()]
        return [permissions.IsAdminUser()]
    
    def perform_update(self, serializer):
        # Auto-set resolved_at when status changes to resolved
        if serializer.validated_data.get('status') == 'resolved':
            from django.utils import timezone
            serializer.save(resolved_at=timezone.now())
        else:
            serializer.save()

# URLs
POST /api/inquiries/ - Submit inquiry (public)
GET /api/inquiries/ - List all inquiries (admin only)
GET /api/inquiries/{id}/ - Get inquiry details (admin only)
PATCH /api/inquiries/{id}/ - Update inquiry (admin only)
```

**Email Notification (Future Enhancement):**
```python
# In backend/inquiries/signals.py
from django.db.models.signals import post_save
from django.dispatch import receiver
from django.core.mail import send_mail
from django.conf import settings
from .models import Inquiry

@receiver(post_save, sender=Inquiry)
def notify_admin_new_inquiry(sender, instance, created, **kwargs):
    if created:  # Only on new inquiries
        send_mail(
            subject=f'New Inquiry: {instance.subject}',
            message=f'''
            New inquiry received from {instance.name} ({instance.email})
            
            Subject: {instance.subject}
            Message: {instance.message}
            
            View in dashboard: {settings.ADMIN_DASHBOARD_URL}/inquiries
            ''',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[settings.ADMIN_EMAIL],
            fail_silently=True,
        )
```

**Django App Setup:**
```bash
# Create new Django app
cd backend
python manage.py startapp inquiries

# Add to INSTALLED_APPS in settings.py
INSTALLED_APPS += ['inquiries']

# Create migrations
python manage.py makemigrations inquiries
python manage.py migrate inquiries
```

---

## Implementation Priority

### Phase 1 (High Priority - Core Functionality)
1. **Search Bar Functionality** - Critical for user experience
2. **Cart Adjustments** - Improves shopping experience
3. **Contact Us Dashboard** - Customer service essential

### Phase 2 (Medium Priority - Enhanced Features)
4. **Smart Filters** - Improves product discovery
5. **Sale/Discount Management** - Revenue optimization
6. **Forgot Password** - User account management

### Phase 3 (Low Priority - Nice to Have)
7. **Social Media Connection** - Alternative login method

---

## Testing Checklist

For each feature, ensure:
- [ ] Frontend UI is responsive (mobile, tablet, desktop)
- [ ] API endpoints return correct data
- [ ] Error handling is implemented
- [ ] Loading states are shown
- [ ] Success/failure messages are displayed
- [ ] Data validation on both frontend and backend
- [ ] Security considerations addressed
- [ ] Performance is acceptable
- [ ] Accessibility standards met

---

## Notes

- All features should maintain consistency with existing design system
- Ensure backward compatibility with existing data
- Document all new API endpoints in API documentation
- Update user documentation/help section
- Consider analytics tracking for new features
- Plan for A/B testing where applicable

---

**End of Document**
