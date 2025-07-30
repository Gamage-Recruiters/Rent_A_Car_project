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

interface BookingRequest {
  id: string;
  user: string;
  mobile: string;
  date: string;
  car: string;
  status: 'pending' | 'approved' | 'rejected';
}

export default function BookingRequestsScreen() {
  const [requests, setRequests] = useState<BookingRequest[]>([
    {
      id: '1',
      user: 'John Doe',
      mobile: '+94 712345678',
      date: '2025-07-26',
      car: 'Toyota Prius',
      status: 'pending',
    },
    {
      id: '2',
      user: 'Jane Smith',
      mobile: '+94 762345678',
      date: '2025-07-27',
      car: 'Honda Civic',
      status: 'pending',
    },
  ]);

  const handleAction = (id: string, action: 'approve' | 'reject') => {
    const newStatus = action === 'approve' ? 'approved' : 'rejected';

    setRequests((prev) =>
      prev.map((req) =>
        req.id === id ? { ...req, status: newStatus } : req
      )
    );

    Alert.alert(`Booking ${newStatus}`);
  };

  const renderItem = ({ item }: { item: BookingRequest }) => (
    <View style={styles.card}>
      <Text style={styles.name}>{item.user}</Text>
      <View style={styles.separator} />
      <Text style={styles.info}>📞 {item.mobile}</Text>
      <Text style={styles.info}>🚗 {item.car}</Text>
      <Text style={styles.info}>📅 {item.date}</Text>
      <View style={styles.statusRow}>
        <Text style={styles.statusLabel}>Status:</Text>
        <Text
          style={[
            styles.statusValue,
            item.status === 'approved'
              ? styles.approved
              : item.status === 'rejected'
              ? styles.rejected
              : styles.pending,
          ]}
        >
          {item.status.toUpperCase()}
        </Text>
      </View>

      {item.status === 'pending' && (
        <View style={styles.actionRow}>
          <TouchableOpacity
            style={[styles.actionBtn, styles.approveBtn]}
            onPress={() => handleAction(item.id, 'approve')}
          >
            <CheckCircle color="white" size={18} />
            <Text style={styles.btnText}>Approve</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.actionBtn, styles.rejectBtn]}
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
      <Text style={styles.header}>🚘 Booking Requests</Text>
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
    backgroundColor: '#E2E8F0',
  },
  header: {
    fontSize: 28,
    fontWeight: '800',
    color: '#0F172A',
    marginVertical: 20,
    textAlign: 'center',
  },
  list: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    backgroundColor: '#FFFFFF',
    padding: 18,
    borderRadius: 20,
    marginBottom: 18,
    shadowColor: '#0F172A',
    shadowOpacity: 0.07,
    shadowRadius: 12,
    elevation: 4,
    borderLeftWidth: 4,
    borderLeftColor: '#3B82F6',
  },
  name: {
    fontSize: 20,
    fontWeight: '700',
    color: '#1E293B',
    marginBottom: 6,
  },
  info: {
    fontSize: 15,
    color: '#475569',
    marginTop: 2,
  },
  separator: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  statusLabel: {
    fontSize: 14,
    color: '#334155',
    fontWeight: '600',
  },
  statusValue: {
    marginLeft: 8,
    fontWeight: '700',
    paddingVertical: 2,
    paddingHorizontal: 10,
    borderRadius: 14,
    fontSize: 13,
  },
  approved: {
    backgroundColor: '#DCFCE7',
    color: '#16A34A',
  },
  rejected: {
    backgroundColor: '#FEE2E2',
    color: '#DC2626',
  },
  pending: {
    backgroundColor: '#E0F2FE',
    color: '#0284C7',
  },
  actionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 12,
    flex: 1,
    justifyContent: 'center',
  },
  approveBtn: {
    backgroundColor: '#16A34A',
    marginRight: 8,
  },
  rejectBtn: {
    backgroundColor: '#DC2626',
    marginLeft: 8,
  },
  btnText: {
    color: '#FFF',
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '600',
  },
});
