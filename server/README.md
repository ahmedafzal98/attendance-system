# Attendance System - Backend Server

Backend server for the attendance system built with Node.js, Express, and MongoDB.

## Features

- User Management & Authentication
  - Admin login
  - Create Employee accounts (Admin only)
  - JWT-based authentication
  - Password hashing with bcrypt

- Core Attendance & IP Configuration
  - Employee check-in/check-out (Office WiFi only)
  - IP-based access control
  - Automatic status detection (Present, Late, Absent, Half Day)
  - Attendance history and reporting
  - Admin attendance management

## Prerequisites

- Node.js (v18 or higher)
- MongoDB database (local or cloud)
- npm or yarn

## Setup Instructions

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment variables:**
   Create a `.env` file in the server directory with the following:
   ```
   DATABASE_URL="mongodb://localhost:27017/attendance_db"
   JWT_SECRET="your-super-secret-jwt-key-change-this-in-production"
   PORT=3000
   NODE_ENV=development
   ```

   For MongoDB Atlas (cloud), use:
   ```
   DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/attendance_db?retryWrites=true&w=majority"
   ```

3. **Start the development server:**
   ```bash
   npm run dev
   ```

4. **Create an admin user:**
   ```bash
   npm run create:admin
   # Or with custom values:
   npm run create:admin admin@example.com admin123 "Admin Name"
   ```

5. **Set up office IP configuration:**
   ```bash
   npm run setup:office-ip "Main Office" "192.168.1.1" "255.255.255.0"
   # Or with CIDR notation:
   npm run setup:office-ip "Main Office" "192.168.1.0" "/24"
   ```
   
   **Note:** Employees can only check-in/check-out when connected to office WiFi. Make sure to configure the office IP address(es) before testing attendance features.

## API Endpoints

### Authentication

- `POST /api/users/login` - Admin login
  - Body: `{ "email": "admin@example.com", "password": "password123" }`
  - Returns: `{ "user": {...}, "token": "jwt-token" }`

### Employee Management (Admin only)

- `POST /api/users/employees` - Create employee account
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "email": "employee@example.com", "password": "password123", "name": "Employee Name" }`
  - Returns: `{ "message": "Employee account created successfully", "user": {...} }`

- `GET /api/users/employees` - Get all employees
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "employees": [...] }`

### Attendance (Employee - Requires Office WiFi)

- `POST /api/attendance/checkin` - Check in
  - Headers: `Authorization: Bearer <token>`
  - **Note:** Must be connected to office WiFi
  - Returns: `{ "message": "Checked in successfully", "attendance": {...} }`

- `POST /api/attendance/checkout` - Check out
  - Headers: `Authorization: Bearer <token>`
  - **Note:** Must be connected to office WiFi
  - Returns: `{ "message": "Checked out successfully", "attendance": {...} }`

- `GET /api/attendance/today` - Get today's attendance
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "attendance": {...} }`

- `GET /api/attendance/my-attendance` - Get attendance history
  - Headers: `Authorization: Bearer <token>`
  - Query params: `?startDate=2024-01-01&endDate=2024-01-31` (optional)
  - Returns: `{ "attendance": [...] }`

### Attendance Management (Admin only)

- `PUT /api/attendance/:attendanceId/status` - Update attendance status
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "status": "PRESENT|ABSENT|LATE|HALF_DAY", "notes": "optional notes" }`
  - Returns: `{ "message": "Attendance status updated successfully", "attendance": {...} }`

- `POST /api/attendance/:userId/absent` - Mark employee as absent
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "date": "2024-01-15", "notes": "optional notes" }`
  - Returns: `{ "message": "Employee marked as absent", "attendance": {...} }`

- `GET /api/attendance/user/:userId` - Get user's attendance records
  - Headers: `Authorization: Bearer <token>`
  - Query params: `?startDate=2024-01-01&endDate=2024-01-31` (optional)
  - Returns: `{ "attendance": [...] }`

### IP Configuration Management (Admin only)

- `GET /api/ip-config` - Get all IP configurations
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "ipConfigs": [...] }`

