import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Image,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Eye, EyeOff } from 'lucide-react-native';
import { router } from 'expo-router';
import axios from 'axios';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const scaleValue = useSharedValue(1);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Please enter your email and password');
      return;
    }

    setIsLoading(true);

    try {
      // API call
      const endpoint = `/auth/${userType}/login`;
      const response = await axios.post(`${API_URL}${endpoint}`, {
        email,
        password,
      });

      if (response.status === 200) {
        const { accessToken, refreshToken, owner, message } = response.data;

        // Store tokens in AsyncStorage
        await AsyncStorage.setItem('accessToken', accessToken);
        await AsyncStorage.setItem('refreshToken', refreshToken);

        // Optionally store user info
        await AsyncStorage.setItem('user', JSON.stringify(owner));

      } else {
        throw new Error('Login failed');
      }
    } catch (error) {
      let errorMessage = 'Please check your credentials and try again.';
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }
      Alert.alert('Login Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 40 : 0}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={styles.illustrationContainer} entering={FadeIn}>
            <View style={styles.illustrationPlaceholder}>
              <Image
                source={require('../../assets/images/login_car.png')}
                style={{ width: 250, height: 150 }}
                resizeMode="contain"
              />
            </View>
          </Animated.View>

          <Animated.View style={styles.content} entering={FadeIn.delay(200)}>
            <Text style={styles.subtitle}>Welcome!</Text>
            <Text style={styles.description}>
              Sign in your account to continue
            </Text>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'customer' && styles.activeUserTypeButton,
                ]}
                onPress={() => setUserType('customer')}
              >
                <Text
                  style={[
                    styles.userTypeText,
                    userType === 'customer' && styles.activeUserTypeText,
                  ]}
                >
                  Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'owner' && styles.activeUserTypeButton,
                ]}
                onPress={() => setUserType('owner')}
              >
                <Text
                  style={[
                    styles.userTypeText,
                    userType === 'owner' && styles.activeUserTypeText,
                  ]}
                >
                  Car Owner
                </Text>
              </TouchableOpacity>
            </View>

            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Email Address"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor="#8E8E93"
              />
            </View>

            <View style={styles.inputContainer}>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  placeholderTextColor="#8E8E93"
                />
                <TouchableOpacity
                  onPress={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff size={20} color="#8E8E93" />
                  ) : (
                    <Eye size={20} color="#8E8E93" />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotPassword}>
              <Text style={styles.forgotPasswordText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.loginButton, isLoading && styles.disabledButton]}
              onPress={handleLogin}
              disabled={isLoading}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View style={animatedStyle}>
                <Text style={styles.loginButtonText}>
                  {isLoading ? 'Signing In...' : 'Login'}
                </Text>
              </Animated.View>
            </TouchableOpacity>

            <View style={styles.signUpContainer}>
              <Text style={styles.signUpText}>Not a member? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/register')}>
                <Text style={styles.signUpLink}>Register now</Text>
              </TouchableOpacity>
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FFFFFF' },
  scrollContent: { paddingBottom: 40 },
  illustrationContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 20,
    backgroundColor: '#E8F0FE',
    paddingBottom: 30,
  },
  illustrationPlaceholder: {
    width: 250,
    height: 150,
    backgroundColor: '#d0dfff',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  content: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  subtitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 6,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
  },
  userTypeContainer: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  userTypeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  activeUserTypeButton: {
    backgroundColor: '#007AFF',
    borderColor: '#007AFF',
  },
  userTypeText: {
    color: '#666',
    fontWeight: '500',
  },
  activeUserTypeText: {
    color: '#fff',
  },
  inputContainer: {
    marginBottom: 16,
  },
  input: {
    fontSize: 16,
    color: '#1D1D1F',
    backgroundColor: '#F9F9F9',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 10,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 16,
    paddingVertical: Platform.OS === 'ios' ? 14 : 0,
  },
  passwordInput: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    paddingVertical: 14,
    paddingRight: 10,
  },
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotPasswordText: {
    fontSize: 14,
    color: '#007AFF',
  },
  loginButton: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  disabledButton: {
    opacity: 0.6,
  },
  loginButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  signUpContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  signUpText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  signUpLink: {
    fontSize: 14,
    color: '#007AFF',
    fontWeight: '600',
  },
});
