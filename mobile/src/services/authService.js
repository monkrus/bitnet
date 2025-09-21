import AsyncStorage from '@react-native-async-storage/async-storage';

// Use the working simple auth server
const API_BASE_URL = 'http://localhost:3001/api';

class AuthService {
  async register(userData) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(userData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed');
      }

      await this.storeToken(data.token);
      await this.storeUser(data.user);

      return data;
    } catch (error) {
      console.error('Registration error:', error);
      throw error;
    }
  }

  async login(email, password) {
    try {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Login failed');
      }

      await this.storeToken(data.token);
      await this.storeUser(data.user);

      return data;
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  }

  async logout() {
    try {
      console.log('Logging out user...');

      // For web compatibility, try both AsyncStorage and localStorage
      if (typeof window !== 'undefined') {
        // Web environment - use localStorage as backup
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        console.log('Cleared localStorage');
      }

      // Also clear AsyncStorage
      await AsyncStorage.multiRemove(['authToken', 'userData']);
      console.log('Cleared AsyncStorage');

    } catch (error) {
      console.error('Logout error:', error);
      // Don't throw error - logout should work even if storage fails
    }
  }

  async getToken() {
    try {
      let token = await AsyncStorage.getItem('authToken');

      // Fallback to localStorage for web
      if (!token && typeof window !== 'undefined') {
        token = localStorage.getItem('authToken');
      }

      return token;
    } catch (error) {
      console.error('Get token error:', error);
      return null;
    }
  }

  async getUser() {
    try {
      let userData = await AsyncStorage.getItem('userData');

      // Fallback to localStorage for web
      if (!userData && typeof window !== 'undefined') {
        userData = localStorage.getItem('userData');
      }

      return userData ? JSON.parse(userData) : null;
    } catch (error) {
      console.error('Get user error:', error);
      return null;
    }
  }

  async storeToken(token) {
    try {
      await AsyncStorage.setItem('authToken', token);

      // Also store in localStorage for web
      if (typeof window !== 'undefined') {
        localStorage.setItem('authToken', token);
      }
    } catch (error) {
      console.error('Store token error:', error);
      throw error;
    }
  }

  async storeUser(user) {
    try {
      const userString = JSON.stringify(user);
      await AsyncStorage.setItem('userData', userString);

      // Also store in localStorage for web
      if (typeof window !== 'undefined') {
        localStorage.setItem('userData', userString);
      }
    } catch (error) {
      console.error('Store user error:', error);
      throw error;
    }
  }

  async isAuthenticated() {
    try {
      const token = await this.getToken();
      return !!token;
    } catch (error) {
      console.error('Check auth error:', error);
      return false;
    }
  }

  async getProfile() {
    try {
      const token = await this.getToken();
      if (!token) {
        throw new Error('No auth token found');
      }

      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to get profile');
      }

      await this.storeUser(data.user);
      return data.user;
    } catch (error) {
      console.error('Get profile error:', error);
      throw error;
    }
  }
}

export default new AuthService();