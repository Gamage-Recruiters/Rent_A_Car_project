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

// Define Notification type for TypeScript
type Notification = {
  id: string;
  type: 'booking' | 'maintenance' | 'service' | 'insurance' | 'app-update';
  title: string;
  description: string;
  createdAt: string;
  read: boolean;
};

// Icon map for each notification type
const ICON_MAP = {
  booking: <Bell size={24} color="#007AFF" />,
  maintenance: <CalendarClock size={24} color="#FF9500" />,
  service: <Wrench size={24} color="#10B981" />,
  insurance: <ShieldAlert size={24} color="#F43F5E" />,
  'app-update': <Info size={24} color="#34C759" />,
};

export default function OwnerNotificationsScreen() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        await new Promise((res) => setTimeout(res, 1000));

        const data: Notification[] = [
          {
            id: '1',
            type: 'booking',
            title: 'New Booking Received',
            description: 'Booking request for your Tesla Model 3.',
            createdAt: '2025-07-29T08:30:00Z',
            read: false,
          },
          {
            id: '2',
            type: 'insurance',
            title: 'Insurance Expiring Soon',
            description: 'Your vehicle insurance expires in 3 days.',
            createdAt: '2025-07-28T10:00:00Z',
            read: false,
          },
          {
            id: '3',
            type: 'maintenance',
            title: 'Time for Maintenance',
            description: '30,000 km reached. Schedule a check-up.',
            createdAt: '2025-07-27T14:00:00Z',
            read: true,
          },
        ];

        setNotifications(data);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, read: true } : item
      )
    );

  };

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));

  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.header}>Notifications & Reminders</Text>

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" />
      ) : (
        <ScrollView contentContainerStyle={styles.scroll}>
          {notifications.map((item) => (
            <View
              key={item.id}
              style={[
                styles.card,
                item.read && styles.cardRead,
              ]}
            >
              <View style={styles.icon}>{ICON_MAP[item.type]}</View>
              <View style={styles.content}>
                <Text style={styles.title}>{item.title}</Text>
                <Text style={styles.description}>{item.description}</Text>
                <Text style={styles.timestamp}>
                  {new Date(item.createdAt).toLocaleString()}
                </Text>
              </View>
              <View style={styles.actions}>
                {!item.read && (
                  <TouchableOpacity
                    onPress={() => handleMarkAsRead(item.id)}
                    style={styles.iconButton}
                  >
                    <Check size={20} color="#10B981" />
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  onPress={() => handleDelete(item.id)}
                  style={styles.iconButton}
                >
                  <Trash2 size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
    paddingTop: 20,
    paddingHorizontal: 16,
  },
  header: {
    fontSize: 22,
    fontWeight: '700',
    marginBottom: 16,
    color: '#111827',
  },
  scroll: {
    paddingBottom: 20,
  },
  card: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    padding: 14,
    borderRadius: 12,
    elevation: 2,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardRead: {
    opacity: 0.6,
  },
  icon: {
    marginRight: 12,
  },
  content: {
    flex: 1,
  },
  title: {
    fontSize: 15,
    fontWeight: '600',
    color: '#1F2937',
  },
  description: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
  },
  timestamp: {
    fontSize: 11,
    color: '#9CA3AF',
    marginTop: 4,
  },
  actions: {
    flexDirection: 'row',
    marginLeft: 10,
  },
  iconButton: {
    marginLeft: 10,
  },
});
