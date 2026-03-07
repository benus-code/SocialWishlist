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
import {useAuth} from '../../contexts/AuthContext';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {GoogleSignInButton} from '../../components/GoogleSignInButton';
import {Toast} from '../../components/Toast';
import {colors, fonts, spacing, radius} from '../../theme';
import type {AuthStackParamList} from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Register'>;

export function RegisterScreen({navigation}: Props) {
  const {t} = useTranslation('auth');
  const {register, googleLogin} = useAuth();
  const [displayName, setDisplayName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({visible: false, message: '', type: 'error' as const});

  const handleRegister = async () => {
    if (!email.trim() || !password) {
      setToast({visible: true, message: t('register.emailPasswordRequired'), type: 'error'});
      return;
    }
    if (password.length < 6) {
      setToast({visible: true, message: t('register.passwordMinLength'), type: 'error'});
      return;
    }

    setLoading(true);
    try {
      await register(email.trim().toLowerCase(), password, displayName.trim() || undefined);
    } catch (err: any) {
      setToast({
        visible: true,
        message: err.message || t('register.createError'),
        type: 'error',
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
          <View style={styles.logo}>
            <Text style={styles.logoText}>W</Text>
          </View>
          <Text style={styles.title}>{t('register.title')}</Text>
          <Text style={styles.subtitle}>{t('register.subtitle')}</Text>
        </View>

        <View style={styles.form}>
          <Input
            label={t('register.name')}
            placeholder={t('register.namePlaceholder')}
            value={displayName}
            onChangeText={setDisplayName}
            autoCapitalize="words"
            textContentType="name"
          />

          <Input
            label={t('register.email')}
            placeholder={t('register.emailPlaceholder')}
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />

          <Input
            label={t('register.password')}
            placeholder={t('register.passwordPlaceholder')}
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textContentType="newPassword"
            autoComplete="password-new"
            rightIcon={
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <Button
            title={t('register.createAccount')}
            onPress={handleRegister}
            loading={loading}
            size="lg"
            style={styles.registerButton}
          />

          <GoogleSignInButton
            onSuccess={async (credential) => {
              try {
                await googleLogin(credential);
              } catch (err: any) {
                setToast({
                  visible: true,
                  message: err.message || t('register.createError'),
                  type: 'error',
                });
              }
            }}
            onError={(msg) => setToast({visible: true, message: msg, type: 'error'})}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>{t('register.hasAccount')}</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Login')}>
            <Text style={styles.footerLink}>{t('register.signIn')}</Text>
          </TouchableOpacity>
        </View>
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
  logo: {
    width: 56,
    height: 56,
    borderRadius: radius.lg,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  logoText: {
    color: colors.white,
    fontSize: 28,
    fontWeight: '700',
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: '700',
    color: colors.gray900,
  },
  subtitle: {
    fontSize: fonts.sizes.md,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  form: {
    marginBottom: spacing.xxl,
  },
  eyeIcon: {
    fontSize: 18,
  },
  registerButton: {
    marginTop: spacing.sm,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
  },
  footerText: {
    color: colors.gray500,
    fontSize: fonts.sizes.sm,
  },
  footerLink: {
    color: colors.primary,
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
  },
});
