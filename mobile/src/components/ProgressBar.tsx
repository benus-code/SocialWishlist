import React from 'react';
import {View, StyleSheet, ViewStyle} from 'react-native';
import {colors, radius} from '../theme';

type ProgressBarProps = {
  percent: number;
  color?: string;
  backgroundColor?: string;
  height?: number;
  style?: ViewStyle;
};

export function ProgressBar({
  percent,
  color = colors.primary,
  backgroundColor = colors.gray100,
  height = 8,
  style,
}: ProgressBarProps) {
  const clampedPercent = Math.min(100, Math.max(0, percent));

  return (
    <View style={[styles.track, {backgroundColor, height, borderRadius: height / 2}, style]}>
      <View
        style={[
          styles.fill,
          {
            backgroundColor: clampedPercent >= 100 ? colors.success : color,
            width: `${clampedPercent}%`,
            height,
            borderRadius: height / 2,
          },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  track: {
    overflow: 'hidden',
  },
  fill: {
    position: 'absolute',
    left: 0,
    top: 0,
  },
});
