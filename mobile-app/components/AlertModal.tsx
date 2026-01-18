import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';
import { BrandColors, BrandSpacing, BrandBorderRadius, BrandShadows } from '@/constants/brand';

interface AlertModalProps {
  visible: boolean;
  onClose: () => void;
  type: 'success' | 'warning' | 'info' | 'error';
  title: string;
  message: string;
  details?: string;
  checkInTime?: string;
  minutesLate?: number;
  minutesEarly?: number;
  status?: string;
  remark?: string;
}

const { width } = Dimensions.get('window');

export default function AlertModal({
  visible,
  onClose,
  type,
  title,
  message,
  details,
  checkInTime,
  minutesLate,
  minutesEarly,
  status,
  remark,
}: AlertModalProps) {
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.spring(scaleAnim, {
          toValue: 1,
          useNativeDriver: true,
          tension: 50,
          friction: 7,
        }),
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      scaleAnim.setValue(0);
      opacityAnim.setValue(0);
    }
  }, [visible]);

  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          colors: ['#27AE60', '#2ECC71'],
          icon: 'checkmark-circle',
          iconBg: '#27AE60' + '20',
        };
      case 'warning':
        return {
          colors: ['#F39C12', '#F5B041'],
          icon: 'time',
          iconBg: '#F39C12' + '20',
        };
      case 'info':
        return {
          colors: ['#3498DB', '#5DADE2'],
          icon: 'information-circle',
          iconBg: '#3498DB' + '20',
        };
      case 'error':
        return {
          colors: ['#E74C3C', '#EC7063'],
          icon: 'close-circle',
          iconBg: '#E74C3C' + '20',
        };
      default:
        return {
          colors: ['#3498DB', '#5DADE2'],
          icon: 'information-circle',
          iconBg: '#3498DB' + '20',
        };
    }
  };

  const config = getTypeConfig();

  const getStatusMessage = () => {
    if (minutesLate && minutesLate > 0) {
      return `You are ${minutesLate} minute${minutesLate > 1 ? 's' : ''} late`;
    } else if (minutesEarly && minutesEarly > 0) {
      return `You came ${minutesEarly} minute${minutesEarly > 1 ? 's' : ''} early`;
    } else {
      return 'You are on time';
    }
  };

  const getRemark = () => {
    if (remark) return remark;
    
    if (minutesLate && minutesLate > 0) {
      if (minutesLate <= 5) {
        return 'Good effort! Please try to be on time.';
      } else if (minutesLate <= 15) {
        return 'Please be on time next time.';
      } else {
        return 'Please be on time. Consistent punctuality is important.';
      }
    } else if (minutesEarly && minutesEarly > 0) {
      return 'Excellent! Keep up the good work.';
    } else {
      return 'Perfect! You are on time.';
    }
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={styles.overlay}>
        <Animated.View
          style={[
            styles.container,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          <LinearGradient colors={config.colors} style={styles.gradient}>
            <View style={styles.iconContainer}>
              <View style={[styles.iconCircle, { backgroundColor: config.iconBg }]}>
                <Ionicons name={config.icon as any} size={48} color="#fff" />
              </View>
            </View>

            <View style={styles.content}>
              <Text style={styles.title}>{title}</Text>
              <Text style={styles.message}>{message}</Text>

              {checkInTime && (
                <View style={styles.infoBox}>
                  <Ionicons name="time-outline" size={20} color="#fff" />
                  <Text style={styles.infoText}>Check-in Time: {checkInTime}</Text>
                </View>
              )}

              {(minutesLate || minutesEarly) !== undefined && (
                <View style={styles.statusBox}>
                  <Text style={styles.statusTitle}>Your Status</Text>
                  <Text style={styles.statusMessage}>{getStatusMessage()}</Text>
                  {status && (
                    <View style={styles.statusBadge}>
                      <Text style={styles.statusBadgeText}>{status}</Text>
                    </View>
                  )}
                </View>
              )}

              {details && (
                <Text style={styles.details}>{details}</Text>
              )}

              <View style={styles.remarkBox}>
                <Ionicons name="chatbubble-ellipses-outline" size={18} color="rgba(255,255,255,0.9)" />
                <Text style={styles.remark}>{getRemark()}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.button}
              onPress={onClose}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={['rgba(255,255,255,0.3)', 'rgba(255,255,255,0.2)']}
                style={styles.buttonGradient}
              >
                <Text style={styles.buttonText}>OK</Text>
                <Ionicons name="checkmark" size={20} color="#fff" />
              </LinearGradient>
            </TouchableOpacity>
          </LinearGradient>
        </Animated.View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: BrandSpacing.lg,
  },
  container: {
    width: width * 0.85,
    maxWidth: 400,
    borderRadius: BrandBorderRadius.xl,
    overflow: 'hidden',
    ...BrandShadows.xl,
  },
  gradient: {
    padding: BrandSpacing.xl,
    alignItems: 'center',
  },
  iconContainer: {
    marginBottom: BrandSpacing.md,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    width: '100%',
    alignItems: 'center',
    marginBottom: BrandSpacing.lg,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: '#fff',
    marginBottom: BrandSpacing.sm,
    textAlign: 'center',
  },
  message: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.95)',
    textAlign: 'center',
    marginBottom: BrandSpacing.md,
    lineHeight: 22,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: BrandSpacing.md,
    borderRadius: BrandBorderRadius.md,
    width: '100%',
    marginBottom: BrandSpacing.sm,
    gap: BrandSpacing.sm,
  },
  infoText: {
    fontSize: 15,
    fontWeight: '600',
    color: '#fff',
    flex: 1,
  },
  statusBox: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: BrandSpacing.md,
    borderRadius: BrandBorderRadius.md,
    width: '100%',
    marginBottom: BrandSpacing.sm,
    alignItems: 'center',
  },
  statusTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.9)',
    marginBottom: BrandSpacing.xs,
  },
  statusMessage: {
    fontSize: 18,
    fontWeight: '700',
    color: '#fff',
    marginBottom: BrandSpacing.xs,
  },
  statusBadge: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    paddingHorizontal: BrandSpacing.md,
    paddingVertical: BrandSpacing.xs,
    borderRadius: BrandBorderRadius.sm,
    marginTop: BrandSpacing.xs,
  },
  statusBadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#fff',
    textTransform: 'uppercase',
  },
  details: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.9)',
    textAlign: 'center',
    marginBottom: BrandSpacing.sm,
    lineHeight: 20,
  },
  remarkBox: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    padding: BrandSpacing.md,
    borderRadius: BrandBorderRadius.md,
    width: '100%',
    marginTop: BrandSpacing.sm,
    gap: BrandSpacing.sm,
    borderLeftWidth: 3,
    borderLeftColor: 'rgba(255, 255, 255, 0.5)',
  },
  remark: {
    fontSize: 14,
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.95)',
    flex: 1,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  button: {
    width: '100%',
    borderRadius: BrandBorderRadius.md,
    overflow: 'hidden',
    ...BrandShadows.md,
  },
  buttonGradient: {
    padding: BrandSpacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: BrandSpacing.sm,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#fff',
  },
});

