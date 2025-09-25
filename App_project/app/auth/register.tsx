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
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Checkbox } from 'react-native-paper';
import { Mail, Lock, User, Eye, EyeOff, Key } from 'lucide-react-native';
import axios from 'axios';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RegisterScreen() {
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [userType, setUserType] = useState('customer');
  const [agree, setAgree] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  const handleRegister = async () => {
    // Validation
    if (!firstName || !email || !password || !phone || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }
    if (!agree) {
      Alert.alert('Error', 'Please agree to the terms');
      return;
    }
    const emailRegex = /.+@.+\..+/;
    if (!emailRegex.test(email)) {
      Alert.alert('Error', 'Please enter a valid email address');
      return;
    }

    setLoading(true);

    try {
      const endpoint =
        userType === 'owner'
          ? '/auth/owner/register'
          : '/auth/customer/register';

      const fullURL = `${API_URL}/api${endpoint}`;

      const userData = { firstName, lastName, email, phone, password };

      const response = await axios.post(fullURL, userData, {
        headers: { 'Content-Type': 'application/json' },
        timeout: 10000,
      });

      // Get tokens and user info
      const { accessToken, refreshToken, owner } = response.data;

      await AsyncStorage.setItem('accessToken', accessToken);
      await AsyncStorage.setItem('refreshToken', refreshToken);
      await AsyncStorage.setItem('user', JSON.stringify(owner));

      const successMessage =
        userType === 'owner'
          ? 'Owner account created successfully! Wait for admin approval.'
          : 'Customer account created successfully!';

      // Navigate after success
      Alert.alert('Success', successMessage, [
        {
          text: 'OK',
          onPress: () => router.push('../login'),
        },
      ]);
    } catch (error: any) {
      let errorMessage = 'Something went wrong. Please try again.';
      if (axios.isAxiosError(error) && error.response) {
        if (error.response.status === 409) {
          errorMessage =
            userType === 'owner'
              ? 'Owner email already exists.'
              : 'Customer email already exists.';
        } else if (error.response.status === 400) {
          errorMessage = error.response.data.message || errorMessage;
        }
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
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 60 : 0}
      >
        <ScrollView
          contentContainerStyle={{
            flexGrow: 1,
            justifyContent: 'center',
            paddingBottom: 20,
          }}
          keyboardShouldPersistTaps="handled"
        >
          <Image
            source={require('../../assets/images/login_car.png')}
            style={styles.image}
            resizeMode="contain"
          />

          <View style={styles.card}>
            <Text style={styles.title}>Sign up</Text>
            <Text style={styles.subtitle}>Create an account to get started</Text>

            {/* User Type */}
            <View style={styles.userTypeContainer}>
              <TouchableOpacity
                style={[
                  styles.userTypeButton,
                  userType === 'customer' && styles.activeUserTypeButton,
                  { borderTopLeftRadius: 8, borderBottomLeftRadius: 8 },
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
                  { borderTopRightRadius: 8, borderBottomRightRadius: 8, marginLeft: -1 },
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

            {/* Name */}
            <View style={{ flexDirection: 'row', gap: 8, marginBottom: 16 }}>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <User size={20} color="#999" />
                <TextInput
                  placeholder="First Name *"
                  style={styles.input}
                  value={firstName}
                  onChangeText={setFirstName}
                  autoCapitalize="words"
                />
              </View>
              <View style={[styles.inputWrapper, { flex: 1 }]}>
                <User size={20} color="#999" />
                <TextInput
                  placeholder="Last Name"
                  style={styles.input}
                  value={lastName}
                  onChangeText={setLastName}
                  autoCapitalize="words"
                />
              </View>
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
            
            {/* Phone */}
            <View style={styles.inputWrapper}>
              <User size={20} color="#999" />
              <TextInput
                placeholder="Phone Number *"
                keyboardType="phone-pad"
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
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
                {showPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
              </TouchableOpacity>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputWrapper}>
              <Lock size={20} color="#999" />
              <TextInput
                placeholder="Confirm password *"
                secureTextEntry={!showConfirmPassword}
                style={styles.input}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
              >
                {showConfirmPassword ? <EyeOff size={20} color="#999" /> : <Eye size={20} color="#999" />}
              </TouchableOpacity>
            </View>

            {/* Owner notice */}
            {userType === 'owner' && (
              <View style={styles.noticeContainer}>
                <Text style={styles.noticeText}>
                  ℹ️ Owner accounts require admin approval before login.
                </Text>
              </View>
            )}

            {/* Terms */}
            <View style={styles.checkboxRow}>
              <Checkbox status={agree ? 'checked' : 'unchecked'} onPress={() => setAgree(!agree)} />
              <Text style={styles.checkboxText}>
                I agree to the <Text style={styles.link}>Terms and Conditions</Text>
              </Text>
            </View>

            {/* Button */}
            <TouchableOpacity
              onPress={handleRegister}
              style={[styles.button, (!agree || loading) && styles.disabled]}
              disabled={!agree || loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" />
              ) : (
                <Text style={styles.buttonText}>Create Account</Text>
              )}
            </TouchableOpacity>

            {/* Login Link */}
            <View style={styles.loginContainer}>
              <Text style={styles.loginText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.push('/auth/login')}>
                <Text style={styles.loginLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  image: { width: '100%', height: 220, marginTop: 16 },
  card: {
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginTop: -30,
    borderRadius: 16,
    padding: 20,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: -2 },
    shadowRadius: 8,
  },
  title: { fontSize: 24, fontWeight: '700', color: '#111', marginBottom: 4 },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 20 },
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
  input: { flex: 1, paddingVertical: 12, marginLeft: 8, fontSize: 16, color: '#111' },
  checkboxRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20, gap: 8 },
  checkboxText: { flex: 1, color: '#666', fontSize: 13 },
  link: { color: '#007AFF', fontWeight: '600' },
  button: { backgroundColor: '#007AFF', borderRadius: 10, paddingVertical: 14, alignItems: 'center' },
  disabled: { opacity: 0.5 },
  buttonText: { color: '#fff', fontSize: 16, fontWeight: '600' },
  userTypeContainer: { flexDirection: 'row', marginBottom: 20 },
  userTypeButton: { flex: 1, paddingVertical: 10, alignItems: 'center', borderWidth: 1, borderColor: '#E0E0E0' },
  activeUserTypeButton: { backgroundColor: '#007AFF', borderColor: '#007AFF' },
  userTypeText: { color: '#666', fontWeight: '500' },
  activeUserTypeText: { color: '#fff' },
  loginContainer: { flexDirection: 'row', justifyContent: 'center', marginTop: 16 },
  loginText: { color: '#666', fontSize: 14 },
  loginLink: { color: '#007AFF', fontWeight: '600', fontSize: 14 },
  noticeContainer: { backgroundColor: '#E3F2FD', padding: 12, borderRadius: 8, marginBottom: 16, borderLeftWidth: 4, borderLeftColor: '#2196F3' },
  noticeText: { color: '#1565C0', fontSize: 13, lineHeight: 18 },
});
