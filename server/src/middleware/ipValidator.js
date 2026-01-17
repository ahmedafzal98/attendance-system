const IPConfig = require('../models/IPConfig');

/**
 * Get client IP address from request
 */
const getClientIP = (req) => {
  let ip = (
    req.headers['x-forwarded-for']?.split(',')[0]?.trim() ||
    req.headers['x-real-ip'] ||
    req.connection?.remoteAddress ||
    req.socket?.remoteAddress ||
    req.ip ||
    'unknown'
  );

  // Handle IPv6 localhost (::1) - convert to IPv4 localhost
  if (ip === '::1' || ip === '::ffff:127.0.0.1') {
    ip = '127.0.0.1';
  }

  // Remove IPv6 prefix if present (::ffff:)
  ip = ip.replace(/^::ffff:/, '');

  return ip;
};

/**
 * Check if IP address matches a given IP or subnet
 */
const isIPAllowed = (clientIP, allowedIP, subnet) => {
  // Normalize IPs - remove IPv6 prefix if present
  clientIP = clientIP.replace(/^::ffff:/, '');
  allowedIP = allowedIP.replace(/^::ffff:/, '');

  // Handle localhost for development/testing
  if (clientIP === '127.0.0.1' || clientIP === 'localhost') {
    // In development, you might want to allow localhost
    // For production, comment this out or make it configurable
    if (process.env.NODE_ENV === 'development') {
      console.log('Development mode: Allowing localhost IP');
      return true;
    }
  }

  // Debug: Log IP comparison details
  console.log(`[IP Check] Comparing ClientIP: ${clientIP} with AllowedIP: ${allowedIP}, Subnet: ${subnet || 'none'}`);

  // Validate that both IPs are IPv4 format
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(clientIP) || !ipv4Regex.test(allowedIP)) {
    console.log(`Invalid IP format - ClientIP: ${clientIP}, AllowedIP: ${allowedIP}`);
    return false;
  }

  // Exact match
  if (clientIP === allowedIP) {
    return true;
  }

  // If subnet is provided, check CIDR notation
  if (subnet) {
    // Handle CIDR notation (e.g., "/24" or "192.168.1.0/24")
    if (subnet.includes('/')) {
      let network = allowedIP; // Default to allowedIP as network
      let prefixLength = subnet;
      
      // If subnet contains full CIDR notation (e.g., "192.168.1.0/24")
      if (subnet.includes('.') && subnet.includes('/')) {
        const parts = subnet.split('/');
        network = parts[0];
        prefixLength = parts[1];
      } else if (subnet.startsWith('/')) {
        // If subnet is just "/24", use allowedIP as network
        prefixLength = subnet.substring(1); // Remove the leading '/'
      }
      
      const mask = parseInt(prefixLength, 10);

      if (isNaN(mask) || mask < 0 || mask > 32) {
        console.log(`Invalid CIDR prefix length: ${prefixLength}`);
        return false;
      }

      // Validate network IP is not empty
      if (!network || network.trim() === '') {
        console.log(`Invalid network IP: network is empty, using allowedIP: ${allowedIP}`);
        network = allowedIP;
      }

      return isIPInCIDR(clientIP, network, mask);
    }

    // Handle subnet mask (e.g., "255.255.255.0")
    if (subnet.includes('.')) {
      if (!ipv4Regex.test(subnet)) {
        console.log(`Invalid subnet mask format: ${subnet}`);
        return false;
      }
      return isIPInSubnet(clientIP, allowedIP, subnet);
    }
  }

  return false;
};

/**
 * Check if IP is in CIDR range
 */
const isIPInCIDR = (ip, network, prefixLength) => {
  const ipNum = ipToNumber(ip);
  const networkNum = ipToNumber(network);
  const mask = (0xffffffff << (32 - prefixLength)) >>> 0;

  return (ipNum & mask) === (networkNum & mask);
};

/**
 * Check if IP is in subnet range
 */
const isIPInSubnet = (ip, networkIP, subnetMask) => {
  const ipNum = ipToNumber(ip);
  const networkNum = ipToNumber(networkIP);
  const maskNum = ipToNumber(subnetMask);

  return (ipNum & maskNum) === (networkNum & maskNum);
};

/**
 * Convert IP address to number
 */
const ipToNumber = (ip) => {
  // Validate IPv4 format
  const ipv4Regex = /^(\d{1,3}\.){3}\d{1,3}$/;
  if (!ipv4Regex.test(ip)) {
    throw new Error(`Invalid IPv4 address: ${ip}`);
  }

  const parts = ip.split('.');
  if (parts.length !== 4) {
    throw new Error(`Invalid IP address format: ${ip}`);
  }

  // Validate each octet is between 0-255
  for (const octet of parts) {
    const num = parseInt(octet, 10);
    if (isNaN(num) || num < 0 || num > 255) {
      throw new Error(`Invalid octet in IP address: ${ip}`);
    }
  }

  return parts.reduce((acc, octet) => (acc << 8) + parseInt(octet, 10), 0) >>> 0;
};

/**
 * Middleware to validate if request is from office WiFi
 */
const validateOfficeIP = async (req, res, next) => {
  try {
    const clientIP = getClientIP(req);

    // Get all active IP configurations
    const allowedIPs = await IPConfig.find({ isActive: true });

    if (allowedIPs.length === 0) {
      // If no IP configs exist, allow all (for development)
      console.warn('No IP configurations found. Allowing all IPs.');
      req.clientIP = clientIP;
      return next();
    }

    // Check if client IP matches any allowed IP
    const isAllowed = allowedIPs.some((config) => {
      const result = isIPAllowed(clientIP, config.ipAddress, config.subnet);
      console.log(`IP Check - ClientIP: ${clientIP}, AllowedIP: ${config.ipAddress}, Subnet: ${config.subnet || 'none'}, Result: ${result}`);
      return result;
    });

    if (!isAllowed) {
      console.log('=== IP VALIDATION FAILED ===');
      console.log('Client IP:', clientIP);
      console.log('Allowed IPs:', allowedIPs.map(c => `${c.ipAddress}${c.subnet ? ` (${c.subnet})` : ''}`).join(', '));
      console.log('Request headers:', {
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'remoteAddress': req.connection?.remoteAddress || req.socket?.remoteAddress,
      });
      console.log('===========================');
      
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be connected to office WiFi to perform this action',
        clientIP: clientIP,
        allowedIPs: allowedIPs.map(c => c.ipAddress),
        hint: 'Make sure your device IP matches one of the configured office IPs, or configure a subnet range (e.g., 192.168.18.0/24)',
      });
    }

    // Attach client IP to request for logging
    req.clientIP = clientIP;
    next();
  } catch (error) {
    console.error('IP validation error:', error);
    res.status(500).json({
      error: 'Internal server error',
      message: 'Failed to validate IP address',
    });
  }
};

module.exports = {
  validateOfficeIP,
  getClientIP,
};

