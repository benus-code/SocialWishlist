import React, {useState} from 'react';
import {
  View,
  TextInput,
  Text,
  StyleSheet,
  TextInputProps,
  TouchableOpacity,
} from 'react-native';
import {colors, radius, fonts, spacing} from '../theme';

type InputProps = TextInputProps & {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconPress?: () => void;
};

export function Input({
  label,
  error,
  icon,
  rightIcon,
  onRightIconPress,
  style,
  ...props
}: InputProps) {
  const [focused, setFocused] = useState(false);

  return (
    <View style={styles.container}>
      {label && <Text style={styles.label}>{label}</Text>}
      <View
        style={[
          styles.inputContainer,
          focused && styles.inputFocused,
          error && styles.inputError,
        ]}>
        {icon && <View style={styles.icon}>{icon}</View>}
        <TextInput
          style={[styles.input, style]}
          placeholderTextColor={colors.gray400}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          {...props}
        />
        {rightIcon && (
          <TouchableOpacity onPress={onRightIconPress} style={styles.rightIcon}>
            {rightIcon}
          </TouchableOpacity>
        )}
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: spacing.lg,
  },
  label: {
    fontSize: fonts.sizes.sm,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: spacing.xs,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  inputFocused: {
    borderColor: colors.primary,
    backgroundColor: colors.white,
  },
  inputError: {
    borderColor: colors.error,
  },
  icon: {
    marginRight: spacing.sm,
  },
  input: {
    flex: 1,
    paddingVertical: 14,
    fontSize: fonts.sizes.md,
    color: colors.gray900,
  },
  rightIcon: {
    marginLeft: spacing.sm,
    padding: spacing.xs,
  },
  error: {
    fontSize: fonts.sizes.xs,
    color: colors.error,
    marginTop: spacing.xs,
  },
});
