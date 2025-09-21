const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  res.json({
    message: 'BitNet API v1.0',
    endpoints: {
      health: '/health',
      auth: '/api/auth',
      users: '/api/users',
      events: '/api/events',
      connections: '/api/connections'
    }
  });
});

module.exports = router;