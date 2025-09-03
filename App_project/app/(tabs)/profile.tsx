import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Mail, Phone, MapPin, Pencil } from 'lucide-react-native';
import { useRouter } from 'expo-router';

export default function ProfileScreen() {
  const router = useRouter();

  const user = {
    name: 'Lucas Scott',
    username: '@lucasscott3',
    email: 'lucasscott@gmail.com',
    phone: '+94 771234567',
    address: 'No. 45/3, Temple Road Nugegoda',
    avatar:
      'https://plus.unsplash.com/premium_photo-1671656349322-41de944d259b?w=600&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8Ym95fGVufDB8fDB8fHww',
  };

  const rentals = [
    {
      car: 'Tesla Model 3',
      date: '15/12/2024',
      duration: '3 days',
      status: 'Completed',
    },
    {
      car: 'BMW i8',
      date: '20/06/2024',
      duration: '2 days',
      status: 'Completed',
    },
    {
      car: 'Audi E-Tron',
      date: '01/05/2024',
      duration: '4 days',
      status: 'Completed',
    },
  ];

  const handleEditProfile = () => {
    router.push('/editProfile/edit-profile');
  };

  const handleLogout = () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: () => console.log('Logged out') },
    ]);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Profile Header */}
        <View style={styles.profileSection}>
          <View style={styles.avatarWrapper}>
            <Image source={{ uri: user.avatar }} style={styles.profileImage} />
            <TouchableOpacity style={styles.editIcon} onPress={handleEditProfile}>
              <Pencil size={18} color="#fff" />
            </TouchableOpacity>
          </View>
          <Text style={styles.name}>{user.name}</Text>
          <Text style={styles.username}>{user.username}</Text>
        </View>

        {/* Contact Info */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>📇 Contact Info</Text>
          <View style={styles.infoItem}>
            <Mail size={18} color="#007AFF" />
            <Text style={styles.infoText}>{user.email}</Text>
          </View>
          <View style={styles.infoItem}>
            <Phone size={18} color="#007AFF" />
            <Text style={styles.infoText}>{user.phone}</Text>
          </View>
          <View style={styles.infoItem}>
            <MapPin size={18} color="#007AFF" />
            <Text style={styles.infoText}>{user.address}</Text>
          </View>
        </View>

        {/* Rental History */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>🕓 Recent Rentals</Text>
          <Text style={styles.cardSubtitle}>Your recent car bookings</Text>
          {rentals.map((rental, index) => (
            <View key={index} style={styles.rentalCard}>
              <View>
                <Text style={styles.carName}>{rental.car}</Text>
                <Text style={styles.rentalDetails}>{rental.date} • {rental.duration}</Text>
              </View>
              <View style={styles.statusBadge}>
                <Text style={styles.statusText}>{rental.status}</Text>
              </View>
            </View>
          ))}
        </View>

        {/* Logout */}
        <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#eef4fb',
  },
  scrollContent: {
    paddingBottom: 40,
    paddingHorizontal: 16,
  },
  profileSection: {
    alignItems: 'center',
    marginTop: 30,
    marginBottom: 25,
  },
  avatarWrapper: {
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 6,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  editIcon: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#007AFF',
    borderRadius: 20,
    padding: 6,
    elevation: 3,
  },
  name: {
    fontSize: 22,
    fontWeight: '700',
    marginTop: 12,
    color: '#1e1e1e',
  },
  username: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOpacity: 0.06,
    shadowRadius: 6,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    marginBottom: 12,
    color: '#1c1c1e',
  },
  cardSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 10,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 10,
  },
  infoText: {
    fontSize: 15,
    color: '#333',
  },
  rentalCard: {
    backgroundColor: '#f2f8ff',
    padding: 14,
    borderRadius: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  carName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1a1a1a',
  },
  rentalDetails: {
    fontSize: 13,
    color: '#555',
    marginTop: 2,
  },
  statusBadge: {
    backgroundColor: '#d0f5d0',
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 20,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#28a745',
  },
  logoutButton: {
    backgroundColor: '#ff3b30',
    marginTop: 10,
    alignSelf: 'center',
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 30,
    elevation: 2,
  },
  logoutText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
});
