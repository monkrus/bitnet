import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import AuthService from '../services/authService';

const HomeScreen = ({ user, onLogout }) => {
  const handleLogout = async () => {
    try {
      console.log('Direct logout - starting...');

      // Clear storage directly
      if (typeof window !== 'undefined') {
        localStorage.removeItem('authToken');
        localStorage.removeItem('userData');
        console.log('Cleared localStorage directly');
      }

      // Call AuthService logout
      await AuthService.logout();
      console.log('AuthService logout completed');

      // Call the parent logout callback
      onLogout();
      console.log('Parent onLogout called');

    } catch (error) {
      console.error('Logout error:', error);
      // Force logout anyway
      onLogout();
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.welcomeText}>Welcome to BitNet!</Text>
        <Text style={styles.userInfo}>
          {user?.firstName} {user?.lastName}
        </Text>
        {user?.company && (
          <Text style={styles.companyText}>{user.company}</Text>
        )}
        {user?.jobTitle && (
          <Text style={styles.jobText}>{user.jobTitle}</Text>
        )}
      </View>

      <View style={styles.content}>
        <Text style={styles.subtitle}>
          Your B2B networking platform is ready!
        </Text>
        <Text style={styles.description}>
          Connect with professionals, attend events, and grow your network.
        </Text>
      </View>

      <View style={styles.footer}>
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutButtonText}>Logout (Direct)</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.logoutButton, {backgroundColor: '#007AFF', marginTop: 10}]}
          onPress={() => {
            console.log('Test button clicked - calling onLogout directly');
            onLogout();
          }}
        >
          <Text style={styles.logoutButtonText}>Test Logout Callback</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    padding: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 50,
    marginBottom: 40,
  },
  welcomeText: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 10,
  },
  userInfo: {
    fontSize: 20,
    color: '#007AFF',
    fontWeight: '600',
    marginBottom: 5,
  },
  companyText: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  jobText: {
    fontSize: 16,
    color: '#666',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
    textAlign: 'center',
    marginBottom: 15,
  },
  description: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
  },
  footer: {
    paddingBottom: 20,
  },
  logoutButton: {
    backgroundColor: '#FF3B30',
    borderRadius: 8,
    padding: 15,
    alignItems: 'center',
  },
  logoutButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
});

export default HomeScreen;