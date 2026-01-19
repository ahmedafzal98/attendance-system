import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import api from '@/src/services/api';
import { BrandColors, BrandSpacing, BrandBorderRadius, BrandShadows } from '@/constants/brand';

interface AttendanceRecord {
  id: string;
  date: string;
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

export default function AttendanceHistoryScreen() {
  const insets = useSafeAreaInsets();
  const [attendanceHistory, setAttendanceHistory] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dateFilter, setDateFilter] = useState<'all' | 'week' | 'month'>('month');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAttendanceHistory();
  }, [dateFilter]);

  const getDateRange = () => {
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    switch (dateFilter) {
      case 'week':
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - 7);
        weekStart.setHours(0, 0, 0, 0);
        return {
          startDate: weekStart.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      case 'month':
        const monthStart = new Date(today);
        monthStart.setDate(1);
        monthStart.setHours(0, 0, 0, 0);
        return {
          startDate: monthStart.toISOString().split('T')[0],
          endDate: today.toISOString().split('T')[0],
        };
      default:
        return {
          startDate: null,
          endDate: null,
        };
    }
  };

  const fetchAttendanceHistory = async () => {
    try {
      setLoading(true);
      setError('');
      const { startDate, endDate } = getDateRange();

      let url = '/attendance/my-attendance';
      const params = new URLSearchParams();
      if (startDate) params.append('startDate', startDate);
      if (endDate) params.append('endDate', endDate);
      if (params.toString()) url += `?${params.toString()}`;

      const response = await api.get(url);
      setAttendanceHistory(response.data.attendance || []);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to fetch attendance history');
      setAttendanceHistory([]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchAttendanceHistory();
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
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

  const calculateStats = () => {
    const stats = {
      total: attendanceHistory.length,
      present: 0,
      late: 0,
      absent: 0,
      halfDay: 0,
      totalHours: 0,
    };

    attendanceHistory.forEach((record) => {
      switch (record.status) {
        case 'PRESENT':
          stats.present++;
          break;
        case 'LATE':
          stats.late++;
          break;
        case 'ABSENT':
          stats.absent++;
          break;
        case 'HALF_DAY':
          stats.halfDay++;
          break;
      }
      if (record.workingHours) {
        stats.totalHours += record.workingHours;
      }
    });

    return stats;
  };

  const stats = calculateStats();

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
            <Text style={styles.headerTitle}>Attendance History</Text>
            <Text style={styles.headerSubtitle}>View your attendance records</Text>
          </View>
          <View style={styles.iconContainer}>
            <Ionicons name="document-text-outline" size={32} color="#fff" />
          </View>
        </View>
      </LinearGradient>

      {/* Filter Buttons */}
      <View style={styles.filterContainer}>
        <TouchableOpacity
          style={[styles.filterButton, dateFilter === 'all' && styles.filterButtonActive]}
          onPress={() => setDateFilter('all')}
        >
          <Text style={[styles.filterButtonText, dateFilter === 'all' && styles.filterButtonTextActive]}>
            All
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, dateFilter === 'week' && styles.filterButtonActive]}
          onPress={() => setDateFilter('week')}
        >
          <Text style={[styles.filterButtonText, dateFilter === 'week' && styles.filterButtonTextActive]}>
            Week
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.filterButton, dateFilter === 'month' && styles.filterButtonActive]}
          onPress={() => setDateFilter('month')}
        >
          <Text style={[styles.filterButtonText, dateFilter === 'month' && styles.filterButtonTextActive]}>
            Month
          </Text>
        </TouchableOpacity>
      </View>

      {/* Statistics Cards */}
      {!loading && attendanceHistory.length > 0 && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: BrandColors.primary + '20' }]}>
              <Ionicons name="calendar-outline" size={20} color={BrandColors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total Days</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: BrandColors.success + '15' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: BrandColors.success + '30' }]}>
              <Ionicons name="checkmark-circle-outline" size={20} color={BrandColors.success} />
            </View>
            <Text style={[styles.statValue, { color: BrandColors.success }]}>{stats.present}</Text>
            <Text style={[styles.statLabel, { color: BrandColors.success }]}>Present</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: BrandColors.warning + '15' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: BrandColors.warning + '30' }]}>
              <Ionicons name="time-outline" size={20} color={BrandColors.warning} />
            </View>
            <Text style={[styles.statValue, { color: BrandColors.warning }]}>{stats.late}</Text>
            <Text style={[styles.statLabel, { color: BrandColors.warning }]}>Late</Text>
          </View>
        </View>
      )}

      {/* Content */}
      <View style={styles.content}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={BrandColors.primary} />
            <Text style={styles.loadingText}>Loading attendance history...</Text>
          </View>
        ) : error ? (
          <View style={styles.errorContainer}>
            <Ionicons name="alert-circle-outline" size={48} color={BrandColors.error} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity style={styles.retryButton} onPress={fetchAttendanceHistory}>
              <Text style={styles.retryButtonText}>Retry</Text>
            </TouchableOpacity>
          </View>
        ) : attendanceHistory.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="document-text-outline" size={64} color={BrandColors.textSecondary} />
            <Text style={styles.emptyStateText}>No attendance records found</Text>
            <Text style={styles.emptyStateSubtext}>
              {dateFilter === 'all'
                ? 'Your attendance history will appear here'
                : `No records found for the selected ${dateFilter} period`}
            </Text>
          </View>
        ) : (
          <>
            <View style={styles.sectionHeader}>
              <Ionicons name="list-outline" size={20} color={BrandColors.textPrimary} />
              <Text style={styles.sectionTitle}>Attendance Records</Text>
            </View>
            {attendanceHistory.map((record, index) => (
              <View key={record.id || `${record.date}-${index}`} style={styles.recordCard}>
                <View style={styles.recordHeader}>
                  <View style={styles.dateContainer}>
                    <Ionicons name="calendar-outline" size={20} color={BrandColors.primary} />
                    <Text style={styles.recordDate}>{formatDate(record.date)}</Text>
                  </View>
                  <View
                    style={[
                      styles.statusBadge,
                      { backgroundColor: getStatusColor(record.status) + '20' },
                    ]}
                  >
                    <Ionicons
                      name={getStatusIcon(record.status)}
                      size={16}
                      color={getStatusColor(record.status)}
                    />
                    <Text style={[styles.statusText, { color: getStatusColor(record.status) }]}>
                      {record.status}
                    </Text>
                  </View>
                </View>

                <View style={styles.recordBody}>
                  {record.checkIn?.time && (
                    <View style={styles.timeRow}>
                      <View style={[styles.timeIconContainer, { backgroundColor: BrandColors.primary + '20' }]}>
                        <Ionicons name="arrow-down-circle" size={18} color={BrandColors.primary} />
                      </View>
                      <View style={styles.timeContent}>
                        <Text style={styles.timeLabel}>Check In</Text>
                        <Text style={styles.timeValue}>{formatTime(record.checkIn.time)}</Text>
                      </View>
                    </View>
                  )}

                  {record.checkOut?.time && (
                    <View style={styles.timeRow}>
                      <View style={[styles.timeIconContainer, { backgroundColor: BrandColors.error + '20' }]}>
                        <Ionicons name="arrow-up-circle" size={18} color={BrandColors.error} />
                      </View>
                      <View style={styles.timeContent}>
                        <Text style={styles.timeLabel}>Check Out</Text>
                        <Text style={styles.timeValue}>{formatTime(record.checkOut.time)}</Text>
                      </View>
                    </View>
                  )}

                  {record.workingHours > 0 && (
                    <View style={styles.workingHoursRow}>
                      <Ionicons name="hourglass-outline" size={18} color={BrandColors.info} />
                      <Text style={styles.workingHoursText}>
                        Working Hours: {Math.floor(record.workingHours / 60)}h {record.workingHours % 60}m
                      </Text>
                    </View>
                  )}

                  {!record.checkIn?.time && !record.checkOut?.time && (
                    <View style={styles.noRecordRow}>
                      <Ionicons name="close-circle-outline" size={18} color={BrandColors.textSecondary} />
                      <Text style={styles.noRecordText}>No check-in/check-out recorded</Text>
                    </View>
                  )}
                </View>
              </View>
            ))}
          </>
        )}
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
  filterContainer: {
    flexDirection: 'row',
    padding: BrandSpacing.md,
    gap: BrandSpacing.sm,
  },
  filterButton: {
    flex: 1,
    paddingVertical: BrandSpacing.sm,
    paddingHorizontal: BrandSpacing.md,
    borderRadius: BrandBorderRadius.md,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
    alignItems: 'center',
  },
  filterButtonActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  filterButtonText: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  filterButtonTextActive: {
    color: '#fff',
  },
  statsContainer: {
    flexDirection: 'row',
    padding: BrandSpacing.md,
    gap: BrandSpacing.sm,
  },
  statCard: {
    flex: 1,
    backgroundColor: BrandColors.surface,
    borderRadius: BrandBorderRadius.md,
    padding: BrandSpacing.md,
    alignItems: 'center',
    ...BrandShadows.sm,
  },
  statIconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: BrandSpacing.xs,
  },
  statValue: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.textPrimary,
    marginBottom: 2,
  },
  statLabel: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    fontWeight: '600',
  },
  content: {
    padding: BrandSpacing.lg,
  },
  loadingContainer: {
    padding: BrandSpacing.xl,
    alignItems: 'center',
    gap: BrandSpacing.md,
  },
  loadingText: {
    fontSize: 14,
    color: BrandColors.textSecondary,
  },
  errorContainer: {
    padding: BrandSpacing.xl,
    alignItems: 'center',
    gap: BrandSpacing.md,
  },
  errorText: {
    fontSize: 14,
    color: BrandColors.error,
    textAlign: 'center',
  },
  retryButton: {
    marginTop: BrandSpacing.md,
    paddingVertical: BrandSpacing.sm,
    paddingHorizontal: BrandSpacing.lg,
    backgroundColor: BrandColors.primary,
    borderRadius: BrandBorderRadius.md,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: BrandColors.surface,
    borderRadius: BrandBorderRadius.xl,
    padding: BrandSpacing['2xl'],
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
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.sm,
    marginBottom: BrandSpacing.md,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  recordCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: BrandBorderRadius.xl,
    padding: BrandSpacing.lg,
    marginBottom: BrandSpacing.md,
    ...BrandShadows.md,
  },
  recordHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: BrandSpacing.md,
    paddingBottom: BrandSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.divider,
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.sm,
    flex: 1,
  },
  recordDate: {
    fontSize: 16,
    fontWeight: '700',
    color: BrandColors.textPrimary,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: BrandSpacing.sm,
    paddingVertical: 6,
    borderRadius: BrandBorderRadius.sm,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  recordBody: {
    gap: BrandSpacing.sm,
  },
  timeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.sm,
  },
  timeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  timeContent: {
    flex: 1,
  },
  timeLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginBottom: 2,
  },
  timeValue: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  workingHoursRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.xs,
    paddingTop: BrandSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: BrandColors.divider,
  },
  workingHoursText: {
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.info,
  },
  noRecordRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.xs,
    paddingTop: BrandSpacing.sm,
  },
  noRecordText: {
    fontSize: 13,
    color: BrandColors.textSecondary,
    fontStyle: 'italic',
  },
});

