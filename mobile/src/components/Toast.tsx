import React, {useEffect, useRef} from 'react';
import {Animated, Text, StyleSheet, TouchableOpacity} from 'react-native';
import {colors, radius, spacing, fonts, shadows} from '../theme';

type ToastType = 'success' | 'error' | 'info';

type ToastProps = {
  message: string;
  type?: ToastType;
  visible: boolean;
  onDismiss: () => void;
  duration?: number;
};

const TOAST_COLORS: Record<ToastType, {bg: string; text: string}> = {
  success: {bg: colors.successBg, text: colors.success},
  error: {bg: colors.errorBg, text: colors.error},
  info: {bg: colors.primaryBg, text: colors.primary},
};

export function Toast({
  message,
  type = 'info',
  visible,
  onDismiss,
  duration = 3000,
}: ToastProps) {
  const translateY = useRef(new Animated.Value(-100)).current;

  useEffect(() => {
    if (visible) {
      Animated.spring(translateY, {
        toValue: 0,
        useNativeDriver: true,
        tension: 80,
        friction: 10,
      }).start();

      const timer = setTimeout(onDismiss, duration);
      return () => clearTimeout(timer);
    } else {
      Animated.timing(translateY, {
        toValue: -100,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [visible, duration, onDismiss, translateY]);

  if (!visible) return null;

  const toastColors = TOAST_COLORS[type];

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: toastColors.bg,
          transform: [{translateY}],
        },
      ]}>
      <TouchableOpacity onPress={onDismiss} activeOpacity={0.8}>
        <Text style={[styles.text, {color: toastColors.text}]}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: spacing.lg,
    right: spacing.lg,
    padding: spacing.lg,
    borderRadius: radius.md,
    zIndex: 1000,
    ...shadows.md,
  },
  text: {
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
});
