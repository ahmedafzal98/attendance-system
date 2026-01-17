# 📱 EAS Build Configuration Guide

## ❌ **The Error**

```
Run this command inside a project directory.
Error: build:configure command failed.
```

This happens because you're running EAS commands from the **root directory** instead of the **`mobile-app`** directory.

---

## ✅ **Solution: Run from mobile-app Directory**

EAS CLI commands must be run from within the Expo project directory (`mobile-app`).

### **Quick Fix:**

```bash
# Navigate to mobile-app directory
cd mobile-app

# Then run EAS commands
eas build:configure
```

---

## 📋 **Complete EAS Setup Steps**

### **Step 1: Navigate to Project Directory**

```bash
cd /Users/mbp/Desktop/attendance-system/mobile-app
```

### **Step 2: Install EAS CLI (if not installed)**

```bash
npm install -g eas-cli
```

### **Step 3: Login to Expo**

```bash
eas login
```

### **Step 4: Configure Build**

```bash
eas build:configure
```

This will create/update `eas.json` in the `mobile-app` directory.

---

## 🔧 **EAS Build Configuration**

After running `eas build:configure`, you'll be asked:

1. **Which platforms?** (iOS, Android, or both)
2. **Build profile?** (preview, production, development)

This creates an `eas.json` file with build configurations.

---

## 📝 **Example eas.json**

After configuration, you'll have something like:

```json
{
  "cli": {
    "version": ">= 5.2.0"
  },
  "build": {
    "development": {
      "developmentClient": true,
      "distribution": "internal"
    },
    "preview": {
      "distribution": "internal",
      "android": {
        "buildType": "apk"
      }
    },
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://attendance-api-7poe.onrender.com/api"
      }
    }
  },
  "submit": {
    "production": {}
  }
}
```

---

## 🚀 **Common EAS Commands**

All commands must be run from `mobile-app/` directory:

```bash
# Navigate first
cd mobile-app

# Configure build
eas build:configure

# Build for Android
eas build --platform android

# Build for iOS
eas build --platform ios

# Build for both
eas build --platform all

# Build preview (internal testing)
eas build --profile preview --platform android

# Build production
eas build --profile production --platform android

# Check build status
eas build:list

# View build logs
eas build:view
```

---

## ⚙️ **Environment Variables for Production Build**

Make sure your `mobile-app/.env` file has:

```env
EXPO_PUBLIC_API_URL=https://attendance-api-7poe.onrender.com/api
```

Or set it in `eas.json` under the production profile:

```json
{
  "build": {
    "production": {
      "env": {
        "EXPO_PUBLIC_API_URL": "https://attendance-api-7poe.onrender.com/api"
      }
    }
  }
}
```

---

## 🔍 **Verify You're in the Right Directory**

Before running EAS commands, always check:

```bash
# Should show: /Users/mbp/Desktop/attendance-system/mobile-app
pwd

# Should show: expo-router/entry or expo related files
ls app.json package.json
```

---

## 📋 **Quick Checklist**

- [ ] Navigate to `mobile-app/` directory
- [ ] EAS CLI installed (`npm install -g eas-cli`)
- [ ] Logged in to Expo (`eas login`)
- [ ] Run `eas build:configure`
- [ ] Configure environment variables
- [ ] Run build commands

---

## 🎯 **Summary**

- **Error**: Running EAS from wrong directory
- **Solution**: `cd mobile-app` first, then run EAS commands
- **Always**: Run EAS/Expo commands from the project directory

**Run `cd mobile-app` first, then try `eas build:configure` again!**

