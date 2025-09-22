import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { CheckCircle, XCircle } from 'lucide-react-native';

export default function BookingRequestsScreen() {
  const [requests, setRequests] = useState([
    {
      id: '1',
      user: 'John Doe',
      date: '2025-07-26',
      car: 'Toyota Prius',
      status: 'pending',
    },
    { 
      id: '2',
      user: 'Jane Smith',
      date: '2025-07-27',
      car: 'Honda Civic',
      status: 'pending',
    },
  ]);

  const handleAction = (id, action) => {
    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: action } : req
      )
    );
    Alert.alert(`Booking ${action === 'approve' ? 'approved' : 'rejected'}`);
  };

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.user}</Text>
      <Text style={styles.info}>Car: {item.car}</Text>
      <Text style={styles.info}>Date: {item.date}</Text>
      <Text style={styles.status}>
        Status:{' '}
        <Text
          style={{
            color:
              item.status === 'approved'
                ? 'green'
                : item.status === 'rejected'
                ? 'red'
                : '#999',
          }}
        >
          {item.status.toUpperCase()}
        </Text>
      </Text>

      {item.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={styles.approveBtn}
            onPress={() => handleAction(item.id, 'approve')}
          >
            <CheckCircle color="white" size={18} />
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.rejectBtn}
            onPress={() => handleAction(item.id, 'reject')}
          >
            <XCircle color="white" size={18} />
            <Text style={styles.btnText}>Reject</Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Booking Requests</Text>
      <FlatList
        data={requests}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.list}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    margin: 16,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    color: '#555',
    marginTop: 4,
  },
  status: {
    marginTop: 6,
    fontWeight: '500',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 12,
  },
  approveBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#22C55E',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginRight: 8,
    justifyContent: 'center',
  },
  rejectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    padding: 10,
    borderRadius: 8,
    flex: 1,
    marginLeft: 8,
    justifyContent: 'center',
  },
  btnText: {
    color: 'white',
    marginLeft: 6,
    fontWeight: '500',
  },
});
