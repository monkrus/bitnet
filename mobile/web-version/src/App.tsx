import React, { useState, useEffect } from 'react';
import './App.css';

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
  }
};

const LoginScreen = ({ onLogin, navigation }: any) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

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
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
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
          <input
            type="password"
            placeholder="Password *"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="password"
            placeholder="Confirm Password *"
            value={formData.confirmPassword}
            onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
            className="auth-input"
            required
          />
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
          <input
            type="password"
            placeholder="New Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="auth-input"
            required
          />
          <input
            type="password"
            placeholder="Confirm New Password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="auth-input"
            required
          />
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

const HomeScreen = ({ user, onLogout }: any) => {
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
      {currentScreen === 'Home' && (
        <HomeScreen user={user} onLogout={handleLogout} />
      )}
    </div>
  );
}

export default App;
