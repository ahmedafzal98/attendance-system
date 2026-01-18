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
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { getMyLeaves, getMyLeaveStats, deleteLeaveRequest, LeaveRequest, LeaveStats } from '@/src/services/leaveService';
import AlertModal from '@/components/AlertModal';
import { BrandColors, BrandSpacing, BrandBorderRadius, BrandShadows } from '@/constants/brand';

export default function LeavesScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [leaves, setLeaves] = useState<LeaveRequest[]>([]);
  const [stats, setStats] = useState<LeaveStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorModal, setErrorModal] = useState({ visible: false, message: '' });
  const [successModal, setSuccessModal] = useState({ visible: false, message: '' });
  const [deleteConfirmModal, setDeleteConfirmModal] = useState({ visible: false, leaveId: '', leaveType: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [leavesData, statsData] = await Promise.all([
        getMyLeaves(),
        getMyLeaveStats(),
      ]);
      setLeaves(leavesData);
      setStats(statsData);
    } catch (error) {
      console.error('Error fetching leave data:', error);
      setErrorModal({
        visible: true,
        message: 'Failed to load leave requests',
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const handleDelete = (leave: LeaveRequest) => {
    setDeleteConfirmModal({
      visible: true,
      leaveId: leave.id,
      leaveType: leave.leaveType,
    });
  };

  const handleDeleteConfirm = async () => {
    try {
      await deleteLeaveRequest(deleteConfirmModal.leaveId);
      setDeleteConfirmModal({ visible: false, leaveId: '', leaveType: '' });
      setSuccessModal({
        visible: true,
        message: 'Leave request deleted successfully',
      });
      fetchData();
    } catch (error: any) {
      setDeleteConfirmModal({ visible: false, leaveId: '', leaveType: '' });
      setErrorModal({
        visible: true,
        message: error.response?.data?.error || 'Failed to delete leave request',
      });
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return BrandColors.success;
      case 'REJECTED':
        return BrandColors.error;
      case 'PENDING':
        return BrandColors.warning;
      default:
        return BrandColors.textSecondary;
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'APPROVED':
        return 'checkmark-circle';
      case 'REJECTED':
        return 'close-circle';
      case 'PENDING':
        return 'time-outline';
      default:
        return 'help-circle';
    }
  };

  const getLeaveTypeColor = (type: string) => {
    switch (type) {
      case 'SICK':
        return BrandColors.error;
      case 'VACATION':
        return BrandColors.info;
      case 'PERSONAL':
        return BrandColors.secondary;
      case 'EMERGENCY':
        return BrandColors.warning;
      default:
        return BrandColors.textSecondary;
    }
  };

  const getLeaveTypeIcon = (type: string) => {
    switch (type) {
      case 'SICK':
        return 'medical';
      case 'VACATION':
        return 'beach';
      case 'PERSONAL':
        return 'person';
      case 'EMERGENCY':
        return 'warning';
      default:
        return 'calendar';
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={BrandColors.primary} />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>
    );
  }

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
          <View style={styles.headerTextContainer}>
            <Text style={styles.headerTitle}>Leave Management</Text>
            <Text style={styles.headerSubtitle}>View and manage your leaves</Text>
          </View>
          <TouchableOpacity
            style={styles.addButton}
            onPress={() => router.push('/(tabs)/apply-leave')}
            activeOpacity={0.8}
          >
            <Ionicons name="add-circle" size={24} color="#fff" />
            <Text style={styles.addButtonText}>Apply</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      {/* Statistics Cards */}
      {stats && (
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={[styles.statIconContainer, { backgroundColor: BrandColors.primary + '20' }]}>
              <Ionicons name="list" size={24} color={BrandColors.primary} />
            </View>
            <Text style={styles.statValue}>{stats.total}</Text>
            <Text style={styles.statLabel}>Total</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: BrandColors.warning + '15' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: BrandColors.warning + '30' }]}>
              <Ionicons name="time-outline" size={24} color={BrandColors.warning} />
            </View>
            <Text style={[styles.statValue, { color: BrandColors.warning }]}>{stats.pending}</Text>
            <Text style={[styles.statLabel, { color: BrandColors.warning }]}>Pending</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: BrandColors.success + '15' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: BrandColors.success + '30' }]}>
              <Ionicons name="checkmark-circle-outline" size={24} color={BrandColors.success} />
            </View>
            <Text style={[styles.statValue, { color: BrandColors.success }]}>{stats.approved}</Text>
            <Text style={[styles.statLabel, { color: BrandColors.success }]}>Approved</Text>
          </View>
          <View style={[styles.statCard, { backgroundColor: BrandColors.error + '15' }]}>
            <View style={[styles.statIconContainer, { backgroundColor: BrandColors.error + '30' }]}>
              <Ionicons name="close-circle-outline" size={24} color={BrandColors.error} />
            </View>
            <Text style={[styles.statValue, { color: BrandColors.error }]}>{stats.rejected}</Text>
            <Text style={[styles.statLabel, { color: BrandColors.error }]}>Rejected</Text>
          </View>
        </View>
      )}

      {/* Leave Requests List */}
      <View style={styles.content}>
        <View style={styles.sectionHeader}>
          <Ionicons name="calendar-outline" size={20} color={BrandColors.textPrimary} />
          <Text style={styles.sectionTitle}>My Leave Requests</Text>
        </View>

        {leaves.length === 0 ? (
          <View style={styles.emptyState}>
            <Ionicons name="calendar-clear-outline" size={64} color={BrandColors.textSecondary} />
            <Text style={styles.emptyStateText}>No leave requests yet</Text>
            <Text style={styles.emptyStateSubtext}>Tap "Apply" to create a new request</Text>
          </View>
        ) : (
          leaves.map((leave) => (
            <View key={leave.id} style={styles.leaveCard}>
              <View style={styles.leaveCardHeader}>
                <View style={styles.leaveTypeBadge}>
                  <View
                    style={[
                      styles.leaveTypeIconContainer,
                      { backgroundColor: getLeaveTypeColor(leave.leaveType) + '20' },
                    ]}
                  >
                    <Ionicons
                      name={getLeaveTypeIcon(leave.leaveType) as any}
                      size={20}
                      color={getLeaveTypeColor(leave.leaveType)}
                    />
                  </View>
                  <Text style={styles.leaveTypeText}>{leave.leaveType}</Text>
                </View>
                <View
                  style={[
                    styles.statusBadge,
                    { backgroundColor: getStatusColor(leave.status) + '20' },
                  ]}
                >
                  <Ionicons name={getStatusIcon(leave.status)} size={16} color={getStatusColor(leave.status)} />
                  <Text style={[styles.statusText, { color: getStatusColor(leave.status) }]}>
                    {leave.status}
                  </Text>
                </View>
              </View>

              <View style={styles.leaveCardBody}>
                <View style={styles.detailsGrid}>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color={BrandColors.textSecondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>From</Text>
                      <Text style={styles.detailValue}>{formatDate(leave.startDate)}</Text>
                    </View>
                  </View>
                  <View style={styles.detailItem}>
                    <Ionicons name="calendar-outline" size={16} color={BrandColors.textSecondary} />
                    <View style={styles.detailContent}>
                      <Text style={styles.detailLabel}>To</Text>
                      <Text style={styles.detailValue}>{formatDate(leave.endDate)}</Text>
                    </View>
                  </View>
                </View>

                <View style={styles.daysRow}>
                  <Ionicons name="time-outline" size={18} color={BrandColors.primary} />
                  <Text style={styles.daysText}>{leave.totalDays} day(s)</Text>
                </View>

                <View style={styles.reasonContainer}>
                  <Text style={styles.reasonLabel}>Reason</Text>
                  <Text style={styles.reasonValue}>{leave.reason}</Text>
                </View>

                {leave.adminNotes && (
                  <View style={styles.adminNotesContainer}>
                    <View style={styles.adminNotesHeader}>
                      <Ionicons name="information-circle-outline" size={18} color={BrandColors.info} />
                      <Text style={styles.adminNotesLabel}>Admin Notes</Text>
                    </View>
                    <Text style={styles.adminNotesValue}>{leave.adminNotes}</Text>
                  </View>
                )}

                {leave.reviewedBy && (
                  <View style={styles.reviewedContainer}>
                    <Ionicons name="person-outline" size={14} color={BrandColors.textSecondary} />
                    <Text style={styles.reviewedLabel}>
                      Reviewed by {leave.reviewedBy.name} on {formatDate(leave.reviewedAt || '')}
                    </Text>
                  </View>
                )}
              </View>

              {leave.status === 'PENDING' && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDelete(leave)}
                  activeOpacity={0.7}
                >
                  <Ionicons name="trash-outline" size={18} color={BrandColors.error} />
                  <Text style={styles.deleteButtonText}>Delete</Text>
                </TouchableOpacity>
              )}
            </View>
          ))
        )}
      </View>

      {/* Error Modal */}
      <AlertModal
        visible={errorModal.visible}
        onClose={() => setErrorModal({ visible: false, message: '' })}
        type="error"
        title="Error"
        message={errorModal.message}
        showRemarks={false}
      />

      {/* Success Modal */}
      <AlertModal
        visible={successModal.visible}
        onClose={() => setSuccessModal({ visible: false, message: '' })}
        type="success"
        title="Success"
        message={successModal.message}
        showRemarks={false}
      />

      {/* Delete Confirmation Modal */}
      <AlertModal
        visible={deleteConfirmModal.visible}
        onClose={() => setDeleteConfirmModal({ visible: false, leaveId: '', leaveType: '' })}
        type="error"
        title="Delete Leave Request"
        message={`Are you sure you want to delete this ${deleteConfirmModal.leaveType} leave request?`}
        showRemarks={false}
      >
        <View style={{ marginTop: 16, gap: 12 }}>
          <TouchableOpacity
            style={{
              backgroundColor: 'rgba(255, 255, 255, 0.3)',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={() => setDeleteConfirmModal({ visible: false, leaveId: '', leaveType: '' })}
          >
            <Text style={{ color: '#fff', fontWeight: '600' }}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={{
              backgroundColor: '#E74C3C',
              padding: 12,
              borderRadius: 8,
              alignItems: 'center',
            }}
            onPress={handleDeleteConfirm}
          >
            <Text style={{ color: '#fff', fontWeight: '700' }}>Delete</Text>
          </TouchableOpacity>
        </View>
      </AlertModal>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.background,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    color: BrandColors.textSecondary,
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
    gap: BrandSpacing.md,
  },
  headerTextContainer: {
    flex: 1,
    marginRight: BrandSpacing.sm,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 13,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: BrandSpacing.md,
    paddingVertical: BrandSpacing.sm,
    borderRadius: BrandBorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.xs,
    flexShrink: 0,
  },
  addButtonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
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
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: BrandSpacing.xs,
  },
  statValue: {
    fontSize: 22,
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
  },
  emptyStateSubtext: {
    fontSize: 14,
    color: BrandColors.textSecondary,
  },
  leaveCard: {
    backgroundColor: BrandColors.surface,
    borderRadius: BrandBorderRadius.xl,
    padding: BrandSpacing.lg,
    marginBottom: BrandSpacing.md,
    ...BrandShadows.md,
  },
  leaveCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: BrandSpacing.md,
    paddingBottom: BrandSpacing.md,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.divider,
  },
  leaveTypeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.sm,
  },
  leaveTypeIconContainer: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leaveTypeText: {
    fontSize: 14,
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
  leaveCardBody: {
    gap: BrandSpacing.md,
  },
  detailsGrid: {
    gap: BrandSpacing.sm,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.sm,
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
    fontSize: 14,
    fontWeight: '600',
    color: BrandColors.textPrimary,
  },
  daysRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.xs,
    paddingVertical: BrandSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: BrandColors.divider,
    borderBottomWidth: 1,
    borderBottomColor: BrandColors.divider,
  },
  daysText: {
    fontSize: 15,
    fontWeight: '700',
    color: BrandColors.primary,
  },
  reasonContainer: {
    paddingTop: BrandSpacing.sm,
  },
  reasonLabel: {
    fontSize: 12,
    color: BrandColors.textSecondary,
    marginBottom: BrandSpacing.xs,
    fontWeight: '600',
  },
  reasonValue: {
    fontSize: 14,
    color: BrandColors.textPrimary,
    lineHeight: 20,
  },
  adminNotesContainer: {
    marginTop: BrandSpacing.xs,
    padding: BrandSpacing.md,
    backgroundColor: BrandColors.info + '15',
    borderRadius: BrandBorderRadius.md,
    borderLeftWidth: 3,
    borderLeftColor: BrandColors.info,
  },
  adminNotesHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.xs,
    marginBottom: BrandSpacing.xs,
  },
  adminNotesLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: BrandColors.info,
  },
  adminNotesValue: {
    fontSize: 13,
    color: BrandColors.textPrimary,
    lineHeight: 18,
  },
  reviewedContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.xs,
    paddingTop: BrandSpacing.sm,
    borderTopWidth: 1,
    borderTopColor: BrandColors.divider,
  },
  reviewedLabel: {
    fontSize: 11,
    color: BrandColors.textSecondary,
    fontStyle: 'italic',
  },
  deleteButton: {
    marginTop: BrandSpacing.md,
    paddingVertical: BrandSpacing.sm,
    paddingHorizontal: BrandSpacing.md,
    backgroundColor: BrandColors.error + '10',
    borderRadius: BrandBorderRadius.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BrandSpacing.xs,
    borderWidth: 1,
    borderColor: BrandColors.error + '30',
  },
  deleteButtonText: {
    color: BrandColors.error,
    fontSize: 14,
    fontWeight: '700',
  },
});
