import React, { useState, useEffect } from 'react';
import './App.css';
import jsQR from 'jsqr';

// Import QRCode with require to avoid TypeScript issues
const QRCode = require('qrcode');

// Utility function to format address objects into readable strings
const formatFullAddress = (address: any) => {
  if (typeof address === 'string') return address; // Handle legacy single string addresses
  if (!address) return '';
  const { street, city, zip, country } = address;
  const parts = [street, city, zip, country].filter(part => part && part.trim());
  return parts.join(', ');
};

// Mock AuthService for web
const AuthService = {
  async login(email: string, password: string) {
    const response = await fetch('http://localhost:3007/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async register(userData: any) {
    const response = await fetch('http://localhost:3007/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(userData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async logout() {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
  },

  async isAuthenticated() {
    return !!localStorage.getItem('authToken');
  },

  async getUser() {
    const userData = localStorage.getItem('userData');
    return userData ? JSON.parse(userData) : null;
  },

  async forgotPassword(email: string) {
    const response = await fetch('http://localhost:3007/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Enhanced contact management methods
  updateContactNotes(contactId: number, notes: any[]) {
    try {
      const contacts = this.getContacts();
      const updatedContacts = contacts.map((contact: any) => {
        if (contact.companyId === contactId) {
          return { ...contact, notes };
        }
        return contact;
      });
      localStorage.setItem('bitnet_contacts', JSON.stringify(updatedContacts));
    } catch (error) {
      console.error('Failed to update contact notes:', error);
    }
  },

  updateContactMeetings(contactId: number, meetings: any[]) {
    try {
      const contacts = this.getContacts();
      const updatedContacts = contacts.map((contact: any) => {
        if (contact.companyId === contactId) {
          return { ...contact, meetings };
        }
        return contact;
      });
      localStorage.setItem('bitnet_contacts', JSON.stringify(updatedContacts));
    } catch (error) {
      console.error('Failed to update contact meetings:', error);
    }
  },

  updateContactReminders(contactId: number, reminders: any[]) {
    try {
      const contacts = this.getContacts();
      const updatedContacts = contacts.map((contact: any) => {
        if (contact.companyId === contactId) {
          return { ...contact, reminders };
        }
        return contact;
      });
      localStorage.setItem('bitnet_contacts', JSON.stringify(updatedContacts));
    } catch (error) {
      console.error('Failed to update contact reminders:', error);
    }
  },

  updateConnectionStatus(contactId: number, status: string) {
    try {
      const contacts = this.getContacts();
      const updatedContacts = contacts.map((contact: any) => {
        if (contact.companyId === contactId) {
          return {
            ...contact,
            connectionStatus: status,
            lastStatusUpdate: new Date().toISOString()
          };
        }
        return contact;
      });
      localStorage.setItem('bitnet_contacts', JSON.stringify(updatedContacts));
    } catch (error) {
      console.error('Failed to update connection status:', error);
    }
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await fetch('http://localhost:3007/api/auth/reset-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, newPassword }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async createCompanyProfile(companyData: any) {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3007/api/companies', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(companyData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async getCompanyProfile() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3007/api/companies/my-profile', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async updateCompanyProfile(companyData: any) {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3007/api/companies/my-profile', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(companyData),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async getAllCompanies() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3007/api/companies', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async generateQRCode() {
    const token = localStorage.getItem('authToken');
    const response = await fetch('http://localhost:3007/api/companies/my-profile/qr', {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async getCompanyById(companyId: number) {
    const token = localStorage.getItem('authToken');
    const response = await fetch(`http://localhost:3007/api/companies/${companyId}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      },
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  // Contact management functions
  saveContact(contact: any, category: string = 'prospect') {
    const contacts = this.getContacts();
    const existingIndex = contacts.findIndex((c: any) => c.companyId === contact.companyId);

    const contactData = {
      ...contact,
      category,
      savedAt: new Date().toISOString()
    };

    if (existingIndex >= 0) {
      contacts[existingIndex] = contactData;
    } else {
      contacts.push(contactData);
    }

    localStorage.setItem('savedContacts', JSON.stringify(contacts));
    return true;
  },

  getContacts() {
    const contacts = localStorage.getItem('savedContacts');
    return contacts ? JSON.parse(contacts) : [];
  },

  removeContact(companyId: number) {
    const contacts = this.getContacts();
    const filtered = contacts.filter((c: any) => c.companyId !== companyId);
    localStorage.setItem('savedContacts', JSON.stringify(filtered));
    return true;
  }
};

const LoginScreen = ({ onLogin, navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      alert('Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.login(email, password);
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userData', JSON.stringify(result.user));
      onLogin(result.user);
    } catch (error: any) {
      alert('Login failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h1 className="auth-title">Welcome Back</h1>
        <p className="auth-subtitle">Sign in to your BitNet account</p>

        <form onSubmit={handleLogin} className="auth-form">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="auth-input"
            required
          />
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <button
          onClick={() => navigation.navigate('Register')}
          className="auth-link"
        >
          Don't have an account? Sign up
        </button>

        <button
          onClick={() => navigation.navigate('ForgotPassword')}
          className="auth-link"
          style={{ marginTop: '10px' }}
        >
          Forgot your password?
        </button>
      </div>
    </div>
  );
};

const RegisterScreen = ({ onLogin, navigation }: any) => {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    confirmPassword: '',
    company: '',
    jobTitle: '',
  });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    const { firstName, lastName, email, password, confirmPassword } = formData;

    if (!firstName || !lastName || !email || !password) {
      alert('Please fill in all required fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    try {
      const { confirmPassword: _, ...userData } = formData;
      const result = await AuthService.register(userData);
      localStorage.setItem('authToken', result.token);
      localStorage.setItem('userData', JSON.stringify(result.user));
      alert('Account created successfully!');
      onLogin(result.user);
    } catch (error: any) {
      alert('Registration failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container scrollable">
      <div className="auth-content">
        <h1 className="auth-title">Join BitNet</h1>
        <p className="auth-subtitle">Create your professional account</p>

        <form onSubmit={handleRegister} className="auth-form">
          <input
            type="text"
            placeholder="First Name *"
            value={formData.firstName}
            onChange={(e) => handleInputChange('firstName', e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="text"
            placeholder="Last Name *"
            value={formData.lastName}
            onChange={(e) => handleInputChange('lastName', e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="email"
            placeholder="Email *"
            value={formData.email}
            onChange={(e) => handleInputChange('email', e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="text"
            placeholder="Company"
            value={formData.company}
            onChange={(e) => handleInputChange('company', e.target.value)}
            className="auth-input"
          />
          <input
            type="text"
            placeholder="Job Title"
            value={formData.jobTitle}
            onChange={(e) => handleInputChange('jobTitle', e.target.value)}
            className="auth-input"
          />
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password *"
              value={formData.password}
              onChange={(e) => handleInputChange('password', e.target.value)}
              className="auth-input"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password *"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              className="auth-input"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <button
          onClick={() => navigation.navigate('Login')}
          className="auth-link"
        >
          Already have an account? Sign in
        </button>
      </div>
    </div>
  );
};

const ForgotPasswordScreen = ({ navigation }: any) => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [resetLink, setResetLink] = useState('');

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      alert('Please enter your email');
      return;
    }

    setLoading(true);
    try {
      const result = await AuthService.forgotPassword(email);
      setMessage(result.message);
      if (result.resetLink) {
        setResetLink(result.resetLink);
      }
    } catch (error: any) {
      alert('Failed to send reset email: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h1 className="auth-title">Reset Password</h1>
        <p className="auth-subtitle">Enter your email to receive a password reset link</p>

        {!message ? (
          <form onSubmit={handleForgotPassword} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="auth-input"
              required
            />
            <button type="submit" disabled={loading} className="auth-button">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        ) : (
          <div className="success-message">
            <p style={{ color: '#28a745', marginBottom: '20px' }}>{message}</p>
            {resetLink && (
              <div style={{ background: '#f8f9fa', padding: '15px', borderRadius: '8px', marginBottom: '20px' }}>
                <p style={{ margin: '0 0 10px 0', fontWeight: 'bold' }}>Development Reset Link:</p>
                <a
                  href={resetLink}
                  style={{ color: '#007AFF', wordBreak: 'break-all' }}
                  onClick={(e) => {
                    e.preventDefault();
                    const token = resetLink.split('token=')[1];
                    navigation.navigate('ResetPassword', { token });
                  }}
                >
                  {resetLink}
                </a>
              </div>
            )}
          </div>
        )}

        <button
          onClick={() => navigation.navigate('Login')}
          className="auth-link"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

const ResetPasswordScreen = ({ navigation, token }: any) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password || !confirmPassword) {
      alert('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    if (password.length < 6) {
      alert('Password must be at least 6 characters long');
      return;
    }

    if (!token) {
      alert('Invalid reset token');
      return;
    }

    setLoading(true);
    try {
      await AuthService.resetPassword(token, password);
      alert('Password reset successful! You can now log in with your new password.');
      navigation.navigate('Login');
    } catch (error: any) {
      alert('Password reset failed: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-content">
        <h1 className="auth-title">Set New Password</h1>
        <p className="auth-subtitle">Enter your new password</p>

        <form onSubmit={handleResetPassword} className="auth-form">
          <div className="password-input-container">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="auth-input"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "🙈" : "👁️"}
            </button>
          </div>
          <div className="password-input-container">
            <input
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="auth-input"
              required
            />
            <button
              type="button"
              className="password-toggle"
              onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            >
              {showConfirmPassword ? "👁️" : "👁️‍🗨️"}
            </button>
          </div>
          <button type="submit" disabled={loading} className="auth-button">
            {loading ? 'Resetting...' : 'Reset Password'}
          </button>
        </form>

        <button
          onClick={() => navigation.navigate('Login')}
          className="auth-link"
        >
          Back to Login
        </button>
      </div>
    </div>
  );
};

const CompanyProfileScreen = ({ navigation }: any) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    industry: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    address: {
      street: '',
      city: '',
      zip: '',
      country: ''
    },
    logo: '',
    socialMedia: {
      linkedin: '',
      twitter: '',
      facebook: '',
      instagram: ''
    },
    contactPersons: [{
      name: '',
      title: '',
      email: '',
      phone: ''
    }]
  });
  const [emailSuggestions, setEmailSuggestions] = useState<string[]>([]);
  const [showEmailSuggestions, setShowEmailSuggestions] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{[key: string]: string}>({});
  const [loading, setLoading] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [qrLoading, setQrLoading] = useState(false);

  const industries = [
    'Technology', 'Healthcare', 'Finance', 'Education', 'Manufacturing',
    'Retail', 'Real Estate', 'Construction', 'Transportation', 'Energy',
    'Agriculture', 'Media', 'Hospitality', 'Legal', 'Consulting', 'Other'
  ];

  const quickFillTemplates = {
    'Technology': {
      description: 'Innovative technology solutions for businesses and consumers',
      website: formData.name ? `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : '',
      contactEmail: formData.name ? `info@${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : ''
    },
    'Healthcare': {
      description: 'Providing quality healthcare services and medical solutions',
      website: formData.name ? `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : '',
      contactEmail: formData.name ? `contact@${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : ''
    },
    'Finance': {
      description: 'Financial services and investment solutions',
      website: formData.name ? `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : '',
      contactEmail: formData.name ? `info@${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : ''
    },
    'Retail': {
      description: 'Quality products and exceptional customer service',
      website: formData.name ? `${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : '',
      contactEmail: formData.name ? `hello@${formData.name.toLowerCase().replace(/[^a-z0-9]/g, '')}.com` : ''
    }
  };

  const applyQuickFill = (industry: string) => {
    const template = quickFillTemplates[industry as keyof typeof quickFillTemplates];
    if (template && formData.name) {
      setFormData(prev => ({
        ...prev,
        description: prev.description || template.description,
        website: prev.website || template.website,
        contactEmail: prev.contactEmail || template.contactEmail
      }));
    }
  };

  useEffect(() => {
    loadCompanyProfile();
    suggestContactEmail();
  }, []);

  const suggestContactEmail = async () => {
    try {
      const userData = await AuthService.getUser();
      if (userData && userData.email && !formData.contactEmail) {
        setFormData(prev => ({ ...prev, contactEmail: userData.email }));
      }
    } catch (error) {
      console.error('Error getting user data:', error);
    }
  };

  const formatPhoneNumber = (phone: string) => {
    // Remove all non-numeric characters
    const cleaned = phone.replace(/\D/g, '');

    // Format based on length
    if (cleaned.length === 0) return '';
    if (cleaned.length <= 3) return cleaned;
    if (cleaned.length <= 6) return `${cleaned.slice(0, 3)}-${cleaned.slice(3)}`;
    if (cleaned.length <= 10) return `${cleaned.slice(0, 3)}-${cleaned.slice(3, 6)}-${cleaned.slice(6)}`;

    // For numbers longer than 10 digits, format as international
    return `+${cleaned.slice(0, -10)} ${cleaned.slice(-10, -7)}-${cleaned.slice(-7, -4)}-${cleaned.slice(-4)}`;
  };

  const formatWebsiteUrl = (url: string) => {
    if (!url) return '';

    // If URL doesn't start with http:// or https://, add https://
    if (!url.match(/^https?:\/\//)) {
      return `https://${url}`;
    }
    return url;
  };

  const formatSocialMediaUrl = (platform: string, value: string) => {
    if (!value) return '';

    // Remove any existing URLs and extract username/handle
    let cleanValue = value.replace(/^https?:\/\/(www\.)?(facebook|linkedin|twitter|instagram)\.(com|in)\/?/g, '');
    cleanValue = cleanValue.replace(/^@/, ''); // Remove @ symbol
    cleanValue = cleanValue.replace(/\/$/, ''); // Remove trailing slash

    if (!cleanValue) return '';

    // Format based on platform
    switch (platform) {
      case 'linkedin':
        return cleanValue.includes('/')
          ? `https://linkedin.com/${cleanValue}`
          : `https://linkedin.com/company/${cleanValue}`;
      case 'twitter':
        return `https://twitter.com/${cleanValue}`;
      case 'facebook':
        return `https://facebook.com/${cleanValue}`;
      case 'instagram':
        return `https://instagram.com/${cleanValue}`;
      default:
        return value;
    }
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const generateEmailSuggestions = (companyName: string, currentEmail: string) => {
    if (!companyName || currentEmail.includes('@')) return [];

    const cleanCompanyName = companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
    const suggestions = [
      `info@${cleanCompanyName}.com`,
      `contact@${cleanCompanyName}.com`,
      `hello@${cleanCompanyName}.com`,
      `sales@${cleanCompanyName}.com`
    ];

    return suggestions.filter(suggestion =>
      suggestion.toLowerCase().includes(currentEmail.toLowerCase())
    ).slice(0, 3);
  };

  const loadCompanyProfile = async () => {
    try {
      const result = await AuthService.getCompanyProfile();
      const company = result.company;

      // Ensure contactPersons is always an array and address is in new format
      const normalizedCompany = {
        ...company,
        contactPersons: Array.isArray(company.contactPersons) ? company.contactPersons :
                       company.contactPersons ? [company.contactPersons] :
                       [{ name: '', title: '', email: '', phone: '' }],
        socialMedia: company.socialMedia || {
          linkedin: '',
          twitter: '',
          facebook: '',
          instagram: ''
        },
        address: typeof company.address === 'string'
          ? { street: company.address, city: '', zip: '', country: '' }
          : company.address || { street: '', city: '', zip: '', country: '' }
      };

      setFormData(normalizedCompany);
      setHasProfile(true);
    } catch (error: any) {
      if (error.message !== 'Company profile not found') {
        console.error('Load profile error:', error);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    let processedValue = value;
    let errors = { ...validationErrors };

    // Apply formatting based on field type
    if (field === 'contactPhone') {
      processedValue = formatPhoneNumber(value);
    } else if (field === 'website') {
      processedValue = value; // Don't auto-format while typing
      if (value && !value.match(/^https?:\/\//)) {
        errors[field] = '';
      } else {
        delete errors[field];
      }
    } else if (field === 'contactEmail') {
      if (value && !validateEmail(value) && value.includes('@')) {
        errors[field] = 'Please enter a valid email address';
      } else {
        delete errors[field];
      }

      // Generate email suggestions
      if (formData.name && value && !value.includes('@')) {
        const suggestions = generateEmailSuggestions(formData.name, value);
        setEmailSuggestions(suggestions);
        setShowEmailSuggestions(suggestions.length > 0);
      } else {
        setShowEmailSuggestions(false);
      }
    }

    setValidationErrors(errors);
    setFormData(prev => ({ ...prev, [field]: processedValue }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };


  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const result = event.target?.result as string;
        setFormData(prev => ({ ...prev, logo: result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSocialMediaChange = (platform: string, value: string) => {
    const formattedValue = formatSocialMediaUrl(platform, value);
    setFormData(prev => ({
      ...prev,
      socialMedia: {
        ...prev.socialMedia,
        [platform]: formattedValue
      }
    }));
  };

  const handleContactPersonChange = (index: number, field: string, value: string) => {
    let processedValue = value;

    // Apply formatting for contact person fields
    if (field === 'phone') {
      processedValue = formatPhoneNumber(value);
    }

    setFormData(prev => ({
      ...prev,
      contactPersons: Array.isArray(prev.contactPersons) ? prev.contactPersons.map((person, i) =>
        i === index ? { ...person, [field]: processedValue } : person
      ) : []
    }));
  };

  const addContactPerson = () => {
    setFormData(prev => ({
      ...prev,
      contactPersons: [...(Array.isArray(prev.contactPersons) ? prev.contactPersons : []), { name: '', title: '', email: '', phone: '' }]
    }));
  };

  const removeContactPerson = (index: number) => {
    setFormData(prev => ({
      ...prev,
      contactPersons: Array.isArray(prev.contactPersons) ? prev.contactPersons.filter((_, i) => i !== index) : []
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.industry) {
      alert('Company name and industry are required');
      return;
    }

    // Validate email if provided
    if (formData.contactEmail && !validateEmail(formData.contactEmail)) {
      alert('Please enter a valid email address');
      return;
    }

    // Filter out empty contact persons and format URLs before saving
    const filteredData = {
      ...formData,
      website: formData.website ? formatWebsiteUrl(formData.website) : '',
      address: formatFullAddress(formData.address),
      contactPersons: formData.contactPersons.filter(person => person.name.trim() !== '')
    };

    setLoading(true);
    try {
      if (hasProfile) {
        await AuthService.updateCompanyProfile(filteredData);
        alert('Company profile updated successfully!');
      } else {
        await AuthService.createCompanyProfile(filteredData);
        alert('Company profile created successfully!');
        setHasProfile(true);
      }
      setIsEditing(false);
    } catch (error: any) {
      alert(`${hasProfile ? 'Update' : 'Creation'} failed: ` + error.message);
    } finally {
      setLoading(false);
    }
  };

  const generateQRCode = async () => {
    if (!hasProfile) {
      alert('Please create your company profile first');
      return;
    }

    setQrLoading(true);
    try {
      const response = await AuthService.generateQRCode();
      // Convert JSON data to QR code image
      const qrCodeImageUrl = await QRCode.toDataURL(response.qrCode.data, {
        width: 256,
        margin: 2,
        color: {
          dark: '#000000',
          light: '#FFFFFF'
        }
      });
      setQrCode(qrCodeImageUrl);
    } catch (error: any) {
      alert('Failed to generate QR code: ' + error.message);
    } finally {
      setQrLoading(false);
    }
  };

  return (
    <div className="auth-container scrollable">
      <div className="auth-content" style={{ maxWidth: '600px' }}>
        <h1 className="auth-title">
          {hasProfile ? 'Company Profile' : 'Create Company Profile'}
        </h1>
        <p className="auth-subtitle">
          {hasProfile && !isEditing
            ? 'View your company information'
            : 'Enter your company details to create your B2B profile'
          }
        </p>

        {!hasProfile || isEditing ? (
          <div style={{
            backgroundColor: '#e8f4fd',
            border: '1px solid #b8daff',
            borderRadius: '8px',
            padding: '15px',
            marginBottom: '20px'
          }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#004085', fontSize: '14px' }}>
              ⚡ Time-saving tips:
            </h4>
            <ul style={{ margin: 0, paddingLeft: '18px', fontSize: '12px', color: '#004085' }}>
              <li>📞 Phone numbers auto-format as you type</li>
              <li>📧 Email suggestions appear based on your company name</li>
              <li>🌐 Just enter your domain name - we'll add https:// automatically</li>
              <li>📱 Social media: Just enter usernames - we'll create the full URLs</li>
              <li>🚀 Select your industry for quick-fill templates</li>
            </ul>
          </div>
        ) : null}

        {hasProfile && !isEditing ? (
          <div className="company-profile-view">
            {formData.logo && (
              <div className="profile-field" style={{ textAlign: 'center', marginBottom: '20px' }}>
                <img
                  src={formData.logo}
                  alt="Company Logo"
                  style={{
                    maxWidth: '120px',
                    height: 'auto',
                    borderRadius: '8px',
                    border: '2px solid #007AFF'
                  }}
                />
              </div>
            )}
            <div className="profile-field">
              <strong>Company Name:</strong> {formData.name}
            </div>
            <div className="profile-field">
              <strong>Industry:</strong> {formData.industry}
            </div>
            {formData.description && (
              <div className="profile-field">
                <strong>Description:</strong> {formData.description}
              </div>
            )}
            {formData.contactEmail && (
              <div className="profile-field">
                <strong>Email:</strong> {formData.contactEmail}
              </div>
            )}
            {formData.contactPhone && (
              <div className="profile-field">
                <strong>Phone Number:</strong> {formData.contactPhone}
              </div>
            )}
            {formData.website && (
              <div className="profile-field">
                <strong>Website:</strong>
                <a href={formData.website} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px' }}>
                  {formData.website}
                </a>
              </div>
            )}
            {formatFullAddress(formData.address) && (
              <div className="profile-field">
                <strong>Address:</strong>
                <div style={{ marginTop: '4px', lineHeight: '1.5' }}>
                  {formatFullAddress(formData.address)}
                </div>
              </div>
            )}

            {/* Social Media Links */}
            {(formData.socialMedia?.linkedin || formData.socialMedia?.twitter || formData.socialMedia?.facebook || formData.socialMedia?.instagram) && (
              <div className="profile-field">
                <strong>Social Media:</strong>
                <div className="social-media-container">
                  {formData.socialMedia?.linkedin && (
                    <a href={formData.socialMedia.linkedin} target="_blank" rel="noopener noreferrer" className="social-link linkedin">
                      📘 {formData.socialMedia.linkedin}
                    </a>
                  )}
                  {formData.socialMedia?.twitter && (
                    <a href={formData.socialMedia.twitter} target="_blank" rel="noopener noreferrer" className="social-link twitter">
                      🐦 {formData.socialMedia.twitter}
                    </a>
                  )}
                  {formData.socialMedia?.facebook && (
                    <a href={formData.socialMedia.facebook} target="_blank" rel="noopener noreferrer" className="social-link facebook">
                      📘 {formData.socialMedia.facebook}
                    </a>
                  )}
                  {formData.socialMedia?.instagram && (
                    <a href={formData.socialMedia.instagram} target="_blank" rel="noopener noreferrer" className="social-link instagram">
                      📷 {formData.socialMedia.instagram}
                    </a>
                  )}
                </div>
              </div>
            )}

            {/* Contact Persons */}
            {Array.isArray(formData.contactPersons) && formData.contactPersons.some(person => person.name) && (
              <div className="profile-field">
                <strong>Contact Persons:</strong>
                {formData.contactPersons.map((person, index) => (
                  person.name && (
                    <div key={index} style={{ marginTop: '8px', padding: '10px', backgroundColor: '#f8f9fa', borderRadius: '6px' }}>
                      <div><strong>{person.name}</strong> {person.title && `- ${person.title}`}</div>
                      {person.email && <div>📧 {person.email}</div>}
                      {person.phone && <div>📞 {person.phone}</div>}
                    </div>
                  )
                ))}
              </div>
            )}

            <div className="home-actions">
              <button
                onClick={() => setIsEditing(true)}
                className="auth-button"
                style={{ marginTop: '20px' }}
              >
                Edit Profile
              </button>

              <button
                onClick={generateQRCode}
                disabled={qrLoading}
                className="auth-button"
                style={{
                  backgroundColor: qrLoading ? '#ccc' : '#28a745',
                  marginTop: '10px'
                }}
              >
                {qrLoading ? 'Generating...' : 'Generate QR Code'}
              </button>

              {qrCode && (
                <div style={{
                  marginTop: '20px',
                  textAlign: 'center',
                  padding: '20px',
                  backgroundColor: '#f8f9fa',
                  borderRadius: '8px',
                  border: '2px solid #007AFF'
                }}>
                  <h3 style={{ marginBottom: '15px', color: '#333' }}>Your Company QR Code</h3>
                  <img
                    src={qrCode}
                    alt="Company QR Code"
                    style={{
                      maxWidth: '256px',
                      width: '100%',
                      height: 'auto',
                      border: '1px solid #ddd',
                      borderRadius: '8px'
                    }}
                  />
                  <p style={{
                    marginTop: '10px',
                    fontSize: '14px',
                    color: '#666',
                    lineHeight: '1.4'
                  }}>
                    Share this QR code with other businesses to exchange contact information instantly!
                    <br />
                    <strong>📱 Camera compatible:</strong> Regular camera apps will now open your BitNet profile directly.
                  </p>
                </div>
              )}
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="auth-form">
            <input
              type="text"
              placeholder="Company Name *"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              className="auth-input"
              required
            />

            <div>
              <select
                value={formData.industry}
                onChange={(e) => {
                  handleInputChange('industry', e.target.value);
                  if (e.target.value && quickFillTemplates[e.target.value as keyof typeof quickFillTemplates]) {
                    // Show quick fill option after a short delay
                    setTimeout(() => {
                      if (formData.name && (!formData.description || !formData.website || !formData.contactEmail)) {
                        const shouldQuickFill = window.confirm(
                          `Would you like to auto-fill some fields with ${e.target.value} industry suggestions? You can always edit them afterwards.`
                        );
                        if (shouldQuickFill) {
                          applyQuickFill(e.target.value);
                        }
                      }
                    }, 500);
                  }
                }}
                className="auth-input"
                required
              >
                <option value="">Select Industry *</option>
                {industries.map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
              {formData.industry && quickFillTemplates[formData.industry as keyof typeof quickFillTemplates] && formData.name && (
                <button
                  type="button"
                  onClick={() => applyQuickFill(formData.industry)}
                  style={{
                    marginTop: '5px',
                    padding: '6px 12px',
                    backgroundColor: '#17a2b8',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    fontSize: '12px',
                    cursor: 'pointer'
                  }}
                >
                  ⚡ Quick-fill {formData.industry} template
                </button>
              )}
            </div>

            <textarea
              placeholder="Company Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="auth-input"
              rows={4}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />

            <div style={{ position: 'relative' }}>
              <input
                type="email"
                placeholder="Email (suggested from your login email)"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                className="auth-input"
                style={{
                  borderColor: validationErrors.contactEmail ? '#dc3545' : undefined,
                  marginBottom: showEmailSuggestions ? '5px' : undefined
                }}
              />
              {validationErrors.contactEmail && (
                <div style={{
                  color: '#dc3545',
                  fontSize: '12px',
                  marginTop: '2px',
                  marginBottom: '10px'
                }}>
                  {validationErrors.contactEmail}
                </div>
              )}
              {showEmailSuggestions && (
                <div style={{
                  position: 'absolute',
                  top: '100%',
                  left: 0,
                  right: 0,
                  backgroundColor: 'white',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                  zIndex: 1000,
                  maxHeight: '150px',
                  overflowY: 'auto'
                }}>
                  <div style={{
                    padding: '8px',
                    fontSize: '12px',
                    color: '#666',
                    borderBottom: '1px solid #eee'
                  }}>
                    💡 Suggested emails:
                  </div>
                  {emailSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => {
                        handleInputChange('contactEmail', suggestion);
                        setShowEmailSuggestions(false);
                      }}
                      style={{
                        display: 'block',
                        width: '100%',
                        padding: '8px 12px',
                        textAlign: 'left',
                        border: 'none',
                        backgroundColor: 'transparent',
                        cursor: 'pointer',
                        fontSize: '14px',
                        borderBottom: index < emailSuggestions.length - 1 ? '1px solid #f0f0f0' : 'none'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#f8f9fa'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                    >
                      {suggestion}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="tel"
                placeholder="Phone Number"
                value={formData.contactPhone}
                onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                className="auth-input"
                style={{
                  paddingLeft: '30px'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#28a745',
                fontSize: '16px'
              }}>
                📞
              </span>
            </div>

            <div style={{ position: 'relative' }}>
              <input
                type="text"
                placeholder="Website"
                value={formData.website}
                onChange={(e) => handleInputChange('website', e.target.value)}
                className="auth-input"
                style={{
                  paddingLeft: '30px'
                }}
              />
              <span style={{
                position: 'absolute',
                left: '8px',
                top: '50%',
                transform: 'translateY(-50%)',
                color: '#007AFF',
                fontSize: '16px'
              }}>
                🌐
              </span>
            </div>

            {/* Address Fields */}
            <div style={{ marginBottom: '15px' }}>
              <label style={{ display: 'block', marginBottom: '8px', fontWeight: 'bold', color: '#333' }}>Address:</label>

              <input
                type="text"
                placeholder="Street Address"
                value={formData.address.street}
                onChange={(e) => handleAddressChange('street', e.target.value)}
                className="auth-input"
                style={{ marginBottom: '10px' }}
              />

              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginBottom: '10px' }}>
                <input
                  type="text"
                  placeholder="City"
                  value={formData.address.city}
                  onChange={(e) => handleAddressChange('city', e.target.value)}
                  className="auth-input"
                />
                <input
                  type="text"
                  placeholder="ZIP/Postal Code"
                  value={formData.address.zip}
                  onChange={(e) => handleAddressChange('zip', e.target.value)}
                  className="auth-input"
                />
              </div>

              <input
                type="text"
                placeholder="Country"
                value={formData.address.country}
                onChange={(e) => handleAddressChange('country', e.target.value)}
                className="auth-input"
              />
            </div>

            {/* Logo Upload */}
            <div style={{ marginTop: '10px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontWeight: 'bold', color: '#333' }}>Company Logo:</label>
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="auth-input"
                style={{ padding: '8px' }}
              />
              {formData.logo && (
                <div style={{ marginTop: '10px', textAlign: 'center' }}>
                  <img
                    src={formData.logo}
                    alt="Logo Preview"
                    style={{
                      maxWidth: '100px',
                      height: 'auto',
                      borderRadius: '6px',
                      border: '1px solid #ddd'
                    }}
                  />
                </div>
              )}
            </div>

            {/* Social Media Links */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>
                Social Media Links:
                <span style={{ fontSize: '12px', fontWeight: 'normal', color: '#666', marginLeft: '8px' }}>
                  (Just enter your username/handle - we'll format the URLs automatically)
                </span>
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="LinkedIn"
                  value={formData.socialMedia?.linkedin || ''}
                  onChange={(e) => handleSocialMediaChange('linkedin', e.target.value)}
                  className="auth-input"
                  style={{
                    paddingLeft: '30px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#0077b5',
                  fontSize: '16px'
                }}>
                  💼
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Twitter"
                  value={formData.socialMedia?.twitter || ''}
                  onChange={(e) => handleSocialMediaChange('twitter', e.target.value)}
                  className="auth-input"
                  style={{
                    paddingLeft: '30px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#1da1f2',
                  fontSize: '16px'
                }}>
                  🐦
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Facebook"
                  value={formData.socialMedia?.facebook || ''}
                  onChange={(e) => handleSocialMediaChange('facebook', e.target.value)}
                  className="auth-input"
                  style={{
                    paddingLeft: '30px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#4267b2',
                  fontSize: '16px'
                }}>
                  📘
                </span>
              </div>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  placeholder="Instagram"
                  value={formData.socialMedia?.instagram || ''}
                  onChange={(e) => handleSocialMediaChange('instagram', e.target.value)}
                  className="auth-input"
                  style={{
                    paddingLeft: '30px'
                  }}
                />
                <span style={{
                  position: 'absolute',
                  left: '8px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: '#e1306c',
                  fontSize: '16px'
                }}>
                  📷
                </span>
              </div>
            </div>

            {/* Contact Persons */}
            <div style={{ marginTop: '20px' }}>
              <label style={{ display: 'block', marginBottom: '10px', fontWeight: 'bold', color: '#333' }}>Contact Persons:</label>
              {(Array.isArray(formData.contactPersons) ? formData.contactPersons : []).map((person, index) => (
                <div key={index} style={{ marginBottom: '15px', padding: '15px', border: '1px solid #e0e0e0', borderRadius: '8px', backgroundColor: '#f8f9fa' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <h4 style={{ margin: 0, color: '#333' }}>Contact Person {index + 1}</h4>
                    {Array.isArray(formData.contactPersons) && formData.contactPersons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeContactPerson(index)}
                        style={{ background: 'none', border: 'none', color: '#dc3545', cursor: 'pointer', fontSize: '16px' }}
                      >
                        🗑️
                      </button>
                    )}
                  </div>
                  <input
                    type="text"
                    placeholder="Name"
                    value={person.name}
                    onChange={(e) => handleContactPersonChange(index, 'name', e.target.value)}
                    className="auth-input"
                  />
                  <input
                    type="text"
                    placeholder="Job Title"
                    value={person.title}
                    onChange={(e) => handleContactPersonChange(index, 'title', e.target.value)}
                    className="auth-input"
                  />
                  <input
                    type="email"
                    placeholder="Email"
                    value={person.email}
                    onChange={(e) => handleContactPersonChange(index, 'email', e.target.value)}
                    className="auth-input"
                  />
                  <div style={{ position: 'relative' }}>
                    <input
                      type="tel"
                      placeholder="Phone Number"
                      value={person.phone}
                      onChange={(e) => handleContactPersonChange(index, 'phone', e.target.value)}
                      className="auth-input"
                      style={{
                        paddingLeft: '25px'
                      }}
                    />
                    <span style={{
                      position: 'absolute',
                      left: '6px',
                      top: '50%',
                      transform: 'translateY(-50%)',
                      color: '#28a745',
                      fontSize: '14px'
                    }}>
                      📞
                    </span>
                  </div>
                </div>
              ))}
              <button
                type="button"
                onClick={addContactPerson}
                className="auth-button"
                style={{ backgroundColor: '#28a745', marginTop: '10px' }}
              >
                + Add Contact Person
              </button>
            </div>

            <button type="submit" disabled={loading} className="auth-button">
              {loading
                ? (hasProfile ? 'Updating...' : 'Creating...')
                : (hasProfile ? 'Update Profile' : 'Create Profile')
              }
            </button>

            {hasProfile && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="auth-link"
                style={{ marginTop: '10px' }}
              >
                Cancel
              </button>
            )}
          </form>
        )}

        <button
          onClick={() => navigation.navigate('Home')}
          className="auth-link"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

const QRScannerScreen = ({ navigation }: any) => {
  const [scannedData, setScannedData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('prospect');

  const contactCategories = [
    { value: 'prospect', label: '🎯 Prospect', color: '#007AFF' },
    { value: 'partner', label: '🤝 Partner', color: '#28a745' },
    { value: 'client', label: '💼 Client', color: '#6f42c1' },
    { value: 'vendor', label: '🏪 Vendor', color: '#fd7e14' },
    { value: 'investor', label: '💰 Investor', color: '#20c997' },
    { value: 'other', label: '📋 Other', color: '#6c757d' }
  ];

  useEffect(() => {
    // Check for pending QR data from URL
    const pendingData = sessionStorage.getItem('pendingQRData');
    if (pendingData) {
      try {
        const qrData = JSON.parse(pendingData);
        setScannedData(qrData);
        sessionStorage.removeItem('pendingQRData');
      } catch (error) {
        setError('Invalid QR data from URL');
        sessionStorage.removeItem('pendingQRData');
      }
    }
  }, []);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setLoading(true);
    setError('');

    try {
      // Create an image element to load the uploaded file
      const img = new Image();
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      if (!ctx) {
        setError('Canvas not supported');
        setLoading(false);
        return;
      }

      // Read the file as data URL
      const reader = new FileReader();
      reader.onload = (e) => {
        img.onload = () => {
          try {
            // Set canvas dimensions to match image
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image to canvas
            ctx.drawImage(img, 0, 0);

            // Get image data from canvas
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);

            // Use jsQR to decode the QR code
            const qrCode = jsQR(imageData.data, imageData.width, imageData.height);

            if (qrCode) {
              try {
                const qrCodeData = qrCode.data;

                // Check if it's a URL (new format)
                if (qrCodeData.startsWith('http://') || qrCodeData.startsWith('https://')) {
                  // Extract QR data from URL parameter
                  const url = new URL(qrCodeData);
                  const qrParam = url.searchParams.get('qr');

                  if (qrParam) {
                    const qrData = JSON.parse(decodeURIComponent(qrParam));

                    if (qrData.type === 'bitnet_company') {
                      setScannedData(qrData);
                    } else {
                      setError('Invalid QR code: Not a BitNet company QR code');
                    }
                  } else {
                    setError('Invalid QR code: No company data in URL');
                  }
                } else {
                  // Try parsing as JSON (legacy format)
                  const qrData = JSON.parse(qrCodeData);

                  // Validate that it's a BitNet company QR code
                  if (qrData.type === 'bitnet_company') {
                    setScannedData(qrData);
                  } else {
                    setError('Invalid QR code: Not a BitNet company QR code');
                  }
                }
              } catch (parseErr) {
                setError('Invalid QR code: Could not parse company data');
              }
            } else {
              setError('No QR code found in image');
            }
          } catch (err) {
            setError('Failed to process image');
          } finally {
            setLoading(false);
          }
        };

        img.onerror = () => {
          setError('Failed to load image');
          setLoading(false);
        };

        if (e.target?.result) {
          img.src = e.target.result as string;
        }
      };

      reader.onerror = () => {
        setError('Failed to read file');
        setLoading(false);
      };

      reader.readAsDataURL(file);
    } catch (err) {
      setError('Failed to process QR code');
      setLoading(false);
    }
  };

  const handleManualInput = () => {
    const input = prompt('Enter QR code data (JSON format):');
    if (input) {
      try {
        const data = JSON.parse(input);
        setScannedData(data);
      } catch (err) {
        setError('Invalid JSON format');
      }
    }
  };

  return (
    <div className="auth-container scrollable">
      <div className="auth-content" style={{ maxWidth: '600px' }}>
        <h1 className="auth-title">Scan QR Code</h1>
        <p className="auth-subtitle">
          Upload a QR code image or enter QR data manually to connect with other businesses
        </p>

        {!scannedData ? (
          <div className="auth-form" style={{ textAlign: 'center' }}>
            <div style={{
              border: '2px dashed #007AFF',
              borderRadius: '8px',
              padding: '40px 20px',
              marginBottom: '20px',
              backgroundColor: '#f8f9fa'
            }}>
              <p style={{ marginBottom: '20px', color: '#666' }}>
                📷 Upload QR Code Image
              </p>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                style={{
                  marginBottom: '20px',
                  padding: '10px',
                  border: '1px solid #ddd',
                  borderRadius: '4px'
                }}
              />
              {loading && (
                <div style={{ marginTop: '10px' }}>
                  <div className="loading-spinner" style={{ width: '20px', height: '20px' }}></div>
                  <p>Processing QR code...</p>
                </div>
              )}
            </div>

            <button
              onClick={handleManualInput}
              className="auth-button"
              style={{ backgroundColor: '#6c757d', marginBottom: '20px' }}
            >
              Enter QR Data Manually (For Testing)
            </button>

            {error && (
              <p style={{ color: '#dc3545', marginTop: '10px' }}>
                {error}
              </p>
            )}
          </div>
        ) : (
          <div className="company-profile-view">
            <h2 style={{ color: '#28a745', marginBottom: '20px' }}>
              ✅ Company Information Scanned
            </h2>

            <div className="profile-field">
              <strong>Company Name:</strong> {scannedData.name}
            </div>
            <div className="profile-field">
              <strong>Industry:</strong> {scannedData.industry}
            </div>
            {scannedData.description && (
              <div className="profile-field">
                <strong>Description:</strong> {scannedData.description}
              </div>
            )}
            {scannedData.contactEmail && (
              <div className="profile-field">
                <strong>Contact Email:</strong> {scannedData.contactEmail}
              </div>
            )}
            {scannedData.contactPhone && (
              <div className="profile-field">
                <strong>Contact Phone:</strong> {scannedData.contactPhone}
              </div>
            )}
            {scannedData.website && (
              <div className="profile-field">
                <strong>Website:</strong>
                <a href={scannedData.website} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px' }}>
                  {scannedData.website}
                </a>
              </div>
            )}
            {formatFullAddress(scannedData.address) && (
              <div className="profile-field">
                <strong>Address:</strong>
                <div style={{ marginTop: '4px', lineHeight: '1.5' }}>
                  {formatFullAddress(scannedData.address)}
                </div>
              </div>
            )}

            <div className="home-actions">
              <div style={{ marginTop: '20px', marginBottom: '15px' }}>
                <label style={{ display: 'block', marginBottom: '8px', fontWeight: '600', color: '#333' }}>Contact Category:</label>
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="auth-input"
                  style={{ marginBottom: '10px' }}
                >
                  {contactCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>
              <button
                onClick={() => {
                  try {
                    AuthService.saveContact(scannedData, selectedCategory);
                    alert('Contact information saved successfully!');
                  } catch (error) {
                    alert('Failed to save contact information');
                  }
                }}
                className="auth-button"
                style={{ backgroundColor: '#28a745', marginTop: '10px' }}
              >
                Save Contact
              </button>

              <button
                onClick={() => setScannedData(null)}
                className="auth-button"
                style={{ backgroundColor: '#6c757d', marginTop: '10px' }}
              >
                Scan Another QR Code
              </button>
            </div>
          </div>
        )}

        <button
          onClick={() => navigation.navigate('Home')}
          className="auth-link"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

const ContactsScreen = ({ navigation }: any) => {
  const [contacts, setContacts] = useState<any[]>([]);
  const [filteredContacts, setFilteredContacts] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [industryFilter, setIndustryFilter] = useState('all');
  const [expandedContact, setExpandedContact] = useState<number | null>(null);
  const [newNote, setNewNote] = useState('');
  const [newMeeting, setNewMeeting] = useState({ title: '', date: '', time: '', location: '' });
  const [newReminder, setNewReminder] = useState({ title: '', date: '', priority: 'medium' });

  const contactCategories = [
    { value: 'prospect', label: '🎯 Prospect', color: '#007AFF' },
    { value: 'partner', label: '🤝 Partner', color: '#28a745' },
    { value: 'client', label: '💼 Client', color: '#6f42c1' },
    { value: 'vendor', label: '🏪 Vendor', color: '#fd7e14' },
    { value: 'investor', label: '💰 Investor', color: '#20c997' },
    { value: 'other', label: '📋 Other', color: '#6c757d' }
  ];

  useEffect(() => {
    const savedContacts = AuthService.getContacts();
    // Add default category for existing contacts without category
    const contactsWithCategory = savedContacts.map((contact: any) => ({
      ...contact,
      category: contact.category || 'prospect'
    }));
    setContacts(contactsWithCategory);
    setFilteredContacts(contactsWithCategory);
  }, []);

  useEffect(() => {
    let filtered = contacts;

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter((contact: any) =>
        contact.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        contact.industry.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (contact.contactEmail && contact.contactEmail.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (contact.description && contact.description.toLowerCase().includes(searchTerm.toLowerCase()))
      );
    }

    // Apply category filter
    if (categoryFilter !== 'all') {
      filtered = filtered.filter((contact: any) => contact.category === categoryFilter);
    }

    // Apply industry filter
    if (industryFilter !== 'all') {
      filtered = filtered.filter((contact: any) => contact.industry === industryFilter);
    }

    setFilteredContacts(filtered);
  }, [contacts, searchTerm, categoryFilter, industryFilter]);

  const getUniqueIndustries = () => {
    const industries = contacts.map((contact: any) => contact.industry);
    const uniqueIndustries = Array.from(new Set(industries));
    return uniqueIndustries.sort();
  };

  const getCategoryInfo = (category: string) => {
    return contactCategories.find(cat => cat.value === category) || contactCategories[contactCategories.length - 1];
  };

  const exportToCSV = () => {
    if (filteredContacts.length === 0) {
      alert('No contacts to export');
      return;
    }

    const headers = ['Name', 'Category', 'Industry', 'Email', 'Phone', 'Website', 'Address', 'Description', 'Saved Date'];
    const csvContent = [
      headers.join(','),
      ...filteredContacts.map((contact: any) => [
        `"${contact.name || ''}"`,
        `"${contact.category || ''}"`,
        `"${contact.industry || ''}"`,
        `"${contact.contactEmail || ''}"`,
        `"${contact.contactPhone || ''}"`,
        `"${contact.website || ''}"`,
        `"${formatFullAddress(contact.address) || ''}"`,
        `"${(contact.description || '').replace(/"/g, '""')}"`,
        `"${new Date(contact.savedAt).toLocaleDateString()}"`
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bitnet_contacts_${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToVCard = () => {
    if (filteredContacts.length === 0) {
      alert('No contacts to export');
      return;
    }

    const vCardContent = filteredContacts.map((contact: any) => {
      let vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
      vcard += `FN:${contact.name}\n`;
      vcard += `ORG:${contact.name}\n`;
      if (contact.contactEmail) vcard += `EMAIL:${contact.contactEmail}\n`;
      if (contact.contactPhone) vcard += `TEL:${contact.contactPhone}\n`;
      if (contact.website) vcard += `URL:${contact.website}\n`;
      if (formatFullAddress(contact.address)) vcard += `ADR:;;${formatFullAddress(contact.address)};;;;\n`;
      if (contact.description) vcard += `NOTE:${contact.description}\n`;
      vcard += 'END:VCARD\n';
      return vcard;
    }).join('\n');

    const blob = new Blob([vCardContent], { type: 'text/vcard;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `bitnet_contacts_${new Date().toISOString().split('T')[0]}.vcf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleRemoveContact = (companyId: number) => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      AuthService.removeContact(companyId);
      const updatedContacts = AuthService.getContacts();
      const contactsWithCategory = updatedContacts.map((contact: any) => ({
        ...contact,
        category: contact.category || 'prospect'
      }));
      setContacts(contactsWithCategory);
    }
  };

  const addNote = (contactId: number) => {
    if (!newNote.trim()) return;

    const updatedContacts = contacts.map(contact => {
      if (contact.companyId === contactId) {
        const notes = contact.notes || [];
        notes.push({
          id: Date.now(),
          text: newNote,
          date: new Date().toISOString(),
          author: 'You'
        });
        return { ...contact, notes };
      }
      return contact;
    });

    setContacts(updatedContacts);
    setFilteredContacts(updatedContacts);
    AuthService.updateContactNotes(contactId, updatedContacts.find(c => c.companyId === contactId)?.notes);
    setNewNote('');
  };

  const scheduleMeeting = (contactId: number) => {
    if (!newMeeting.title.trim() || !newMeeting.date) return;

    const updatedContacts = contacts.map(contact => {
      if (contact.companyId === contactId) {
        const meetings = contact.meetings || [];
        meetings.push({
          id: Date.now(),
          ...newMeeting,
          status: 'scheduled',
          createdAt: new Date().toISOString()
        });
        return { ...contact, meetings };
      }
      return contact;
    });

    setContacts(updatedContacts);
    setFilteredContacts(updatedContacts);
    AuthService.updateContactMeetings(contactId, updatedContacts.find(c => c.companyId === contactId)?.meetings);
    setNewMeeting({ title: '', date: '', time: '', location: '' });
  };

  const addReminder = (contactId: number) => {
    if (!newReminder.title.trim() || !newReminder.date) return;

    const updatedContacts = contacts.map(contact => {
      if (contact.companyId === contactId) {
        const reminders = contact.reminders || [];
        reminders.push({
          id: Date.now(),
          ...newReminder,
          status: 'active',
          createdAt: new Date().toISOString()
        });
        return { ...contact, reminders };
      }
      return contact;
    });

    setContacts(updatedContacts);
    setFilteredContacts(updatedContacts);
    AuthService.updateContactReminders(contactId, updatedContacts.find(c => c.companyId === contactId)?.reminders);
    setNewReminder({ title: '', date: '', priority: 'medium' });
  };

  const updateConnectionStatus = (contactId: number, status: string) => {
    const updatedContacts = contacts.map(contact => {
      if (contact.companyId === contactId) {
        return {
          ...contact,
          connectionStatus: status,
          lastStatusUpdate: new Date().toISOString()
        };
      }
      return contact;
    });

    setContacts(updatedContacts);
    setFilteredContacts(updatedContacts);
    AuthService.updateConnectionStatus(contactId, status);
  };

  return (
    <div className="auth-container scrollable">
      <div className="auth-content" style={{ maxWidth: '600px' }}>
        <h1 className="auth-title">Saved Contacts</h1>
        <p className="auth-subtitle">
          Companies you've connected with through QR code scanning ({filteredContacts.length} of {contacts.length})
        </p>

        {/* Search and Filter Controls */}
        <div style={{ marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="Search contacts by name, industry, email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="auth-input"
            style={{ marginBottom: '15px' }}
          />

          <div style={{ display: 'flex', gap: '15px', marginBottom: '15px', flexWrap: 'wrap' }}>
            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Category:</label>
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="auth-input"
                style={{ padding: '10px', fontSize: '14px' }}
              >
                <option value="all">All Categories</option>
                {contactCategories.map(cat => (
                  <option key={cat.value} value={cat.value}>{cat.label}</option>
                ))}
              </select>
            </div>

            <div style={{ flex: '1', minWidth: '150px' }}>
              <label style={{ display: 'block', marginBottom: '5px', fontSize: '14px', fontWeight: '600' }}>Industry:</label>
              <select
                value={industryFilter}
                onChange={(e) => setIndustryFilter(e.target.value)}
                className="auth-input"
                style={{ padding: '10px', fontSize: '14px' }}
              >
                <option value="all">All Industries</option>
                {getUniqueIndustries().map(industry => (
                  <option key={industry} value={industry}>{industry}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Export Buttons */}
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <button
              onClick={exportToCSV}
              className="auth-button"
              style={{
                backgroundColor: '#17a2b8',
                fontSize: '14px',
                padding: '10px 20px',
                flex: '1',
                minWidth: '120px'
              }}
              disabled={filteredContacts.length === 0}
            >
              📊 Export CSV
            </button>
            <button
              onClick={exportToVCard}
              className="auth-button"
              style={{
                backgroundColor: '#6f42c1',
                fontSize: '14px',
                padding: '10px 20px',
                flex: '1',
                minWidth: '120px'
              }}
              disabled={filteredContacts.length === 0}
            >
              📇 Export vCard
            </button>
          </div>
        </div>

        {filteredContacts.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: '40px 20px',
            backgroundColor: '#f8f9fa',
            borderRadius: '8px',
            margin: '20px 0'
          }}>
            <p style={{ color: '#666', marginBottom: '20px' }}>
              📋 No saved contacts yet
            </p>
            <p style={{ color: '#666', fontSize: '14px' }}>
              Scan QR codes from other businesses to start building your network!
            </p>
            <button
              onClick={() => navigation.navigate('QRScanner')}
              className="auth-button"
              style={{ marginTop: '20px', backgroundColor: '#6c757d' }}
            >
              Scan QR Code
            </button>
          </div>
        ) : (
          <div>
            {filteredContacts.map((contact, index) => (
              <div key={index} className="company-profile-view" style={{ marginBottom: '20px', border: `2px solid ${getCategoryInfo(contact.category).color}15`, borderLeft: `4px solid ${getCategoryInfo(contact.category).color}` }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <div>
                    <h3 style={{ color: '#007AFF', margin: 0, marginBottom: '5px' }}>{contact.name}</h3>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '5px' }}>
                      <span style={{
                        backgroundColor: getCategoryInfo(contact.category).color,
                        color: 'white',
                        padding: '2px 8px',
                        borderRadius: '12px',
                        fontSize: '12px',
                        fontWeight: '600'
                      }}>
                        {getCategoryInfo(contact.category).label}
                      </span>
                      {/* Connection Status */}
                      <select
                        value={contact.connectionStatus || 'initial'}
                        onChange={(e) => updateConnectionStatus(contact.companyId, e.target.value)}
                        style={{
                          fontSize: '10px',
                          padding: '2px 6px',
                          borderRadius: '8px',
                          border: '1px solid #ddd',
                          backgroundColor: contact.connectionStatus === 'active' ? '#28a745' :
                                         contact.connectionStatus === 'follow-up' ? '#ffc107' :
                                         contact.connectionStatus === 'closed' ? '#dc3545' : '#6c757d',
                          color: 'white'
                        }}
                      >
                        <option value="initial">📧 Initial</option>
                        <option value="contacted">📞 Contacted</option>
                        <option value="active">✅ Active</option>
                        <option value="follow-up">⏰ Follow-up</option>
                        <option value="closed">❌ Closed</option>
                      </select>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: '5px' }}>
                    <button
                      onClick={() => setExpandedContact(expandedContact === contact.companyId ? null : contact.companyId)}
                      style={{
                        backgroundColor: '#007AFF',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      {expandedContact === contact.companyId ? 'Less' : 'More'}
                    </button>
                    <button
                      onClick={() => handleRemoveContact(contact.companyId)}
                      style={{
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        padding: '5px 10px',
                        fontSize: '12px',
                        cursor: 'pointer'
                      }}
                    >
                      Remove
                    </button>
                  </div>
                </div>

                <div className="profile-field">
                  <strong>Industry:</strong> {contact.industry}
                </div>
                {contact.description && (
                  <div className="profile-field">
                    <strong>Description:</strong> {contact.description}
                  </div>
                )}
                {contact.contactEmail && (
                  <div className="profile-field">
                    <strong>Contact Email:</strong>
                    <a href={`mailto:${contact.contactEmail}`} style={{ marginLeft: '8px' }}>
                      {contact.contactEmail}
                    </a>
                  </div>
                )}
                {contact.contactPhone && (
                  <div className="profile-field">
                    <strong>Contact Phone:</strong>
                    <a href={`tel:${contact.contactPhone}`} style={{ marginLeft: '8px' }}>
                      {contact.contactPhone}
                    </a>
                  </div>
                )}
                {contact.website && (
                  <div className="profile-field">
                    <strong>Website:</strong>
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" style={{ marginLeft: '8px' }}>
                      {contact.website}
                    </a>
                  </div>
                )}
                {formatFullAddress(contact.address) && (
                  <div className="profile-field">
                    <strong>Address:</strong>
                    <div style={{ marginTop: '4px', lineHeight: '1.5' }}>
                      {formatFullAddress(contact.address)}
                    </div>
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                  Saved on: {new Date(contact.savedAt).toLocaleDateString()}
                </div>

                {/* Enhanced Features Section */}
                {expandedContact === contact.companyId && (
                  <div style={{ marginTop: '20px', borderTop: '1px solid #eee', paddingTop: '15px' }}>

                    {/* Notes Section */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>📝 Notes ({contact.notes?.length || 0})</h4>
                      {contact.notes && contact.notes.length > 0 && (
                        <div style={{ marginBottom: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                          {contact.notes.map((note: any) => (
                            <div key={note.id} style={{
                              backgroundColor: '#f8f9fa',
                              padding: '8px',
                              marginBottom: '5px',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              <div>{note.text}</div>
                              <div style={{ color: '#666', fontSize: '10px', marginTop: '4px' }}>
                                {new Date(note.date).toLocaleDateString()} - {note.author}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input
                          type="text"
                          value={newNote}
                          onChange={(e) => setNewNote(e.target.value)}
                          placeholder="Add a note..."
                          style={{
                            flex: 1,
                            padding: '6px',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                        <button
                          onClick={() => addNote(contact.companyId)}
                          style={{
                            backgroundColor: '#28a745',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Add
                        </button>
                      </div>
                    </div>

                    {/* Meetings Section */}
                    <div style={{ marginBottom: '20px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>🗓️ Meetings ({contact.meetings?.length || 0})</h4>
                      {contact.meetings && contact.meetings.length > 0 && (
                        <div style={{ marginBottom: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                          {contact.meetings.map((meeting: any) => (
                            <div key={meeting.id} style={{
                              backgroundColor: '#e3f2fd',
                              padding: '8px',
                              marginBottom: '5px',
                              borderRadius: '4px',
                              fontSize: '12px'
                            }}>
                              <div style={{ fontWeight: 'bold' }}>{meeting.title}</div>
                              <div>📅 {meeting.date} {meeting.time && `at ${meeting.time}`}</div>
                              {meeting.location && <div>📍 {meeting.location}</div>}
                              <div style={{ color: '#666', fontSize: '10px', marginTop: '4px' }}>
                                Status: {meeting.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gap: '5px', marginBottom: '5px' }}>
                        <input
                          type="text"
                          value={newMeeting.title}
                          onChange={(e) => setNewMeeting(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Meeting title..."
                          style={{
                            padding: '6px',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                        <input
                          type="date"
                          value={newMeeting.date}
                          onChange={(e) => setNewMeeting(prev => ({ ...prev, date: e.target.value }))}
                          style={{
                            padding: '6px',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                        <input
                          type="time"
                          value={newMeeting.time}
                          onChange={(e) => setNewMeeting(prev => ({ ...prev, time: e.target.value }))}
                          style={{
                            padding: '6px',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', gap: '5px' }}>
                        <input
                          type="text"
                          value={newMeeting.location}
                          onChange={(e) => setNewMeeting(prev => ({ ...prev, location: e.target.value }))}
                          placeholder="Location (optional)..."
                          style={{
                            flex: 1,
                            padding: '6px',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                        <button
                          onClick={() => scheduleMeeting(contact.companyId)}
                          style={{
                            backgroundColor: '#007AFF',
                            color: 'white',
                            border: 'none',
                            borderRadius: '4px',
                            padding: '6px 10px',
                            fontSize: '11px',
                            cursor: 'pointer'
                          }}
                        >
                          Schedule
                        </button>
                      </div>
                    </div>

                    {/* Reminders Section */}
                    <div style={{ marginBottom: '15px' }}>
                      <h4 style={{ margin: '0 0 10px 0', color: '#333', fontSize: '14px' }}>⏰ Follow-up Reminders ({contact.reminders?.length || 0})</h4>
                      {contact.reminders && contact.reminders.length > 0 && (
                        <div style={{ marginBottom: '10px', maxHeight: '150px', overflowY: 'auto' }}>
                          {contact.reminders.map((reminder: any) => (
                            <div key={reminder.id} style={{
                              backgroundColor: reminder.priority === 'high' ? '#fff3cd' : reminder.priority === 'low' ? '#d4edda' : '#f8f9fa',
                              padding: '8px',
                              marginBottom: '5px',
                              borderRadius: '4px',
                              fontSize: '12px',
                              borderLeft: `3px solid ${reminder.priority === 'high' ? '#ffc107' : reminder.priority === 'low' ? '#28a745' : '#007AFF'}`
                            }}>
                              <div style={{ fontWeight: 'bold' }}>{reminder.title}</div>
                              <div>📅 {reminder.date}</div>
                              <div style={{ color: '#666', fontSize: '10px', marginTop: '4px' }}>
                                Priority: {reminder.priority} | Status: {reminder.status}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 100px', gap: '5px' }}>
                        <input
                          type="text"
                          value={newReminder.title}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, title: e.target.value }))}
                          placeholder="Follow-up task..."
                          style={{
                            padding: '6px',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                        <input
                          type="date"
                          value={newReminder.date}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, date: e.target.value }))}
                          style={{
                            padding: '6px',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        />
                        <select
                          value={newReminder.priority}
                          onChange={(e) => setNewReminder(prev => ({ ...prev, priority: e.target.value }))}
                          style={{
                            padding: '6px',
                            fontSize: '12px',
                            border: '1px solid #ddd',
                            borderRadius: '4px'
                          }}
                        >
                          <option value="low">Low</option>
                          <option value="medium">Medium</option>
                          <option value="high">High</option>
                        </select>
                      </div>
                      <button
                        onClick={() => addReminder(contact.companyId)}
                        style={{
                          backgroundColor: '#ffc107',
                          color: '#000',
                          border: 'none',
                          borderRadius: '4px',
                          padding: '6px 10px',
                          fontSize: '11px',
                          cursor: 'pointer',
                          marginTop: '5px',
                          width: '100%'
                        }}
                      >
                        Add Reminder
                      </button>
                    </div>

                  </div>
                )}
              </div>
            ))}
          </div>
        )}

        <button
          onClick={() => navigation.navigate('Home')}
          className="auth-link"
        >
          Back to Home
        </button>
      </div>
    </div>
  );
};

// Bottom Navigation Component
const BottomNavigation = ({ currentScreen, navigation, onLogout }: any) => {
  return (
    <div className="bottom-nav">
      <button
        onClick={() => navigation.navigate('Home')}
        className={`nav-item ${currentScreen === 'Home' ? 'active' : ''}`}
      >
        <div className="nav-icon">🏠</div>
        <div className="nav-label">Home</div>
      </button>

      <button
        onClick={() => navigation.navigate('CompanyProfile')}
        className={`nav-item ${currentScreen === 'CompanyProfile' ? 'active' : ''}`}
      >
        <div className="nav-icon">🏢</div>
        <div className="nav-label">Profile</div>
      </button>

      <button
        onClick={() => navigation.navigate('QRScanner')}
        className={`nav-item ${currentScreen === 'QRScanner' ? 'active' : ''}`}
      >
        <div className="nav-icon">📷</div>
        <div className="nav-label">Scan</div>
      </button>

      <button
        onClick={() => navigation.navigate('Contacts')}
        className={`nav-item ${currentScreen === 'Contacts' ? 'active' : ''}`}
      >
        <div className="nav-icon">👥</div>
        <div className="nav-label">Contacts</div>
      </button>

      <button
        onClick={onLogout}
        className="nav-item"
      >
        <div className="nav-icon">🚪</div>
        <div className="nav-label">Logout</div>
      </button>
    </div>
  );
};

const HomeScreen = ({ user, onLogout, navigation }: any) => {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Welcome to BitNet!</h1>
        <div className="user-info">
          <p className="user-name">{user?.firstName} {user?.lastName}</p>
          {user?.company && <p className="user-company">{user.company}</p>}
          {user?.jobTitle && <p className="user-job">{user.jobTitle}</p>}
        </div>
      </div>

      <div className="home-content">
        <h2 className="home-subtitle">Your B2B networking platform is ready!</h2>
        <p className="home-description">
          Connect with professionals, attend events, and grow your network.
        </p>

        <div className="home-actions-grid">
          <button
            onClick={() => navigation.navigate('CompanyProfile')}
            className="home-action-button company-button"
          >
            <div style={{ marginBottom: '8px', fontSize: '24px' }}>🏢</div>
            Manage Company Profile
          </button>

          <button
            onClick={() => navigation.navigate('QRScanner')}
            className="home-action-button scanner-button"
          >
            <div style={{ marginBottom: '8px', fontSize: '24px' }}>📷</div>
            Scan QR Code
          </button>

          <button
            onClick={() => navigation.navigate('Contacts')}
            className="home-action-button contacts-button"
          >
            <div style={{ marginBottom: '8px', fontSize: '24px' }}>👥</div>
            View Saved Contacts
          </button>

          <button
            onClick={() => navigation.navigate('Settings')}
            className="home-action-button"
            style={{ background: 'linear-gradient(135deg, var(--gray-600), var(--gray-700))' }}
          >
            <div style={{ marginBottom: '8px', fontSize: '24px' }}>⚙️</div>
            Settings
          </button>
        </div>
      </div>
    </div>
  );
};

const SettingsScreen = ({ navigation, user, onLogout }: any) => {
  const handleLogout = async () => {
    try {
      await AuthService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  return (
    <div className="screen">
      <div className="screen-header">
        <button onClick={() => navigation.navigate('Home')} className="back-button">
          ← Back
        </button>
        <h1>Settings</h1>
      </div>

      <div className="screen-content">
        <div className="form-section">
          <h2>Account Information</h2>
          <div className="info-item">
            <label>Name:</label>
            <span>{user?.firstName} {user?.lastName}</span>
          </div>
          <div className="info-item">
            <label>Email:</label>
            <span>{user?.email}</span>
          </div>
        </div>

        <div className="form-section">
          <h2>App Information</h2>
          <div className="info-item">
            <label>Version:</label>
            <span>1.5.0</span>
          </div>
          <div className="info-item">
            <label>Build:</label>
            <span>Sprint 1.5</span>
          </div>
        </div>

        <div className="form-section">
          <h2>Quick Actions</h2>
          <button
            onClick={() => navigation.navigate('CompanyProfile')}
            className="settings-action-button"
          >
            🏢 Edit Company Profile
          </button>
          <button
            onClick={() => navigation.navigate('QRScanner')}
            className="settings-action-button"
          >
            📱 Scan QR Code
          </button>
          <button
            onClick={() => navigation.navigate('Contacts')}
            className="settings-action-button"
          >
            👥 View Contacts
          </button>
        </div>

        <div className="form-section">
          <button onClick={handleLogout} className="logout-button">
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

function App() {
  const [currentScreen, setCurrentScreen] = useState('Login');
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [resetToken, setResetToken] = useState('');

  const navigation = {
    navigate: (screen: string, params?: any) => {
      setCurrentScreen(screen);
      if (params && screen === 'ResetPassword') {
        setResetToken(params.token);
      }
    }
  };

  useEffect(() => {
    checkAuthStatus();

    // Check for reset token in URL
    const urlParams = new URLSearchParams(window.location.search);
    const tokenParam = urlParams.get('token');
    const qrParam = urlParams.get('qr');

    if (tokenParam) {
      setResetToken(tokenParam);
      setCurrentScreen('ResetPassword');
    } else if (qrParam) {
      // Handle QR code data from URL
      try {
        const qrData = JSON.parse(decodeURIComponent(qrParam));
        // Store QR data temporarily and navigate to scanner
        sessionStorage.setItem('pendingQRData', JSON.stringify(qrData));
        setCurrentScreen('QRScanner');
      } catch (error) {
        console.error('Invalid QR data in URL:', error);
      }
    }
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await AuthService.isAuthenticated();
      if (isAuth) {
        const userData = await AuthService.getUser();
        setUser(userData);
        setCurrentScreen('Home');
      }
    } catch (error) {
      console.error('Auth check error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = (userData: any) => {
    setUser(userData);
    setCurrentScreen('Home');
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentScreen('Login');
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading BitNet...</p>
      </div>
    );
  }

  return (
    <div className="App">
      {currentScreen === 'Login' && (
        <LoginScreen onLogin={handleLogin} navigation={navigation} />
      )}
      {currentScreen === 'Register' && (
        <RegisterScreen onLogin={handleLogin} navigation={navigation} />
      )}
      {currentScreen === 'ForgotPassword' && (
        <ForgotPasswordScreen navigation={navigation} />
      )}
      {currentScreen === 'ResetPassword' && (
        <ResetPasswordScreen navigation={navigation} token={resetToken} />
      )}
      {currentScreen === 'CompanyProfile' && (
        <CompanyProfileScreen navigation={navigation} />
      )}
      {currentScreen === 'QRScanner' && (
        <QRScannerScreen navigation={navigation} />
      )}
      {currentScreen === 'Contacts' && (
        <ContactsScreen navigation={navigation} />
      )}
      {currentScreen === 'Home' && (
        <HomeScreen user={user} onLogout={handleLogout} navigation={navigation} />
      )}
      {currentScreen === 'Settings' && (
        <SettingsScreen user={user} onLogout={handleLogout} navigation={navigation} />
      )}
    </div>
  );
}

export default App;
