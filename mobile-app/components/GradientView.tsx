import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';

interface GradientViewProps {
  colors: string[];
  style?: ViewStyle;
  children?: React.ReactNode;
  start?: { x: number; y: number };
  end?: { x: number; y: number };
}

/**
 * GradientView component that uses LinearGradient if available, otherwise falls back to solid color
 */
export const GradientView: React.FC<GradientViewProps> = ({
  colors,
  style,
  children,
  start,
  end,
}) => {
  // Try to import LinearGradient dynamically
  let LinearGradient: any = null;
  try {
    LinearGradient = require('expo-linear-gradient').LinearGradient;
  } catch (error) {
    // LinearGradient not available, will use fallback
  }

  // If LinearGradient is available, use it
  if (LinearGradient) {
    return (
      <LinearGradient
        colors={colors}
        style={style}
        start={start || { x: 0, y: 0 }}
        end={end || { x: 0, y: 1 }}
      >
        {children}
      </LinearGradient>
    );
  }

  // Fallback to solid color (first color in gradient)
  return (
    <View style={[style, { backgroundColor: colors[0] }]}>
      {children}
    </View>
  );
};
