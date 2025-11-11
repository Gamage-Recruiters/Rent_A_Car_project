import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft, Send, MessageSquare, ChevronDown, Check } from 'lucide-react-native';
import { router } from 'expo-router';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useUserStore } from '@/stores/userStore';
import Animated, { FadeIn } from 'react-native-reanimated';

const API_URL = process.env.EXPO_PUBLIC_API_URL;

const subjects = [
  'Booking Inquiry',
  'Customer Support',
  'Become a Partner',
  'Feedback',
  'Other',
];

export default function ContactScreen() {
  const { user } = useUserStore();
  const [firstName, setFirstName] = useState(user?.firstName || '');
  const [lastName, setLastName] = useState(user?.lastName || '');
  const [email, setEmail] = useState(user?.email || '');
  const [phone, setPhone] = useState(user?.phone || user?.phoneNumber || '');
  const [subject, setSubject] = useState(subjects[0]);
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  type PastMessage = {
    subject: string;
    message: string;
    createdAt: string;
  };
  const [pastMessages, setPastMessages] = useState<PastMessage[]>([]);
  const [showPastMessages, setShowPastMessages] = useState(false);
  const [showSubjectModal, setShowSubjectModal] = useState(false);

  useEffect(() => {
    // Load user's past messages when component mounts
    fetchPastMessages();
  }, []);

  const fetchPastMessages = async () => {
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        console.log('No auth token found');
        return;
      }
      
      const response = await axios.get(`${API_URL}/customer/contact/my-messages`, {
        headers: {
          Authorization: `Bearer ${token}`
        }
      });
      
      if (response.data.success) {
        setPastMessages(response.data.data);
      }
    } catch (error) {
      console.error('Error fetching past messages:', error);
    }
  };

  const handleSubmit = async () => {
    // Validate form
    if (!firstName.trim() || !email.trim() || !message.trim()) {
      Alert.alert('Missing Information', 'Please fill in all required fields.');
      return;
    }
    
    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      Alert.alert('Invalid Email', 'Please enter a valid email address.');
      return;
    }

    setIsLoading(true);
    
    try {
      const token = await AsyncStorage.getItem('accessToken');
      
      if (!token) {
        Alert.alert('Authentication Required', 'Please log in to submit inquiries.');
        router.push('/auth/login');
        setIsLoading(false);
        return;
      }

      const response = await axios.post(
        `${API_URL}/customer/contact/submit-message`, 
        {
          firstName,
          lastName,
          emailAddress: email,
          phoneNumber: phone,
          subject,
          message
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        }
      );
      
      if (response.data.success) {
        Alert.alert(
          'Message Sent!',
          'Your inquiry has been submitted successfully. We will get back to you shortly.',
          [{ text: 'OK', onPress: () => {
            setMessage('');
            fetchPastMessages();
          }}]
        );
      } else {
        throw new Error(response.data.message || 'Failed to submit message');
      }
    } catch (error) {
      console.error('Error submitting inquiry:', error);
      
      let errorMessage = 'An error occurred while submitting your inquiry';
      if (typeof error === 'object' && error !== null) {
        if ('response' in error && typeof (error as any).response?.data?.message === 'string') {
          errorMessage = (error as any).response.data.message;
        } else if ('message' in error && typeof (error as any).message === 'string') {
          errorMessage = (error as any).message;
        }
      }
      
      Alert.alert('Submission Failed', errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
          >
            <ArrowLeft size={24} color="#1D1D1F" />
          </TouchableOpacity>
          <Text style={styles.title}>Contact Us</Text>
        </View>

        {/* Main Content */}
        <Animated.View entering={FadeIn.delay(100)} style={styles.content}>
          <Text style={styles.subtitle}>
            Have questions or need assistance? Fill out the form below and we'll get back to you as soon as possible.
          </Text>
          
          {/* Contact Form */}
          <View style={styles.formContainer}>
            <Text style={styles.sectionTitle}>Contact Information</Text>
            
            {/* First Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>First Name *</Text>
              <TextInput
                style={styles.input}
                value={firstName}
                onChangeText={setFirstName}
                placeholder="Enter your first name"
              />
            </View>
            
            {/* Last Name */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Last Name</Text>
              <TextInput
                style={styles.input}
                value={lastName}
                onChangeText={setLastName}
                placeholder="Enter your last name"
              />
            </View>
            
            {/* Email */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email Address *</Text>
              <TextInput
                style={styles.input}
                value={email}
                onChangeText={setEmail}
                placeholder="Enter your email address"
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
            
            {/* Phone */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Phone Number</Text>
              <TextInput
                style={styles.input}
                value={phone}
                onChangeText={setPhone}
                placeholder="Enter your phone number"
                keyboardType="phone-pad"
              />
            </View>
            
            {/* Subject - Custom Dropdown */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Subject *</Text>
              <TouchableOpacity 
                style={styles.dropdownButton}
                onPress={() => setShowSubjectModal(true)}
              >
                <Text style={styles.dropdownText}>{subject}</Text>
                <ChevronDown size={20} color="#8E8E93" />
              </TouchableOpacity>
            </View>
            
            {/* Message */}
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Message *</Text>
              <TextInput
                style={styles.messageInput}
                value={message}
                onChangeText={setMessage}
                placeholder="Type your message here..."
                multiline
                textAlignVertical="top"
              />
            </View>
            
            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.submitButton, isLoading && styles.disabledButton]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" size="small" />
              ) : (
                <View style={styles.buttonContent}>
                  <Send size={20} color="#FFFFFF" />
                  <Text style={styles.submitButtonText}>Send Message</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Past Messages */}
          {pastMessages.length > 0 && (
            <View style={styles.pastMessagesContainer}>
              <TouchableOpacity
                style={styles.pastMessagesHeader}
                onPress={() => setShowPastMessages(!showPastMessages)}
              >
                <View style={styles.pastMessagesHeaderLeft}>
                  <MessageSquare size={20} color="#007AFF" />
                  <Text style={styles.pastMessagesTitle}>
                    Your Past Inquiries ({pastMessages.length})
                  </Text>
                </View>
                <Text style={styles.expandText}>
                  {showPastMessages ? 'Hide' : 'Show'}
                </Text>
              </TouchableOpacity>
              
              {showPastMessages && (
                <View style={styles.messagesList}>
                  {pastMessages.map((msg, index) => (
                    <View key={index} style={styles.messageCard}>
                      <View style={styles.messageCardHeader}>
                        <Text style={styles.messageCardSubject}>{msg.subject}</Text>
                        <Text style={styles.messageCardDate}>
                          {formatDate(msg.createdAt)}
                        </Text>
                      </View>
                      <Text style={styles.messageCardContent}>{msg.message}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          )}
        </Animated.View>

        {/* Contact Details */}
        <View style={styles.contactDetailsContainer}>
          <Text style={styles.contactDetailsTitle}>Other Ways to Contact Us</Text>
          
          <View style={styles.contactItem}>
            <Text style={styles.contactItemTitle}>Customer Support</Text>
            <Text style={styles.contactItemValue}>support@rentacar.com</Text>
            <Text style={styles.contactItemValue}>+1-555-CAR-RENT</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Text style={styles.contactItemTitle}>Business Inquiries</Text>
            <Text style={styles.contactItemValue}>business@rentacar.com</Text>
          </View>
          
          <View style={styles.contactItem}>
            <Text style={styles.contactItemTitle}>Working Hours</Text>
            <Text style={styles.contactItemValue}>Monday - Friday: 9AM - 6PM</Text>
            <Text style={styles.contactItemValue}>Saturday: 10AM - 4PM</Text>
          </View>
        </View>
      </ScrollView>

      {/* Subject Selection Modal */}
      <Modal
        visible={showSubjectModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowSubjectModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Select Subject</Text>
            
            {subjects.map((item, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.modalItem,
                  subject === item && styles.modalItemSelected
                ]}
                onPress={() => {
                  setSubject(item);
                  setShowSubjectModal(false);
                }}
              >
                <Text 
                  style={[
                    styles.modalItemText,
                    subject === item && styles.modalItemTextSelected
                  ]}
                >
                  {item}
                </Text>
                {subject === item && (
                  <Check size={20} color="#007AFF" />
                )}
              </TouchableOpacity>
            ))}
            
            <TouchableOpacity 
              style={styles.modalCancelButton}
              onPress={() => setShowSubjectModal(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  content: {
    paddingHorizontal: 20,
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 24,
    lineHeight: 24,
  },
  formContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  inputContainer: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#1D1D1F',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  messageInput: {
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    minHeight: 120,
  },
  // Replace Picker styles with custom dropdown
  dropdownButton: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderWidth: 1,
    borderColor: '#E0E0E0',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  dropdownText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  submitButton: {
    backgroundColor: '#007AFF',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  buttonContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  submitButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    marginLeft: 8,
  },
  disabledButton: {
    opacity: 0.6,
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingTop: 20,
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 16,
    textAlign: 'center',
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalItemSelected: {
    backgroundColor: 'rgba(0, 122, 255, 0.1)',
  },
  modalItemText: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
  },
  modalItemTextSelected: {
    fontFamily: 'Inter-SemiBold',
    color: '#007AFF',
  },
  modalCancelButton: {
    marginTop: 16,
    paddingVertical: 16,
    alignItems: 'center',
    borderRadius: 12,
    backgroundColor: '#F2F2F7',
  },
  modalCancelText: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#FF3B30',
  },
  pastMessagesContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    marginBottom: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  pastMessagesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  pastMessagesHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  pastMessagesTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginLeft: 12,
  },
  expandText: {
    fontSize: 14,
    fontFamily: 'Inter-Medium',
    color: '#007AFF',
  },
  messagesList: {
    padding: 20,
  },
  messageCard: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#007AFF',
  },
  messageCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  messageCardSubject: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
  },
  messageCardDate: {
    fontSize: 12,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
  },
  messageCardContent: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    lineHeight: 20,
  },
  contactDetailsContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginHorizontal: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  contactDetailsTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 16,
  },
  contactItem: {
    marginBottom: 16,
  },
  contactItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    marginBottom: 4,
  },
  contactItemValue: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginBottom: 2,
  },
});