- `POST /api/ip-config` - Create IP configuration
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "Main Office", "ipAddress": "192.168.1.1", "subnet": "255.255.255.0", "description": "Main office WiFi", "isActive": true }`
  - Returns: `{ "message": "IP configuration created successfully", "ipConfig": {...} }`

- `PUT /api/ip-config/:configId` - Update IP configuration
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ "name": "Updated Name", "isActive": false }` (all fields optional)
  - Returns: `{ "message": "IP configuration updated successfully", "ipConfig": {...} }`

- `DELETE /api/ip-config/:configId` - Delete IP configuration
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "message": "IP configuration deleted successfully" }`

### Dashboard & Statistics

#### Employee Dashboard

- `GET /api/dashboard/my-stats` - Get your attendance statistics and history
  - Headers: `Authorization: Bearer <token>`
  - Query params: `?startDate=2024-01-01&endDate=2024-01-31` (optional)
  - Returns: 
    ```json
    {
      "message": "Your attendance statistics",
      "statistics": {
        "totalDays": 30,
        "present": 25,
        "late": 3,
        "absent": 2,
        "halfDay": 0,
        "totalWorkingHours": 12000,
        "averageWorkingHours": 400,
        "attendancePercentage": 93
      },
      "recentAttendance": [...],
      "allAttendance": [...]
    }
    ```

#### Admin Dashboard

- `GET /api/dashboard/who-is-in-office` - Get employees currently in the office
  - Headers: `Authorization: Bearer <token>`
  - Returns: 
    ```json
    {
      "message": "Employees currently in office",
      "count": 5,
      "employees": [
        {
          "id": "...",
          "userId": "...",
          "name": "John Doe",
          "email": "john@example.com",
          "checkInTime": "2024-01-15T09:00:00.000Z",
          "checkInIP": "192.168.1.100",
          "status": "PRESENT",
          "workingHours": 240
        }
      ]
    }
    ```

- `GET /api/dashboard/today-summary` - Get today's attendance summary
  - Headers: `Authorization: Bearer <token>`
  - Returns:
    ```json
    {
      "message": "Today's attendance summary",
      "date": "2024-01-15",
      "summary": {
        "totalEmployees": 20,
        "checkedIn": 18,
        "checkedOut": 12,
        "inOffice": 6,
        "present": 15,
        "late": 3,
        "absent": 2,
        "halfDay": 0
      },
      "byStatus": {
        "PRESENT": [...],
        "LATE": [...],
        "ABSENT": [...],
        "HALF_DAY": [...]
      }
    }
    ```

- `GET /api/dashboard/statistics` - Get attendance statistics for a date range
  - Headers: `Authorization: Bearer <token>`
  - Query params: `?startDate=2024-01-01&endDate=2024-01-31` (optional)
  - Returns:
    ```json
    {
      "message": "Attendance statistics",
      "dateRange": {
        "startDate": "2024-01-01",
        "endDate": "2024-01-31"
      },
      "summary": {
        "totalRecords": 600,
        "present": 480,
        "late": 60,
        "absent": 50,
        "halfDay": 10,
        "averageWorkingHours": 420
      },
      "byDate": [
        {
          "date": "2024-01-31",
          "present": 18,
          "late": 2,
          "absent": 0,
          "halfDay": 0,
          "total": 20
        }
      ]
    }
    ```

### Leave Management

#### Employee Leave Requests

- `POST /api/leaves` - Create a leave request
  - Headers: `Authorization: Bearer <token>`
  - Body: 
    ```json
    {
      "leaveType": "VACATION|SICK|PERSONAL|EMERGENCY|OTHER",
      "startDate": "2024-02-01",
      "endDate": "2024-02-05",
      "reason": "Family vacation"
    }
    ```
  - Returns: `{ "message": "Leave request created successfully", "leave": {...} }`
  - **Status:** Automatically set to `PENDING`

- `GET /api/leaves/my-leaves` - Get your leave requests
  - Headers: `Authorization: Bearer <token>`
  - Query params: `?startDate=2024-01-01&endDate=2024-12-31&status=PENDING` (all optional)
  - Returns: `{ "message": "Your leave requests", "leaves": [...] }`

- `GET /api/leaves/my-stats` - Get your leave statistics
  - Headers: `Authorization: Bearer <token>`
  - Returns: 
    ```json
    {
      "message": "Your leave statistics",
      "statistics": {
        "total": 10,
        "pending": 2,
        "approved": 7,
        "rejected": 1,
        "totalDays": 35
      }
    }
    ```

- `GET /api/leaves/my-leaves/:leaveId` - Get a specific leave request
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "leave": {...} }`

