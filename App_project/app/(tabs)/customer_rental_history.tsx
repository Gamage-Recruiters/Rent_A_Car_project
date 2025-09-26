import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const mockEarnings = {
  total: 1520,
  thisMonth: 930,
  active: 1,
  completed: 12,
};

const mockHistory = [
  { id: 'RH401', car: 'Toyota Camry 20222', customer: 'John Smith', status: 'Completed' },
  { id: 'RH502', car: 'Honda Civic 222', customer: 'Mia Wilson', status: 'Completed' },
  { id: 'RH602', car: 'BMW X5 2014', customer: 'Emily Davis', status: 'Pending' },
];

const TABS = ['All Rentals', 'Active', 'Completed', 'Pending'];

export default function CustomerRentalHistoryScreen() {
  const [selectedTab, setSelectedTab] = useState('All Rentals');

  const filteredHistory =
    selectedTab === 'All Rentals'
      ? mockHistory
      : mockHistory.filter((item) => item.status === selectedTab.slice(0, -1));

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.headerTitle}>Rental History & Earnings</Text>
        <Text style={styles.headerSubtitle}>
          Track your rental income and manage your car listings
        </Text>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${mockEarnings.total}</Text>
            <Text style={styles.statLabel}>Total Earnings</Text>
            <Text style={styles.statSubLabel}>All time</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>${mockEarnings.thisMonth}</Text>
            <Text style={styles.statLabel}>This Month</Text>
            <Text style={styles.statSubLabel}>+10% from last month</Text>
          </View>
        </View>
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockEarnings.active}</Text>
            <Text style={styles.statLabel}>Active Rentals</Text>
            <Text style={styles.statSubLabel}>Currently rented</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statValue}>{mockEarnings.completed}</Text>
            <Text style={styles.statLabel}>Completed</Text>
            <Text style={styles.statSubLabel}>Total rentals</Text>
          </View>
        </View>
        <View style={styles.historySection}>
          <Text style={styles.sectionTitle}>Rental History</Text>
          <View style={styles.tabRow}>
            {TABS.map((tab) => (
              <TouchableOpacity
                key={tab}
                style={[styles.tabButton, selectedTab === tab && styles.activeTabButton]}
                onPress={() => setSelectedTab(tab)}
              >
                <Text style={[styles.tabButtonText, selectedTab === tab && styles.activeTabButtonText]}>{tab}</Text>
              </TouchableOpacity>
            ))}
          </View>
          <View style={styles.tableHeader}>
            <Text style={[styles.tableHeaderText, { flex: 1.2 }]}>Rental ID</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Car Model</Text>
            <Text style={[styles.tableHeaderText, { flex: 2 }]}>Customer</Text>
          </View>
          <FlatList
            data={filteredHistory}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={styles.tableRow}>
                <Text style={[styles.tableCell, { flex: 1.2 }]}>{item.id}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.car}</Text>
                <Text style={[styles.tableCell, { flex: 2 }]}>{item.customer}</Text>
              </View>
            )}
            ListEmptyComponent={<Text style={styles.emptyText}>No records found.</Text>}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F7F8FA',
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-Bold',
    color: '#2471F2',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#8E8E93',
    marginBottom: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 16,
    marginHorizontal: 4,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statValue: {
    fontSize: 22,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 14,
    fontFamily: 'Poppins-Medium',
    color: '#1D1D1F',
  },
  statSubLabel: {
    fontSize: 12,
    color: '#8E8E93',
    marginTop: 2,
  },
  historySection: {
    backgroundColor: '#F1F3F6',
    borderRadius: 12,
    padding: 16,
    marginTop: 18,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 10,
  },
  tabRow: {
    flexDirection: 'row',
    marginBottom: 10,
  },
  tabButton: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    backgroundColor: '#E5E9F2',
    marginRight: 8,
  },
  activeTabButton: {
    backgroundColor: '#2471F2',
  },
  tabButtonText: {
    fontSize: 13,
    color: '#1D1D1F',
    fontFamily: 'Inter-Medium',
  },
  activeTabButtonText: {
    color: '#FFFFFF',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E9F2',
    paddingBottom: 6,
    marginBottom: 4,
  },
  tableHeaderText: {
    fontSize: 13,
    fontFamily: 'Poppins-Medium',
    color: '#8E8E93',
  },
  tableRow: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F3F6',
  },
  tableCell: {
    fontSize: 13,
    color: '#1D1D1F',
    fontFamily: 'Inter-Regular',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8E8E93',
    marginTop: 12,
    fontSize: 14,
  },
}); 