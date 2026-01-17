# 🧪 Postman API Testing Guide

## 🔴 **502 Bad Gateway - Troubleshooting**

A **502 Bad Gateway** error means your Render service isn't responding. Here's how to fix it:

### **Common Causes & Solutions:**

1. **Service is Sleeping (Render Free Tier)**
   - Free tier services sleep after 15 minutes of inactivity
   - **Solution**: Wait 30-60 seconds after the first request (cold start)
   - Try the request again

2. **Service Failed to Start**
   - Check Render logs for errors
   - Common issues:
     - Missing environment variables (DATABASE_URL, JWT_SECRET)
     - Port configuration wrong
     - Database connection failed

3. **Environment Variables Not Set**
   - Verify all required env vars are set on Render:
     - `DATABASE_URL`
     - `JWT_SECRET`
     - `PORT` (Render usually sets this automatically)
     - `NODE_ENV=production`
     - `CORS_ORIGIN`

4. **Build/Start Command Issues**
   - Check Render service settings:
     - **Build Command**: `npm install` (or `yarn install`)
     - **Start Command**: `npm start` (which runs `node src/index.js`)

---

## ✅ **Check Your Render Service Status**

1. Go to your Render dashboard
2. Click on your service
3. Check the **Logs** tab:
   - Look for startup errors
   - Check if database connection succeeded
   - Verify server started on correct port

4. Check **Environment** tab:
   - All required variables should be set
   - No typos in variable names

---

## 🧪 **Testing Endpoints in Postman**

### **Base URL:**
```
https://attendance-api-7poe.onrender.com
```

### **Health Check (No Auth Required)**

**Request:**
- **Method:** `GET`
- **URL:** `https://attendance-api-7poe.onrender.com/health`
- **Headers:** None required

**Expected Response:**
```json
{
  "status": "ok",
  "message": "Server is running"
}
```

**Status Code:** `200 OK`

---

### **1. Admin Login (No Auth Required)**

**Request:**
- **Method:** `POST`
- **URL:** `https://attendance-api-7poe.onrender.com/api/users/login`
- **Headers:**
  ```
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "admin@example.com",
    "password": "admin123"
  }
  ```

**Expected Response:**
```json
{
  "user": {
    "id": "...",
    "email": "admin@example.com",
    "name": "Admin User",
    "role": "ADMIN"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Status Code:** `200 OK`

**⚠️ Important:** Save the `token` from this response for authenticated requests!

---

### **2. Get All Employees (Requires Auth)**

**Request:**
- **Method:** `GET`
- **URL:** `https://attendance-api-7poe.onrender.com/api/users/employees`
- **Headers:**
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
  ```

**Expected Response:**
```json
{
  "employees": [
    {
      "id": "...",
      "email": "employee@example.com",
      "name": "Employee Name",
      "role": "EMPLOYEE"
    }
  ]
}
```

**Status Code:** `200 OK`

---

### **3. Check In (Employee - Requires Auth & Office WiFi)**

**Request:**
- **Method:** `POST`
- **URL:** `https://attendance-api-7poe.onrender.com/api/attendance/checkin`
- **Headers:**
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
  ```

**Expected Response:**
```json
{
  "message": "Checked in successfully",
  "attendance": {
    "id": "...",
    "userId": "...",
    "date": "2024-01-17",
    "checkIn": "2024-01-17T09:00:00.000Z",
    "status": "PRESENT"
  }
}
```

**Status Code:** `200 OK`

**Note:** Requires connection to office WiFi (IP validation)

---

### **4. Check Out (Employee - Requires Auth & Office WiFi)**

**Request:**
- **Method:** `POST`
- **URL:** `https://attendance-api-7poe.onrender.com/api/attendance/checkout`
- **Headers:**
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  Content-Type: application/json
  ```

**Expected Response:**
```json
{
  "message": "Checked out successfully",
  "attendance": {
    "id": "...",
    "checkOut": "2024-01-17T18:00:00.000Z",
    "workingHours": 8
  }
}
```

**Status Code:** `200 OK`

---

### **5. Get Today's Attendance (Employee - Requires Auth)**

**Request:**
- **Method:** `GET`
- **URL:** `https://attendance-api-7poe.onrender.com/api/attendance/today`
- **Headers:**
  ```
  Authorization: Bearer YOUR_TOKEN_HERE
  ```

**Expected Response:**
```json
{
  "attendance": {
    "id": "...",
    "date": "2024-01-17",
    "checkIn": "2024-01-17T09:00:00.000Z",
    "status": "PRESENT"
  }
}
```