- `DELETE /api/leaves/my-leaves/:leaveId` - Delete a leave request (only if pending)
  - Headers: `Authorization: Bearer <token>`
  - Returns: `{ "message": "Leave request deleted successfully" }`

#### Admin Leave Management

- `GET /api/leaves` - Get all leave requests
  - Headers: `Authorization: Bearer <token>`
  - Query params: `?startDate=2024-01-01&endDate=2024-12-31&status=PENDING&userId=123` (all optional)
  - Returns: `{ "message": "All leave requests", "leaves": [...] }`

- `GET /api/leaves/pending` - Get all pending leave requests
  - Headers: `Authorization: Bearer <token>`
  - Returns: 
    ```json
    {
      "message": "Pending leave requests",
      "count": 5,
      "leaves": [...]
    }
    ```

- `PUT /api/leaves/:leaveId/status` - Approve or reject a leave request
  - Headers: `Authorization: Bearer <token>`
  - Body: 
    ```json
    {
      "status": "APPROVED|REJECTED",
      "adminNotes": "Optional notes from admin"
    }
    ```
  - Returns: `{ "message": "Leave request approved/rejected successfully", "leave": {...} }`
  - **Workflow:** Changes status from `PENDING` to `APPROVED` or `REJECTED`

- `GET /api/leaves/statistics` - Get leave statistics
  - Headers: `Authorization: Bearer <token>`
  - Returns:
    ```json
    {
      "message": "Leave statistics",
      "statistics": {
        "total": 50,
        "pending": 5,
        "approved": 40,
        "rejected": 5,
        "byType": {
          "SICK": 10,
          "VACATION": 25,
          "PERSONAL": 10,
          "EMERGENCY": 3,
          "OTHER": 2
        }
      }
    }
    ```

### Health Check

- `GET /health` - Server health check
  - Returns: `{ "status": "ok", "message": "Server is running" }`

## Project Structure

```
server/
├── src/
│   ├── config/
│   │   └── database.js        # MongoDB connection
│   ├── controllers/           # Request handlers
│   │   ├── userController.js
│   │   ├── attendanceController.js
│   │   ├── ipConfigController.js
│   │   ├── dashboardController.js
│   │   └── leaveController.js
│   ├── middleware/            # Auth and error handling middleware
│   │   ├── auth.js
│   │   ├── errorHandler.js
│   │   └── ipValidator.js
│   ├── models/                # Mongoose models
│   │   ├── User.js
│   │   ├── Attendance.js
│   │   ├── IPConfig.js
│   │   └── Leave.js
│   ├── routes/                # API routes
│   │   ├── userRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── ipConfigRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── leaveRoutes.js
│   ├── scripts/               # Utility scripts
│   │   ├── createAdmin.js
│   │   └── setupOfficeIP.js
│   ├── services/              # Business logic
│   │   ├── userService.js
│   │   ├── attendanceService.js
│   │   ├── dashboardService.js
│   │   └── leaveService.js
│   ├── utils/                 # Utility functions (auth helpers)
│   │   └── auth.js
│   └── index.js               # Application entry point
├── .env                       # Environment variables (not in git)
├── package.json
└── README.md
```

