import { Tabs } from 'expo-router';
import { Home, Search, User, Settings, Car, Calendar } from 'lucide-react-native';
import { useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '../../stores/userStore';

export default function TabLayout() {
  const [userType, setUserType] = useState<string | null>(null);
  const storeUserType = useUserStore((state) => state.userType);
  
  useEffect(() => {
    // Check for user type in AsyncStorage
    const checkUserType = async () => {
      try {
        const storedUserType = await AsyncStorage.getItem('userType');
        console.log('UserType from AsyncStorage:', storedUserType);
        setUserType(storedUserType);
      } catch (error) {
        console.error('Error reading user type from storage:', error);
      }
    };
    
    checkUserType();
  }, []);

  // Use either the AsyncStorage value or the store value
  const effectiveUserType = userType || storeUserType;
  console.log('Effective user type:', effectiveUserType);
  
  const isOwner = effectiveUserType === 'owner';
  console.log('Is owner:', isOwner);

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: '#007AFF',
        tabBarInactiveTintColor: '#8E8E93',
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 0,
          elevation: 8,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.1,
          shadowRadius: 8,
          height: 85,
          paddingBottom: 25,
          paddingTop: 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontFamily: 'Inter-Medium',
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ size, color }) => (
            <Home size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: 'Search',
          tabBarIcon: ({ size, color }) => (
            <Search size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="dashboard"
        options={{
          title: 'Dashboard',
          tabBarIcon: ({ size, color }) => (
            <Car size={size} color={color} />
          ),
          // Only show dashboard tab for owners
          href: isOwner ? undefined : null,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Profile',
          tabBarIcon: ({ size, color }) => (
            <User size={size} color={color} />
          ),
          // Redirect to appropriate profile screen
          href: isOwner ? '/(tabs)/profile' : '/(tabs)/userProfile',
        }}
      />

      <Tabs.Screen
        name="userProfile"
        options={{
          // Hide this from tab bar
          href: null,
        }}
      />

      <Tabs.Screen
        name="rental_history"
        options={{
          title: 'History',
          tabBarIcon: ({ size, color }) => (
            <Calendar size={size} color={color} />
          ),
          // Route to appropriate history screen based on user type
          href: isOwner ? '/(tabs)/rental_history' : '/(tabs)/customer_rental_history',
        }}
      />
      <Tabs.Screen
        name="customer_rental_history"
        options={{
          // Hide this from tab bar
          href: null,
        }}
      />
      <Tabs.Screen
        name="more"
        options={{
          title: 'More',
          tabBarIcon: ({ size, color }) => (
            <Settings size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="payment"
        options={{
          href: null, // This hides the tab from the tab bar
        }}
      />
    </Tabs>
  );
}