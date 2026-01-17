# 🔍 Environment Variables Review Guide

Since I cannot directly access your `.env.example` files, use this guide to verify they're correct.

---

## ✅ **1. Server `.env.example` - REQUIRED Variables**

### Your file should contain:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (REQUIRED)
DATABASE_URL=mongodb://localhost:27017/attendance_db
# For MongoDB Atlas (production):
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/attendance_db?retryWrites=true&w=majority

# JWT Secret (REQUIRED)
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# CORS Configuration (Optional)
CORS_ORIGIN=*
# For production: CORS_ORIGIN=https://admin.yourdomain.com,https://yourapp.com
```

### ✅ Checklist:
- [ ] **DATABASE_URL** is present (REQUIRED - server won't start without it)
- [ ] **JWT_SECRET** is present (REQUIRED - server throws error without it)
- [ ] **PORT** is present (optional, defaults to 3000)
- [ ] **NODE_ENV** is present (optional, defaults to 'development')
- [ ] **CORS_ORIGIN** is present (optional, defaults to '*' for dev)
- [ ] No actual secrets (just placeholders)
- [ ] Helpful comments included

### ❌ Common Mistakes:
- Missing `DATABASE_URL` or `JWT_SECRET` (these are REQUIRED)
- Using actual database credentials (should be placeholders)
- Missing comments explaining each variable

---

## ✅ **2. Admin Web `.env.example` - Optional Variables**

### Your file should contain:

```env
# API Configuration
# For development (using Vite proxy):
VITE_API_URL=/api

# For production (when API is on a different domain):
# VITE_API_URL=https://api.yourdomain.com/api

# Server proxy target (for Vite dev server - development only)
VITE_API_PROXY_TARGET=http://localhost:3000
```

### ✅ Checklist:
- [ ] **VITE_API_URL** is present (optional, defaults to '/api')
  - Development: `/api` (uses Vite proxy)
  - Production: Full URL like `https://api.yourdomain.com/api`
- [ ] **VITE_API_PROXY_TARGET** is present (optional, defaults to 'http://localhost:3000')
  - Only used in development by Vite proxy
- [ ] Variable names start with `VITE_` (required by Vite)
- [ ] Comments explain dev vs production usage

### ❌ Common Mistakes:
- Variable names don't start with `VITE_` (won't work!)
- Missing comments about dev/production differences
- Wrong URL format (trailing slashes, etc.)

---

## ✅ **3. Mobile App `.env.example` - Required for Production**

### Your file should contain:

```env
# API Configuration
# IMPORTANT: In Expo, environment variables MUST be prefixed with EXPO_PUBLIC_

# For development (use your local machine's IP address, not localhost):
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api

# For production:
# EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api

# Note: After updating this file, restart Expo dev server
```

### ✅ Checklist:
- [ ] **EXPO_PUBLIC_API_URL** is present
  - Development: Your local machine's IP (e.g., `http://192.168.1.100:3000/api`)
  - Production: Your deployed API URL (e.g., `https://api.yourdomain.com/api`)
- [ ] Variable name starts with `EXPO_PUBLIC_` (required by Expo)
- [ ] Uses IP address, NOT `localhost` (for development)
- [ ] No trailing slash in URL
- [ ] Comments explain how to find your local IP

### ❌ Common Mistakes:
- Variable name doesn't start with `EXPO_PUBLIC_` (won't be accessible!)
- Using `localhost` instead of actual IP address (won't work on physical devices)
- Trailing slash in URL (`/api/` instead of `/api`)
- Missing comment about restarting Expo

---

## 🎯 **Quick Verification Test**

### Test Server:
```bash
cd server
# If you have .env file:
npm run dev
# Should start without errors

# If missing .env:
# Should show error: "JWT_SECRET is required"
```

### Test Admin Web:
```bash
cd admin-web
npm run dev
# Should proxy API requests correctly
# Check browser console - should see API calls working
```

### Test Mobile App:
```bash
cd mobile-app
# Make sure .env has EXPO_PUBLIC_API_URL set
npx expo start
# Should connect to API (check network requests in app)
```

---

## 📋 **Complete Template for Each File**

### server/.env.example (CORRECT):
```env
PORT=3000
NODE_ENV=development
DATABASE_URL=mongodb://localhost:27017/attendance_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
CORS_ORIGIN=*
```

### admin-web/.env.example (CORRECT):
```env
VITE_API_URL=/api
VITE_API_PROXY_TARGET=http://localhost:3000
```

### mobile-app/.env.example (CORRECT):
```env
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

---

## 🚨 **Critical Issues to Fix**

1. **Server**: Must have `DATABASE_URL` and `JWT_SECRET` (no defaults in code)
2. **Admin Web**: Variables must start with `VITE_`
3. **Mobile App**: 
   - Variable must start with `EXPO_PUBLIC_`
   - Must use IP address, not `localhost`
   - No trailing slash

---

## 📝 **Next Steps**

1. Review each `.env.example` file against this guide
2. Compare with the templates above
3. Fix any missing or incorrect variables
4. Test each application to ensure they work in dev mode
5. Update production examples with your actual domains

---

## 💡 **Tips**

- **Development**: Use `localhost` or local IP addresses
- **Production**: Use actual domain names and HTTPS URLs
- **Comments**: Add helpful comments explaining each variable
- **Validation**: Test each app after setting up `.env` files

---

## ✅ **Final Checklist**

- [ ] Server `.env.example` has all required variables
- [ ] Admin web `.env.example` has `VITE_` prefixed variables
- [ ] Mobile app `.env.example` has `EXPO_PUBLIC_` prefixed variable
- [ ] All files have helpful comments
- [ ] No actual secrets (just placeholders)
- [ ] URLs are properly formatted (no trailing slashes)
- [ ] Development and production examples are clear

