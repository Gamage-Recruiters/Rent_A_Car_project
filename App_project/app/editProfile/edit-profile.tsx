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

export default function EditProfileScreen() {
  const router = useRouter();
  const API_URL = process.env.EXPO_PUBLIC_API_URL || 'http://localhost:8000/api';

  const [profileImage, setProfileImage] = useState<string | null>(null);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch current profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const accessToken = await AsyncStorage.getItem('accessToken');
        if (!accessToken) throw new Error('User not logged in');

        const res = await axios.get(`${API_URL}/owner/profile`, {
          headers: { Authorization: `Bearer ${accessToken}` },
        });

        const user = res.data.data;
        setFirstName(user.firstName);
        setLastName(user.lastName);
        setEmail(user.email);
        setPhone(user.phone || '');
        setAddress(user.address || '');
        
        // FIX: Correct image URL construction
        if (user.image) {
          setProfileImage(`${API_URL}/uploads/ownerProfileImages/${user.image}`);
        } else {
          setProfileImage(null);
        }
        
        console.log('Current profile image:', user.image);
        console.log('Full image URL:', user.image ? `${API_URL}/uploads/ownerProfileImages/${user.image}` : 'No image');
      } catch (err: any) {
        console.error('Profile fetch error:', err);
        Alert.alert('Error', 'Failed to fetch profile. Please try again.');
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
      }
    } catch (error) {
      console.error('Image picker error:', error);
      Alert.alert('Error', 'Failed to pick image. Please try again.');
    }
  };

  // Save changes - FIXED VERSION
  const handleSave = async () => {
    try {
      setSaving(true);
      const accessToken = await AsyncStorage.getItem('accessToken');
      if (!accessToken) throw new Error('User not logged in');

      const formData = new FormData();
      
      // Append all profile fields
      formData.append('firstName', firstName);
      formData.append('lastName', lastName);
      formData.append('email', email);
      formData.append('phone', phone);
      formData.append('address', address);
      
      // Append image only if it's a new local image (not a URL)
      if (profileImage && !profileImage.startsWith(API_URL)) {
        // Extract file extension
        const fileExtension = profileImage.split('.').pop() || 'jpg';
        
        formData.append('image', {
          uri: profileImage,
          type: `image/${fileExtension}`,
          name: `profile_${Date.now()}.${fileExtension}`,
        } as any);
        
        console.log('Uploading new image:', profileImage);
      }

      console.log('Sending update request...');
      
      const response = await axios.put(`${API_URL}/owner/profile`, formData, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      console.log('Update response:', response.data);

      if (response.data.success) {
        Alert.alert('✅ Success', 'Your profile has been updated!');
        router.back();
      } else {
        throw new Error(response.data.message || 'Update failed');
      }
    } catch (err: any) {
      console.error('Profile update error:', err.response?.data || err.message);
      Alert.alert(
        'Update Failed', 
        err.response?.data?.message || 'Failed to update profile. Please try again.'
      );
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.centeredContainer}>
          <ActivityIndicator size="large" color="#007AFF" />
          <Text style={{ marginTop: 10 }}>Loading profile...</Text>
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
              />
              <Text style={styles.changePhotoText}>
                {saving ? 'Uploading...' : 'Change Photo'}
              </Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>First Name</Text>
            <TextInput
              style={styles.input}
              value={firstName}
              onChangeText={setFirstName}
              placeholder="Enter first name"
              editable={!saving}
            />

            <Text style={styles.label}>Last Name</Text>
            <TextInput
              style={styles.input}
              value={lastName}
              onChangeText={setLastName}
              placeholder="Enter last name"
              editable={!saving}
            />

            <Text style={styles.label}>Email</Text>
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
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveText}>Save Changes</Text>
            )}
          </TouchableOpacity>
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
  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});