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
  ScrollView,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Checkbox } from 'react-native-paper';
import { Mail, Lock, User, Eye, EyeOff } from 'lucide-react-native';
import axios from 'axios';
import { router } from 'expo-router';

import { API_URL } from '@env';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!firstName || !email || !password || !confirmPassword) {
      Alert.alert('Please fill in requied fields fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Passwords do not match');
      return;
    }

    if (!agree) {
      Alert.alert('Please agree to the terms');
      return;
    }

    setLoading(true);
    try {
      const endpoint = `/auth/${userType}/register`;

      const userData = {
        firstName,
        lastName,
        email,
        password,
      };

      // Call the api
      const response = await axios.post(`${API_URL}${endpoint}`, userData)

      const data = response.data;

      if (response.status < 200 || response.status >= 300) {
        throw new Error(data.message || 'Registration failed');
      }

      Alert.alert(
        'Success',
        'Account created successfully!',
        [{ text: 'OK', onPress: () => router.push('/auth/login') }]
      );
    } catch (error) {
      let errorMessage = 'Something went wront. Pleas try again';

      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message;
      } else if (error instanceof Error) {
        errorMessage = error.message;
      }

      Alert.alert('Registration Failed', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scroll}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <Image
            source={require('../../assets/images/login_car.png')}
            style={styles.image}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <Text style={styles.title}>Sign up</Text>
            <Text style={styles.subtitle}>
              Create an account to get started
            </Text>

            {/* User Type Selection */}
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'customer' && styles.activeUserTypeButton
                ]}
                onPress={() => setUserType('customer')}
              >
                <Text style={[
                  styles.userTypeText,
                  userType === 'customer' && styles.activeUserTypeText
                ]}>
                  Customer
                </Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[
                  styles.userTypeButton, 
                  userType === 'owner' && styles.activeUserTypeButton
                ]}
                onPress={() => setUserType('owner')}
              >
                <Text style={[
                  styles.userTypeText,
                  userType === 'owner' && styles.activeUserTypeText
                ]}>
                  Car Owner
                </Text>
              </TouchableOpacity>
            </View>

            {/* First Name */}
            <View style={styles.inputWrapper}>
              <User size={20} color="#999" />
              <TextInput
                placeholder="First Name *"
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
              />
            </View>

            {/* Last Name */}
            <View style={styles.inputWrapper}>
              <User size={20} color="#999" />
              <TextInput
                placeholder="Last Name"
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
              />
            </View>

            {/* Email */}
            <View style={styles.inputWrapper}>
              <Mail size={20} color="#999" />
              <TextInput
                placeholder="Email Address"
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                value={email}
                onChangeText={setEmail}
              />
            </View>

            {/* Password */}
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#999" />
              <TextInput
                placeholder="Create a password *"
                secureTextEntry={!showPassword}
                style={styles.input}
                value={password}
                onChangeText={setPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {showPassword ? (
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#999" />
              <TextInput
                placeholder="Confirm password"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color="#999" />
                ) : (
                  <Eye size={20} color="#999" />
                )}
              </TouchableOpacity>
            </View>

            {/* Checkbox */}
            <View style={styles.checkboxRow}>
              <Checkbox
                status={agree ? 'checked' : 'unchecked'}
                onPress={() => setAgree(!agree)}
              />
              <Text style={styles.checkboxText}>
                I agree to the{' '}
                <Text style={styles.link}>Terms and Conditions</Text>
              </Text>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleRegister}
              style={[styles.button, !agree && styles.disabled]}
              disabled={!agree || loading}
            >
              <Text style={styles.buttonText}>
                {loading ? 'Creating...' : 'Create Account'}
              </Text>
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>

          </View>
        </KeyboardAvoidingView>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  scroll: { paddingBottom: 20 },
  image: {
    width: '100%',
    height: 220,
    marginTop: 16,
  },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
    elevation: 3,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#111',
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: '#666',
    marginBottom: 20,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 12,
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    marginLeft: 8,
    fontSize: 16,
    color: '#111',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
    gap: 8,
  },
  checkboxText: {
    flex: 1,
    color: '#666',
    fontSize: 13,
  },
  link: {
    color: '#007AFF',
    fontWeight: '600',
  },
  button: {
    backgroundColor: '#007AFF',
    borderRadius: 10,
    paddingVertical: 14,
    alignItems: 'center',
  },
  disabled: {
    opacity: 0.5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
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
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
  },
  loginText: {
    color: '#666',
    fontSize: 14,
  },
  loginLink: {
    color: '#007AFF',
    fontWeight: '600',
    fontSize: 14,
  },
});
