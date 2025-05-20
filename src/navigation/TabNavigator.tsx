import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import HomeScreen from '../screens/HomeScreen';
import ProfileScreen from '../screens/ProfileScreen';
import GoScreen from '../screens/GoScreen';
import MessagesScreen from '../screens/MessagesScreen';
import NotificationsScreen from '../screens/NotificationsScreen';

/*
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { View, Text } from 'react-native';

const Tab = createBottomTabNavigator();

const PlaceholderScreen = ({ title }: { title: string }) => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>{title} Screen Coming Soon!</Text>
  </View>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarStyle: { backgroundColor: '#f5f1fa', height: 100 },
        tabBarLabelStyle: { fontSize: 12, marginBottom: 5 },
        tabBarIcon: ({ focused, color, size }) => {
          if (route.name === 'Home') {
            return <Ionicons name="image-outline" size={24} color={color} />;
          } else if (route.name === 'Go') {
            return <MaterialIcons name="commute" size={24} color={color} />;
          } else if (route.name === 'Message') {
            return <Feather name="bell" size={24} color={color} />;
          } else if (route.name === 'User') {
            return <Feather name="user" size={24} color={color} />;
          }
        },
        tabBarActiveTintColor: '#6e5be0',
        tabBarInactiveTintColor: '#333',
        tabBarActiveBackgroundColor: '#e8e2fc',
        tabBarItemStyle: { borderRadius: 15, margin: 5 },
      })}
    >
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Go" component={GoScreen} />
      <Tab.Screen name="Message" component={MessagesScreen} />
      <Tab.Screen name="User" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

export default TabNavigator;
*/
import { Ionicons, MaterialIcons, Feather } from '@expo/vector-icons';
import { SafeAreaView, View, TouchableOpacity, StyleSheet, Text, Platform } from 'react-native';

const Tab = createBottomTabNavigator();

const CustomHomeButton = ({ children, onPress }: any) => (
  <TouchableOpacity
    style={styles.customHomeButton}
    onPress={onPress}
    activeOpacity={0.8}
  >
    {children}
  </TouchableOpacity>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: styles.tabBar,
        tabBarIcon: ({ color, size, focused }) => {
          if (route.name === 'Go') {
            return <MaterialIcons name="commute" size={24} color={color} />;
          } else if (route.name === 'Message') {
            return <Feather name="message-circle" size={24} color={color} />;
          } else if (route.name === 'Home') {
            return <Ionicons name="home" size={30} color="#fff" />;
          } else if (route.name === 'Notifications') {
            return <Ionicons name="notifications-outline" size={24} color={color} />;
          } else if (route.name === 'User') {
            return <Feather name="user" size={24} color={color} />;
          }
        },
        tabBarActiveTintColor: '#6e5be0',
        tabBarInactiveTintColor: '#333',
      })}
    >
      <Tab.Screen name="Go" component={GoScreen} />
      <Tab.Screen name="Message" component={MessagesScreen} options={{ headerShown: true, title: 'Messages' }}/>
      
      <Tab.Screen
        name="Home"
        component={HomeScreen}
        options={{
          tabBarButton: (props) => <CustomHomeButton {...props} />,
        }}
      />
      <Tab.Screen name="Notifications" component={NotificationsScreen} options={{ headerShown: true, title: 'Notifications' }}/>
      
      <Tab.Screen name="User" component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBar: {
    position: 'absolute',
    height: 70,
    backgroundColor: '#f5f1fa',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingHorizontal: 10,
    paddingBottom: Platform.OS === 'android' ? 100 : 30,
  },
  customHomeButton: {
    top: -20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#6e5be0',
    width: 60,
    height: 60,
    borderRadius: 30,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
});

export default TabNavigator;
