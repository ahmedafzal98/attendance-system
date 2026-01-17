# Environment Variables Validation Checklist

This document helps you verify that your `.env.example` files are correct.

## 🔍 **Server (.env.example)** - Required Variables

Your `server/.env.example` should contain:

```env
# ✅ REQUIRED
DATABASE_URL=mongodb://localhost:27017/attendance_db
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production

# ✅ OPTIONAL (but recommended)
PORT=3000
NODE_ENV=development
CORS_ORIGIN=*
```

### Validation:
- [ ] `DATABASE_URL` is present (required - server won't start without it)
- [ ] `JWT_SECRET` is present (required - server will throw error without it)
- [ ] `PORT` is present (optional, defaults to 3000)
- [ ] `NODE_ENV` is present (optional, defaults to 'development')
- [ ] `CORS_ORIGIN` is present (optional, defaults to '*' for dev)

### Production Notes:
- `DATABASE_URL` should be MongoDB Atlas connection string
- `JWT_SECRET` should be a strong, randomly generated secret
- `CORS_ORIGIN` should list actual frontend domains (comma-separated)
- `NODE_ENV` should be `production`

---

## 🌐 **Admin Web (.env.example)** - Optional Variables

Your `admin-web/.env.example` should contain:

```env
# ✅ OPTIONAL - For production API URL
VITE_API_URL=/api

# ✅ OPTIONAL - For Vite dev server proxy
VITE_API_PROXY_TARGET=http://localhost:3000
```

### Validation:
- [ ] `VITE_API_URL` is present (optional, defaults to '/api')
  - Development: Can be `/api` (uses Vite proxy)
  - Production: Should be full URL like `https://api.yourdomain.com/api`
- [ ] `VITE_API_PROXY_TARGET` is present (optional, defaults to 'http://localhost:3000')
  - Only used in development by Vite proxy
  - Can be omitted if using default

### Important Notes:
- All Vite env vars **must** be prefixed with `VITE_`
- These are optional because the code has defaults
- In production, `VITE_API_URL` should point to your actual API

---

## 📱 **Mobile App (.env.example)** - Required in Production

Your `mobile-app/.env.example` should contain:

```env
# ✅ REQUIRED for production, recommended for dev
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api
```

### Validation:
- [ ] `EXPO_PUBLIC_API_URL` is present
  - Development: Your local machine's IP (e.g., `http://192.168.1.100:3000/api`)
  - Production: Your deployed API URL (e.g., `https://api.yourdomain.com/api`)

### Important Notes:
- **MUST** be prefixed with `EXPO_PUBLIC_` for Expo
- No trailing slash
- Development: Use your computer's local IP (find with `ifconfig` or `ipconfig`)
- Production: Use your deployed backend URL

### Finding Your Local IP:
- **macOS/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
- **Windows**: `ipconfig | findstr IPv4`

---

## ✅ **Complete Checklist**

### Server `.env.example`:
- [ ] Contains `DATABASE_URL` with placeholder
- [ ] Contains `JWT_SECRET` with placeholder
- [ ] Contains `PORT=3000`
- [ ] Contains `NODE_ENV=development`
- [ ] Contains `CORS_ORIGIN=*` (or production example)

### Admin Web `.env.example`:
- [ ] Contains `VITE_API_URL=/api` (or production example)
- [ ] Contains `VITE_API_PROXY_TARGET=http://localhost:3000`

### Mobile App `.env.example`:
- [ ] Contains `EXPO_PUBLIC_API_URL` with placeholder IP
- [ ] Variable name starts with `EXPO_PUBLIC_`
- [ ] URL format is correct (no trailing slash)

---

## 🚨 **Common Mistakes to Avoid**

1. ❌ **Real secrets in .env.example** - Never put actual database passwords or JWT secrets
2. ❌ **Missing variable prefix** - Vite needs `VITE_`, Expo needs `EXPO_PUBLIC_`
3. ❌ **Incorrect URL format** - No trailing slashes in API URLs
4. ❌ **localhost in mobile app** - Use actual IP address, not `localhost`
5. ❌ **Missing comments** - Add helpful comments explaining each variable

---

## 📝 **Example Production Configurations**

### Server Production:
```env
NODE_ENV=production
PORT=3000
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority
JWT_SECRET=<generated-with-openssl-rand-base64-32>
CORS_ORIGIN=https://admin.yourdomain.com,https://yourapp.com
```

### Admin Web Production:
```env
VITE_API_URL=https://api.yourdomain.com/api
# VITE_API_PROXY_TARGET not needed in production
```

### Mobile App Production:
```env
EXPO_PUBLIC_API_URL=https://api.yourdomain.com/api
```

---

## 🔧 **How to Test Your Configuration**

1. **Server**: `npm run dev` - Should start without errors
2. **Admin Web**: `npm run dev` - Should proxy to backend correctly
3. **Mobile App**: Start Expo - Should connect to API correctly

If any fail, check the console for environment variable warnings!

