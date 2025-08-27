import React, { useState } from 'react';
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
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EditProfileScreen() {
  const [profileImage, setProfileImage] = useState(
    'https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Ym95fGVufDB8fDB8fHww'
  ); // Default profile image

  const handleImageChange = () => {
    Alert.alert('Change Photo', 'Image picker integration goes here.');
    // You can integrate ImagePicker later
  };

  const handleSave = () => {
    Alert.alert('✅ Success', 'Your profile has been updated!');
  };

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
            <TouchableOpacity onPress={handleImageChange}>
              <Image source={{ uri: profileImage }} style={styles.profileImage} />
              <Text style={styles.changePhotoText}>Change Photo</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.card}>
            <Text style={styles.label}>Full Name</Text>
            <TextInput
              placeholder="Enter your name"
              placeholderTextColor="#888"
              style={styles.input}
              defaultValue="Lucas Scott"
            />

            <Text style={styles.label}>Username</Text>
            <TextInput
              placeholder="Enter username"
              placeholderTextColor="#888"
              style={styles.input}
              defaultValue="@lucasscott3"
            />

            <Text style={styles.label}>Email</Text>
            <TextInput
              placeholder="Enter email"
              placeholderTextColor="#888"
              style={styles.input}
              defaultValue="lucasscott@gmail.com"
              keyboardType="email-address"
            />

            <Text style={styles.label}>Phone</Text>
            <TextInput
              placeholder="Enter phone number"
              placeholderTextColor="#888"
              style={styles.input}
              defaultValue="+94 771234567"
              keyboardType="phone-pad"
            />

            <Text style={styles.label}>Address</Text>
            <TextInput
              placeholder="Enter address"
              placeholderTextColor="#888"
              style={[styles.input, { marginBottom: 20 }]}
              defaultValue="No. 45/3, Temple Road Nugegoda"
            />
          </View>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveText}>Save Changes</Text>
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
  saveText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
