import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/Feather';

export default function PastBookingScreen() {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.contentContainer}>
        {/* Header */}
        <Text style={styles.header}>Past Booking</Text>

        {/* Vehicle Card */}
        <View style={styles.card}>
          {/* Vehicle Image and Info */}
          <View style={styles.vehicleInfo}>
            <View style={styles.imagePlaceholder} />
            <View style={styles.vehicleDetails}>
              <Text style={styles.vehicleTitle}>Toyota Prius - CAX-1234</Text>
              <View style={styles.locationRow}>
                <Icon name="map-pin" size={14} color="#999" />
                <Text style={styles.locationText}>Colombo to Galle</Text>
              </View>
              <Text style={styles.kmText}>120km</Text>
            </View>
          </View>

          {/* Booking Details */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Booking Details</Text>
            <DetailRow icon="calendar" label="Dates" value="12 - 14 Nov 2024" />
            <DetailRow icon="user" label="Booked By" value="Nimal Perera" />
            <DetailRow icon="file-text" label="Documents" value="ID Card" />
            <DetailRow icon="phone" label="Phone" value="0214345646" />
            <DetailRow icon="dollar-sign" label="Earned" value="$150" />
          </View>

          {/* Reviews */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Reviews</Text>
            <View style={styles.ratingContainer}>
              <Text style={styles.ratingText}>4.4</Text>
              <View style={styles.starsRow}>
                {[1, 2, 3, 4].map((_, i) => (
                  <Icon key={i} name="star" color="#FFD700" size={18} />
                ))}
                <Icon name="star" color="#CCC" size={18} />
              </View>
            </View>
            <Text style={styles.reviewText}>
              Lorem ipsum dolor sit amet, consectetur
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const DetailRow = ({ icon, label, value }) => (
  <View style={styles.detailRow}>
    <Icon name={icon} size={16} color="#555" style={styles.icon} />
    <Text style={styles.detailLabel}>{label}:</Text>
    <Text style={styles.detailValue}>{value}</Text>
  </View>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f9f9f9',
  },
  contentContainer: {
    padding: 16,
  },
  header: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 12,
    alignSelf: 'center',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    elevation: 4,
  },
  vehicleInfo: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  imagePlaceholder: {
    width: 70,
    height: 70,
    backgroundColor: '#ddd',
    borderRadius: 8,
  },
  vehicleDetails: {
    marginLeft: 12,
    flex: 1,
    justifyContent: 'center',
  },
  vehicleTitle: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    color: '#777',
    marginLeft: 4,
  },
  kmText: {
    color: '#007BFF',
    fontSize: 14,
    marginTop: 4,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontWeight: '600',
    fontSize: 15,
    marginBottom: 8,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  icon: {
    width: 20,
  },
  detailLabel: {
    fontSize: 14,
    color: '#333',
    width: 90,
  },
  detailValue: {
    fontSize: 14,
    color: '#555',
  },
  ratingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  ratingText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginRight: 10,
  },
  starsRow: {
    flexDirection: 'row',
  },
  reviewText: {
    marginTop: 4,
    color: '#777',
    fontSize: 13,
  },
});
