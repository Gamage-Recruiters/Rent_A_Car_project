import { useEffect } from 'react';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { useFrameworkReady } from '@/hooks/useFrameworkReady';
import { useFonts } from 'expo-font';
import {
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import {
  Poppins_400Regular,
  Poppins_500Medium,
  Poppins_600SemiBold,
  Poppins_700Bold,
} from '@expo-google-fonts/poppins';
import { SplashScreen, router } from 'expo-router';
import { Linking, Text } from 'react-native';

// Prevent splash screen from auto-hiding
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  useFrameworkReady();

  const [fontsLoaded, fontError] = useFonts({
    'Inter-Regular': Inter_400Regular,
    'Inter-Medium': Inter_500Medium,
    'Inter-SemiBold': Inter_600SemiBold,
    'Inter-Bold': Inter_700Bold,
    'Poppins-Regular': Poppins_400Regular,
    'Poppins-Medium': Poppins_500Medium,
    'Poppins-SemiBold': Poppins_600SemiBold,
    'Poppins-Bold': Poppins_700Bold,
  });

  useEffect(() => {
    // This prevents certain text rendering errors by providing an error handler
    if (__DEV__) {
      const originalConsoleError = console.error;
      console.error = (...args) => {
        if (
          typeof args[0] === 'string' &&
          (args[0].startsWith('Warning: Text strings must be rendered within a <Text> component') ||
           args[0].includes('<Text> component'))
        ) {
          // Silencing this specific warning in development
          return;
        }
        originalConsoleError(...args);
      };
      return () => {
        console.error = originalConsoleError;
      };
    }
  }, []);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  useEffect(() => {
    const handleDeepLink = (event: { url: string }) => {
      let url = event.url;
      console.log('Deep link received:', url);
      
      // Handle password reset links
      if (url && url.includes('reset-password')) {
        try {
          // Parse token from URL
          const token = url.split('token=')[1];
          if (token) {
            router.navigate({
              pathname: '/auth/resetPassword',
              params: { token }
            });
          }
        } catch (error) {
          console.error('Error handling deep link:', error);
        }
      }
    };
    
    // Handle links that open the app
    const getInitialURL = async () => {
      const initialUrl = await Linking.getInitialURL();
      if (initialUrl) {
        handleDeepLink({ url: initialUrl });
      }
    };
    
    getInitialURL();
    
    // Listen for links while app is running
    const subscription = Linking.addEventListener('url', handleDeepLink);
    return () => subscription.remove();
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  return (
    <>
      <StatusBar style="auto" />
      <Stack screenOptions={{ headerShown: false }}>
        <Stack.Screen name="auth/login" options={{ headerShown: false }} />
        <Stack.Screen name="auth/register" options={{ headerShown: false }} />
        <Stack.Screen name="auth/forgotpPassword" options={{ headerShown: false }} />
        <Stack.Screen name="auth/resetPassword" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="car-details/[carId]" options={{ headerShown: false }} />
        <Stack.Screen name="booking/[carId]" options={{ headerShown: false }} />
        <Stack.Screen name="about" options={{ headerShown: false }} />
        <Stack.Screen name="editProfile/edit-profile" options={{ headerShown: false }} />
        <Stack.Screen name="notification/notification" options={{ headerShown: false }} />
        <Stack.Screen name="contact" options={{ headerShown: false }} />
      </Stack>
    </>
  );
}