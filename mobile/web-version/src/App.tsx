import React, { useState, useEffect } from 'react';
import './App.css';
import jsQR from 'jsqr';

// Mock AuthService for web
const AuthService = {
  async login(email: string, password: string) {
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async register(userData: any) {
    const response = await fetch('http://localhost:3001/api/auth/register', {
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
    const response = await fetch('http://localhost:3001/api/auth/forgot-password', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email }),
    });
    const data = await response.json();
    if (!response.ok) throw new Error(data.error);
    return data;
  },

  async resetPassword(token: string, newPassword: string) {
    const response = await fetch('http://localhost:3001/api/auth/reset-password', {
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
    const response = await fetch('http://localhost:3001/api/companies', {
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
    const response = await fetch('http://localhost:3001/api/companies/my-profile', {
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
    const response = await fetch('http://localhost:3001/api/companies/my-profile', {
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
    const response = await fetch('http://localhost:3001/api/companies', {
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
    const response = await fetch('http://localhost:3001/api/companies/my-profile/qr', {
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
    const response = await fetch(`http://localhost:3001/api/companies/${companyId}`, {
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
  saveContact(contact: any) {
    const contacts = this.getContacts();
    const existingIndex = contacts.findIndex((c: any) => c.companyId === contact.companyId);

    if (existingIndex >= 0) {
      contacts[existingIndex] = { ...contact, savedAt: new Date().toISOString() };
    } else {
      contacts.push({ ...contact, savedAt: new Date().toISOString() });
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
    address: ''
  });
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

  const loadCompanyProfile = async () => {
    try {
      const result = await AuthService.getCompanyProfile();
      setFormData(result.company);
      setHasProfile(true);
    } catch (error: any) {
      if (error.message !== 'Company profile not found') {
        console.error('Load profile error:', error);
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name || !formData.industry) {
      alert('Company name and industry are required');
      return;
    }

    setLoading(true);
    try {
      if (hasProfile) {
        await AuthService.updateCompanyProfile(formData);
        alert('Company profile updated successfully!');
      } else {
        await AuthService.createCompanyProfile(formData);
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
      setQrCode(response.qrCode);
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

        {hasProfile && !isEditing ? (
          <div className="company-profile-view">
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
                <strong>Contact Email:</strong> {formData.contactEmail}
              </div>
            )}
            {formData.contactPhone && (
              <div className="profile-field">
                <strong>Contact Phone:</strong> {formData.contactPhone}
              </div>
            )}
            {formData.website && (
              <div className="profile-field">
                <strong>Website:</strong> {formData.website}
              </div>
            )}
            {formData.address && (
              <div className="profile-field">
                <strong>Address:</strong> {formData.address}
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

            <select
              value={formData.industry}
              onChange={(e) => handleInputChange('industry', e.target.value)}
              className="auth-input"
              required
            >
              <option value="">Select Industry *</option>
              {industries.map(industry => (
                <option key={industry} value={industry}>{industry}</option>
              ))}
            </select>

            <textarea
              placeholder="Company Description"
              value={formData.description}
              onChange={(e) => handleInputChange('description', e.target.value)}
              className="auth-input"
              rows={4}
              style={{ resize: 'vertical', minHeight: '100px' }}
            />

            <input
              type="email"
              placeholder="Contact Email (suggested from your login email)"
              value={formData.contactEmail}
              onChange={(e) => handleInputChange('contactEmail', e.target.value)}
              className="auth-input"
            />

            <input
              type="tel"
              placeholder="Contact Phone"
              value={formData.contactPhone}
              onChange={(e) => handleInputChange('contactPhone', e.target.value)}
              className="auth-input"
            />

            <input
              type="text"
              placeholder="Website (https://example.com)"
              value={formData.website}
              onChange={(e) => handleInputChange('website', e.target.value)}
              className="auth-input"
            />

            <textarea
              placeholder="Address"
              value={formData.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              className="auth-input"
              rows={3}
              style={{ resize: 'vertical', minHeight: '80px' }}
            />

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
                // Parse the QR code data as JSON
                const qrData = JSON.parse(qrCode.data);

                // Validate that it's a BitNet company QR code
                if (qrData.type === 'bitnet_company') {
                  setScannedData(qrData);
                } else {
                  setError('Invalid QR code: Not a BitNet company QR code');
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
                <strong>Website:</strong> {scannedData.website}
              </div>
            )}
            {scannedData.address && (
              <div className="profile-field">
                <strong>Address:</strong> {scannedData.address}
              </div>
            )}

            <div className="home-actions">
              <button
                onClick={() => {
                  try {
                    AuthService.saveContact(scannedData);
                    alert('Contact information saved successfully!');
                  } catch (error) {
                    alert('Failed to save contact information');
                  }
                }}
                className="auth-button"
                style={{ backgroundColor: '#28a745', marginTop: '20px' }}
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

  useEffect(() => {
    const savedContacts = AuthService.getContacts();
    setContacts(savedContacts);
  }, []);

  const handleRemoveContact = (companyId: number) => {
    if (window.confirm('Are you sure you want to remove this contact?')) {
      AuthService.removeContact(companyId);
      const updatedContacts = AuthService.getContacts();
      setContacts(updatedContacts);
    }
  };

  return (
    <div className="auth-container scrollable">
      <div className="auth-content" style={{ maxWidth: '600px' }}>
        <h1 className="auth-title">Saved Contacts</h1>
        <p className="auth-subtitle">
          Companies you've connected with through QR code scanning
        </p>

        {contacts.length === 0 ? (
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
            {contacts.map((contact, index) => (
              <div key={index} className="company-profile-view" style={{ marginBottom: '20px' }}>
                <div style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  marginBottom: '15px'
                }}>
                  <h3 style={{ color: '#007AFF', margin: 0 }}>{contact.name}</h3>
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
                    <a href={`mailto:${contact.contactEmail}`} style={{ color: '#007AFF', marginLeft: '8px' }}>
                      {contact.contactEmail}
                    </a>
                  </div>
                )}
                {contact.contactPhone && (
                  <div className="profile-field">
                    <strong>Contact Phone:</strong>
                    <a href={`tel:${contact.contactPhone}`} style={{ color: '#007AFF', marginLeft: '8px' }}>
                      {contact.contactPhone}
                    </a>
                  </div>
                )}
                {contact.website && (
                  <div className="profile-field">
                    <strong>Website:</strong>
                    <a href={contact.website} target="_blank" rel="noopener noreferrer" style={{ color: '#007AFF', marginLeft: '8px' }}>
                      {contact.website}
                    </a>
                  </div>
                )}
                {contact.address && (
                  <div className="profile-field">
                    <strong>Address:</strong> {contact.address}
                  </div>
                )}
                <div style={{ fontSize: '12px', color: '#666', marginTop: '10px' }}>
                  Saved on: {new Date(contact.savedAt).toLocaleDateString()}
                </div>
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

const HomeScreen = ({ user, onLogout, navigation }: any) => {
  const handleLogout = async () => {
    try {
      await AuthService.logout();
      onLogout();
    } catch (error) {
      console.error('Logout error:', error);
      onLogout();
    }
  };

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

        <div className="home-actions">
          <button
            onClick={() => navigation.navigate('CompanyProfile')}
            className="auth-button"
            style={{ marginBottom: '20px' }}
          >
            Manage Company Profile
          </button>

          <button
            onClick={() => navigation.navigate('QRScanner')}
            className="auth-button"
            style={{
              marginBottom: '20px',
              backgroundColor: '#6c757d'
            }}
          >
            Scan QR Code
          </button>

          <button
            onClick={() => navigation.navigate('Contacts')}
            className="auth-button"
            style={{
              marginBottom: '20px',
              backgroundColor: '#17a2b8'
            }}
          >
            View Saved Contacts
          </button>
        </div>
      </div>

      <div className="home-footer">
        <button onClick={handleLogout} className="logout-button">
          Logout
        </button>
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
    if (tokenParam) {
      setResetToken(tokenParam);
      setCurrentScreen('ResetPassword');
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
    </div>
  );
}

export default App;
