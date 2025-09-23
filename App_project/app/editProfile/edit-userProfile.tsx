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
  Image,
  ActivityIndicator,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as ImagePicker from 'expo-image-picker';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import { Switch } from 'react-native-paper';
import { ArrowLeft } from 'lucide-react-native';

export default function EditProfileScreen() {
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [profile, setProfile] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    address: '',
    isNewsletterSubscribed: false,
    photo: null,
  });
  const [profileImage, setProfileImage] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const API_URL = process.env.EXPO_PUBLIC_API_URL;

  // Fetch profile data when component mounts
  useEffect(() => {
    fetchProfileData();
  }, []);

  const fetchProfileData = async () => {
    try {
      setIsLoading(true);
      const token = await AsyncStorage.getItem('customerToken');
      
      if (!token) {
        Alert.alert('Error', 'You are not logged in');
        router.replace('/auth/login');
        return;
      }

      const response = await axios.get(`${API_URL}/customer/profile`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });

      if (response.data.success) {
        const profileData = response.data.data;
        console.log('Fetched profile data:', profileData);
        
        setProfile({
          firstName: profileData.firstName || '',
          lastName: profileData.lastName || '',
          email: profileData.email || '',
          phoneNumber: profileData.phoneNumber || '',
          address: profileData.address || '',
          isNewsletterSubscribed: profileData.isNewsletterSubscribed || false,
          photo: profileData.photo || null,
        });

        // Set profile image if available
        if (profileData.photo) {
          setProfileImage(getImageUrl(profileData.photo));
        }
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      let errorMessage = 'Failed to load profile data';
      
      if (axios.isAxiosError(error) && error.response) {
        errorMessage = error.response.data.message || errorMessage;
        
        // If unauthorized, redirect to login
        if (error.response.status === 401) {
          await AsyncStorage.removeItem('customerToken');
          router.replace('/auth/login');
        }
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const getImageUrl = (photoPath) => {
    if (!photoPath) return null;
    if (photoPath.startsWith('http')) return photoPath;
    return `${API_URL.replace('/api', '')}${photoPath}`;
  };

  const handleImageChange = async () => {
    try {
      // Request permission
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow access to your photo library');
        return;
      }

      // Launch image picker
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets[0]) {
        // Set the selected image for preview
        setProfileImage(result.assets[0].uri);
        
        // Save image details for upload
        setImageFile({
          uri: result.assets[0].uri,
          type: 'image/jpeg',
          name: 'profile-image.jpg',
        });
      }
    } catch (error) {
      console.error('Error picking image:', error);
      Alert.alert('Error', 'Failed to select image');
    }
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      const token = await AsyncStorage.getItem('customerToken');
      
      if (!token) {
        Alert.alert('Error', 'You are not logged in');
        router.replace('/auth/login');
        return;
      }

      // Create form data for multipart/form-data request
      const formData = new FormData();
      formData.append('firstName', profile.firstName);
      formData.append('lastName', profile.lastName);
      formData.append('email', profile.email);
      formData.append('phoneNumber', profile.phoneNumber);
      formData.append('address', profile.address);
      formData.append('isNewsletterSubscribed', profile.isNewsletterSubscribed.toString());
      
      // Add image if selected
      if (imageFile) {
        formData.append('customerProfileImage', imageFile);
      }

      console.log('Sending update with data:', formData);

      // Update profile
      const response = await axios.put(`${API_URL}/customer/profile`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        }
      });

      if (response.data.success) {
        Alert.alert('Success', 'Your profile has been updated!', [
          { text: 'OK', onPress: () => router.back() }
        ]);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      let errorMessage = 'Failed to update profile';
      
      if (axios.isAxiosError(error) && error.response) {
        console.log('Error response:', error.response.data);
        errorMessage = error.response.data.message || errorMessage;
      }
      
      Alert.alert('Error', errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  const getInitials = () => {
    return `${profile.firstName.charAt(0) || ''}${profile.lastName.charAt(0) || ''}`.toUpperCase();
  };

  const renderProfileForm = () => (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity 
          style={styles.backButton} 
          onPress={() => router.back()}
        >
          <ArrowLeft size={24} color="#333" />
        </TouchableOpacity>
        <Text style={styles.header}>Edit Profile</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Profile Image Section */}
      <View style={styles.imageContainer}>
        <TouchableOpacity onPress={handleImageChange}>
          {profileImage ? (
            <Image source={{ uri: profileImage }} style={styles.profileImage} />
          ) : (
            <View style={[styles.profileImage, styles.profileImagePlaceholder]}>
              <Text style={styles.profileImagePlaceholderText}>
                {getInitials()}
              </Text>
            </View>
          )}
          <Text style={styles.changePhotoText}>Change Photo</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.card}>
        <Text style={styles.label}>First Name</Text>
        <TextInput
          placeholder="Enter your first name"
          placeholderTextColor="#888"
          style={styles.input}
          value={profile.firstName}
          onChangeText={(text) => setProfile({...profile, firstName: text})}
        />

        <Text style={styles.label}>Last Name</Text>
        <TextInput
          placeholder="Enter your last name"
          placeholderTextColor="#888"
          style={styles.input}
          value={profile.lastName}
          onChangeText={(text) => setProfile({...profile, lastName: text})}
        />

        <Text style={styles.label}>Email</Text>
        <TextInput
          placeholder="Enter email"
          placeholderTextColor="#888"
          style={styles.input}
          value={profile.email}
          onChangeText={(text) => setProfile({...profile, email: text})}
          keyboardType="email-address"
          autoCapitalize="none"
        />

        <Text style={styles.label}>Phone</Text>
        <TextInput
          placeholder="Enter phone number"
          placeholderTextColor="#888"
          style={styles.input}
          value={profile.phoneNumber}
          onChangeText={(text) => setProfile({...profile, phoneNumber: text})}
          keyboardType="phone-pad"
        />

        <Text style={styles.label}>Address</Text>
        <TextInput
          placeholder="Enter address"
          placeholderTextColor="#888"
          style={styles.input}
          value={profile.address}
          onChangeText={(text) => setProfile({...profile, address: text})}
          multiline
        />
        
        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Subscribe to newsletter</Text>
          <Switch
            value={profile.isNewsletterSubscribed}
            onValueChange={(value) => 
              setProfile({...profile, isNewsletterSubscribed: value})
            }
            color="#007AFF"
          />
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.saveButton, isSaving && styles.disabledButton]} 
        onPress={handleSave}
        disabled={isSaving}
      >
        <Text style={styles.saveText}>
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.loadingContainer]}>
        <ActivityIndicator size="large" color="#007AFF" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <FlatList
          data={[{ key: 'profile-form' }]}
          renderItem={() => renderProfileForm()}
          keyExtractor={(item) => item.key}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 40 }}
        />
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  container: {
    padding: 20,
    paddingBottom: 40,
    alignItems: 'center',
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
    marginBottom: 20,
  },
  backButton: {
    padding: 5,
  },
  placeholder: {
    width: 34,
  },
  header: {
    fontSize: 24,
    fontWeight: '700',
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
  profileImagePlaceholder: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#007AFF',
  },
  profileImagePlaceholderText: {
    fontSize: 36,
    fontWeight: 'bold',
    color: 'white',
  },
  changePhotoText: {
    color: '#007AFF',
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
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
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 15,
  },
  switchLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#333',
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
  disabledButton: {
    backgroundColor: '#80b0e0',
    shadowOpacity: 0.1,
  },
  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});