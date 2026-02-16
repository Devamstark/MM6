# SSL/HTTPS Security Setup Guide

## ✅ Current Security Status

### Frontend (Vercel)
- **SSL Certificate**: ✅ Automatically provided by Vercel (Let's Encrypt)
- **HTTPS**: ✅ All Vercel deployments use HTTPS by default
- **Your URL**: `https://mm-6.vercel.app` or your custom domain

### Backend (Render)
- **SSL Certificate**: ✅ Automatically provided by Render (Let's Encrypt)
- **HTTPS**: ✅ All Render services use HTTPS by default
- **Your URL**: `https://mm6-backend.onrender.com` (or your actual backend URL)

## 🔧 Required Configuration

### 1. Vercel Environment Variables

Go to: https://vercel.com/dashboard → Your Project → Settings → Environment Variables

Add the following:

```
Name: VITE_API_URL
Value: https://your-backend-url.onrender.com/api
Environments: Production, Preview, Development
```

⚠️ **CRITICAL**: The URL MUST start with `https://` not `http://`

### 2. Render Backend Configuration

Ensure your backend is deployed and accessible via HTTPS:

1. Go to your Render dashboard
2. Check your service URL - it should be `https://...`
3. Verify the service is running

### 3. CORS Configuration (Backend)

Your Django backend should allow requests from your Vercel domain:

```python
# backend/cloudmart/settings.py
CORS_ALLOWED_ORIGINS = [
    "https://mm-6.vercel.app",
    "https://your-custom-domain.com",  # if you have one
]

# For development
if DEBUG:
    CORS_ALLOWED_ORIGINS += ["http://localhost:5173", "http://localhost:5174"]
```

## 🚨 Common SSL Issues & Solutions

### Issue 1: "Mixed Content" Warning
**Cause**: Frontend (HTTPS) calling backend over HTTP
**Solution**: Ensure `VITE_API_URL` uses `https://`

### Issue 2: "NET::ERR_CERT_AUTHORITY_INVALID"
**Cause**: Using self-signed certificate
**Solution**: Both Vercel and Render provide valid certificates - no action needed

### Issue 3: Browser Shows "Not Secure"
**Causes**:
- Accessing via `http://` instead of `https://`
- Mixed content (loading resources over HTTP)
- Expired certificate (shouldn't happen with Vercel/Render)

**Solution**: 
- Always use `https://` URLs
- Check all external resources use HTTPS
- Redeploy if needed

## 📋 Deployment Checklist

- [ ] Vercel environment variable `VITE_API_URL` set to HTTPS backend URL
- [ ] Backend deployed on Render with HTTPS
- [ ] CORS configured to allow Vercel domain
- [ ] Test the deployed site at `https://mm-6.vercel.app`
- [ ] Verify no mixed content warnings in browser console
- [ ] Check that login/payment forms work over HTTPS

## 🔐 Additional Security Recommendations

### 1. Force HTTPS Redirect
Vercel automatically redirects HTTP to HTTPS - no configuration needed.

### 2. Security Headers
Add to `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        },
        {
          "key": "X-XSS-Protection",
          "value": "1; mode=block"
        },
        {
          "key": "Strict-Transport-Security",
          "value": "max-age=31536000; includeSubDomains"
        }
      ]
    }
  ]
}
```

### 3. Content Security Policy (CSP)
Consider adding CSP headers to prevent XSS attacks.

### 4. Environment Variables Security
- ✅ Never commit `.env` files to Git
- ✅ Use Vercel's environment variables for secrets
- ✅ Rotate API keys regularly

## 🧪 Testing SSL

### Test Your Deployment:
1. Visit: `https://www.ssllabs.com/ssltest/`
2. Enter your Vercel URL
3. Check for A+ rating

### Browser Console Check:
1. Open your site in Chrome
2. Press F12 → Console tab
3. Look for any "Mixed Content" warnings
4. All requests should be HTTPS

## 📞 Support

If issues persist:
- **Vercel Support**: https://vercel.com/support
- **Render Support**: https://render.com/docs/support
- Check browser console for specific error messages
