const express = require('express');
const cors = require('cors');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const QRCode = require('qrcode');
const { dbHelpers } = require('./database');

const app = express();
const PORT = 3001;

// Middleware
app.use(cors({
  origin: ['http://localhost:8090', 'http://localhost:8085', 'http://localhost:8083', 'http://localhost:8082', 'http://localhost:3002', 'http://localhost:3003'],
  credentials: true
}));
app.use(express.json());

// JWT verification middleware
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  try {
    const decoded = jwt.verify(token, 'simple_secret');
    req.userId = decoded.userId;
    next();
  } catch (error) {
    return res.status(403).json({ error: 'Invalid or expired token' });
  }
};

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
    const existingUser = await dbHelpers.getUserByEmail(email);
    if (existingUser) {
      return res.status(400).json({
        error: 'User with this email already exists'
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await dbHelpers.createUser({
      email,
      password_hash: hashedPassword,
      firstName,
      lastName
    });

    // Generate token
    const token = jwt.sign({ userId: user.id }, 'simple_secret', { expiresIn: '7d' });

    console.log('User created successfully:', user.email);

    res.status(201).json({
      message: 'User registered successfully',
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName
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
    const user = await dbHelpers.getUserByEmail(email);
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
        lastName: user.last_name
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

// Company Profile Routes

// Create company profile
app.post('/api/companies', verifyToken, async (req, res) => {
  try {
    console.log('Company profile creation request:', req.body);

    const { name, description, industry, contactEmail, contactPhone, website, address } = req.body;

    if (!name || !industry) {
      return res.status(400).json({
        error: 'Company name and industry are required'
      });
    }

    // Check if user already has a company
    const existingCompany = companies.find(c => c.ownerId === req.userId);
    if (existingCompany) {
      return res.status(400).json({
        error: 'User already has a company profile'
      });
    }

    // Create company profile
    const company = {
      id: nextCompanyId++,
      ownerId: req.userId,
      name,
      description: description || '',
      industry,
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      website: website || '',
      address: address || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    companies.push(company);

    console.log('Company profile created successfully:', company.name);

    res.status(201).json({
      message: 'Company profile created successfully',
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        industry: company.industry,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
        website: company.website,
        address: company.address
      }
    });

  } catch (error) {
    console.error('Company creation error:', error);
    res.status(500).json({
      error: 'Company profile creation failed',
      details: error.message
    });
  }
});

// Get user's company profile
app.get('/api/companies/my-profile', verifyToken, async (req, res) => {
  try {
    const company = companies.find(c => c.ownerId === req.userId);

    if (!company) {
      return res.status(404).json({
        error: 'Company profile not found'
      });
    }

    res.json({
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        industry: company.industry,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
        website: company.website,
        address: company.address
      }
    });

  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({
      error: 'Failed to retrieve company profile',
      details: error.message
    });
  }
});

// Update company profile
app.put('/api/companies/my-profile', verifyToken, async (req, res) => {
  try {
    console.log('Company profile update request:', req.body);

    const { name, description, industry, contactEmail, contactPhone, website, address } = req.body;

    if (!name || !industry) {
      return res.status(400).json({
        error: 'Company name and industry are required'
      });
    }

    const companyIndex = companies.findIndex(c => c.ownerId === req.userId);

    if (companyIndex === -1) {
      return res.status(404).json({
        error: 'Company profile not found'
      });
    }

    // Update company profile
    companies[companyIndex] = {
      ...companies[companyIndex],
      name,
      description: description || '',
      industry,
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      website: website || '',
      address: address || '',
      updatedAt: new Date().toISOString()
    };

    console.log('Company profile updated successfully:', companies[companyIndex].name);

    res.json({
      message: 'Company profile updated successfully',
      company: {
        id: companies[companyIndex].id,
        name: companies[companyIndex].name,
        description: companies[companyIndex].description,
        industry: companies[companyIndex].industry,
        contactEmail: companies[companyIndex].contactEmail,
        contactPhone: companies[companyIndex].contactPhone,
        website: companies[companyIndex].website,
        address: companies[companyIndex].address
      }
    });

  } catch (error) {
    console.error('Company update error:', error);
    res.status(500).json({
      error: 'Company profile update failed',
      details: error.message
    });
  }
});

// Get all companies (for browsing)
app.get('/api/companies', verifyToken, async (req, res) => {
  try {
    const allCompanies = companies.map(company => ({
      id: company.id,
      name: company.name,
      description: company.description,
      industry: company.industry,
      contactEmail: company.contactEmail,
      website: company.website,
      address: company.address
    }));

    res.json({
      companies: allCompanies
    });

  } catch (error) {
    console.error('Get companies error:', error);
    res.status(500).json({
      error: 'Failed to retrieve companies',
      details: error.message
    });
  }
});

// QR Code Routes

// Generate QR code for company profile
app.get('/api/companies/my-profile/qr', verifyToken, async (req, res) => {
  try {
    const company = companies.find(c => c.ownerId === req.userId);

    if (!company) {
      return res.status(404).json({
        error: 'Company profile not found'
      });
    }

    // Create company data for QR code
    const qrData = {
      type: 'bitnet_company',
      companyId: company.id,
      name: company.name,
      industry: company.industry,
      description: company.description,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      website: company.website,
      address: company.address,
      url: `http://localhost:3002/company/${company.id}`
    };

    // Generate QR code as data URL
    const qrCodeDataURL = await QRCode.toDataURL(JSON.stringify(qrData), {
      width: 256,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    res.json({
      qrCode: qrCodeDataURL,
      data: qrData
    });

  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({
      error: 'Failed to generate QR code',
      details: error.message
    });
  }
});

// Get company profile by ID (for QR code scanning)
app.get('/api/companies/:id', verifyToken, async (req, res) => {
  try {
    const companyId = parseInt(req.params.id);
    const company = companies.find(c => c.id === companyId);

    if (!company) {
      return res.status(404).json({
        error: 'Company not found'
      });
    }

    res.json({
      company: {
        id: company.id,
        name: company.name,
        description: company.description,
        industry: company.industry,
        contactEmail: company.contactEmail,
        contactPhone: company.contactPhone,
        website: company.website,
        address: company.address
      }
    });

  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({
      error: 'Failed to retrieve company',
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