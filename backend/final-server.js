const express = require('express');
const cors = require('cors');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// In-memory users
const users = [
  { id: 1, email: 'sergei@test.com', password: 'testpass123', firstName: 'Sergei', lastName: 'Test' },
  { id: 2, email: 'sergeisqa@gmail.com', password: 'mypassword123', firstName: 'Sergei', lastName: 'QA' },
  { id: 3, email: 'sergeigodev@gmail.com', password: 'mypassword123', firstName: 'Sergei', lastName: 'Dev' }
];

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

app.listen(PORT, () => {
  console.log(`Final server running on port ${PORT}`);
  console.log('Available test users:');
  users.forEach(user => {
    console.log(`  - ${user.email} / ${user.password}`);
  });
});

console.log('Server script loaded');