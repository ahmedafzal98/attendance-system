# 🔍 Debug: Private IP Header Not Being Sent

## ❌ **Current Issue**

Server logs show:
- ❌ Private IP from header: `none` (NOT SENT)
- ❌ No `x-client-local-ip` header in request
- ❌ Client IP: `103.244.178.1` (public IP only)

**This means the mobile app is not sending the private IP header.**

---

## 🔍 **Possible Causes**

### **1. OTA Update Not Applied Yet**

The update might not have been downloaded/applied on your device yet.

**Solution:**
- Wait 1-2 minutes after publishing OTA update
- **Force close** the app completely
- **Reopen** the app
- **Wait 30 seconds** for update to check
- **Close and reopen** again (updates apply on restart)

### **2. expo-network Not Working**

The `expo-network` package might not be detecting the IP correctly.

**Check mobile app console/logs:**
- Look for: `Detected private IP: 192.168.18.7`
- Or: `expo-network not available`
- Or: `Private IP detection returned unknown`

### **3. Device Not on WiFi**

If device is on cellular data or not connected to WiFi, no private IP available.

**Solution:**
- Make sure device is connected to office WiFi
- Check WiFi connection in device settings

### **4. expo-network Package Issue**

`expo-network` might not be compatible with SDK 54 or might need native build.

---

## ✅ **Debugging Steps**

### **Step 1: Check Mobile App Console**

Look at the mobile app console/logs to see:
- Is `expo-network` loaded?
- Is private IP being detected?
- Is header being sent?

**You should see:**
```
Detected private IP: 192.168.18.7
```

**Or errors like:**
```
expo-network not available
Private IP detection returned unknown
```

### **Step 2: Verify OTA Update Was Applied**

Check if the update was actually applied:
1. Open the app
2. Check for any console warnings/errors
3. Try to make a request and check logs

### **Step 3: Test Private IP Detection Directly**

Add temporary logging in the mobile app to verify:

```typescript
// In api.ts, after getLocalIPAddress call:
const localIP = await getLocalIPAddress();
console.log('=== PRIVATE IP DEBUG ===');
console.log('Network module available:', !!Network);
console.log('Detected private IP:', localIP);
console.log('Will send header:', localIP ? `X-Client-Local-IP: ${localIP}` : 'NO HEADER');
```

### **Step 4: Check Server Logs Again**

After trying check-in again, check server logs for:
- `[IP Validation] Private IP from header: 192.168.18.7` (if working)
- `[IP Validation] Private IP from header: none` (if not working)
- `All custom headers:` - should list `x-client-local-ip` if sent

---

## 🚨 **If expo-network Doesn't Work**

If `expo-network` is not working or not compatible:

### **Option 1: Build New APK**

```bash
cd mobile-app
eas build --platform android --profile production
```

Native packages often require a new build even if OTA was published.

### **Option 2: Use Alternative Package**

If `expo-network` is deprecated/incompatible, use:

```bash
cd mobile-app
npx expo install @react-native-community/netinfo
```

Then update the code to use `NetInfo` instead of `expo-network`.

---

## 🔧 **Immediate Workaround (For Testing)**

While debugging, you can temporarily:

1. **Get your device's actual IP** manually (Settings → WiFi → Network Details)
2. **Add it to database** as an allowed IP (via admin panel):
   - IP: `192.168.18.7` (or whatever your device IP is)
   - Subnet: Leave empty (exact match)

This will allow check-in for now while we fix the header issue.

---

## 📋 **What to Check**

- [ ] OTA update applied on device? (Wait 1-2 minutes, restart app)
- [ ] Device connected to office WiFi?
- [ ] `expo-network` working? (Check mobile app console)
- [ ] Private IP detected? (Check mobile app console for `Detected private IP:`)
- [ ] Header being sent? (Check server logs for `x-client-local-ip`)

---

## 🎯 **Next Steps**

1. **Check mobile app console** - Look for private IP detection messages
2. **Wait and restart app** - OTA update might not be applied yet
3. **If still not working** - Build new APK (might need native build)
4. **Check alternative** - Use `@react-native-community/netinfo` if `expo-network` doesn't work

---

**Check your mobile app console/logs to see if private IP is being detected!**

