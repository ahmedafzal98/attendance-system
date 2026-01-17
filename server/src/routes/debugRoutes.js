const { Router } = require('express');
const { getClientIP } = require('../middleware/ipValidator');

const router = Router();

// Debug endpoint to check what IP the server sees
router.get('/my-ip', (req, res) => {
  const clientIP = getClientIP(req);
  res.json({
    clientIP: clientIP,
    headers: {
      'x-forwarded-for': req.headers['x-forwarded-for'],
      'x-real-ip': req.headers['x-real-ip'],
      'remoteAddress': req.connection?.remoteAddress || req.socket?.remoteAddress,
      'ip': req.ip,
    },
    message: 'Use this IP address or configure a subnet range in IP Configuration',
  });
});

module.exports = router;

