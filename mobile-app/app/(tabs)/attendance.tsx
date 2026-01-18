import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '@/src/contexts/AuthContext';
import api from '@/src/services/api';
import AlertModal from '@/components/AlertModal';
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

export default function AttendanceScreen() {
  const { user } = useAuth();
  const insets = useSafeAreaInsets();
  const [todayAttendance, setTodayAttendance] = useState<TodayAttendance | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [alertModal, setAlertModal] = useState({
    visible: false,
    type: 'success' as 'success' | 'warning' | 'info' | 'error',
    title: '',
    message: '',
    checkInTime: '',
    minutesLate: 0,
    minutesEarly: 0,
    status: '',
  });

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

  const handleCheckIn = async () => {
    if (todayAttendance?.checkIn?.time) {
      Alert.alert('Already Checked In', 'You have already checked in today.');
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post('/attendance/checkin');
      const { attendance, minutesLate, minutesEarly, status } = response.data;
      
      const checkInTime = attendance?.checkIn?.time 
        ? new Date(attendance.checkIn.time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

      // Determine alert type and message
      let alertType: 'success' | 'warning' | 'info' | 'error' = 'success';
      let title = 'Check-In Successful!';
      let message = 'You have successfully checked in.';

      if (minutesLate && minutesLate > 0) {
        if (minutesLate <= 5) {
          alertType = 'warning';
          title = 'Checked In (Slightly Late)';
          message = `You checked in ${minutesLate} minute${minutesLate > 1 ? 's' : ''} late.`;
        } else if (minutesLate <= 15) {
          alertType = 'warning';
          title = 'Checked In (Late)';
          message = `You checked in ${minutesLate} minutes late.`;
        } else {
          alertType = 'warning';
          title = 'Checked In (Very Late)';
          message = `You checked in ${minutesLate} minutes late.`;
        }
      } else if (minutesEarly && minutesEarly > 0) {
        alertType = 'success';
        title = 'Checked In (Early)';
        message = `You checked in ${minutesEarly} minute${minutesEarly > 1 ? 's' : ''} early.`;
      } else {
        alertType = 'success';
        title = 'Checked In (On Time)';
        message = 'You checked in on time.';
      }

      setAlertModal({
        visible: true,
        type: alertType,
        title,
        message,
        checkInTime,
        minutesLate: minutesLate || 0,
        minutesEarly: minutesEarly || 0,
        status: status || 'PRESENT',
      });

      // Fetch updated attendance after showing alert
      setTimeout(() => {
        fetchTodayAttendance();
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to check in. Please make sure you are connected to office WiFi.';
      Alert.alert('Check In Failed', errorMessage);
    } finally {
      setProcessing(false);
    }
  };

  const handleCheckOut = async () => {
    if (!todayAttendance?.checkIn?.time) {
      Alert.alert('Error', 'You must check in before checking out.');
      return;
    }

    if (todayAttendance?.checkOut?.time) {
      Alert.alert('Already Checked Out', 'You have already checked out today.');
      return;
    }

    setProcessing(true);
    try {
      const response = await api.post('/attendance/checkout');
      const { attendance } = response.data;
      
      const checkOutTime = attendance?.checkOut?.time 
        ? new Date(attendance.checkOut.time).toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          })
        : new Date().toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
          });

      const workingHours = attendance?.workingHours || 0;
      const hours = Math.floor(workingHours / 60);
      const minutes = workingHours % 60;

      setAlertModal({
        visible: true,
        type: 'success',
        title: 'Check-Out Successful!',
        message: `You have successfully checked out. Working hours: ${hours}h ${minutes}m`,
        checkInTime: checkOutTime,
        minutesLate: 0,
        minutesEarly: 0,
        status: '',
      });

      // Fetch updated attendance after showing alert
      setTimeout(() => {
        fetchTodayAttendance();
      }, 1000);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error ||
        error.response?.data?.message ||
        'Failed to check out. Please make sure you are connected to office WiFi.';
      Alert.alert('Check Out Failed', errorMessage);
    } finally {
      setProcessing(false);
    }
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
        return 'stop-circle-outline';
      default:
        return 'help-circle';
    }
  };

  const canCheckIn = !todayAttendance?.checkIn?.time;
  const canCheckOut = todayAttendance?.checkIn?.time && !todayAttendance?.checkOut?.time;

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
          <View>
            <Text style={styles.headerTitle}>Attendance</Text>
            <Text style={styles.headerSubtitle}>Check in and check out</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="time-outline" size={32} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      <View style={styles.content}>
        {/* Today's Status Card */}
        <View style={styles.card}>
          <View style={styles.cardHeader}>
            <View style={styles.cardTitleRow}>
              <Ionicons name="calendar-outline" size={24} color={BrandColors.primary} />
              <Text style={styles.cardTitle}>Today's Status</Text>
            </View>
          </View>

          {loading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="large" color={BrandColors.primary} />
            </View>
          ) : todayAttendance ? (
            <View style={styles.attendanceContent}>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(todayAttendance.status) + '20' }]}>
                <Ionicons name={getStatusIcon(todayAttendance.status)} size={32} color={getStatusColor(todayAttendance.status)} />
                <View style={styles.statusTextContainer}>
                  <Text style={[styles.statusText, { color: getStatusColor(todayAttendance.status) }]}>
                    {todayAttendance.status}
                  </Text>
                </View>
              </View>

              <View style={styles.attendanceDetails}>
                {todayAttendance.checkIn?.time && (
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconContainer, { backgroundColor: BrandColors.primary + '20' }]}>
                      <Ionicons name="arrow-down-circle" size={24} color={BrandColors.primary} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Check In</Text>
                      <Text style={styles.detailValue}>{formatTime(todayAttendance.checkIn.time)}</Text>
                      {todayAttendance.checkIn.ipAddress && (
                        <Text style={styles.detailSubtext}>{todayAttendance.checkIn.ipAddress}</Text>
                      )}
                    </View>
                  </View>
                )}

                {todayAttendance.checkOut?.time && (
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconContainer, { backgroundColor: BrandColors.error + '20' }]}>
                      <Ionicons name="arrow-up-circle" size={24} color={BrandColors.error} />
                    </View>
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>Check Out</Text>
                      <Text style={styles.detailValue}>{formatTime(todayAttendance.checkOut.time)}</Text>
                      {todayAttendance.checkOut.ipAddress && (
                        <Text style={styles.detailSubtext}>{todayAttendance.checkOut.ipAddress}</Text>
                      )}
                    </View>
                  </View>
                )}

                {todayAttendance.workingHours > 0 && (
                  <View style={styles.detailRow}>
                    <View style={[styles.detailIconContainer, { backgroundColor: BrandColors.info + '20' }]}>
                      <Ionicons name="hourglass-outline" size={24} color={BrandColors.info} />
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
              <Text style={styles.emptyStateSubtext}>Check in to start recording attendance</Text>
            </View>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.actionsContainer}>
          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.checkInButton,
              (!canCheckIn || processing) && styles.actionButtonDisabled,
            ]}
            onPress={handleCheckIn}
            disabled={!canCheckIn || processing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canCheckIn ? [BrandColors.primary, BrandColors.primaryLight] : [BrandColors.textSecondary, BrandColors.textSecondary]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="arrow-down-circle" size={28} color="#fff" />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Check In</Text>
                <Text style={styles.actionButtonSubtitle}>
                  {processing ? 'Processing...' : todayAttendance?.checkIn?.time ? 'Already checked in' : 'Start your work day'}
                </Text>
              </View>
              {processing && (
                <ActivityIndicator size="small" color="#fff" style={{ marginLeft: BrandSpacing.sm }} />
              )}
            </LinearGradient>
          </TouchableOpacity>

          <TouchableOpacity
            style={[
              styles.actionButton,
              styles.checkOutButton,
              (!canCheckOut || processing) && styles.actionButtonDisabled,
            ]}
            onPress={handleCheckOut}
            disabled={!canCheckOut || processing}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={canCheckOut ? [BrandColors.error, '#c0392b'] : [BrandColors.textSecondary, BrandColors.textSecondary]}
              style={styles.actionButtonGradient}
            >
              <Ionicons name="arrow-up-circle" size={28} color="#fff" />
              <View style={styles.actionButtonContent}>
                <Text style={styles.actionButtonTitle}>Check Out</Text>
                <Text style={styles.actionButtonSubtitle}>
                  {processing ? 'Processing...' : canCheckOut ? 'End your work day' : todayAttendance?.checkOut?.time ? 'Already checked out' : 'Check in first'}
                </Text>
              </View>
              {processing && (
                <ActivityIndicator size="small" color="#fff" style={{ marginLeft: BrandSpacing.sm }} />
              )}
            </LinearGradient>
          </TouchableOpacity>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Ionicons name="information-circle-outline" size={24} color={BrandColors.info} />
          <Text style={styles.infoText}>
            Make sure you are connected to office WiFi to check in or check out.
          </Text>
        </View>
      </View>

      {/* Alert Modal */}
      <AlertModal
        visible={alertModal.visible}
        onClose={() => setAlertModal({ ...alertModal, visible: false })}
        type={alertModal.type}
        title={alertModal.title}
        message={alertModal.message}
        checkInTime={alertModal.checkInTime}
        minutesLate={alertModal.minutesLate}
        minutesEarly={alertModal.minutesEarly}
        status={alertModal.status}
      />
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
  headerTitle: {
    fontSize: 28,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  iconContainer: {
    width: 56,
    height: 56,
    borderRadius: 28,
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
    gap: BrandSpacing.md,
    padding: BrandSpacing.lg,
    borderRadius: BrandBorderRadius.md,
    marginBottom: BrandSpacing.sm,
  },
  statusTextContainer: {
    flex: 1,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '700',
    textTransform: 'capitalize',
  },
  attendanceDetails: {
    gap: BrandSpacing.md,
    paddingTop: BrandSpacing.md,
    borderTopWidth: 1,
    borderTopColor: BrandColors.divider,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: BrandSpacing.md,
  },
  detailIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
  },
  detailContent: {
    flex: 1,
  },
  detailLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginBottom: 4,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  detailSubtext: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginTop: 2,
  },
  emptyState: {
    padding: BrandSpacing.xl,
    alignItems: 'center',
    gap: BrandSpacing.sm,
  },
  emptyStateText: {
    fontSize: 16,
    color: BrandColors.textPrimary,
    fontWeight: '600',
    textAlign: 'center',
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: BrandColors.textSecondary,
    textAlign: 'center',
  },
  actionsContainer: {
    gap: BrandSpacing.md,
  },
  actionButton: {
    borderRadius: BrandBorderRadius.xl,
    overflow: 'hidden',
    ...BrandShadows.md,
  },
  actionButtonGradient: {
    padding: BrandSpacing.lg,
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.md,
    minHeight: 80,
  },
  actionButtonContent: {
    flex: 1,
  },
  actionButtonTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: 4,
  },
  actionButtonSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
  },
  actionButtonDisabled: {
    opacity: 0.5,
  },
  checkInButton: {
    // Styles handled by gradient
  },
  checkOutButton: {
    // Styles handled by gradient
  },
  infoCard: {
    backgroundColor: BrandColors.info + '15',
    borderRadius: BrandBorderRadius.md,
    padding: BrandSpacing.md,
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: BrandSpacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: BrandColors.info,
  },
  infoText: {
    flex: 1,
    fontSize: 13,
    color: BrandColors.textPrimary,
    lineHeight: 18,
  },
});
