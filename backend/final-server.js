const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3007;

app.use(cors());
app.use(express.json({ limit: '10mb' })); // Increased limit for logo uploads

// In-memory users and companies
const users = [
  { id: 1, email: 'sergei@test.com', password: 'testpass123', firstName: 'Sergei', lastName: 'Test' },
  { id: 2, email: 'sergeisqa@gmail.com', password: 'mypassword123', firstName: 'Sergei', lastName: 'QA' },
  { id: 3, email: 'sergeigodev@gmail.com', password: 'mypassword123', firstName: 'Sergei', lastName: 'Dev' }
];

// In-memory companies storage
const companies = {};

// Simple JWT token parsing
const parseToken = (authHeader) => {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  const token = authHeader.substring(7);
  // Extract user ID from mock token
  const userId = token.replace('mock-jwt-token-', '');
  return parseInt(userId);
};

app.get('/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

app.post('/api/auth/register', (req, res) => {
  console.log('Registration request:', req.body);
  const { email, password, firstName, lastName } = req.body;

  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({ error: 'All fields required' });
  }

  const existingUser = users.find(u => u.email === email);
  if (existingUser) {
    return res.status(400).json({ error: 'User already exists' });
  }

  const newUser = {
    id: users.length + 1,
    email,
    password,
    firstName,
    lastName
  };
  users.push(newUser);

  console.log('User registered:', newUser.email);
  res.status(201).json({
    message: 'User registered successfully',
    user: { id: newUser.id, email: newUser.email, firstName: newUser.firstName, lastName: newUser.lastName },
    token: 'mock-jwt-token-' + newUser.id
  });
});

app.post('/api/auth/login', (req, res) => {
  console.log('Login request:', req.body);
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ error: 'Email and password required' });
  }

  const user = users.find(u => u.email === email && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }

  console.log('User logged in:', user.email);
  res.json({
    message: 'Login successful',
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName
    },
    token: 'mock-jwt-token-' + user.id
  });
});

// Company API endpoints
app.post('/api/companies', (req, res) => {
  try {
    console.log('Create company profile request:', req.body);
    const userId = parseToken(req.headers.authorization);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, industry, description, contactEmail, contactPhone, website, address } = req.body;

    if (!name || !industry) {
      return res.status(400).json({ error: 'Company name and industry are required' });
    }

    const companyId = Date.now(); // Simple ID generation
    const company = {
      id: companyId,
      userId,
      name,
      industry,
      description: description || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      website: website || '',
      address: address || '',
      createdAt: new Date().toISOString()
    };

    companies[userId] = company;
    console.log('Company profile created for user:', userId);

    res.status(201).json({
      message: 'Company profile created successfully',
      company
    });
  } catch (error) {
    console.error('Create company error:', error);
    res.status(500).json({ error: 'Company profile creation failed' });
  }
});

app.get('/api/companies/my-profile', (req, res) => {
  try {
    const userId = parseToken(req.headers.authorization);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const company = companies[userId];
    if (!company) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company profile error:', error);
    res.status(500).json({ error: 'Failed to get company profile' });
  }
});

app.put('/api/companies/my-profile', (req, res) => {
  try {
    console.log('Update company profile request:', req.body);
    const userId = parseToken(req.headers.authorization);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { name, industry, description, contactEmail, contactPhone, website, address } = req.body;

    if (!name || !industry) {
      return res.status(400).json({ error: 'Company name and industry are required' });
    }

    const existingCompany = companies[userId];
    if (!existingCompany) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    const updatedCompany = {
      ...existingCompany,
      name,
      industry,
      description: description || '',
      contactEmail: contactEmail || '',
      contactPhone: contactPhone || '',
      website: website || '',
      address: address || '',
      updatedAt: new Date().toISOString()
    };

    companies[userId] = updatedCompany;
    console.log('Company profile updated for user:', userId);

    res.json({
      message: 'Company profile updated successfully',
      company: updatedCompany
    });
  } catch (error) {
    console.error('Update company error:', error);
    res.status(500).json({ error: 'Company profile update failed' });
  }
});

app.get('/api/companies/my-profile/qr', (req, res) => {
  try {
    const userId = parseToken(req.headers.authorization);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const company = companies[userId];
    if (!company) {
      return res.status(404).json({ error: 'Company profile not found' });
    }

    // Generate QR code data with URL format for better camera compatibility
    const qrData = {
      type: 'bitnet_company',
      companyId: company.id,
      name: company.name,
      industry: company.industry,
      description: company.description,
      contactEmail: company.contactEmail,
      contactPhone: company.contactPhone,
      website: company.website,
      address: company.address
    };

    // Create a URL that will open the web app with company data
    const baseUrl = 'http://192.168.1.38:3003'; // Use network IP so phones can access it
    const qrUrl = `${baseUrl}/?qr=${encodeURIComponent(JSON.stringify(qrData))}`;

    res.json({
      qrCode: {
        data: qrUrl, // Now contains URL instead of raw JSON
        jsonData: JSON.stringify(qrData), // Keep JSON for backward compatibility
        company
      }
    });
  } catch (error) {
    console.error('Generate QR code error:', error);
    res.status(500).json({ error: 'QR code generation failed' });
  }
});

app.get('/api/companies/:companyId', (req, res) => {
  try {
    const userId = parseToken(req.headers.authorization);

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const companyId = parseInt(req.params.companyId);

    // Find company by ID across all users
    const company = Object.values(companies).find(c => c.id === companyId);

    if (!company) {
      return res.status(404).json({ error: 'Company not found' });
    }

    res.json({ company });
  } catch (error) {
    console.error('Get company by ID error:', error);
    res.status(500).json({ error: 'Failed to get company' });
  }
});

app.listen(PORT, () => {
  console.log(`Final server running on port ${PORT}`);
  console.log('Available test users:');
  users.forEach(user => {
    console.log(`  - ${user.email} / ${user.password}`);
  });
});

console.log('Server script loaded');