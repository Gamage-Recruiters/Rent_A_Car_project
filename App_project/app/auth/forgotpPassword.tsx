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
  ActivityIndicator,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, ArrowLeft } from 'lucide-react-native';
import { router } from 'expo-router';
import axios from 'axios';
import Animated, {
  FadeIn,
  useSharedValue,
  useAnimatedStyle,
  withSpring,
} from 'react-native-reanimated';

export default function ForgotPasswordScreen() {
  const [email, setEmail] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  const API_URL = process.env.EXPO_PUBLIC_API_URL;
  const scaleValue = useSharedValue(1);
  
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
    if (!email) {
      Alert.alert('Error', 'Please enter your email address');
      return;
    }
    
    // Validate email format
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }
    
    setIsLoading(true);
    
    try {
      const response = await axios.post(`${API_URL}/auth/customer/forgot-password`, {
        email
      });
      
      console.log('Forgot password response:', response.data);
      
      if (response.data.success) {
        setIsSubmitted(true);
      } else {
        Alert.alert(
          'Error',
          response.data.message || 'Failed to send reset link. Please try again.'
        );
      }
    } catch (error) {
      console.error('Forgot password error:', error);
      
      let errorMessage = 'Something went wrong. Please try again.';
      if (axios.isAxiosError(error) && error.response?.data?.message) {
        errorMessage = error.response.data.message;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };
  
  if (isSubmitted) {
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
          <Text style={styles.successTitle}>Check Your Email</Text>
          <Text style={styles.successMessage}>
            We have sent a password recovery link to {email}
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => router.back()}
          >
            <Text style={styles.buttonText}>Back to Login</Text>
          </TouchableOpacity>
        </Animated.View>
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
          <Text style={styles.headerTitle}>Forgot Password</Text>
          <View style={{ width: 40 }} /> {/* Empty view for layout balance */}
        </View>
        
        <View style={styles.content}>
          <Image
            source={require('../../assets/images/login_car.png')}
            style={styles.image}
            resizeMode="contain"
          />
          
          <Text style={styles.title}>Password Recovery</Text>
          <Text style={styles.description}>
            Enter your email and we'll send you a link to reset your password
          </Text>
          
          <View style={styles.inputWrapper}>
            <Mail size={20} color="#999" />
            <TextInput
              style={styles.input}
              placeholder="Email Address"
              value={email}
              onChangeText={setEmail}
              keyboardType="email-address"
              autoCapitalize="none"
              placeholderTextColor="#8E8E93"
              returnKeyType="send"
              onSubmitEditing={handleSubmit}
            />
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
                <Text style={styles.buttonText}>Send Reset Link</Text>
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
    height: 180,
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
    marginBottom: 24,
  },
  input: {
    flex: 1,
    fontSize: 16,
    color: '#1D1D1F',
    paddingVertical: 14,
    marginLeft: 12,
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 22,
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