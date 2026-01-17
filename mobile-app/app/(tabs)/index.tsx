import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
// If expo-linear-gradient is not installed, the app will still work but gradients won't display
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/contexts/AuthContext';
import api from '@/src/services/api';
import { BrandColors, BrandSpacing, BrandBorderRadius, BrandShadows } from '@/constants/brand';

interface TodayAttendance {
  id: string;
  status: string;
  checkIn?: {
    time: string;
    ipAddress: string;
  };
  checkOut?: {
    time: string;
    ipAddress: string;
  };
  workingHours: number;
}

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useEffect(() => {
    fetchTodayAttendance();
  }, []);

  const fetchTodayAttendance = async () => {
    try {
      const response = await api.get('/attendance/today');
      setTodayAttendance(response.data.attendance);
    } catch (error) {
      console.error('Error fetching attendance:', error);
      setTodayAttendance(null);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchTodayAttendance();
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  const formatTime = (dateString: string) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return BrandColors.success;
      case 'LATE':
        return BrandColors.warning;
      case 'ABSENT':
        return BrandColors.error;
      case 'HALF_DAY':
        return BrandColors.info;
      default:
        return BrandColors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PRESENT':
        return 'checkmark-circle';
      case 'LATE':
        return 'time';
      case 'ABSENT':
        return 'close-circle';
      case 'HALF_DAY':
        return 'ellipse-half';
      default:
        return 'help-circle';
    }
  };

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{ paddingBottom: BrandSpacing.xl }}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={BrandColors.primary} />
      }
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#2D5016', '#4A7C2A', '#6B9E3E']}
        style={[styles.header, { paddingTop: insets.top + BrandSpacing.md }]}
      >
        <View style={styles.headerContent}>
          <View style={styles.welcomeSection}>
            <Text style={styles.greeting}>Hello,</Text>
            <Text style={styles.name}>{user?.name || 'Employee'}</Text>
          </View>
          <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
            <Ionicons name="log-out-outline" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Today's Attendance Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="calendar-outline" size={24} color={BrandColors.primary} />
              <Text style={styles.cardTitle}>Today's Attendance</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BrandColors.primary} />
            </View>
          ) : todayAttendance ? (
            <View style={styles.attendanceContent}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(todayAttendance.status) + '20' }]}>
                <Ionicons name={getStatusIcon(todayAttendance.status)} size={24} color={getStatusColor(todayAttendance.status)} />
                <Text style={[styles.statusText, { color: getStatusColor(todayAttendance.status) }]}>
                  {todayAttendance.status}
                </Text>
              </View>

              <View style={styles.attendanceDetails}>
                {todayAttendance.checkIn?.time && (
                  <View style={styles.detailRow}>
                    <View style={styles.detailIconContainer}>
                      <Ionicons name="arrow-down-circle" size={20} color={BrandColors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Check In</Text>
                      <Text style={styles.detailValue}>{formatTime(todayAttendance.checkIn.time)}</Text>
                    </View>
                  </View>
                )}

                {todayAttendance.checkOut?.time && (
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconContainer, { backgroundColor: BrandColors.error + '20' }]}>
                      <Ionicons name="arrow-up-circle" size={20} color={BrandColors.error} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Check Out</Text>
                      <Text style={styles.detailValue}>{formatTime(todayAttendance.checkOut.time)}</Text>
                    </View>
                  </View>
                )}

                {todayAttendance.workingHours > 0 && (
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconContainer, { backgroundColor: BrandColors.info + '20' }]}>
                      <Ionicons name="time-outline" size={20} color={BrandColors.info} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Working Hours</Text>
                      <Text style={styles.detailValue}>
                        {Math.floor(todayAttendance.workingHours / 60)}h {todayAttendance.workingHours % 60}m
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          ) : (
            <View style={styles.emptyState}>
              <Ionicons name="calendar-clear-outline" size={48} color={BrandColors.textSecondary} />
              <Text style={styles.emptyStateText}>No attendance record for today</Text>
            </View>
          )}
        </View>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionsGrid}>
            <TouchableOpacity
              style={[styles.actionCard, styles.attendanceAction]}
              onPress={() => router.push('/(tabs)/attendance')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[BrandColors.primary, BrandColors.primaryLight]}
                style={styles.actionCardGradient}
              >
                <Ionicons name="time-outline" size={32} color="#fff" />
                <Text style={styles.actionCardTitle}>Check In/Out</Text>
                <Text style={styles.actionCardSubtitle}>Record attendance</Text>
              </LinearGradient>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.actionCard, styles.leavesAction]}
              onPress={() => router.push('/(tabs)/leaves')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={[BrandColors.secondary, BrandColors.secondaryLight]}
                style={styles.actionCardGradient}
              >
                <Ionicons name="calendar-outline" size={32} color="#fff" />
                <Text style={styles.actionCardTitle}>Leaves</Text>
                <Text style={styles.actionCardSubtitle}>Manage requests</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  header: {
    paddingBottom: BrandSpacing.lg,
    paddingHorizontal: BrandSpacing.lg,
    ...BrandShadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  welcomeSection: {
    flex: 1,
  },
  greeting: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 4,
  },
  name: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
  },
  logoutButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    padding: BrandSpacing.lg,
    gap: BrandSpacing.lg,
  },
  card: {
    backgroundColor: BrandColors.surface,
    borderRadius: BrandBorderRadius.xl,
    padding: BrandSpacing.lg,
    ...BrandShadows.lg,
  },
  cardHeader: {
    marginBottom: BrandSpacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.sm,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  loadingContainer: {
    padding: BrandSpacing.xl,
    alignItems: 'center',
  },
  attendanceContent: {
    gap: BrandSpacing.md,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.sm,
    padding: BrandSpacing.md,
    borderRadius: BrandBorderRadius.md,
    marginBottom: BrandSpacing.sm,
  },
  statusText: {
    fontSize: 18,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  attendanceDetails: {
    gap: BrandSpacing.sm,
    paddingTop: BrandSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: BrandColors.divider,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.md,
    paddingVertical: BrandSpacing.sm,
  },
  detailIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: BrandColors.primary + '20',
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginBottom: 2,
  },
  detailValue: {
    fontSize: 16,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  emptyState: {
    padding: BrandSpacing.xl,
    alignItems: 'center',
    gap: BrandSpacing.md,
  },
  emptyStateText: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
  quickActions: {
    gap: BrandSpacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.textPrimary,
    marginBottom: BrandSpacing.sm,
  },
  actionsGrid: {
    flexDirection: 'row',
    gap: BrandSpacing.md,
  },
  actionCard: {
    flex: 1,
    borderRadius: BrandBorderRadius.xl,
    overflow: 'hidden',
    ...BrandShadows.md,
  },
  actionCardGradient: {
    padding: BrandSpacing.lg,
    alignItems: 'center',
    gap: BrandSpacing.sm,
    minHeight: 120,
    justifyContent: 'center',
  },
  actionCardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
    marginTop: BrandSpacing.xs,
  },
  actionCardSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  attendanceAction: {
    // Styles handled by gradient
  },
  leavesAction: {
    // Styles handled by gradient
  },
});
