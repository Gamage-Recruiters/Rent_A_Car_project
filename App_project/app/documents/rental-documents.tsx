import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  Alert,
  ScrollView,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';

const { width } = Dimensions.get('window');

type DocumentType = 'identityProof' | 'drivingLicense';

interface Documents {
  identityProof: string | null;
  drivingLicense: string | null;
}

export default function RentalDocumentsScreen() {
  const router = useRouter();

  const [documents, setDocuments] = useState<Documents>({
    identityProof: null, // National ID or Passport
    drivingLicense: null,
  });

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);

  const pickDocument = async (type: DocumentType) => {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert(
        'Permission Required',
        'Please allow access to your photo library to upload documents.',
        [{ text: 'OK' }]
      );
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
      aspect: [4, 3],
    });

    if (!result.canceled && result.assets) {
      const selectedImage = result.assets[0];
      setDocuments(prev => ({ ...prev, [type]: selectedImage.uri }));
    }
  };

  const removeDocument = (type: DocumentType) => {
    Alert.alert(
      'Remove Document',
      'Are you sure you want to remove this document?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => setDocuments(prev => ({ ...prev, [type]: null })),
        },
      ]
    );
  };

  const handleSubmit = async () => {
    if (!documents.identityProof || !documents.drivingLicense) {
      Alert.alert(
        'Missing Documents',
        'Please upload both Identity Proof and Driving License to continue.',
        [{ text: 'OK' }]
      );
      return;
    }

    setIsSubmitting(true);
    
    // Simulate upload delay
    setTimeout(() => {
      setIsSubmitting(false);
      Alert.alert(
        'Documents Submitted Successfully! ✅',
        'Your documents have been uploaded and are being reviewed. You will be notified once verification is complete.',
        [
          {
            text: 'Continue',
            onPress: () => router.back(),
          },
        ]
      );
    }, 2000);
  };

  const renderUploadBox = (label: string, field: DocumentType, description: string, icon: string) => (
    <View style={styles.uploadCard}>
      <View style={styles.cardHeader}>
        <View style={styles.labelContainer}>
          <Text style={styles.icon}>{icon}</Text>
          <View>
            <Text style={styles.label}>{label}</Text>
            <Text style={styles.description}>{description}</Text>
          </View>
        </View>
        {documents[field] && (
          <TouchableOpacity
            onPress={() => removeDocument(field)}
            style={styles.removeButton}
          >
            <Text style={styles.removeButtonText}>✕</Text>
          </TouchableOpacity>
        )}
      </View>

      {documents[field] ? (
        <View style={styles.imageContainer}>
          <Image source={{ uri: documents[field] }} style={styles.previewImage} />
          <TouchableOpacity
            onPress={() => pickDocument(field)}
            style={styles.replaceButton}
          >
            <Text style={styles.replaceButtonText}>Replace Image</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity onPress={() => pickDocument(field)} style={styles.uploadArea}>
          <View style={styles.uploadIcon}>
            <Text style={styles.uploadIconText}>📁</Text>
          </View>
          <Text style={styles.uploadAreaText}>Tap to upload {label.toLowerCase()}</Text>
          <Text style={styles.uploadHint}>JPG, PNG • Max 10MB</Text>
        </TouchableOpacity>
      )}
    </View>
  );

  const isFormComplete = documents.identityProof && documents.drivingLicense;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Header Section */}
        <View style={styles.header}>
          <Text style={styles.screenTitle}>Verify Your Identity</Text>
          <Text style={styles.screenSubtitle}>
            Upload clear photos of your documents to complete verification
          </Text>
          <View style={styles.progressContainer}>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill, 
                  { width: `${(Object.values(documents).filter(Boolean).length / 2) * 100}%` }
                ]} 
              />
            </View>
            <Text style={styles.progressText}>
              {Object.values(documents).filter(Boolean).length} of 2 documents uploaded
            </Text>
          </View>
        </View>

        {/* Upload Cards */}
        <View style={styles.documentsContainer}>
          {renderUploadBox(
            'National ID or Passport',
            'identityProof',
            'Government-issued photo identification',
            '🆔'
          )}
          
          {renderUploadBox(
            'Driving License',
            'drivingLicense',
            'Valid driving license (front side)',
            '🚗'
          )}
        </View>

        {/* Info Section */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📋 Document Requirements</Text>
          <View style={styles.infoList}>
            <Text style={styles.infoItem}>• Documents must be clear and readable</Text>
            <Text style={styles.infoItem}>• All corners should be visible</Text>
            <Text style={styles.infoItem}>• No glare or shadows on the document</Text>
            <Text style={styles.infoItem}>• Documents must be valid and not expired</Text>
          </View>
        </View>

        {/* Submit Button */}
        <TouchableOpacity
          style={[
            styles.submitButton,
            isFormComplete ? styles.submitButtonActive : styles.submitButtonDisabled,
          ]}
          onPress={handleSubmit}
          disabled={!isFormComplete || isSubmitting}
        >
          <Text style={[
            styles.submitText,
            isFormComplete ? styles.submitTextActive : styles.submitTextDisabled,
          ]}>
            {isSubmitting ? 'Submitting...' : 'Submit Documents'}
          </Text>
          {isSubmitting && <Text style={styles.loadingSpinner}>⏳</Text>}
        </TouchableOpacity>

        <View style={styles.bottomSpacer} />
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
  },
  header: {
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 30,
  },
  screenTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#1a202c',
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.5,
  },
  screenSubtitle: {
    fontSize: 16,
    color: '#64748b',
    textAlign: 'center',
    lineHeight: 22,
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    alignItems: 'center',
  },
  progressBar: {
    width: '80%',
    height: 6,
    backgroundColor: '#e2e8f0',
    borderRadius: 3,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 3,
  },
  progressText: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  documentsContainer: {
    marginBottom: 20,
  },
  uploadCard: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderColor: '#e2e8f0',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  labelContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  icon: {
    fontSize: 20,
    marginRight: 12,
  },
  label: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1a202c',
    marginBottom: 2,
  },
  description: {
    fontSize: 12,
    color: '#64748b',
    fontWeight: '500',
  },
  removeButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#fee2e2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeButtonText: {
    color: '#dc2626',
    fontSize: 14,
    fontWeight: '600',
  },
  uploadArea: {
    height: 180,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#cbd5e1',
    borderStyle: 'dashed',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f8fafc',
  },
  uploadIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#e0f2fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
  },
  uploadIconText: {
    fontSize: 24,
  },
  uploadAreaText: {
    color: '#374151',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  uploadHint: {
    color: '#9ca3af',
    fontSize: 12,
    fontWeight: '500',
  },
  imageContainer: {
    position: 'relative',
  },
  previewImage: {
    width: '100%',
    height: 180,
    borderRadius: 12,
    resizeMode: 'cover',
    marginBottom: 12,
  },
  replaceButton: {
    backgroundColor: '#f1f5f9',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    alignSelf: 'center',
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  replaceButtonText: {
    color: '#475569',
    fontSize: 14,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: '#fef3c7',
    borderRadius: 12,
    padding: 16,
    marginBottom: 30,
    borderLeftWidth: 4,
    borderLeftColor: '#f59e0b',
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#92400e',
    marginBottom: 8,
  },
  infoList: {
    marginLeft: 8,
  },
  infoItem: {
    fontSize: 13,
    color: '#92400e',
    lineHeight: 18,
    marginBottom: 2,
  },
  submitButton: {
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    marginTop: 10,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 4,
  },
  submitButtonActive: {
    backgroundColor: '#10b981',
  },
  submitButtonDisabled: {
    backgroundColor: '#e2e8f0',
  },
  submitText: {
    fontSize: 16,
    fontWeight: '700',
  },
  submitTextActive: {
    color: '#ffffff',
  },
  submitTextDisabled: {
    color: '#9ca3af',
  },
  loadingSpinner: {
    marginLeft: 8,
    fontSize: 16,
  },
  bottomSpacer: {
    height: 20,
  },
});