## Scripts

- `npm run dev` - Start development server with watch mode
- `npm start` - Start production server
- `npm run create:admin` - Create an admin user
- `npm run setup:office-ip` - Set up office IP configuration

## Database Schema

### User Model

```javascript
{
  email: String (unique, required),
  password: String (hashed, required),
  name: String (required),
  role: String (enum: ['ADMIN', 'EMPLOYEE'], default: 'EMPLOYEE'),
  createdAt: Date,
  updatedAt: Date
}
```

### Attendance Model

```javascript
{
  user: ObjectId (ref: User, required),
  date: Date (required),
  checkIn: {
    time: Date,
    ipAddress: String
  },
  checkOut: {
    time: Date,
    ipAddress: String
  },
  status: String (enum: ['PRESENT', 'ABSENT', 'LATE', 'HALF_DAY'], default: 'PRESENT'),
  workingHours: Number (in minutes, default: 0),
  notes: String,
  createdAt: Date,
  updatedAt: Date
}
```

### IPConfig Model

```javascript
{
  name: String (required),
  ipAddress: String (required),
  subnet: String (optional - subnet mask or CIDR notation),
  isActive: Boolean (default: true),
  description: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Leave Model

```javascript
{
  user: ObjectId (ref: User, required),
  leaveType: String (enum: ['SICK', 'VACATION', 'PERSONAL', 'EMERGENCY', 'OTHER'], required),
  startDate: Date (required),
  endDate: Date (required),
  totalDays: Number (calculated automatically),
  reason: String (required),
  status: String (enum: ['PENDING', 'APPROVED', 'REJECTED'], default: 'PENDING'),
  adminNotes: String (optional),
  reviewedBy: ObjectId (ref: User, optional),
  reviewedAt: Date (optional),
  createdAt: Date,
  updatedAt: Date
}
```

## Security Notes

- Passwords are hashed using bcrypt
- JWT tokens expire after 7 days
- Admin routes are protected with authentication middleware
- Check-in/check-out requires connection to office WiFi (IP validation)
- CORS is enabled (configure for production)
- Change JWT_SECRET in production
- Password field is automatically excluded from JSON responses

## Attendance Features

### Automatic Status Detection

- **PRESENT**: Checked in on time (before 9:00 AM)
- **LATE**: Checked in after 9:00 AM (more than 30 minutes late)
- **ABSENT**: Marked as absent by admin or no check-in recorded
- **HALF_DAY**: Checked out before completing 4 hours of work

## Leave Management Features

### Leave Workflow

1. **Employee creates leave request** → Status: `PENDING`
2. **Admin reviews request** → Updates status to `APPROVED` or `REJECTED`
3. **System tracks** → Reviewed by, reviewed at, and admin notes

### Leave Types

- **SICK**: Sick leave
- **VACATION**: Vacation/holiday leave
- **PERSONAL**: Personal leave
- **EMERGENCY**: Emergency leave
- **OTHER**: Other types of leave

### Features

- Automatic calculation of total days (includes both start and end dates)
- Overlap detection (prevents overlapping approved/pending requests)
- Date validation (start date cannot be in the past, end date must be after start date)
- Only pending requests can be deleted by employees
- Admin can add notes when approving/rejecting
- Leave statistics for employees and admins

### IP Configuration

The system validates that check-in/check-out requests come from office WiFi by checking the client's IP address against configured office IP addresses. You can configure:

- Single IP addresses
- IP ranges using subnet masks (e.g., `255.255.255.0`)
- IP ranges using CIDR notation (e.g., `/24`)

**Important:** If no IP configurations are set up, the system will allow all IPs (for development purposes). Make sure to configure office IPs in production.
