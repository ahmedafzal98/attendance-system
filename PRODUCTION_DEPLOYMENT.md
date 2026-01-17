# 🚀 Production Deployment Configuration

This document contains the production API URL and configuration details.

## 🌐 **Production API URL**

**Backend API (Render):** `https://attendance-api-7poe.onrender.com`

**API Base Path:** `https://attendance-api-7poe.onrender.com/api`

---

## 📱 **Mobile App Configuration**

### Production Environment Variables

Create or update `mobile-app/.env`:

```env
EXPO_PUBLIC_API_URL=https://attendance-api-7poe.onrender.com/api
```

### Steps:
1. Navigate to `mobile-app` directory
2. Create `.env` file (or update existing)
3. Add: `EXPO_PUBLIC_API_URL=https://attendance-api-7poe.onrender.com/api`
4. Restart Expo dev server after changing `.env`

---

## 🌐 **Admin Web Configuration**

### Production Environment Variables

Create or update `admin-web/.env`:

```env
VITE_API_URL=https://attendance-api-7poe.onrender.com/api
# VITE_API_PROXY_TARGET is only for development, not needed in production
```

### Steps:
1. Navigate to `admin-web` directory
2. Create `.env` file (or update existing)
3. Add: `VITE_API_URL=https://attendance-api-7poe.onrender.com/api`
4. Build for production: `npm run build`
5. Deploy the `dist/` folder

---

## 🔧 **Development vs Production**

### Development:
- **Admin Web**: Uses Vite proxy (`/api` → `http://localhost:3000`)
- **Mobile App**: Uses local IP (e.g., `http://192.168.1.100:3000/api`)

### Production:
- **Admin Web**: Uses full URL (`https://attendance-api-7poe.onrender.com/api`)
- **Mobile App**: Uses full URL (`https://attendance-api-7poe.onrender.com/api`)

---

## ✅ **Verification Checklist**

### Before Deployment:
- [ ] Backend is deployed and accessible at `https://attendance-api-7poe.onrender.com`
- [ ] Backend health endpoint works: `https://attendance-api-7poe.onrender.com/health`
- [ ] Admin web `.env` has `VITE_API_URL` set for production
- [ ] Mobile app `.env` has `EXPO_PUBLIC_API_URL` set for production
- [ ] CORS is configured on backend to allow frontend domains

### Backend CORS Configuration:

Make sure your `server/.env` (on Render) has:

```env
CORS_ORIGIN=https://your-admin-domain.com,https://yourapp.com
```

Or for development/testing:
```env
CORS_ORIGIN=*
```

---

## 🧪 **Testing Production API**

### Test Backend Health:
```bash
curl https://attendance-api-7poe.onrender.com/health
```

Expected response:
```json
{"status":"ok","message":"Server is running"}
```

### Test API Endpoint:
```bash
curl https://attendance-api-7poe.onrender.com/api/users/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@example.com","password":"admin123"}'
```

---

## 📝 **Environment Files Summary**

### `mobile-app/.env` (Production):
```env
EXPO_PUBLIC_API_URL=https://attendance-api-7poe.onrender.com/api
```

### `admin-web/.env` (Production):
```env
VITE_API_URL=https://attendance-api-7poe.onrender.com/api
```

### `server/.env` (On Render):
```env
NODE_ENV=production
PORT=10000
DATABASE_URL=<your-mongodb-connection-string>
JWT_SECRET=<your-secure-jwt-secret>
CORS_ORIGIN=https://your-admin-domain.com,https://yourapp.com
```

---

## 🔐 **Important Notes**

1. **HTTPS**: Production API uses HTTPS (secure)
2. **CORS**: Ensure backend CORS allows your frontend domains
3. **Environment Variables**: Never commit `.env` files with production secrets
4. **API Path**: All API endpoints are under `/api` path
5. **Health Check**: Use `/health` endpoint to verify backend is running

---

## 🆘 **Troubleshooting**

### "Network Error" in Frontend:
- Verify backend URL is correct (includes `/api` at the end)
- Check CORS configuration on backend
- Verify backend is running and accessible

### "401 Unauthorized":
- Check if you're using the correct API URL
- Verify JWT token is being sent in headers
- Check if token is valid and not expired

### CORS Errors:
- Update `CORS_ORIGIN` in backend `.env` on Render
- Include your frontend domain(s) in the CORS_ORIGIN list
- Restart backend after changing CORS configuration

