# Environment Variables Configuration Guide

This document explains how to set up environment variables for secure deployment.

## 🚨 **CRITICAL: Never Commit .env Files**

All `.env` files are excluded from version control via `.gitignore`. **Never commit sensitive information to the repository.**

---

## 📁 **Server (Backend)**

Location: `/server/.env`

### Required Variables

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration (REQUIRED)
DATABASE_URL=mongodb://localhost:27017/attendance_db
# OR for MongoDB Atlas:
# DATABASE_URL=mongodb+srv://username:password@cluster.mongodb.net/attendance_db?retryWrites=true&w=majority

# JWT Secret (REQUIRED)
# Generate a secure secret: openssl rand -base64 32
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
```

### Optional Variables

```env
# CORS Configuration
# For production, specify allowed origins separated by commas:
CORS_ORIGIN=https://your-admin-domain.com,https://your-mobile-app.com
# For development (allow all):
CORS_ORIGIN=*
```

### Setup Steps

1. Copy the example file:
   ```bash
   cd server
   cp .env.example .env
   ```

2. Edit `.env` and fill in your actual values:
   - **DATABASE_URL**: Your MongoDB connection string
   - **JWT_SECRET**: Generate a strong secret key
     ```bash
     openssl rand -base64 32
     ```
   - **CORS_ORIGIN**: Set allowed origins for production

3. Verify the setup:
   ```bash
   npm run dev
   ```

---

## 🌐 **Admin Web (Frontend)**

Location: `/admin-web/.env`

### Environment Variables

```env
# API Configuration
# For development (using Vite proxy):
VITE_API_URL=/api

# For production (when API is on a different domain):
# VITE_API_URL=https://api.your-domain.com/api

# Server proxy target (for Vite dev server - development only)
VITE_API_PROXY_TARGET=http://localhost:3000
```

### Setup Steps

1. Copy the example file:
   ```bash
   cd admin-web
   cp .env.example .env
   ```

2. Edit `.env`:
   - **Development**: Usually no changes needed (uses proxy)
   - **Production**: Set `VITE_API_URL` to your production API URL

3. **Important**: Vite requires the `VITE_` prefix for environment variables to be exposed to client code.

---

## 📱 **Mobile App**

Location: `/mobile-app/.env`

### Environment Variables

```env
# API Configuration
# For development (use your local machine's IP address):
EXPO_PUBLIC_API_URL=http://192.168.1.100:3000/api

# For production:
# EXPO_PUBLIC_API_URL=https://api.your-domain.com/api
```

### Setup Steps

1. Copy the example file:
   ```bash
   cd mobile-app
   cp .env.example .env
   ```

2. Find your local IP address:
   - **macOS/Linux**: `ifconfig | grep "inet " | grep -v 127.0.0.1`
   - **Windows**: `ipconfig | findstr IPv4`

3. Edit `.env` and set `EXPO_PUBLIC_API_URL` to your local IP:
   ```env
   EXPO_PUBLIC_API_URL=http://YOUR_LOCAL_IP:3000/api
   ```

4. **Important**: 
   - Expo requires the `EXPO_PUBLIC_` prefix for environment variables
   - Restart the Expo development server after changing `.env`

---

## 🔒 **Security Checklist**

- [ ] All `.env` files are in `.gitignore`
- [ ] No hardcoded secrets in source code
- [ ] `JWT_SECRET` is a strong, randomly generated string
- [ ] `DATABASE_URL` contains no credentials in production (use connection strings with proper access control)
- [ ] `CORS_ORIGIN` is restricted in production
- [ ] `.env.example` files are present (without actual secrets)
- [ ] Never share `.env` files in chat, email, or version control

---

## 🚀 **Production Deployment**

### Backend Server

1. Set `NODE_ENV=production`
2. Use a strong `JWT_SECRET` (generate with `openssl rand -base64 32`)
3. Set `CORS_ORIGIN` to your actual frontend domains
4. Use a secure database connection string
5. Set `PORT` to your deployment platform's assigned port (or use their environment variable)

### Frontend (Admin Web)

1. Set `VITE_API_URL` to your production API URL
2. Build the app: `npm run build`
3. Deploy the `dist/` folder

### Mobile App

1. Set `EXPO_PUBLIC_API_URL` to your production API URL
2. Build the app with Expo EAS or your preferred method

---

## 📝 **Quick Reference**

| Variable | Location | Required | Example |
|----------|----------|----------|---------|
| `DATABASE_URL` | server/.env | ✅ Yes | `mongodb://localhost:27017/attendance_db` |
| `JWT_SECRET` | server/.env | ✅ Yes | `generated-secret-key` |
| `PORT` | server/.env | No | `3000` |
| `CORS_ORIGIN` | server/.env | No | `https://app.example.com` |
| `VITE_API_URL` | admin-web/.env | No | `/api` or `https://api.example.com/api` |
| `EXPO_PUBLIC_API_URL` | mobile-app/.env | ✅ Yes | `https://api.example.com/api` |

---

## 🆘 **Troubleshooting**

### "JWT_SECRET is required"
- Make sure `.env` exists in the `server/` directory
- Check that `JWT_SECRET` is set in `.env`
- Restart the server after creating/modifying `.env`

### Mobile app can't connect to API
- Verify `EXPO_PUBLIC_API_URL` is set correctly
- Make sure your phone and computer are on the same network (for development)
- Check that the server is running and accessible
- Restart Expo after changing `.env`

### CORS errors in browser
- Check `CORS_ORIGIN` in server `.env`
- For development, use `CORS_ORIGIN=*`
- For production, list all allowed origins separated by commas

---

## 📚 **Additional Resources**

- [Vite Environment Variables](https://vitejs.dev/guide/env-and-mode.html)
- [Expo Environment Variables](https://docs.expo.dev/guides/environment-variables/)
- [Node.js dotenv](https://github.com/motdotla/dotenv)
- [MongoDB Connection Strings](https://www.mongodb.com/docs/manual/reference/connection-string/)

