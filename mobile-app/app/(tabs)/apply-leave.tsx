import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { Calendar } from 'react-native-calendars';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { createLeaveRequest, CreateLeaveData } from '@/src/services/leaveService';
import { BrandColors, BrandSpacing, BrandBorderRadius, BrandShadows } from '@/constants/brand';

const LEAVE_TYPES = [
  { value: 'SICK', label: 'Sick Leave' },
  { value: 'VACATION', label: 'Vacation' },
  { value: 'PERSONAL', label: 'Personal Leave' },
  { value: 'EMERGENCY', label: 'Emergency' },
  { value: 'OTHER', label: 'Other' },
] as const;

export default function ApplyLeaveScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [formData, setFormData] = useState<CreateLeaveData>({
    leaveType: 'VACATION',
    startDate: '',
    endDate: '',
    reason: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showStartCalendar, setShowStartCalendar] = useState(false);
  const [showEndCalendar, setShowEndCalendar] = useState(false);

  // Format date to YYYY-MM-DD for backend
  const formatDateForBackend = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // Format date for display
  const formatDateForDisplay = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const handleDateSelect = (date: string, type: 'start' | 'end') => {
    const selectedDate = new Date(date);
    const formattedDate = formatDateForBackend(selectedDate);

    if (type === 'start') {
      setFormData({ ...formData, startDate: formattedDate });
      setShowStartCalendar(false);
      setErrors({ ...errors, startDate: '' });
    } else {
      setFormData({ ...formData, endDate: formattedDate });
      setShowEndCalendar(false);
      setErrors({ ...errors, endDate: '' });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!formData.startDate) {
      newErrors.startDate = 'Start date is required';
    }
    if (!formData.endDate) {
      newErrors.endDate = 'End date is required';
    }
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end < start) {
        newErrors.endDate = 'End date must be after start date';
      }
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (start < today) {
        newErrors.startDate = 'Start date cannot be in the past';
      }
    }
    if (!formData.reason.trim()) {
      newErrors.reason = 'Reason is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    console.log("handleSubmit",formData);
    if (!validateForm()) {
      Alert.alert('Validation Error', 'Please fix the errors in the form');
      return;
    }

    setLoading(true);
    try {
      console.log(formData);
      
      await createLeaveRequest(formData);
      Alert.alert('Success', 'Leave request submitted successfully!', [
        {
          text: 'OK',
          onPress: () => router.back(),
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.error || 'Failed to submit leave request';
      Alert.alert('Error', errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateDays = () => {
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      if (end >= start) {
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
        return diffDays;
      }
    }
    return 0;
  };

  // Get minimum date for calendar (today)
  const getMinDate = () => {
    return formatDateForBackend(new Date());
  };

  // Get marked dates for calendar
  const getMarkedDates = () => {
    const marked: any = {};
    
    if (formData.startDate) {
      marked[formData.startDate] = {
        startingDay: true,
        color: '#3498db',
        textColor: '#fff',
      };
    }
    
    if (formData.endDate) {
      marked[formData.endDate] = {
        endingDay: true,
        color: '#3498db',
        textColor: '#fff',
      };
    }
    
    // Mark dates in between
    if (formData.startDate && formData.endDate) {
      const start = new Date(formData.startDate);
      const end = new Date(formData.endDate);
      const current = new Date(start);
      
      while (current <= end) {
        const dateStr = formatDateForBackend(current);
        if (dateStr !== formData.startDate && dateStr !== formData.endDate) {
          marked[dateStr] = {
            color: '#e3f2fd',
            textColor: '#1976d2',
          };
        }
        current.setDate(current.getDate() + 1);
      }
    }
    
    return marked;
  };

  return (
    <ScrollView 
      style={styles.container}
      contentContainerStyle={{ paddingBottom: BrandSpacing.xl }}
    >
      {/* Header with Gradient */}
      <LinearGradient
        colors={['#2D5016', '#4A7C2A', '#6B9E3E']}
        style={[styles.header, { paddingTop: insets.top + BrandSpacing.md }]}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#fff" />
          </TouchableOpacity>
          <View style={styles.headerTitleContainer}>
            <Text style={styles.headerTitle}>Apply for Leave</Text>
            <Text style={styles.headerSubtitle}>Submit a leave request</Text>
          </View>
          <View style={styles.placeholder} />
        </View>
      </LinearGradient>

      <View style={styles.content}>
        <View style={styles.formGroup}>
          <Text style={styles.label}>Leave Type *</Text>
          <View style={styles.leaveTypeContainer}>
            {LEAVE_TYPES.map((type) => (
              <TouchableOpacity
                key={type.value}
                style={[
                  styles.leaveTypeButton,
                  formData.leaveType === type.value && styles.leaveTypeButtonActive,
                ]}
                onPress={() => setFormData({ ...formData, leaveType: type.value as any })}
              >
                <Text
                  style={[
                    styles.leaveTypeButtonText,
                    formData.leaveType === type.value && styles.leaveTypeButtonTextActive,
                  ]}
                >
                  {type.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <View style={styles.formGroup}>
          <Text style={styles.label}>Start Date *</Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.startDate && styles.inputError]}
            onPress={() => {
              setShowStartCalendar(true);
              setShowEndCalendar(false);
            }}
          >
            <View style={styles.dateButtonContent}>
              <Ionicons name="calendar-outline" size={20} color={BrandColors.textSecondary} />
              <Text style={[styles.dateButtonText, !formData.startDate && styles.dateButtonPlaceholder]}>
                {formData.startDate ? formatDateForDisplay(formData.startDate) : 'Select start date'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BrandColors.textSecondary} />
          </TouchableOpacity>
          {errors.startDate && (
            <Text style={styles.errorText}>{errors.startDate}</Text>
          )}
        </View>

        {showStartCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              current={formData.startDate || getMinDate()}
              minDate={getMinDate()}
              onDayPress={(day) => handleDateSelect(day.dateString, 'start')}
              markedDates={getMarkedDates()}
              markingType="period"
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                textSectionTitleColor: BrandColors.primary,
                selectedDayBackgroundColor: BrandColors.primary,
                selectedDayTextColor: '#fff',
                todayTextColor: BrandColors.primary,
                dayTextColor: BrandColors.textPrimary,
                textDisabledColor: BrandColors.textSecondary,
                dotColor: BrandColors.primary,
                selectedDotColor: '#fff',
                arrowColor: BrandColors.primary,
                monthTextColor: BrandColors.textPrimary,
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 13,
              }}
            />
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>End Date *</Text>
          <TouchableOpacity
            style={[styles.dateButton, errors.endDate && styles.inputError]}
            onPress={() => {
              setShowEndCalendar(true);
              setShowStartCalendar(false);
            }}
          >
            <View style={styles.dateButtonContent}>
              <Ionicons name="calendar-outline" size={20} color={BrandColors.textSecondary} />
              <Text style={[styles.dateButtonText, !formData.endDate && styles.dateButtonPlaceholder]}>
                {formData.endDate ? formatDateForDisplay(formData.endDate) : 'Select end date'}
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={BrandColors.textSecondary} />
          </TouchableOpacity>
          {errors.endDate && (
            <Text style={styles.errorText}>{errors.endDate}</Text>
          )}
        </View>

        {showEndCalendar && (
          <View style={styles.calendarContainer}>
            <Calendar
              current={formData.endDate || formData.startDate || getMinDate()}
              minDate={formData.startDate || getMinDate()}
              onDayPress={(day) => handleDateSelect(day.dateString, 'end')}
              markedDates={getMarkedDates()}
              markingType="period"
              theme={{
                backgroundColor: '#fff',
                calendarBackground: '#fff',
                textSectionTitleColor: BrandColors.primary,
                selectedDayBackgroundColor: BrandColors.primary,
                selectedDayTextColor: '#fff',
                todayTextColor: BrandColors.primary,
                dayTextColor: BrandColors.textPrimary,
                textDisabledColor: BrandColors.textSecondary,
                dotColor: BrandColors.primary,
                selectedDotColor: '#fff',
                arrowColor: BrandColors.primary,
                monthTextColor: BrandColors.textPrimary,
                textDayFontWeight: '500',
                textMonthFontWeight: 'bold',
                textDayHeaderFontWeight: '600',
                textDayFontSize: 16,
                textMonthFontSize: 18,
                textDayHeaderFontSize: 13,
              }}
            />
          </View>
        )}

        {formData.startDate && formData.endDate && calculateDays() > 0 && (
          <View style={styles.daysInfo}>
            <Text style={styles.daysText}>
              Total Days: <Text style={styles.daysValue}>{calculateDays()}</Text>
            </Text>
          </View>
        )}

        <View style={styles.formGroup}>
          <Text style={styles.label}>Reason *</Text>
          <TextInput
            style={[
              styles.textArea,
              errors.reason && styles.inputError,
            ]}
            placeholder="Enter the reason for your leave request"
            value={formData.reason}
            onChangeText={(text) => {
              setFormData({ ...formData, reason: text });
              setErrors({ ...errors, reason: '' });
            }}
            multiline
            numberOfLines={4}
            placeholderTextColor="#999"
            textAlignVertical="top"
          />
          {errors.reason && (
            <Text style={styles.errorText}>{errors.reason}</Text>
          )}
        </View>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.submitButtonText}>Submit Leave Request</Text>
          )}
        </TouchableOpacity>

        <View style={styles.noteCard}>
          <Text style={styles.noteTitle}>ℹ️ Note</Text>
          <Text style={styles.noteText}>
            Your leave request will be sent for admin approval. You can track
            its status in the Leave Management section. Pending requests can be
            deleted before they are reviewed.
          </Text>
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
    paddingHorizontal: BrandSpacing.lg,
    paddingBottom: BrandSpacing.lg,
    ...BrandShadows.md,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    width: '100%',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitleContainer: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  headerSubtitle: {
    fontSize: 12,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: '500',
  },
  placeholder: {
    width: 60, // Same width as back button for centering
  },
  content: {
    padding: BrandSpacing.lg,
  },
  formGroup: {
    marginBottom: BrandSpacing.lg,
  },
  label: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.textPrimary,
    marginBottom: BrandSpacing.sm,
  },
  leaveTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  leaveTypeButton: {
    paddingHorizontal: BrandSpacing.md,
    paddingVertical: BrandSpacing.sm,
    borderRadius: BrandBorderRadius.md,
    backgroundColor: BrandColors.surface,
    borderWidth: 1,
    borderColor: BrandColors.border,
  },
  leaveTypeButtonActive: {
    backgroundColor: BrandColors.primary,
    borderColor: BrandColors.primary,
  },
  leaveTypeButtonText: {
    fontSize: 13,
    color: BrandColors.textPrimary,
    fontWeight: '600',
  },
  leaveTypeButtonTextActive: {
    color: '#fff',
  },
  dateButton: {
    backgroundColor: BrandColors.surface,
    borderRadius: BrandBorderRadius.md,
    padding: BrandSpacing.md,
    borderWidth: 1,
    borderColor: BrandColors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    minHeight: 56,
  },
  dateButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: BrandSpacing.sm,
    flex: 1,
  },
  dateButtonText: {
    fontSize: 16,
    color: BrandColors.textPrimary,
    fontWeight: '500',
  },
  dateButtonPlaceholder: {
    color: BrandColors.textSecondary,
  },
  calendarContainer: {
    backgroundColor: BrandColors.surface,
    borderRadius: BrandBorderRadius.xl,
    padding: BrandSpacing.md,
    marginBottom: BrandSpacing.lg,
    ...BrandShadows.md,
  },
  inputError: {
    borderColor: BrandColors.error,
  },
  textArea: {
    backgroundColor: BrandColors.surface,
    borderRadius: BrandBorderRadius.md,
    padding: BrandSpacing.md,
    fontSize: 16,
    borderWidth: 1,
    borderColor: BrandColors.border,
    minHeight: 120,
    color: BrandColors.textPrimary,
    ...Platform.select({
      ios: {
        paddingTop: BrandSpacing.md,
      },
    }),
  },
  errorText: {
    color: BrandColors.error,
    fontSize: 12,
    marginTop: BrandSpacing.xs,
    fontWeight: '500',
  },
  daysInfo: {
    backgroundColor: BrandColors.success + '20',
    padding: BrandSpacing.md,
    borderRadius: BrandBorderRadius.md,
    marginBottom: BrandSpacing.lg,
    borderLeftWidth: 3,
    borderLeftColor: BrandColors.success,
  },
  daysText: {
    fontSize: 14,
    color: BrandColors.success,
    fontWeight: '600',
  },
  daysValue: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: BrandColors.primary,
    borderRadius: BrandBorderRadius.xl,
    padding: BrandSpacing.lg,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: BrandSpacing.md,
    marginBottom: BrandSpacing.lg,
    ...BrandShadows.md,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  noteCard: {
    backgroundColor: BrandColors.info + '15',
    borderRadius: BrandBorderRadius.md,
    padding: BrandSpacing.md,
    borderLeftWidth: 3,
    borderLeftColor: BrandColors.info,
    flexDirection: 'row',
    gap: BrandSpacing.sm,
  },
  noteTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.info,
    marginBottom: BrandSpacing.xs,
  },
  noteText: {
    fontSize: 13,
    color: BrandColors.textPrimary,
    lineHeight: 18,
    flex: 1,
  },
});
