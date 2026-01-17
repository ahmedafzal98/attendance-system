# 📱 Over-The-Air (OTA) Updates Setup Guide

## ✅ **Current Status**

### **Already Configured:**
- ✅ `expo-updates` package installed (version ~29.0.16)
- ✅ `runtimeVersion` configured in `app.json` (policy: "appVersion")
- ✅ `updates.url` configured in `app.json`
- ✅ EAS project ID present: `0eb06d59-024d-4a18-8f33-764b4b87f687`
- ✅ `eas.json` created with update channels

### **Created:**
- ✅ `eas.json` file (EAS build and update configuration)

---

## 📋 **OTA Updates Configuration**

### **1. app.json Configuration** ✅

Your `app.json` already has:

```json
{
  "runtimeVersion": {
    "policy": "appVersion"
  },
  "updates": {
    "url": "https://u.expo.dev/0eb06d59-024d-4a18-8f33-764b4b87f687"
  }
}
```

**This is correct!** ✅

### **2. eas.json Configuration** ✅

I've created `eas.json` with update channels:

```json
{
  "update": {
    "development": {
      "channel": "development"
    },
    "preview": {
      "channel": "preview"
    },
    "production": {
      "channel": "production"
    }
  }
}
```

---

## 🚀 **How OTA Updates Work**

### **Runtime Version Policy: "appVersion"**

- When `app.json` `version` changes (e.g., "1.0.0" → "1.0.1"), it creates a new runtime version
- Users on old runtime versions won't receive updates (requires new build)
- Users on same runtime version receive OTA updates automatically

### **Update Channels**

- **Development**: Internal testing
- **Preview**: Pre-production testing
- **Production**: Live app updates

---

## 📤 **Publishing Updates**

### **Development Update:**

```bash
cd mobile-app
eas update --branch development --message "Development update"
```

### **Preview Update:**

```bash
eas update --branch preview --message "Preview update"
```

### **Production Update:**

```bash
eas update --branch production --message "Production update"
```

### **Auto Channel (Recommended):**

```bash
# Automatically uses the channel based on current build profile
eas update --auto
```

---

## 🔄 **Check for Updates in Code (Optional)**

If you want to manually check for updates in your app, you can add this to `app/_layout.tsx`:

```typescript
import * as Updates from 'expo-updates';
import { useEffect } from 'react';

useEffect(() => {
  async function onFetchUpdateAsync() {
    try {
      const update = await Updates.checkForUpdateAsync();
      
      if (update.isAvailable) {
        await Updates.fetchUpdateAsync();
        await Updates.reloadAsync();
      }
    } catch (error) {
      console.error(`Error fetching latest update: ${error}`);
    }
  }

  // Check for updates on app start
  onFetchUpdateAsync();
}, []);
```

**Note:** Expo automatically checks for updates, so this is optional.

---

## 📋 **OTA Updates Workflow**

### **1. Make Code Changes**

Change your JavaScript/TypeScript code, assets, or `app.json` (excluding native changes).

### **2. Publish Update**

```bash
cd mobile-app
eas update --branch production --message "Bug fixes and improvements"
```

### **3. Users Receive Update**

- App automatically checks for updates on launch
- Users receive update in background
- Update applies on next app restart

---

## ⚠️ **Important Notes**

### **What CAN be Updated via OTA:**
- ✅ JavaScript/TypeScript code
- ✅ React components
- ✅ Assets (images, fonts)
- ✅ `app.json` changes (most)
- ✅ Environment variables (via `eas.json`)

### **What REQUIRES a New Build:**
- ❌ Native code changes (iOS/Android native)
- ❌ `expo` SDK version changes
- ❌ `app.json` `version` changes (creates new runtime)
- ❌ Adding new native dependencies
- ❌ Changing app icon or splash screen (sometimes)

---

## 🔧 **Runtime Version Management**

### **Current Setup:**

Your `app.json` uses:
```json
"runtimeVersion": {
  "policy": "appVersion"
}
```

This means:
- `version: "1.0.0"` → Runtime: `1.0.0`
- `version: "1.0.1"` → Runtime: `1.0.1` (new build required)

### **Alternative (SDK Version):**

```json
"runtimeVersion": {
  "policy": "sdkVersion"
}
```

This uses Expo SDK version as runtime version.

---

## ✅ **Verify OTA Setup**

### **1. Check Configuration:**

```bash
cd mobile-app
cat app.json | grep -A 5 "runtimeVersion"
cat app.json | grep -A 3 "updates"
```

### **2. Check eas.json:**

```bash
cat eas.json
```

### **3. Publish Test Update:**

```bash
eas update --branch production --message "Test OTA update"
```

### **4. Check Update Status:**

```bash
eas update:list
```

---

## 🎯 **Quick Commands**

```bash
# Publish production update
cd mobile-app
eas update --branch production --message "Your update message"

# List recent updates
eas update:list

# View update details
eas update:view [update-id]

# Rollback an update (if needed)
eas update:republish --branch production --message "Rollback"
```

---

## 📝 **Summary**

- ✅ **OTA Updates**: Fully configured
- ✅ **eas.json**: Created with update channels
- ✅ **runtimeVersion**: Configured in `app.json`
- ✅ **expo-updates**: Installed and ready
- ✅ **Update URL**: Configured in `app.json`

**You're all set!** You can now publish OTA updates using `eas update` commands.

---

## 🔗 **Useful Links**

- [Expo Updates Documentation](https://docs.expo.dev/versions/latest/sdk/updates/)
- [EAS Update Documentation](https://docs.expo.dev/eas-update/introduction/)
- [Runtime Versions Guide](https://docs.expo.dev/eas-update/runtime-versions/)

---

## 💡 **Pro Tips**

1. **Use Semantic Versioning**: Update `app.json` version for major releases
2. **Test Updates First**: Use preview channel before production
3. **Monitor Updates**: Check `eas update:list` to see update status
4. **Rollback Capability**: Keep previous versions for rollback if needed
5. **Update Messages**: Always include descriptive messages with `--message`

