# Attendance System - Mobile App

React Native (Expo) mobile application for employees to check in and check out.

## Features

- **Employee Login**: Secure authentication using credentials created by admin
- **Check In/Check Out**: IP-validated attendance tracking
- **Today's Attendance**: View current attendance status
- **Real-time Updates**: Pull to refresh attendance data

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- Expo CLI (installed globally or via npx)
- Expo Go app on your mobile device (for testing)

## Setup Instructions

1. **Install dependencies:**
   ```bash
   cd mobile-app
   npm install
   ```

2. **Configure API URL:**
   - Open `src/services/api.ts`
   - Update `API_BASE_URL` to point to your backend server
   - For local development on device: `http://YOUR_LOCAL_IP:3000/api`
   - For production: `https://your-server.com/api`

   **Important:** When testing on a physical device, use your computer's local IP address (not `localhost`). You can find it with:
   - Mac/Linux: `ifconfig` or `ipconfig getifaddr en0`
   - Windows: `ipconfig`

3. **Start the development server:**
   ```bash
   npm start
   # or
   npx expo start
   ```

4. **Run on device:**
   - Install Expo Go app on your phone
   - Scan the QR code from the terminal
   - Or press `i` for iOS simulator, `a` for Android emulator

## Project Structure

```
mobile-app/
├── app/
│   ├── (auth)/
│   │   ├── _layout.tsx        # Auth layout
│   │   └── login.tsx          # Login screen
│   ├── (tabs)/
│   │   ├── _layout.tsx        # Tabs layout
│   │   ├── index.tsx          # Home screen
│   │   └── attendance.tsx     # Check in/out screen
│   └── _layout.tsx            # Root layout
├── src/
│   ├── contexts/
│   │   └── AuthContext.tsx    # Authentication state
│   └── services/
│       └── api.ts             # API client
└── package.json
```

## Important Notes

### IP Configuration

- **Office WiFi Required**: Employees can only check in/out when connected to office WiFi
- **IP Validation**: The app validates the device's IP address against configured office IPs
- **Admin Setup**: Admin must configure office IP addresses in the admin panel first

### Development vs Production

- **Development**: Update `API_BASE_URL` in `src/services/api.ts`
- **Production**: Use your production server URL
- **Network**: Ensure mobile device can reach the backend server

### Testing

1. Make sure backend server is running
2. Ensure office IP is configured in admin panel
3. Connect mobile device to office WiFi
4. Login with employee credentials
5. Try checking in/out

## Troubleshooting

### "Access denied" or "Must be connected to office WiFi"

- Verify you're connected to office WiFi
- Check that office IP is configured in admin panel
- Ensure the IP configuration is marked as "Active"

### Cannot connect to server

- Check `API_BASE_URL` in `src/services/api.ts`
- Verify backend server is running
- Ensure mobile device and server are on the same network (for local testing)
- Check firewall settings

### Login fails

- Verify employee account exists (created by admin)
- Check credentials are correct
- Ensure backend server is accessible
