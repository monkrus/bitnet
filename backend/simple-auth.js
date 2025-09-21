const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const app = express();
const PORT = 3001;

// Simple in-memory storage
let users = [];
let nextId = 1;
let resetTokens = []; // Store reset tokens temporarily

// Middleware
app.use(cors({
  origin: ['http://localhost:8090', 'http://localhost:8085', 'http://localhost:8083', 'http://localhost:8082', 'http://localhost:3002'],
  credentials: true
}));
app.use(express.json());

// Routes
app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', async (req, res) => {
  try {
    console.log('Registration request:', req.body);

    const { email, password, firstName, lastName, company, jobTitle } = req.body;

    if (!email || !password || !firstName || !lastName) {
      return res.status(400).json({
        error: 'Email, password, first name, and last name are required'
      });
    }

    // Check if user exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = {
      id: nextId++,
      email,
      password_hash: hashedPassword,
      first_name: firstName,
      last_name: lastName,
      company: company || '',
      job_title: jobTitle || '',
      created_at: new Date().toISOString()
    };

    users.push(user);

    // Generate token
    const token = jwt.sign({ userId: user.id }, 'simple_secret', { expiresIn: '7d' });

    console.log('User created successfully:', user.email);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        jobTitle: user.job_title
      },
      token
    });

  } catch (error) {
    console.error('Registration error details:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({
      error: 'Registration failed',
      details: error.message,
      stack: error.stack
    });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    console.log('Login request:', req.body);

    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: 'Email and password are required'
      });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Verify password
    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return res.status(401).json({
        error: 'Invalid email or password'
      });
    }

    // Generate token
    const token = jwt.sign({ userId: user.id }, 'simple_secret', { expiresIn: '7d' });

    console.log('User logged in successfully:', user.email);

    res.json({
      message: 'Login successful',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.first_name,
        lastName: user.last_name,
        company: user.company,
        jobTitle: user.job_title
      },
      token
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      error: 'Login failed',
      details: error.message
    });
  }
});

// Generate random reset token
function generateResetToken() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

// Password reset request
app.post('/api/auth/forgot-password', async (req, res) => {
  try {
    console.log('Password reset request:', req.body);

    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required'
      });
    }

    // Find user
    const user = users.find(u => u.email === email);
    if (!user) {
      // Don't reveal if email exists or not for security
      return res.json({
        message: 'If your email is registered, you will receive a password reset link.'
      });
    }

    // Generate reset token
    const resetToken = generateResetToken();
    const resetTokenData = {
      token: resetToken,
      userId: user.id,
      email: user.email,
      expires: Date.now() + (15 * 60 * 1000), // 15 minutes
      used: false
    };

    // Store reset token
    resetTokens.push(resetTokenData);

    console.log('Password reset token generated:', resetToken);
    console.log('Reset link: http://localhost:3002/reset-password?token=' + resetToken);

    res.json({
      message: 'If your email is registered, you will receive a password reset link.',
      // For development, return the token (remove in production)
      resetToken: resetToken,
      resetLink: `http://localhost:3002/reset-password?token=${resetToken}`
    });

  } catch (error) {
    console.error('Password reset request error:', error);
    res.status(500).json({
      error: 'Password reset request failed',
      details: error.message
    });
  }
});

// Reset password with token
app.post('/api/auth/reset-password', async (req, res) => {
  try {
    console.log('Password reset:', req.body);

    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        error: 'Password must be at least 6 characters long'
      });
    }

    // Find reset token
    const resetTokenData = resetTokens.find(rt => rt.token === token && !rt.used);
    if (!resetTokenData) {
      return res.status(400).json({
        error: 'Invalid or expired reset token'
      });
    }

    // Check if token is expired
    if (Date.now() > resetTokenData.expires) {
      return res.status(400).json({
        error: 'Reset token has expired'
      });
    }

    // Find user
    const user = users.find(u => u.id === resetTokenData.userId);
    if (!user) {
      return res.status(400).json({
        error: 'User not found'
      });
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // Update user password
    user.password_hash = hashedPassword;
    user.updated_at = new Date().toISOString();

    // Mark token as used
    resetTokenData.used = true;

    console.log('Password reset successful for:', user.email);

    res.json({
      message: 'Password reset successful'
    });

  } catch (error) {
    console.error('Password reset error:', error);
    res.status(500).json({
      error: 'Password reset failed',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Simple auth server running on port ${PORT}`);
  console.log(`Health check: http://localhost:${PORT}/health`);
  console.log(`Registration: http://localhost:${PORT}/api/auth/register`);
  console.log(`Login: http://localhost:${PORT}/api/auth/login`);
});