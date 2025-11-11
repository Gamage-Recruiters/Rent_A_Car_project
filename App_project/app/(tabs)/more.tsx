import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import {
  Info,
  Phone,
  Mail,
  Star,
  Globe,
  Shield,
  FileText,
  ChevronRight,
  MessageCircle,
  ExternalLink,
  CreditCard,
} from 'lucide-react-native';
import { router } from 'expo-router';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withSpring,
  FadeIn,
} from 'react-native-reanimated';

export default function MoreScreen() {
  const scaleValue = useSharedValue(1);

  const handlePressIn = () => {
    scaleValue.value = withSpring(0.95);
  };

  const handlePressOut = () => {
    scaleValue.value = withSpring(1);
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scaleValue.value }],
    };
  });

  const handleContactAdmin = () => {
    router.push('/contact');
  };

  const handleOpenWeb = () => {
    Linking.openURL('https://www.rentacar.com');
  };

  const handleReviews = () => {
    router.push('/reviews');
  };

  const handleRateApp = () => {
    // In a real app, you would use a library like react-native-rate
    Alert.alert(
      'Rate Our App',
      'We would love to hear your feedback! Please rate us on the App Store.',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Rate Now', onPress: () => console.log('Opening app store') },
      ]
    );
  };

  const handlePayment = () => {
    router.push('/payment');
  };

  const MenuItem = ({
    icon: Icon,
    title,
    subtitle,
    onPress,
    showChevron = true,
    iconColor = '#007AFF'
  }: any) => (
    <Animated.View entering={FadeIn.delay(100)}>
      <TouchableOpacity
        style={styles.menuItem}
        onPress={onPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.9}
      >
        <View style={styles.menuItemLeft}>
          <View style={[styles.menuItemIcon, { backgroundColor: `${iconColor}20` }]}>
            <Icon size={20} color={iconColor} />
          </View>
          <View style={styles.menuItemContent}>
            <Text style={styles.menuItemTitle}>{title}</Text>
            {subtitle && <Text style={styles.menuItemSubtitle}>{subtitle}</Text>}
          </View>
        </View>
        {showChevron && <ChevronRight size={20} color="#8E8E93" />}
      </TouchableOpacity>
    </Animated.View>
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>More</Text>
          <Text style={styles.subtitle}>Additional features and information</Text>
        </View>

        {/* App Info Section */}
        <Animated.View style={styles.section} entering={FadeIn}>
          <Text style={styles.sectionTitle}>App Information</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon={Info}
              title="About RentACar"
              subtitle="Learn more about our service"
              onPress={() => router.push('/about')}
              iconColor="#007AFF"
            />
            <MenuItem
              icon={Globe}
              title="Open in Web"
              subtitle="Visit our website"
              onPress={handleOpenWeb}
              iconColor="#4CAF50"
            />
            <MenuItem
              icon={FileText}
              title="Terms & Conditions"
              subtitle="Read our terms of service"
              onPress={() => router.push('/terms')}
              iconColor="#FF9800"
            />
            <MenuItem
              icon={Shield}
              title="Privacy Policy"
              subtitle="Your privacy matters to us"
              onPress={() => router.push('/privacy')}
              iconColor="#9C27B0"
            />
          </View>
        </Animated.View>

        {/* Payment Section */}
        <Animated.View style={styles.section} entering={FadeIn.delay(150)}>
          <Text style={styles.sectionTitle}>Payment & Billing</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon={CreditCard}
              title="Payment Methods"
              subtitle="Manage your payment options"
              onPress={handlePayment}
              iconColor="#4CAF50"
            />
          </View>
        </Animated.View>

        {/* Contact & Support Section */}
        <Animated.View style={styles.section} entering={FadeIn.delay(250)}>
          <Text style={styles.sectionTitle}>Contact & Support</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon={Phone}
              title="Contact Admin"
              subtitle="Get help from our team"
              onPress={handleContactAdmin}
              iconColor="#F44336"
            />
            <MenuItem
              icon={MessageCircle}
              title="Live Chat"
              subtitle="Chat with our support team"
              onPress={() => router.push('/chat')}
              iconColor="#00BCD4"
            />
            <MenuItem
              icon={Mail}
              title="Email Support"
              subtitle="Send us your questions"
              onPress={() => Linking.openURL('mailto:support@rentacar.com')}
              iconColor="#FF5722"
            />
          </View>
        </Animated.View>

        {/* Reviews & Feedback Section */}
        <Animated.View style={styles.section} entering={FadeIn.delay(350)}>
          <Text style={styles.sectionTitle}>Reviews & Feedback</Text>
          <View style={styles.menuContainer}>
            <MenuItem
              icon={Star}
              title="Reviews"
              subtitle="Read what others are saying"
              onPress={handleReviews}
              iconColor="#FFD700"
            />
            <MenuItem
              icon={Star}
              title="Rate Our App"
              subtitle="Help us improve"
              onPress={handleRateApp}
              iconColor="#FF9800"
            />
          </View>
        </Animated.View>

        {/* Quick Actions */}
        <Animated.View style={styles.section} entering={FadeIn.delay(450)}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.quickActionsContainer}>
            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/help')}
              activeOpacity={0.9}
            >
              <View style={styles.quickActionIcon}>
                <Info size={24} color="#007AFF" />
              </View>
              <Text style={styles.quickActionTitle}>Help Center</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={() => router.push('/faq')}
              activeOpacity={0.9}
            >
              <View style={styles.quickActionIcon}>
                <MessageCircle size={24} color="#4CAF50" />
              </View>
              <Text style={styles.quickActionTitle}>FAQ</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionCard}
              onPress={handleOpenWeb}
              activeOpacity={0.9}
            >
              <View style={styles.quickActionIcon}>
                <ExternalLink size={24} color="#FF9800" />
              </View>
              <Text style={styles.quickActionTitle}>Website</Text>
            </TouchableOpacity>
          </View>
        </Animated.View>

        {/* App Details */}
        <Animated.View style={styles.appDetails} entering={FadeIn.delay(550)}>
          <Text style={styles.appName}>RentACar</Text>
          <Text style={styles.appVersion}>Version 1.0.0</Text>
          <Text style={styles.appDescription}>
            Your trusted car rental companion. Find, book, and manage car rentals with ease.
          </Text>
          <View style={styles.appFeatures}>
            <Text style={styles.featureTitle}>Key Features:</Text>
            <Text style={styles.featureText}>• Easy car search and booking</Text>
            <Text style={styles.featureText}>• Secure payment processing</Text>
            <Text style={styles.featureText}>• Real-time availability</Text>
            <Text style={styles.featureText}>• 24/7 customer support</Text>
            <Text style={styles.featureText}>• Car owner dashboard</Text>
            <Text style={styles.featureText}>• Rating and review system</Text>
          </View>
        </Animated.View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 20,
    paddingBottom: 10,
  },
  title: {
    fontSize: 28,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
  },
  subtitle: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 4,
  },
  section: {
    marginTop: 20,
    paddingHorizontal: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  menuContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  menuItemIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemContent: {
    flex: 1,
  },
  menuItemTitle: {
    fontSize: 16,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
  },
  menuItemSubtitle: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    marginTop: 2,
  },
  quickActionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  quickActionCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    marginRight: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  quickActionIcon: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F8F9FA',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  quickActionTitle: {
    fontSize: 14,
    fontFamily: 'Inter-SemiBold',
    color: '#1D1D1F',
    textAlign: 'center',
  },
  appDetails: {
    backgroundColor: '#FFFFFF',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 20,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  appName: {
    fontSize: 24,
    fontFamily: 'Poppins-Bold',
    color: '#1D1D1F',
    textAlign: 'center',
    marginBottom: 4,
  },
  appVersion: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    textAlign: 'center',
    marginBottom: 12,
  },
  appDescription: {
    fontSize: 16,
    fontFamily: 'Inter-Regular',
    color: '#1D1D1F',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 20,
  },
  appFeatures: {
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
    paddingTop: 20,
  },
  featureTitle: {
    fontSize: 18,
    fontFamily: 'Poppins-SemiBold',
    color: '#1D1D1F',
    marginBottom: 12,
  },
  featureText: {
    fontSize: 14,
    fontFamily: 'Inter-Regular',
    color: '#8E8E93',
    lineHeight: 20,
    marginBottom: 4,
  },
});