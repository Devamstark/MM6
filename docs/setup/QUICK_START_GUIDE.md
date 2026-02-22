# 🚀 SmartShop - Quick Start Guide

> 🌐 **Already live in production at [https://smartshop1.us](https://smartshop1.us)**
> This guide covers running the app **locally for development**.

---

## 🌐 Production URLs (Already Deployed)

| Service | URL |
|:---|:---|
| Store | [https://smartshop1.us](https://smartshop1.us) |
| Django Admin | [https://api.smartshop1.us/admin/](https://api.smartshop1.us/admin/) |
| Database Browser | [https://db.smartshop1.us](https://db.smartshop1.us) |
| MinIO Storage | [https://minio.smartshop1.us](https://minio.smartshop1.us) |

See **[VPS_DEPLOYMENT_GUIDE.md](./VPS_DEPLOYMENT_GUIDE.md)** for deployment details.

---


## 📋 Prerequisites Checklist

Before you begin, ensure you have:

- ✅ **Node.js** (v16 or higher) - [Download](https://nodejs.org/)
- ✅ **Python** (3.10 or higher) - [Download](https://www.python.org/)
- ✅ **Git** - [Download](https://git-scm.com/)
- ✅ **Code Editor** (VS Code recommended) - [Download](https://code.visualstudio.com/)

---

## ⚡ Quick Start (5 Minutes)

### Step 1: Backend Setup

Open a terminal in the project root and run:

```powershell
# Navigate to backend directory
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment (Windows)
.\venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Run migrations
python manage.py makemigrations
python manage.py migrate

# Create admin user (follow prompts)
python manage.py createsuperuser

# Start backend server
python manage.py runserver
```

✅ **Backend is now running at**: `http://localhost:8000`

---

### Step 2: Frontend Setup

Open a **NEW terminal** (keep backend running) in the project root:

```powershell
# Install frontend dependencies
npm install

# Start development server
npm run dev
```

✅ **Frontend is now running at**: `http://localhost:5173`

---

## 🎯 Access the Application

### User Interfaces
- **Main App**: http://localhost:5173
- **Django Admin**: http://localhost:8000/admin
- **API Root**: http://localhost:8000/api/

### Test Accounts

After creating your superuser, you can:

1. **Login as Admin**: Use the credentials you created
2. **Create Test Users**: Register through the app or Django admin
3. **Create Test Products**: Use the seller dashboard or admin panel

---

## 🧪 Testing the MVP

### 1. Test Authentication
```
1. Go to http://localhost:5173
2. Click "Register" and create a new account
3. Login with your credentials
4. Verify you're redirected to the home page
```

### 2. Test Product Browsing
```
1. Navigate to "Shop" page
2. Use filters (category, price range)
3. Search for products
4. Click on a product to view details
```

### 3. Test Shopping Cart
```
1. Add a product to cart
2. Go to cart page
3. Update quantity
4. Proceed to checkout
5. Complete order
```

### 4. Test Seller Dashboard
```
1. Login as a seller (or change role in Django admin)
2. Go to Seller Dashboard
3. Create a new product
4. Upload images
5. View sales analytics
```

### 5. Test Admin Dashboard
```
1. Login as admin
2. Go to Admin Dashboard
3. View platform statistics
4. Manage users
5. Moderate products
```

### 6. Test Review System
```
1. Purchase a product (complete checkout)
2. Go to Django admin: http://localhost:8000/admin
3. Change order status to "delivered"
4. Go back to product detail page
5. Write a review (should now be allowed)
```

---

## 🛠️ Common Commands

### Backend Commands

```powershell
# Activate virtual environment
cd backend
.\venv\Scripts\activate

# Run server
python manage.py runserver

# Create migrations
python manage.py makemigrations

# Apply migrations
python manage.py migrate

# Create superuser
python manage.py createsuperuser

# Access Django shell
python manage.py shell

# Collect static files (for production)
python manage.py collectstatic
```

### Frontend Commands

```powershell
# Install dependencies
npm install

# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Type check
npx tsc --noEmit
```

---

## 📁 Project Structure Overview

```
cloudmart-e-commerce/
├── backend/                 # Django REST API
│   ├── api/                # Main app (models, views, serializers)
│   ├── core/               # Project settings
│   ├── manage.py           # Django CLI
│   └── requirements.txt    # Python dependencies
│
├── components/             # React components
├── pages/                  # React pages/routes
├── context/                # React context providers
├── services/               # API integration
├── utils/                  # Helper functions
│
├── index.tsx               # React entry point
├── App.tsx                 # Main app component
├── index.css               # Global styles
├── types.ts                # TypeScript interfaces
│
├── package.json            # Node dependencies
├── vite.config.ts          # Vite configuration
├── tailwind.config.js      # Tailwind CSS config
└── tsconfig.json           # TypeScript config
```

---

## 🔧 Configuration

### Environment Variables

#### Backend (.env in backend/)
```env
SECRET_KEY=your-secret-key-here
DEBUG=True
DATABASE_URL=sqlite:///db.sqlite3
ALLOWED_HOSTS=localhost,127.0.0.1
CORS_ALLOWED_ORIGINS=http://localhost:5173
```

#### Frontend (create .env in root)
```env
VITE_API_URL=http://localhost:8000
```

---

## 🐛 Troubleshooting

### Backend Issues

**Problem**: `ModuleNotFoundError: No module named 'django'`
```powershell
# Solution: Activate virtual environment
cd backend
.\venv\Scripts\activate
pip install -r requirements.txt
```

**Problem**: `django.db.utils.OperationalError: no such table`
```powershell
# Solution: Run migrations
python manage.py migrate
```

**Problem**: Port 8000 already in use
```powershell
# Solution: Use a different port
python manage.py runserver 8001
# Update VITE_API_URL to http://localhost:8001
```

### Frontend Issues

**Problem**: `npm: command not found`
```
Solution: Install Node.js from https://nodejs.org/
```

**Problem**: Port 5173 already in use
```powershell
# Solution: Vite will automatically use next available port
# Or specify a port:
npm run dev -- --port 3000
```

**Problem**: API requests failing (CORS errors)
```
Solution: 
1. Check backend is running on port 8000
2. Verify CORS_ALLOWED_ORIGINS in backend settings
3. Check VITE_API_URL in frontend .env
```

### Database Issues

**Problem**: Need to reset database
```powershell
# WARNING: This deletes all data!
cd backend
del db.sqlite3
python manage.py migrate
python manage.py createsuperuser
```

---

## 📊 Sample Data

### Creating Test Data

#### Option 1: Django Admin
1. Go to http://localhost:8000/admin
2. Login with superuser credentials
3. Manually create products, users, orders

#### Option 2: Django Shell
```powershell
cd backend
python manage.py shell
```

```python
from api.models import User, Product

# Create a seller
seller = User.objects.create_user(
    username='testseller',
    email='seller@test.com',
    password='testpass123',
    role='seller'
)

# Create a product
product = Product.objects.create(
    seller=seller,
    name='Test Product',
    description='This is a test product',
    price=29.99,
    stock_quantity=100,
    category='Electronics',
    brand='TestBrand'
)

print(f"Created product: {product.name}")
```

---

## 🚀 Next Steps

After getting the app running:

1. ✅ **Explore the codebase**
   - Check `backend/api/models.py` for database schema
   - Review `services/api.ts` for API integration
   - Look at `pages/` for React components

2. ✅ **Customize the app**
   - Update colors in `tailwind.config.js`
   - Modify homepage content in `pages/Home.tsx`
   - Add your own product categories

3. ✅ **Deploy to production**
   - See `DEPLOYMENT_GUIDE.md` for detailed instructions
   - Deploy backend to Render
   - Deploy frontend to Vercel
   - Use Neon for PostgreSQL database

4. ✅ **Add new features**
   - See `FULL_MVP_SPECIFICATION.md` for future enhancements
   - Check `MVP_IMPLEMENTATION_CHECKLIST.md` for remaining tasks

---

## 📚 Additional Resources

### Documentation
- [Django Documentation](https://docs.djangoproject.com/)
- [Django REST Framework](https://www.django-rest-framework.org/)
- [React Documentation](https://react.dev/)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Vite Guide](https://vitejs.dev/guide/)

### Project Files
- `FULL_MVP_SPECIFICATION.md` - Complete feature specification
- `MVP_IMPLEMENTATION_CHECKLIST.md` - Implementation status
- `DEPLOYMENT_GUIDE.md` - Production deployment guide
- `README.md` - Project overview

---

## 💡 Tips for Development

### Hot Reload
Both frontend and backend support hot reload:
- **Frontend**: Changes to React files auto-refresh the browser
- **Backend**: Django dev server auto-reloads on Python file changes

### Debugging
- **Frontend**: Use browser DevTools (F12)
- **Backend**: Add `print()` statements or use Django Debug Toolbar
- **API**: Test endpoints with Postman or Thunder Client

### Code Quality
```powershell
# Frontend type checking
npx tsc --noEmit

# Backend code formatting
cd backend
pip install black
black .
```

---

## 🎯 Success Checklist

You've successfully set up CloudMart when:

- [ ] Backend server runs without errors
- [ ] Frontend loads at http://localhost:5173
- [ ] You can register a new user
- [ ] You can login and logout
- [ ] Products display on the shop page
- [ ] You can add items to cart
- [ ] Checkout process works
- [ ] Django admin is accessible

---

## 🆘 Getting Help

If you encounter issues:

1. Check the troubleshooting section above
2. Review error messages carefully
3. Check browser console for frontend errors
4. Check terminal for backend errors
5. Verify all dependencies are installed
6. Ensure both servers are running

---

**Happy Coding! 🎉**

For questions or issues, refer to the documentation files or create an issue in the repository.

---

**Last Updated**: February 4, 2026  
**Version**: 1.0.0
