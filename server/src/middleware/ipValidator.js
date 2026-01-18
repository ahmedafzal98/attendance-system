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

      console.log(`[IP Check] Calling isIPInCIDR - ClientIP: ${clientIP}, Network: ${network}, PrefixLength: /${mask}`);
      const cidrResult = isIPInCIDR(clientIP, network, mask);
      console.log(`[IP Check] CIDR result: ${cidrResult}`);
      return cidrResult;
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

  const ipMasked = ipNum & mask;
  const networkMasked = networkNum & mask;
  const result = ipMasked === networkMasked;

  console.log(`[CIDR Check] IP: ${ip} (${ipNum}), Network: ${network} (${networkNum}), Prefix: /${prefixLength}, Mask: ${mask}`);
  console.log(`[CIDR Check] IP & Mask: ${ipMasked}, Network & Mask: ${networkMasked}, Match: ${result}`);

  return result;
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
 * Check if an IP is private (local network)
 */
const isPrivateIP = (ip) => {
  // Private IP ranges:
  // 10.0.0.0/8 (10.0.0.0 - 10.255.255.255)
  // 172.16.0.0/12 (172.16.0.0 - 172.31.255.255)
  // 192.168.0.0/16 (192.168.0.0 - 192.168.255.255)
  // 127.0.0.0/8 (127.0.0.0 - 127.255.255.255) - localhost
  return /^(10\.|172\.(1[6-9]|2[0-9]|3[01])\.|192\.168\.|127\.)/.test(ip);
};

/**
 * Middleware to validate if request is from office WiFi
 */
const validateOfficeIP = async (req, res, next) => {
  try {
    // Priority: Check for private IP from header (sent by mobile app)
    // Express lowercases all headers, so check lowercase versions
    // Check multiple possible header names (case-insensitive)
    // Also check request body as fallback (in case proxy strips headers)
    const privateIPFromHeader = 
      req.headers['x-client-local-ip'] || 
      req.headers['x-client-local-ip'] || // lowercase (Express normalizes)
      req.headers['x-wifi-ip'] ||
      req.headers['x-wifi-ip'] || // lowercase
      req.body?.clientIP || // Fallback: check request body
      req.body?.localIP || // Fallback: alternative body field name
      req.body?.['client-ip'] || // Fallback: kebab-case
      req.body?.['local-ip']; // Fallback: kebab-case
    
    // Get public IP (fallback)
    const publicIP = getClientIP(req);
    
    // Prefer private IP from header if available (for mobile apps)
    // Otherwise use public IP (for web apps on same network)
    const clientIP = privateIPFromHeader || publicIP;
    
    // Log ALL headers for debugging (filter for relevant ones)
    const allHeaders = Object.keys(req.headers).reduce((acc, key) => {
      if (key.toLowerCase().includes('ip') || key.toLowerCase().includes('client') || key.toLowerCase().includes('x-')) {
        acc[key] = req.headers[key];
      }
      return acc;
    }, {});
    
    // Log body IP fields if present
    const bodyIP = req.body?.clientIP || req.body?.localIP || req.body?.['client-ip'] || req.body?.['local-ip'] || 'none';
    
    console.log(`[IP Validation] Private IP from header: ${privateIPFromHeader || 'none'}, Private IP from body: ${bodyIP}, Public IP: ${publicIP}, Using: ${clientIP}`);
    console.log(`[IP Validation] Relevant headers:`, JSON.stringify(allHeaders, null, 2));
    console.log(`[IP Validation] Raw x-client-local-ip header:`, req.headers['x-client-local-ip']);
    if (bodyIP !== 'none') {
      console.log(`[IP Validation] Request body IP fields:`, {
        clientIP: req.body?.clientIP,
        localIP: req.body?.localIP,
        'client-ip': req.body?.['client-ip'],
        'local-ip': req.body?.['local-ip']
      });
    }

    // Allow disabling IP validation via environment variable (for production/public servers)
    if (process.env.DISABLE_IP_VALIDATION === 'true') {
      console.warn('IP validation is disabled via DISABLE_IP_VALIDATION environment variable');
      req.clientIP = clientIP;
      return next();
    }

    // Get all active IP configurations
    const allowedIPs = await IPConfig.find({ isActive: true });

    if (allowedIPs.length === 0) {
      // If no IP configs exist, allow all (for development)
      console.warn('No IP configurations found. Allowing all IPs.');
      req.clientIP = clientIP;
      return next();
    }

    // If client IP is public (not private) AND no private IP header was sent,
    // this means request came through public internet without private IP detection
    if (!isPrivateIP(clientIP) && !privateIPFromHeader) {
      // Check if IP validation should allow public IPs (not recommended for security)
      if (process.env.ALLOW_PUBLIC_IPS === 'true') {
        console.warn(`Public IP detected (${clientIP}) without private IP header. IP validation bypassed due to ALLOW_PUBLIC_IPS=true`);
        req.clientIP = clientIP;
        return next();
      }
      
      // If we have a public IP and no private IP header, deny access
      // This means mobile app didn't send private IP or user is not on office WiFi
      console.log('=== IP VALIDATION FAILED ===');
      console.log('Public IP detected without private IP header. Mobile app may need to send X-Client-Local-IP header.');
      console.log('Client IP:', clientIP);
      console.log('Allowed IPs:', allowedIPs.map(c => `${c.ipAddress}${c.subnet ? ` (${c.subnet})` : ''}`).join(', '));
      console.log('===========================');
      
      return res.status(403).json({
        error: 'Access denied',
        message: 'You must be connected to office WiFi to perform this action',
        clientIP: clientIP,
        allowedIPs: allowedIPs.map(c => c.ipAddress),
        hint: 'Make sure you are connected to office WiFi. If using mobile app, ensure it sends your local WiFi IP address.',
      });
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
      console.log('Private IP from header:', privateIPFromHeader || 'NOT SENT');
      console.log('Allowed IPs:', allowedIPs.map(c => `${c.ipAddress}${c.subnet ? ` (${c.subnet})` : ''}`).join(', '));
      console.log('Request headers (IP-related):', {
        'x-client-local-ip': req.headers['x-client-local-ip'] || req.headers['X-Client-Local-IP'] || 'NOT SENT',
        'x-wifi-ip': req.headers['x-wifi-ip'] || req.headers['X-Wifi-IP'] || 'NOT SENT',
        'x-forwarded-for': req.headers['x-forwarded-for'],
        'x-real-ip': req.headers['x-real-ip'],
        'remoteAddress': req.connection?.remoteAddress || req.socket?.remoteAddress,
      });
      console.log('All custom headers:', Object.keys(req.headers).filter(h => h.toLowerCase().startsWith('x-')));
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

