import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import {
  Bell,
  CalendarClock,
  Info,
  ShieldAlert,
  Wrench,
  Trash2,
  Check,
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

type Notification = {
  id: string;
  type: 'booking' | 'maintenance' | 'service' | 'insurance' | 'app-update';
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

const ICON_MAP = {
  booking: <Bell size={24} color="#2563EB" />,
  maintenance: <CalendarClock size={24} color="#F59E0B" />,
  service: <Wrench size={24} color="#10B981" />,
  insurance: <ShieldAlert size={24} color="#EF4444" />,
  'app-update': <Info size={24} color="#6366F1" />,
};

const THEME = {
  booking: {
    iconBg: '#DBEAFE',
    badgeBg: '#BFDBFE',
    cardBg: '#EFF6FF',
  },
  maintenance: {
    iconBg: '#FEF3C7',
    badgeBg: '#FDE68A',
    cardBg: '#FFFBEB',
  },
  service: {
    iconBg: '#D1FAE5',
    badgeBg: '#6EE7B7',
    cardBg: '#ECFDF5',
  },
  insurance: {
    iconBg: '#FEE2E2',
    badgeBg: '#FCA5A5',
    cardBg: '#FEF2F2',
  },
  'app-update': {
    iconBg: '#E0E7FF',
    badgeBg: '#C7D2FE',
    cardBg: '#EEF2FF',
  },
};

const BADGE_LABEL = {
  booking: 'Booking',
  maintenance: 'Maintenance',
  service: 'Service',
  insurance: 'Insurance',
  'app-update': 'App Update',
};

export default function OwnerNotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      await new Promise((res) => setTimeout(res, 600));

      const now = new Date();
      const mockData: Notification[] = [
        // Booking
        {
          id: 'b1',
          type: 'booking',
          title: 'New Booking for BMW 5 Series',
          description: 'John has requested to book the car for 3 days.',
          createdAt: new Date(now.getTime() - 1 * 60 * 60 * 1000).toISOString(),
          read: false,
        },
        // Maintenance
        {
          id: 'm1',
          type: 'maintenance',
          title: 'Oil Change Due',
          description: 'Nissan Leaf requires oil change in 2 days.',
          createdAt: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(),
          read: false,
        },
        // Service
        {
          id: 's1',
          type: 'service',
          title: 'Vehicle Inspection Completed',
          description: 'Inspection done for Hyundai Kona. No issues found.',
          createdAt: new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000).toISOString(),
          read: true,
        },
        // Insurance
        {
          id: 'i1',
          type: 'insurance',
          title: 'Insurance Expiring Soon',
          description: 'Insurance for Kia Sportage expires in 3 days.',
          createdAt: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(),
          read: false,
        },
        // App Updates
        {
          id: 'u1',
          type: 'app-update',
          title: 'New App Version 2.5.0',
          description: 'Performance improvements, better search & bug fixes.',
          createdAt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toISOString(),
          read: false,
        },
      ];

      setNotifications(mockData);
      setLoading(false);
    };

    fetchNotifications();
  }, []);

  const markAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Notifications</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#6366F1" />
      ) : (
        <ScrollView contentContainerStyle={{ paddingBottom: 40 }}>
          {notifications.map((n) => {
            const theme = THEME[n.type];
            return (
              <View
                key={n.id}
                style={[
                  styles.card,
                  { backgroundColor: theme.cardBg },
                  n.read && { opacity: 0.5 },
                ]}
              >
                <View style={styles.leftIcon}>
                  <View style={[styles.iconCircle, { backgroundColor: theme.iconBg }]}>
                    {ICON_MAP[n.type]}
                  </View>
                </View>

                <View style={styles.content}>
                  <View style={styles.titleRow}>
                    <Text style={styles.title} numberOfLines={1}>
                      {n.title}
                    </Text>
                    <Text style={styles.timestamp}>
                      {getRelativeTime(n.createdAt)}
                    </Text>
                  </View>

                  <Text style={styles.description} numberOfLines={2}>
                    {n.description}
                  </Text>

                  <View
                    style={[styles.badge, { backgroundColor: theme.badgeBg }]}
                  >
                    <Text style={styles.badgeText}>{BADGE_LABEL[n.type]}</Text>
                  </View>
                </View>

                <View style={styles.actions}>
                  {!n.read && (
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => markAsRead(n.id)}
                    >
                      <Check size={18} color="#10B981" />
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => deleteNotification(n.id)}
                  >
                    <Trash2 size={18} color="#EF4444" />
                  </TouchableOpacity>
                </View>
              </View>
            );
          })}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

// Utility: Format relative time
function getRelativeTime(isoDate: string): string {
  const now = new Date();
  const past = new Date(isoDate);
  const diff = now.getTime() - past.getTime();
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  if (days > 0) return days === 1 ? '1 day ago' : `${days} days ago`;
  if (hours > 0) return `${hours}h ago`;
  return 'Just now';
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: 'bold',
    color: '#0F172A',
    marginBottom: 16,
  },
  card: {
    flexDirection: 'row',
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
    alignItems: 'flex-start',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  leftIcon: {
    marginRight: 12,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  title: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1E293B',
    flex: 1,
    marginRight: 8,
  },
  timestamp: {
    fontSize: 12,
    color: '#64748B',
  },
  description: {
    fontSize: 14,
    color: '#475569',
    marginBottom: 8,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 10,
    alignSelf: 'flex-start',
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1E293B',
  },
  actions: {
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
  },
  actionButton: {
    backgroundColor: '#F1F5F9',
    padding: 6,
    borderRadius: 12,
    marginVertical: 3,
  },
});
