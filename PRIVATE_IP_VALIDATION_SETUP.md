# 🔐 Private IP Validation Setup - Office WiFi Required

## 🎯 **Goal**

Require employees to be on office WiFi to check-in, even when the app connects through a public server (Render).

---

## ✅ **Solution: Mobile App Sends Private IP**

The mobile app will:
1. Detect its **private WiFi IP** (e.g., `192.168.18.7`)
2. Send it in a custom header: `X-Client-Local-IP`
3. Server validates this **private IP** (not the public IP)

**Result:** Employees must be on office WiFi! ✅

---

## 📱 **Step 1: Install expo-network Package**

The `expo-network` package is deprecated in SDK 49+, but we can try installing it or use an alternative.

### **Option A: Try expo-network (May not work in SDK 54)**

```bash
cd mobile-app
npx expo install expo-network
```

**Note:** If this doesn't work, use Option B.

### **Option B: Use Alternative Method (Recommended for SDK 54)**

Since `expo-network` may not be available, we can use a React Native library or check network info differently.

**Install alternative:**

```bash
cd mobile-app
npm install react-native-network-info
# Or for Expo:
# npx expo install @react-native-community/netinfo
```

---

## 🛠️ **Step 2: Update Mobile App API Service**

I've already updated `mobile-app/src/services/api.ts` to:
- ✅ Import `expo-network` (you'll need to install it)
- ✅ Get private IP using `Network.getIpAddressAsync()`
- ✅ Send private IP in `X-Client-Local-IP` header

**Next step:** Install `expo-network` and test.

---

## 🔧 **Step 3: Server Already Updated**

I've already updated `server/src/middleware/ipValidator.js` to:
- ✅ Check for `X-Client-Local-IP` header first
- ✅ Validate private IP from header (not public IP)
- ✅ Require private IP for mobile apps (if header not sent, deny access)

---

## 📋 **How It Works**

### **Before (Current Problem):**

1. Mobile app on office WiFi (`192.168.18.7`)
2. Makes request to Render (`https://attendance-api-7poe.onrender.com`)
3. Server sees public IP (`103.244.178.1`) ❌
4. Can't validate office WiFi ❌

### **After (With Private IP Header):**

1. Mobile app detects private WiFi IP (`192.168.18.7`)
2. Sends in header: `X-Client-Local-IP: 192.168.18.7`
3. Server validates private IP from header ✅
4. Checks if `192.168.18.7` matches `192.168.18.0/24` ✅
5. Access granted only if on office WiFi! ✅

---

## 🧪 **Testing**

### **1. Install expo-network:**

```bash
cd mobile-app
npx expo install expo-network
```

If that fails (deprecated), try:
```bash
npm install react-native-network-info
```

### **2. Rebuild the app:**

After installing, rebuild:
```bash
# For Android
npx expo run:android

# Or rebuild with EAS
eas build --platform android --profile production
```

### **3. Test check-in:**

1. Connect to office WiFi
2. Open mobile app
3. Try to check-in
4. Should work! ✅

### **4. Test off WiFi:**

1. Disconnect from office WiFi
2. Try to check-in
3. Should fail with "Access denied" ✅

---

## ⚠️ **Important Notes**

### **What Happens If Mobile App Can't Get Private IP?**

- If app can't detect private IP, the header won't be sent
- Server will see only public IP
- Access will be denied (unless `ALLOW_PUBLIC_IPS=true`)
- **This is by design** - employees must be on WiFi!

### **Limitations:**

1. **Cellular data**: If phone is on cellular (no WiFi), no private IP available → access denied ✅
2. **Different WiFi**: If on different WiFi network → access denied ✅
3. **VPN**: If using VPN, private IP might be different → might fail (expected)

---

## 🔍 **Verify It's Working**

### **Check Server Logs:**

When check-in is attempted, you should see:

```
[IP Validation] Private IP from header: 192.168.18.7, Public IP: 103.244.178.1, Using: 192.168.18.7
IP Check - ClientIP: 192.168.18.7, AllowedIP: 192.168.18.0, Subnet: /24, Result: true
```

### **Check Request Headers:**

In server logs or debugging, check for:
```
X-Client-Local-IP: 192.168.18.7
```

---

## 📝 **Summary**

- ✅ **Server updated** - Validates private IP from header
- ⏳ **Mobile app updated** - Ready to send private IP (needs package install)
- ⏳ **Need to install** - `expo-network` or alternative
- ✅ **Result** - Employees must be on office WiFi!

---

## 🆘 **If expo-network Doesn't Work**

### **Alternative: Use @react-native-community/netinfo**

If `expo-network` is not available, update the code to use `@react-native-community/netinfo`:

```typescript
import NetInfo from '@react-native-community/netinfo';

const getLocalIPAddress = async (): Promise<string | null> => {
  try {
    const state = await NetInfo.fetch();
    if (state.details && 'ipAddress' in state.details) {
      return state.details.ipAddress as string;
    }
    return null;
  } catch (error) {
    console.error('Error getting local IP address:', error);
    return null;
  }
};
```

---

**Install the package and rebuild your app!**

