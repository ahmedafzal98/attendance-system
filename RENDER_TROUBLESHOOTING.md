# 🔧 Render Deployment Troubleshooting

## 🔴 **502 Bad Gateway Error - Fix Guide**

### **Step 1: Check Render Service Status**

1. Go to [Render Dashboard](https://dashboard.render.com)
2. Click on your service
3. Check **Status** badge:
   - ✅ **Live** = Service is running
   - ⏸️ **Suspended** = Service is sleeping/stopped
   - ❌ **Failed** = Service crashed

---

### **Step 2: Check Build & Start Commands**

Go to **Settings** → **Build & Deploy**

#### **Build Command:**
```bash
npm install
```

#### **Start Command:**
```bash
npm start
```

**Verify in `package.json`:**
```json
{
  "scripts": {
    "start": "node src/index.js"
  }
}
```

---

### **Step 3: Verify Environment Variables**

Go to **Environment** tab and ensure these are set:

#### **Required Variables:**
```env
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/db?retryWrites=true&w=majority
JWT_SECRET=your-secure-secret-key-here
NODE_ENV=production
PORT=10000
```

#### **Optional (But Recommended):**
```env
CORS_ORIGIN=*
# Or specific origins:
# CORS_ORIGIN=https://yourdomain.com,https://app.yourdomain.com
```

**⚠️ Important Notes:**
- Render sets `PORT` automatically - you might need to use `process.env.PORT` or `PORT=10000`
- Never commit `.env` files - use Render's Environment tab
- `JWT_SECRET` should be a strong, random string (use `openssl rand -base64 32`)

---

### **Step 4: Check Application Logs**

Go to **Logs** tab and look for:

#### **✅ Good Signs:**
```
MongoDB Connected: cluster.mongodb.net
Server is running on port 10000
Environment: production
```

#### **❌ Error Signs:**
```
Error: DATABASE_URL is not defined
Error: JWT_SECRET is required
MongoDB connection error
Error: Port 3000 already in use
```

---

### **Step 5: Common Issues & Solutions**

#### **Issue 1: Service is Sleeping (Free Tier)**
**Symptom:** 502 on first request, works on second
**Solution:** 
- Wait 30-60 seconds for cold start
- Or upgrade to paid plan (no sleep)

#### **Issue 2: Wrong Port**
**Symptom:** Service starts but immediately crashes
**Solution:**
- Render uses `PORT` environment variable
- Make sure your code uses: `const PORT = process.env.PORT || 3000;`
- Or set `PORT=10000` in environment variables

#### **Issue 3: Database Connection Failed**
**Symptom:** Logs show MongoDB connection error
**Solution:**
- Verify `DATABASE_URL` is correct
- Check MongoDB Atlas IP whitelist (should include `0.0.0.0/0` for all)
- Verify database user has correct permissions

#### **Issue 4: Missing Environment Variables**
**Symptom:** Error about missing DATABASE_URL or JWT_SECRET
**Solution:**
- Add all required variables in Render Environment tab
- Restart service after adding variables

#### **Issue 5: Build Failed**
**Symptom:** Service shows "Build failed"
**Solution:**
- Check build logs for npm install errors
- Verify `package.json` is correct
- Make sure Node.js version is compatible (check `package.json` engines or Render settings)

---

### **Step 6: Verify Your Code Changes**

Make sure `server/src/index.js` has:

```javascript
// Load environment variables FIRST
const dotenv = require('dotenv');
dotenv.config();

// ... rest of code

const PORT = process.env.PORT || 3000;
```

---

### **Step 7: Test Locally First**

Before deploying, test locally:

```bash
cd server

# Set production-like environment
export NODE_ENV=production
export PORT=10000
export DATABASE_URL=your-mongodb-url
export JWT_SECRET=your-secret

# Start server
npm start

# Test health endpoint
curl http://localhost:10000/health
```

If it works locally but not on Render, it's likely an environment variable issue.

---

### **Step 8: Manual Service Restart**

If service is stuck:

1. Go to Render dashboard
2. Click **Manual Deploy** → **Clear build cache & deploy**
3. Wait for build to complete
4. Check logs again

---

### **Step 9: Verify Service Configuration**

#### **Service Type:**
- Should be **Web Service** (not Background Worker)

#### **Region:**
- Choose closest to your users

#### **Branch:**
- Should match your deployment branch (usually `main` or `master`)

#### **Auto-Deploy:**
- Enable to auto-deploy on git push

---

## ✅ **Quick Verification Checklist**

- [ ] Service status is **Live**
- [ ] Build command: `npm install`
- [ ] Start command: `npm start`
- [ ] All environment variables set
- [ ] `PORT` is set or code uses `process.env.PORT`
- [ ] `DATABASE_URL` is correct MongoDB connection string
- [ ] `JWT_SECRET` is set (strong random string)
- [ ] `NODE_ENV=production`
- [ ] Database connection works (check logs)
- [ ] No errors in logs

---

## 🔍 **How to Check Logs**

1. Go to Render dashboard
2. Click your service
3. Click **Logs** tab
4. Look for:
   - ✅ "Server is running on port..."
   - ✅ "MongoDB Connected"
   - ❌ Any error messages

---

## 📞 **If Still Not Working**

1. **Check Logs** - Most issues show up in logs
2. **Verify Environment Variables** - Common cause of issues
3. **Test Locally** - If local works, it's a Render config issue
4. **Check Render Status Page** - Sometimes Render has outages
5. **Review Documentation** - Check Render docs for specific errors

---

## 💡 **Pro Tips**

1. **Always check logs first** - 90% of issues are visible in logs
2. **Use Render's manual deploy** - Clear cache if having issues
3. **Test health endpoint** - Simple way to verify service is up
4. **Keep environment variables in sync** - Local `.env` should match Render
5. **Monitor service status** - Render dashboard shows real-time status

---

**After fixing, test with:**
```bash
curl https://attendance-api-7poe.onrender.com/health
```

Should return:
```json
{"status":"ok","message":"Server is running"}
```

