import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import HomeScreen from '../screens/HomeScreen';

const Stack = createStackNavigator();

const AppNavigator = ({ user, onLogout }) => {
  return (
    <Stack.Navigator
      initialRouteName="Home"
      screenOptions={{
        headerStyle: {
          backgroundColor: '#007AFF',
        },
        headerTintColor: '#fff',
        headerTitleStyle: {
          fontWeight: 'bold',
        },
      }}
    >
      <Stack.Screen
        name="Home"
        options={{ title: 'BitNet' }}
      >
        {props => <HomeScreen {...props} user={user} onLogout={onLogout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
};

export default AppNavigator;