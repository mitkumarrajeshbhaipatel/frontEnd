import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Context Providers
import { AuthProvider } from './src/contexts/AuthContext';
import { SessionProvider } from './src/contexts/SessionContext';
import { ProfileProvider } from './src/contexts/ProfileContext';
import { NotificationProvider } from './src/contexts/NotificationContext';

// Main Tab Navigator
import TabNavigator from './src/navigation/TabNavigator';

// Screens
import SplashScreen from './src/screens/SplashScreen'; 
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import MatchRequestScreen from './src/screens/MatchRequestScreen';
import ResponseScreen from './src/screens/ResponseScreen';
import SessionScreen from './src/screens/SessionScreen';
import GoScreen from './src/screens/GoScreen';
import SessionChatScreen from './src/screens/SessionChatScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import NotificationsScreen from './src/screens/NotificationsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import RatingScreen from './src/screens/RatingScreen';
import ReportScreen from './src/screens/ReportScreen'
import NearbyUserScreen from './src/screens/NearbyUserScreen';

// Create Stack Navigator
const Stack = createNativeStackNavigator();

export default function App() {
  return (
    <ProfileProvider>
    <AuthProvider>
      <SessionProvider>
        <NotificationProvider>
        <SafeAreaProvider>
          <NavigationContainer>
            <Stack.Navigator

                    initialRouteName="Splash"  // Set SplashScreen as initial route
                    screenOptions={{
                    headerTitleAlign: 'center',
                    headerStyle: {
                        backgroundColor: '#fafafa',
                        elevation: 0,
                        shadowColor: 'transparent',
                    },
                    headerTitleStyle: {
                        fontWeight: '600',
                        fontSize: 18,
                        color: '#333',
                    },
                    headerBackTitleVisible: false,
                    headerTintColor: '#4e8cff', // Back button color
                    }}
                    >
                {/* Splash Screen */}
                    <Stack.Screen
                    name="Splash"
                    component={SplashScreen}
                    options={{ headerShown: false }}
                />

              
              {/* Authentication Flow */}
              <Stack.Screen
                name="Login"
                component={LoginScreen}
                options={{ headerShown: false }}
              />
              <Stack.Screen
                name="Register"
                component={RegisterScreen}
                options={{ headerShown: false }}
              />

              {/* Main App Flow */}
              <Stack.Screen
                name="Main"
                component={TabNavigator}
                options={{ headerShown: false }}
              />

              {/* Feature Screens */}
              <Stack.Screen
                name="MatchRequest"
                component={MatchRequestScreen}
                options={{ headerShown: true, title: 'Send Request' }}
              />
              <Stack.Screen
                name="ResponceRequest"
                component={ResponseScreen}
                options={{ headerShown: true, title: 'Respond to Request' }}
              />
              <Stack.Screen
                name="Session"
                component={SessionScreen}
                options={{ headerShown: true, title: 'Active Session' }}
              />
              <Stack.Screen
                name="NearbyUser"
                component={NearbyUserScreen}
                options={{ headerShown: true, title: 'Nearby Users' }}
                />
              <Stack.Screen
                name="GoScreen"
                component={GoScreen}
                options={{ headerShown: false, title: 'Navigate to Request' }}
              />
              <Stack.Screen
                name="SessionChat"
                component={SessionChatScreen}
                options={{ headerShown: true }}
              />
              <Stack.Screen
                name="Profile"
                component={ProfileScreen}
                options={{ headerShown: false}}
              />
              <Stack.Screen
                name="Notifications"
                component={NotificationsScreen}
                options={{ headerShown: true, title: 'Notifications' }}
              />
              <Stack.Screen
                name="History"
                component={HistoryScreen}
                options={{ headerShown: false, title: 'History' }}
              />
              <Stack.Screen
                name="Rating"
                component={RatingScreen}
                options={{ headerShown: false, title: 'Rate Session' }}
              />
              <Stack.Screen
                name="Report"
                component={ReportScreen}
                options={{ headerShown: true, title: 'Report' }}
              />
            </Stack.Navigator>
          </NavigationContainer>
        </SafeAreaProvider>
        </NotificationProvider>
      </SessionProvider>  
    </AuthProvider>
    </ProfileProvider>
  );
}
