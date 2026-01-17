# Attendance System - Admin Panel

Admin web panel for managing the attendance system, built with React and Vite.

## Features

- **Authentication**: Admin login with JWT
- **Employee Management**: Create and view employee accounts
- **Dashboard**: Overview of attendance statistics (coming soon)
- **Responsive Design**: Modern, clean UI

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd admin-web
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

   The app will be available at `http://localhost:5173`

3. **Make sure the backend server is running:**
   - The frontend is configured to proxy API requests to `http://localhost:3000`
   - Ensure the backend server is running on port 3000

## Building for Production

```bash
npm run build
```

The production build will be in the `dist` directory.

## Project Structure

```
admin-web/
├── src/
│   ├── components/        # Reusable components
│   │   ├── Layout.jsx
│   │   └── ProtectedRoute.jsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.jsx
│   ├── pages/             # Page components
│   │   ├── Login.jsx
│   │   ├── Dashboard.jsx
│   │   └── Employees.jsx
│   ├── services/          # API services
│   │   └── api.js
│   ├── App.jsx            # Main app component
│   ├── main.jsx           # Entry point
│   └── index.css          # Global styles
├── index.html
├── vite.config.js
└── package.json
```

## Available Pages

- `/login` - Admin login page
- `/dashboard` - Dashboard overview (protected)
- `/employees` - Employee management (protected)

## Authentication

- JWT tokens are stored in localStorage
- Protected routes require authentication
- Automatic redirect to login on 401 errors

## Development

The app uses Vite for fast development with hot module replacement (HMR).

