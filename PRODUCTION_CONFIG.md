# ⚡ Quick Production Configuration Guide

## 🎯 **Production API URL**

**Your Render Backend:** `https://attendance-api-7poe.onrender.com`  
**API Endpoints:** `https://attendance-api-7poe.onrender.com/api`

---

## 📱 **Mobile App - Production Setup**

### Create/Update `mobile-app/.env`:

```env
EXPO_PUBLIC_API_URL=https://attendance-api-7poe.onrender.com/api
```

### Steps:
1. `cd mobile-app`
2. Create `.env` file (or edit existing)
3. Add the line above
4. **Restart Expo** after changing `.env`

### Verification:
The mobile app will now use the production API by default (unless you override with `.env`).

---

## 🌐 **Admin Web - Production Setup**

### Create/Update `admin-web/.env`:

```env
VITE_API_URL=https://attendance-api-7poe.onrender.com/api
```

### Steps:
1. `cd admin-web`
2. Create `.env` file (or edit existing)
3. Add the line above
4. Build for production: `npm run build`
5. Deploy the `dist/` folder

### Development Note:
- In development, Vite proxy will still work with `/api`
- In production, it will use the full URL from `VITE_API_URL`

---

## 🔧 **Backend CORS Configuration (Important!)**

Make sure your backend on Render has CORS configured to allow your frontend domains.

### Update `server/.env` on Render:

```env
CORS_ORIGIN=https://your-admin-domain.com,https://yourapp.com
```

**Or for testing (allow all):**
```env
CORS_ORIGIN=*
```

**Then restart your Render service!**

---

## ✅ **Quick Test**

### Test Backend:
```bash
curl https://attendance-api-7poe.onrender.com/health
```

Should return:
```json
{"status":"ok","message":"Server is running"}
```

---

## 📋 **Environment Files Checklist**

### `mobile-app/.env`:
- [ ] `EXPO_PUBLIC_API_URL=https://attendance-api-7poe.onrender.com/api`

### `admin-web/.env`:
- [ ] `VITE_API_URL=https://attendance-api-7poe.onrender.com/api`

### `server/.env` (on Render):
- [ ] `CORS_ORIGIN` includes your frontend domains
- [ ] All required variables (DATABASE_URL, JWT_SECRET, etc.)

---

## 🚨 **Important Notes**

1. **API Path**: Always include `/api` at the end of the URL
2. **HTTPS**: Production uses HTTPS (secure)
3. **CORS**: Backend must allow your frontend domains
4. **Restart**: Always restart services after changing `.env` files
5. **Build**: Frontend must be rebuilt after changing env variables

---

## 🎉 **All Set!**

Your frontend configurations are now updated to use the production API at:
**`https://attendance-api-7poe.onrender.com/api`**

