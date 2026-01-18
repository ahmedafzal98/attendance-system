# IP Configuration Guide for Office WiFi Check-In

## Overview

The IP Configuration feature allows you to restrict employee check-in/check-out to only work when employees are connected to your office WiFi network. This ensures that employees must be physically present at the office to check in.

## How It Works

1. **When an employee checks in/out**, the mobile app detects their WiFi IP address (private IP like `192.168.1.100`)
2. **The system checks** if this IP address matches one of your configured office IP ranges
3. **If it matches**, check-in/check-out is allowed
4. **If it doesn't match**, check-in/check-out is denied with "Access Denied" error

**Note**: Login works from anywhere (doesn't require office WiFi), but check-in/check-out requires office WiFi connection.

---

## How to Find Your Office IP Address and Subnet

### Method 1: Check Your Router/Network Settings

1. **Access Router Admin Panel**:
   - Open a web browser on a computer connected to office WiFi
   - Type router's default gateway IP (usually `192.168.1.1` or `192.168.0.1`) in the address bar
   - Login with router admin credentials
   - Look for "Network Settings" or "LAN Settings"

2. **Find Network Configuration**:
   - Look for "LAN IP Address" or "Router IP Address" → This is your **Network Base IP**
   - Look for "Subnet Mask" → This is your **Subnet Mask**
   - Example: If router IP is `192.168.1.1` and subnet is `255.255.255.0`, your network range is `192.168.1.0/24`

### Method 2: Check from a Connected Computer

#### Windows:
1. Open **Command Prompt** (Press `Win + R`, type `cmd`, press Enter)
2. Type: `ipconfig`
3. Look for:
   - **IPv4 Address**: Your computer's IP (e.g., `192.168.1.50`)
   - **Subnet Mask**: The subnet mask (e.g., `255.255.255.0`)
   - **Default Gateway**: Router IP (e.g., `192.168.1.1`)

4. **Your network base IP** is the first 3 octets (e.g., if your IP is `192.168.1.50`, base is `192.168.1.0`)

#### Mac/Linux:
1. Open **Terminal**
2. Type: `ifconfig` or `ipconfig getifaddr en0`
3. Look for:
   - **inet** address: Your computer's IP
   - **netmask**: The subnet mask

### Method 3: Use Network Scanner App (Mobile)

1. Download a network scanner app (e.g., "Network Analyzer", "Fing")
2. Connect to office WiFi
3. Scan the network to see:
   - Router/Gateway IP
   - Network range
   - Connected devices

---

## Understanding IP Address and Subnet

### IP Address Format
- Format: `XXX.XXX.XXX.XXX` (e.g., `192.168.1.1`)
- Each number (octet) ranges from 0-255

### Common Private IP Ranges (Office Networks)
- `192.168.0.0` to `192.168.255.255` (Most common for home/office)
- `10.0.0.0` to `10.255.255.255` (Used in larger offices)
- `172.16.0.0` to `172.31.255.255` (Used in some corporate networks)

### Subnet Mask vs CIDR Notation

#### Subnet Mask Format:
- Format: `255.255.255.0` (same format as IP address)
- Common values:
  - `255.255.255.0` = `/24` = Allows 254 devices (192.168.1.1 - 192.168.1.254)
  - `255.255.0.0` = `/16` = Allows 65,534 devices (192.168.0.1 - 192.168.255.254)
  - `255.0.0.0` = `/8` = Allows 16,777,214 devices

#### CIDR Notation:
- Format: `/24` or `/16` or `/8`
- Easier to use than subnet mask
- `/24` is most common for office networks

---

## Configuration Examples

### Example 1: Small Office (192.168.1.0 Network)

**If your router IP is `192.168.1.1` and subnet mask is `255.255.255.0`:**

- **Name**: `Main Office`
- **IP Address**: `192.168.1.0`
- **Subnet**: `/24` or `255.255.255.0`
- **Description**: `Main office WiFi network`

**This allows all devices with IPs from `192.168.1.1` to `192.168.1.254`**

### Example 2: Large Office (10.0.0.0 Network)

**If your router IP is `10.0.0.1` and subnet mask is `255.255.0.0`:**

- **Name**: `Corporate Office`
- **IP Address**: `10.0.0.0`
- **Subnet**: `/16` or `255.255.0.0`
- **Description**: `Corporate office WiFi network`

**This allows all devices with IPs from `10.0.0.1` to `10.0.255.254`**

### Example 3: Multiple Floors/Buildings

If your office has multiple WiFi networks (e.g., different floors):

**Configuration 1:**
- **Name**: `First Floor WiFi`
- **IP Address**: `192.168.1.0`
- **Subnet**: `/24`

**Configuration 2:**
- **Name**: `Second Floor WiFi`
- **IP Address**: `192.168.2.0`
- **Subnet**: `/24`

**You can add multiple IP configurations to allow check-in from different office networks.**

---

## Step-by-Step Setup Instructions

1. **Find Your Office Network IP**:
   - Use Method 1, 2, or 3 above
   - Identify your network base IP (e.g., `192.168.1.0`)

2. **Find Your Subnet**:
   - Check subnet mask from router or computer
   - Convert to CIDR notation if needed:
     - `255.255.255.0` = `/24`
     - `255.255.0.0` = `/16`
     - `255.0.0.0` = `/8`

3. **Login to Admin Panel**:
   - Go to "IP Configuration" section
   - Click "+ Add IP Configuration"

4. **Fill in the Form**:
   - **Name**: Enter a descriptive name (e.g., "Main Office WiFi")
   - **IP Address**: Enter network base IP (e.g., `192.168.1.0`)
   - **Subnet**: Enter subnet mask or CIDR (e.g., `/24` or `255.255.255.0`)
   - **Description** (Optional): Add notes about this configuration
   - **Active**: Check this box to enable the configuration

5. **Click "Create"**

6. **Test**:
   - Connect a mobile device to office WiFi
   - Try to check in using the mobile app
   - If successful, configuration is correct

---

## Common Issues and Solutions

### Issue 1: "Access Denied" Even on Office WiFi

**Possible Causes:**
1. **Wrong IP Address**: You entered the wrong network base IP
   - **Solution**: Double-check your network IP using `ipconfig` or router settings

2. **Wrong Subnet**: Subnet mask doesn't match your network
   - **Solution**: Verify subnet mask from router or computer settings

3. **Mobile App Not Detecting WiFi IP**: Mobile app might not be detecting private IP correctly
   - **Solution**: Check mobile app logs, ensure app has WiFi permission

### Issue 2: IP Configuration Not Working

**Possible Causes:**
1. **Configuration Not Active**: IP configuration is disabled
   - **Solution**: Click the status badge to activate it

2. **Multiple Networks**: Office has multiple WiFi networks (2.4GHz vs 5GHz)
   - **Solution**: Add separate IP configurations for each network

### Issue 3: How to Allow Check-In from Multiple Locations

**Solution**: Add multiple IP configurations:
- One for main office: `192.168.1.0/24`
- One for branch office: `10.0.0.0/16`
- Each location can have its own configuration

---

## Quick Reference

### Subnet Mask to CIDR Conversion:

| Subnet Mask | CIDR Notation | Devices Supported |
|------------|---------------|-------------------|
| 255.255.255.0 | /24 | 254 devices |
| 255.255.0.0 | /16 | 65,534 devices |
| 255.0.0.0 | /8 | 16,777,214 devices |

### Common Router Default IPs:

| Router Brand | Default Gateway |
|-------------|----------------|
| Linksys | 192.168.1.1 |
| Netgear | 192.168.1.1 or 192.168.0.1 |
| TP-Link | 192.168.1.1 or 192.168.0.1 |
| D-Link | 192.168.1.1 or 192.168.0.1 |
| ASUS | 192.168.1.1 |
| Cisco | 192.168.1.1 or 10.0.0.1 |

### Command Quick Reference:

**Windows:**
```
ipconfig              # Show IP configuration
ipconfig /all         # Show detailed IP configuration
```

**Mac/Linux:**
```
ifconfig              # Show IP configuration
ipconfig getifaddr en0 # Get WiFi IP address
```

---

## Need Help?

If you're still having trouble finding your office IP configuration:

1. **Contact your IT department** - They can provide the exact network configuration
2. **Check router documentation** - Most routers have default settings documented
3. **Use a network scanner app** - Apps like "Fing" or "Network Analyzer" can help identify network settings

---

## Summary

✅ **IP Address**: Enter your office network base IP (e.g., `192.168.1.0`)  
✅ **Subnet**: Enter subnet mask (e.g., `255.255.255.0`) or CIDR notation (e.g., `/24`)  
✅ **Multiple Networks**: You can add multiple IP configurations for different office locations  
✅ **Active Status**: Make sure the IP configuration is marked as "Active"  
✅ **Test**: Always test check-in after adding/modifying IP configuration  

The system validates that employees are physically connected to office WiFi before allowing check-in/check-out, ensuring accurate attendance tracking.