**Status Code:** `200 OK` or `404` if no attendance today

---

### **6. Get IP Configurations (Admin - Requires Auth)**

**Request:**
- **Method:** `GET`
- **URL:** `https://attendance-api-7poe.onrender.com/api/ip-config`
- **Headers:**
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  ```

**Expected Response:**
```json
{
  "ipConfigs": [
    {
      "id": "...",
      "name": "Main Office",
      "ipAddress": "192.168.1.1",
      "subnet": "255.255.255.0",
      "isActive": true
    }
  ]
}
```

**Status Code:** `200 OK`

---

### **7. Create Employee (Admin - Requires Auth)**

**Request:**
- **Method:** `POST`
- **URL:** `https://attendance-api-7poe.onrender.com/api/users/employees`
- **Headers:**
  ```
  Authorization: Bearer YOUR_ADMIN_TOKEN_HERE
  Content-Type: application/json
  ```
- **Body (raw JSON):**
  ```json
  {
    "email": "newemployee@example.com",
    "password": "password123",
    "name": "New Employee"
  }
  ```

**Expected Response:**
```json
{
  "message": "Employee account created successfully",
  "user": {
    "id": "...",
    "email": "newemployee@example.com",
    "name": "New Employee",
    "role": "EMPLOYEE"
  }
}
```

**Status Code:** `201 Created`

---

## 🔧 **Setting Up Postman Environment**

### **Create Environment Variables:**

1. Click **Environments** in Postman
2. Create new environment: "Attendance API Production"
3. Add variables:
   - `base_url`: `https://attendance-api-7poe.onrender.com`
   - `token`: (Leave empty, will be set after login)
   - `admin_token`: (Leave empty, will be set after admin login)

### **Using Variables:**

- **Base URL:** `{{base_url}}/health`
- **Authorization:** `Bearer {{token}}`

---

## 📋 **Quick Test Sequence**

1. **Health Check** → Should return 200 OK
2. **Login** → Get token
3. **Save Token** → Copy token to environment variable
4. **Get Employees** → Test authenticated endpoint
5. **Check In** → Test employee action (if on office WiFi)

---

## 🚨 **Common Errors**

### **401 Unauthorized**
- Token missing or invalid
- Solution: Login again and get new token

### **403 Forbidden**
- Not an admin (for admin-only endpoints)
- Solution: Use admin account token

### **400 Bad Request**
- Missing required fields
- Solution: Check request body matches expected format

### **404 Not Found**
- Wrong endpoint URL
- Solution: Verify endpoint path

### **500 Internal Server Error**
- Server-side error
- Solution: Check Render logs

### **502 Bad Gateway**
- Service not running
- Solution: Check Render service status and logs

---

## ✅ **Testing Checklist**

- [ ] Service is running on Render (not sleeping)
- [ ] Health endpoint returns 200 OK
- [ ] Can login successfully
- [ ] Token is saved and used in subsequent requests
- [ ] Authenticated endpoints work
- [ ] Admin endpoints work with admin token
- [ ] Employee endpoints work with employee token

---

## 💡 **Pro Tips**

1. **Use Postman Collections**: Save all requests in a collection
2. **Set Up Tests**: Auto-save token from login response
3. **Environment Variables**: Use variables for base URL and tokens
4. **Check Render Logs**: Always check logs if something fails
5. **Test in Sequence**: Login first, then test authenticated endpoints

---

## 🔗 **All API Endpoints Summary**

### **Public (No Auth):**
- `GET /health` - Health check
- `POST /api/users/login` - Login

### **Employee (Auth Required):**
- `POST /api/attendance/checkin` - Check in
- `POST /api/attendance/checkout` - Check out
- `GET /api/attendance/today` - Get today's attendance
- `GET /api/attendance/my-attendance` - Get attendance history
- `GET /api/dashboard/my-stats` - Get my statistics
- `POST /api/leaves` - Apply for leave
- `GET /api/leaves/my-leaves` - Get my leaves

### **Admin (Auth + Admin Role Required):**
- `POST /api/users/employees` - Create employee
- `GET /api/users/employees` - Get all employees
- `GET /api/ip-config` - Get IP configs
- `POST /api/ip-config` - Create IP config
- `PUT /api/ip-config/:id` - Update IP config
- `DELETE /api/ip-config/:id` - Delete IP config
- `GET /api/dashboard/who-is-in-office` - Who's in office
- `GET /api/dashboard/today-summary` - Today's summary
- `GET /api/leaves` - Get all leave requests
- `PUT /api/leaves/:id/status` - Update leave status

---

**Happy Testing! 🚀**

