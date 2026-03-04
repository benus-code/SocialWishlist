import React from 'react';
import {View, Text, StyleSheet} from 'react-native';
import {colors, fonts, spacing} from '../theme';
import {Button} from './Button';

type EmptyStateProps = {
  icon?: string;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
};

export function EmptyState({
  icon = '📋',
  title,
  description,
  actionLabel,
  onAction,
}: EmptyStateProps) {
  return (
    <View style={styles.container}>
      <Text style={styles.icon}>{icon}</Text>
      <Text style={styles.title}>{title}</Text>
      {description && <Text style={styles.description}>{description}</Text>}
      {actionLabel && onAction && (
        <Button title={actionLabel} onPress={onAction} style={styles.button} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxxl,
  },
  icon: {
    fontSize: 48,
    marginBottom: spacing.lg,
  },
  title: {
    fontSize: fonts.sizes.lg,
    fontWeight: '600',
    color: colors.gray800,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fonts.sizes.sm,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 20,
  },
  button: {
    marginTop: spacing.xl,
  },
});
