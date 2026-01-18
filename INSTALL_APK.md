# How to Install APK File

## Prerequisites

1. **Enable Developer Options on Android Device:**
   - Go to `Settings` → `About Phone`
   - Tap on `Build Number` 7 times
   - You'll see "You are now a developer!"

2. **Enable USB Debugging:**
   - Go to `Settings` → `Developer Options` (or `System` → `Developer Options`)
   - Enable `USB Debugging`
   - Enable `Install via USB` (if available)

3. **Install Android SDK Platform Tools (if not already installed):**
   - Download from: https://developer.android.com/studio/releases/platform-tools
   - Or install via Homebrew on macOS:
     ```bash
     brew install android-platform-tools
     ```

## Method 1: Install via ADB (USB/Wireless)

### Step 1: Connect Device

**Via USB:**
- Connect your Android device to your computer via USB cable
- Allow USB debugging when prompted on your device

**Via Wireless (Alternative):**
```bash
# First connect via USB once, then:
adb tcpip 5555
adb connect YOUR_DEVICE_IP:5555
# Now you can disconnect USB
```

### Step 2: Verify Device Connection

```bash
adb devices
```

You should see your device listed, e.g.:
```
List of devices attached
ABC123XYZ    device
```

### Step 3: Install APK

```bash
# Replace path/to/your/app.apk with your actual APK file path
adb install path/to/your/app.apk
```

**Example:**
```bash
adb install /Users/mbp/Desktop/attendance-system/mobile-app/build/my-app.apk
```

### Force Install (if app already exists):

```bash
adb install -r path/to/your/app.apk
```

The `-r` flag reinstalls the app if it already exists.

### Install and Grant Permissions:

```bash
adb install -r -g path/to/your/app.apk
```

The `-g` flag grants all runtime permissions automatically.

## Method 2: Direct Transfer to Device

1. **Transfer APK to device:**
   - Email the APK to yourself
   - Or use cloud storage (Google Drive, Dropbox, etc.)
   - Or transfer via USB cable in file transfer mode

2. **Install on device:**
   - Open File Manager on your Android device
   - Navigate to Downloads or where you saved the APK
   - Tap on the APK file
   - Tap `Install` when prompted
   - Allow "Install from Unknown Sources" if prompted

## Method 3: Using EAS Build Download

If you built your APK using EAS:

```bash
# List your builds
eas build:list --platform android

# Download a specific build
eas build:download --platform android --id BUILD_ID

# Or download the latest build
eas build:download --platform android --latest
```

Then install using Method 1 or 2 above.

## Common Issues and Solutions

### Issue: "adb: command not found"
**Solution:** Install Android SDK Platform Tools or add to PATH

### Issue: "device unauthorized"
**Solution:** 
- Check "Always allow from this computer" on your device
- Revoke USB debugging authorization and reconnect

### Issue: "INSTALL_FAILED_UPDATE_INCOMPATIBLE"
**Solution:**
```bash
# Uninstall existing app first
adb uninstall com.ahmedafzal.mobileappattendan

# Then install new APK
adb install path/to/your/app.apk
```

### Issue: "INSTALL_FAILED_INSUFFICIENT_STORAGE"
**Solution:** Free up space on your device

### Issue: "INSTALL_PARSE_FAILED_NO_CERTIFICATES"
**Solution:** APK might be corrupted. Rebuild or re-download.

## Quick Command Reference

```bash
# Check if device is connected
adb devices

# Install APK
adb install app.apk

# Force reinstall
adb install -r app.apk

# Install with all permissions
adb install -r -g app.apk

# Uninstall app
adb uninstall com.ahmedafzal.mobileappattendan

# View logs (for debugging)
adb logcat

# Clear app data
adb shell pm clear com.ahmedafzal.mobileappattendan
```

## Your App Package Name

Your app's package name is: `com.ahmedafzal.mobileappattendan`

Use this for uninstalling or clearing app data.

