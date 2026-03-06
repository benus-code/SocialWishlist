import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
import {authApi} from '../../api/auth';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {Toast} from '../../components/Toast';
import {colors, fonts, spacing, radius} from '../../theme';
import type {AuthStackParamList} from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ForgotPassword'>;

export function ForgotPasswordScreen({navigation}: Props) {
  const {t} = useTranslation('auth');
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [toast, setToast] = useState({visible: false, message: '', type: 'success' as 'success' | 'error'});

  const handleSubmit = async () => {
    if (!email.trim()) {
      setToast({visible: true, message: t('forgotPassword.enterEmail'), type: 'error'});
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(email.trim().toLowerCase());
      setSent(true);
      setToast({
        visible: true,
        message: t('forgotPassword.emailSent'),
        type: 'success',
      });
    } catch {
      // Always show success for security
      setSent(true);
      setToast({
        visible: true,
        message: t('forgotPassword.emailSent'),
        type: 'success',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🔑</Text>
          </View>
          <Text style={styles.title}>{t('forgotPassword.title')}</Text>
          <Text style={styles.subtitle}>
            {t('forgotPassword.subtitle')}
          </Text>
        </View>

        {!sent ? (
          <View style={styles.form}>
            <Input
              label={t('forgotPassword.email')}
              placeholder={t('forgotPassword.emailPlaceholder')}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              textContentType="emailAddress"
            />

            <Button
              title={t('forgotPassword.sendLink')}
              onPress={handleSubmit}
              loading={loading}
              size="lg"
            />
          </View>
        ) : (
          <View style={styles.successCard}>
            <Text style={styles.successIcon}>✉️</Text>
            <Text style={styles.successText}>
              {t('forgotPassword.successMessage')}
            </Text>
          </View>
        )}

        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.backLink}>
          <Text style={styles.backText}>{t('forgotPassword.backToLogin')}</Text>
        </TouchableOpacity>
      </ScrollView>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={() => setToast(prev => ({...prev, visible: false}))}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.white,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: spacing.xxl,
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing.xxxl,
  },
  iconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 28,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: '700',
    color: colors.gray900,
  },
  subtitle: {
    fontSize: fonts.sizes.sm,
    color: colors.gray500,
    textAlign: 'center',
    marginTop: spacing.sm,
    lineHeight: 20,
  },
  form: {
    marginBottom: spacing.xxl,
  },
  successCard: {
    backgroundColor: colors.successBg,
    padding: spacing.xxl,
    borderRadius: radius.md,
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  successIcon: {
    fontSize: 40,
    marginBottom: spacing.md,
  },
  successText: {
    fontSize: fonts.sizes.sm,
    color: colors.success,
    textAlign: 'center',
    lineHeight: 20,
  },
  backLink: {
    alignItems: 'center',
  },
  backText: {
    color: colors.primary,
    fontSize: fonts.sizes.sm,
    fontWeight: '500',
  },
});
