import { Tabs } from 'expo-router';
import React from 'react';
import { Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { HapticTab } from '@/components/haptic-tab';
import { BrandColors } from '@/constants/brand';

export default function TabLayout() {
  const insets = useSafeAreaInsets();
  
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: BrandColors.primary,
        tabBarInactiveTintColor: BrandColors.textSecondary,
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: BrandColors.border,
          paddingBottom: Math.max(insets.bottom, 8),
          paddingTop: 8,
          height: 60 + Math.max(insets.bottom - 8, 0),
          ...Platform.select({
            ios: {
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -2 },
              shadowOpacity: 0.1,
              shadowRadius: 4,
            },
            android: {
              elevation: 8,
            },
          }),
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '600',
          marginBottom: 0,
        },
        tabBarIconStyle: {
          marginTop: 4,
        },
      }}>
      <Tabs.Screen
        name="index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="attendance"
        options={{
          title: 'Attendance',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="leaves"
        options={{
          title: 'Leaves',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="calendar-outline" size={size || 24} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="apply-leave"
        options={{
          href: null, // Hide from tab bar
        }}
      />
    </Tabs>
  );
}
