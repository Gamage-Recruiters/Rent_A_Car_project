import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Image,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import { useRouter } from 'expo-router';

// Create a custom FormData that works better with React Native
const createFormData = (data, files = []) => {
  const formData = new FormData();
  
  // Append regular fields
  Object.keys(data).forEach(key => {
    if (data[key] !== undefined && data[key] !== null) {
      formData.append(key, data[key].toString());
    }
  });
  
  // Append files
  files.forEach(file => {
    formData.append(file.fieldName, file);
  });
  
  return formData;
};

export default function EditProfileScreen() {
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.8.191:8000/api';

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isImageChanged, setIsImageChanged] = useState(false);

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) throw new Error('User not logged in');

        
        const res = await axios.get(`${API_URL}/owner/profile`, {
          headers: { 
            Authorization: `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
          },
          timeout: 10000,
        });

        const user = res.data.data;
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setPhone(user.phone || '');
        setAddress(user.address || '');
        
        // Set profile image
        if (user.image) {
          const baseUrl = API_URL.replace('/api', '');
          const imageUrl = `${baseUrl}/uploads/ownerProfileImages/${user.image}`;
          console.log('🖼️ Setting profile image URL:', imageUrl);
          setProfileImage(imageUrl);
        } else {
          setProfileImage(null);
        }
        
      } catch (err: any) {
        console.error('❌ Profile fetch error:', err);
        
        if (err.response?.status === 401) {
          await AsyncStorage.clear();
          Alert.alert('Session Expired', 'Please login again');
          router.replace('/auth/login');
        } else if (err.code === 'ECONNABORTED') {
          Alert.alert('Timeout', 'Request took too long. Please check your connection.');
        } else if (err.message === 'Network Error') {
          Alert.alert('Network Error', 'Cannot connect to server. Please check if the server is running.');
        } else {
          Alert.alert('Error', 'Failed to fetch profile. Please try again.');
        }
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  // Image picker
  const handleImageChange = async () => {
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission required', 'Sorry, we need camera roll permissions to change your profile image.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        setProfileImage(result.assets[0].uri);
        setIsImageChanged(true);
        console.log('📸 New image selected:', result.assets[0].uri);
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Save changes - IMPROVED VERSION
  const handleSave = async () => {
    try {
      setSaving(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      
      if (!accessToken) {
        Alert.alert('Error', 'Please login again');
        router.replace('/auth/login');
        return;
      }

      console.log('🚀 Starting profile update...');
      
      // Validate required fields
      if (!firstName.trim() || !lastName.trim() || !email.trim()) {
        Alert.alert('Validation Error', 'Please fill in all required fields');
        setSaving(false);
        return;
      }

      // Prepare form data
      const formData = new FormData();
      
      // Append text fields
      formData.append('firstName', firstName.trim());
      formData.append('lastName', lastName.trim());
      formData.append('email', email.trim());
      formData.append('phone', phone.trim());
      formData.append('address', address.trim());
      
      // Append image only if it's a new local image
      if (isImageChanged && profileImage && !profileImage.startsWith('http://192.168.8.191')) {
        console.log('📤 Uploading new image...');
        
        // Extract filename from URI
        const filename = profileImage.split('/').pop() || `profile_${Date.now()}.jpg`;
        const match = /\.(\w+)$/.exec(filename);
        const fileExtension = match ? match[1] : 'jpg';
        const mimeType = `image/${fileExtension === 'jpg' ? 'jpeg' : fileExtension}`;
        
        formData.append('image', {
          uri: profileImage,
          type: mimeType,
          name: filename,
        } as any);
        
        console.log('📁 File details:', {
          uri: profileImage,
          type: mimeType,
          name: filename
        });
      } else {
        console.log('ℹ️ No image change or using existing image');
      }

      console.log('📡 Sending update request to:', `${API_URL}/owner/profile`);
      
      // Create axios config
      const config = {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
        timeout: 30000,
        onUploadProgress: (progressEvent: { total: number; loaded: number; }) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            console.log(`📊 Upload Progress: ${percentCompleted}%`);
          }
        },
      };

      const response = await axios.put(`${API_URL}/owner/profile`, formData, config);

      console.log('✅ Update response:', response.data);

      if (response.data.success) {
        Alert.alert('✅ Success', 'Your profile has been updated!');
        setIsImageChanged(false);
        // Navigate back after a short delay
        setTimeout(() => router.back(), 1500);
      } else {
        throw new Error(response.data.message || 'Update failed');
      }

    } catch (err: any) {
      console.error('❌ Profile update error:', {
        message: err.message,
        code: err.code,
        response: err.response?.data,
        status: err.response?.status
      });

      let errorMessage = 'Failed to update profile. Please try again.';
      
      if (err.code === 'ECONNABORTED') {
        errorMessage = 'Request timeout. Please check your connection and try again.';
      } else if (err.message === 'Network Error') {
        errorMessage = 'Network error. Please check:\n\n• Server is running\n• Correct IP address\n• Network connectivity';
      } else if (err.response?.status === 413) {
        errorMessage = 'Image file is too large. Please choose a smaller image.';
      } else if (err.response?.status === 415) {
        errorMessage = 'Invalid image format. Please use JPEG, PNG, or WebP.';
      } else if (err.response?.data?.message) {
        errorMessage = err.response.data.message;
      } else if (err.response?.status === 401) {
        await AsyncStorage.clear();
        Alert.alert('Session Expired', 'Please login again');
        router.replace('/auth/login');
        return;
      }

      Alert.alert('Update Failed', errorMessage);
    } finally {
      setSaving(false);
    }
  };

  // Test server connection
  const testServerConnection = async () => {
    try {
      const response = await axios.get(API_URL.replace('/api', ''));
      console.log('✅ Server is reachable:', response.status);
      return true;
    } catch (error) {
      console.log('❌ Server is not reachable');
      return false;
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={styles.loadingText}>Loading profile...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
          <Text style={styles.header}>Edit Your Profile</Text>

          {/* Profile Image Section */}
          <View style={styles.imageContainer}>
            <TouchableOpacity onPress={handleImageChange} disabled={saving}>
              <Image
                source={{
                  uri: profileImage || 'https://via.placeholder.com/100',
                }}
                style={styles.profileImage}
                onError={() => console.log('❌ Image failed to load')}
              />
              <Text style={styles.changePhotoText}>
                {saving ? 'Uploading...' : 'Change Photo'}
              </Text>
            </TouchableOpacity>
            {isImageChanged && (
              <Text style={styles.imageChangedText}>Image changed</Text>
            )}
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>First Name *</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              editable={!saving}
            />

            <Text style={styles.label}>Last Name *</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              editable={!saving}
            />

            <Text style={styles.label}>Email *</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              placeholder="Enter email"
              keyboardType="email-address"
              autoCapitalize="none"
              editable={!saving}
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              style={styles.input}
              value={phone}
              onChangeText={setPhone}
              placeholder="Enter phone number"
              keyboardType="phone-pad"
              editable={!saving}
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              style={[styles.input, { marginBottom: 20 }]}
              value={address}
              onChangeText={setAddress}
              placeholder="Enter address"
              editable={!saving}
            />
          </View>

          <TouchableOpacity 
            style={[styles.saveButton, saving && styles.saveButtonDisabled]} 
            onPress={handleSave}
            disabled={saving}
          >
            {saving ? (
              <View style={styles.savingContainer}>
                <ActivityIndicator color="#fff" size="small" />
                <Text style={styles.savingText}>Updating...</Text>
              </View>
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>

          {/* Debug Info */}
          {__DEV__ && (
            <TouchableOpacity 
              style={styles.debugButton}
              onPress={testServerConnection}
            >
              <Text style={styles.debugText}>Test Server Connection</Text>
            </TouchableOpacity>
          )}
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#eef4fb',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  centeredContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    fontSize: 26,
    fontWeight: '800',
    marginBottom: 25,
    textAlign: 'center',
    color: '#1c1c1e',
  },
  imageContainer: {
    alignItems: 'center',
    marginBottom: 25,
  },
  profileImage: {
    width: 110,
    height: 110,
    borderRadius: 55,
    borderWidth: 3,
    borderColor: '#fff',
    backgroundColor: '#ccc',
    marginBottom: 8,
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
  },
  imageChangedText: {
    color: '#4CAF50',
    fontSize: 12,
    marginTop: 4,
    fontStyle: 'italic',
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOpacity: 0.07,
    shadowRadius: 10,
    elevation: 4,
    marginBottom: 30,
    width: '100%',
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    marginBottom: 6,
    color: '#333',
  },
  input: {
    backgroundColor: '#f7f9fc',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    fontSize: 15,
    color: '#1e1e1e',
    marginBottom: 20,
    borderColor: '#ddd',
    borderWidth: 1,
  },
  saveButton: {
    backgroundColor: '#007AFF',
    paddingVertical: 16,
    borderRadius: 30,
    alignItems: 'center',
    shadowColor: '#007AFF',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 5,
    width: '100%',
  },
  saveButtonDisabled: {
    backgroundColor: '#ccc',
    shadowColor: '#ccc',
  },
  savingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  savingText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginLeft: 8,
  },
  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  debugButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#666',
    borderRadius: 8,
  },
  debugText: {
    color: '#fff',
    fontSize: 12,
  },
});