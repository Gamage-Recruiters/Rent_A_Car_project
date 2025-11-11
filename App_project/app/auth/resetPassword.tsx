import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Lock, Eye, EyeOff, ArrowLeft } from 'lucide-react-native';
import { router, useLocalSearchParams } from 'expo-router';
import axios from 'axios';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export default function ResetPasswordScreen() {
  const { token } = useLocalSearchParams<{ token: string }>();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [tokenValid, setTokenValid] = useState(true);
  
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const scaleValue = useSharedValue(1);
  
  useEffect(() => {
    if (!token) {
      setTokenValid(false);
      Alert.alert(
        'Invalid Link',
        'The password reset link is invalid or has expired.',
        [
          { text: 'OK', onPress: () => router.push('/auth/login') }
        ]
      );
    }
  }, [token]);
  
  const handlePressIn = () => {
    scaleValue.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scaleValue.value }],
  }));
  
  const handleSubmit = async () => {
    // Validation
    if (!password || !confirmPassword) {
      Alert.alert('Error', 'Please enter and confirm your new password');
      return;
    }
    
    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }
    
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/customer/reset-password`, {
        token,
        newPassword: password,
        confirmPassword
      });
      
      console.log('Reset password response:', response.data);
      
      if (response.data.success) {
        setIsSuccess(true);
      } else {
        Alert.alert(
          'Error',
          response.data.message || 'Password reset failed. Please try again.'
        );
      }
    } catch (error) {
      console.error('Reset password error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSuccess) {
    return (
      <SafeAreaView style={styles.container}>
        <Animated.View 
          style={styles.successContainer} 
          entering={FadeIn.delay(200)}
        >
          <Image
            source={require('../../assets/images/login_car.png')}
            style={styles.successImage}
            resizeMode="contain"
          />
          <Text style={styles.successTitle}>Password Reset Successful</Text>
          <Text style={styles.successMessage}>
            Your password has been reset successfully. You can now log in with your new password.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.buttonText}>Go to Login</Text>
          </TouchableOpacity>
        </Animated.View>
      </SafeAreaView>
    );
  }
  
  if (!tokenValid) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <Text style={styles.title}>Invalid Link</Text>
          <Text style={styles.description}>
            The password reset link is invalid or has expired.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.push('/auth/forgotpPassword')}
          >
            <Text style={styles.buttonText}>Try Again</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }
  
  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={20} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Reset Password</Text>
          <View style={{ width: 40 }} /> {/* Empty view for layout balance */}
        </View>
        
        <View style={styles.content}>
          <Image
            source={require('../../assets/images/login_car.png')}
            style={styles.image}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Create New Password</Text>
          <Text style={styles.description}>
            Your new password must be different from previous passwords
          </Text>
          
          {/* Password Input */}
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="New Password"
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
              placeholderTextColor="#8E8E93"
            />
            <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
              {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
            </TouchableOpacity>
          </View>
          
          {/* Confirm Password Input */}
          <View style={styles.inputWrapper}>
            <Lock size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Confirm Password"
              value={confirmPassword}
              onChangeText={setConfirmPassword}
              secureTextEntry={!showConfirmPassword}
              placeholderTextColor="#8E8E93"
            />
            <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)}>
              {showConfirmPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
            </TouchableOpacity>
          </View>
          
          {/* Password Requirements */}
          <View style={styles.requirementsContainer}>
            <Text style={styles.requirementsTitle}>Password must:</Text>
            <View style={styles.requirement}>
              <View style={[styles.bullet, password.length >= 6 && styles.validBullet]} />
              <Text style={[styles.requirementText, password.length >= 6 && styles.validText]}>
                Be at least 6 characters
              </Text>
            </View>
            <View style={styles.requirement}>
              <View style={[styles.bullet, /[A-Z]/.test(password) && styles.validBullet]} />
              <Text style={[styles.requirementText, /[A-Z]/.test(password) && styles.validText]}>
                Include an uppercase letter
              </Text>
            </View>
            <View style={styles.requirement}>
              <View style={[styles.bullet, /[0-9]/.test(password) && styles.validBullet]} />
              <Text style={[styles.requirementText, /[0-9]/.test(password) && styles.validText]}>
                Include a number
              </Text>
            </View>
          </View>
          
          <TouchableOpacity
            style={[styles.button, isLoading && styles.disabledButton]}
            onPress={handleSubmit}
            disabled={isLoading}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
          >
            <Animated.View style={[styles.buttonContent, animatedStyle]}>
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.buttonText}>Reset Password</Text>
              )}
            </Animated.View>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F1F1',
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
    backgroundColor: '#F7F7F7',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D1D1F',
  },
  content: {
    padding: 24,
    flex: 1,
  },
  image: {
    width: '100%',
    height: 150,
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  description: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 24,
    lineHeight: 22,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    paddingVertical: 14,
    marginLeft: 12,
  },
  requirementsContainer: {
    backgroundColor: '#F9F9F9',
    borderRadius: 10,
    padding: 16,
    marginBottom: 24,
  },
  requirementsTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  requirement: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  bullet: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#D1D1D6',
    marginRight: 8,
  },
  validBullet: {
    backgroundColor: '#34C759',
  },
  requirementText: {
    fontSize: 14,
    color: '#8E8E93',
  },
  validText: {
    color: '#34C759',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 24,
  },
  buttonContent: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  disabledButton: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '600',
  },
  successContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  successImage: {
    width: 180,
    height: 180,
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#1D1D1F',
    marginBottom: 12,
    textAlign: 'center',
  },
  successMessage: {
    fontSize: 16,
    color: '#8E8E93',
    marginBottom: 32,
    textAlign: 'center',
    lineHeight: 22,
  },
});