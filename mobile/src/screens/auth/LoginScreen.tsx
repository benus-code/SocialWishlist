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
import {useAuth} from '../../contexts/AuthContext';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {Toast} from '../../components/Toast';
import {colors, fonts, spacing, radius} from '../../theme';
import type {AuthStackParamList} from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'Login'>;

export function LoginScreen({navigation}: Props) {
  const {login} = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [toast, setToast] = useState({visible: false, message: '', type: 'error' as const});

  const handleLogin = async () => {
    if (!email.trim() || !password) {
      setToast({visible: true, message: 'Veuillez remplir tous les champs', type: 'error'});
      return;
    }

    setLoading(true);
    try {
      await login(email.trim().toLowerCase(), password);
    } catch (err: any) {
      setToast({
        visible: true,
        message: err.message || 'Email ou mot de passe incorrect',
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
          <Text style={styles.title}>Wishly</Text>
          <Text style={styles.subtitle}>Connectez-vous à votre compte</Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Email"
            placeholder="votre@email.com"
            value={email}
            onChangeText={setEmail}
            autoCapitalize="none"
            keyboardType="email-address"
            textContentType="emailAddress"
            autoComplete="email"
          />

          <Input
            label="Mot de passe"
            placeholder="Votre mot de passe"
            value={password}
            onChangeText={setPassword}
            secureTextEntry={!showPassword}
            textContentType="password"
            autoComplete="password"
            rightIcon={
              <Text style={styles.eyeIcon}>{showPassword ? '🙈' : '👁️'}</Text>
            }
            onRightIconPress={() => setShowPassword(!showPassword)}
          />

          <TouchableOpacity
            onPress={() => navigation.navigate('ForgotPassword')}
            style={styles.forgotLink}>
            <Text style={styles.forgotText}>Mot de passe oublié ?</Text>
          </TouchableOpacity>

          <Button
            title="Se connecter"
            onPress={handleLogin}
            loading={loading}
            size="lg"
            style={styles.loginButton}
          />
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Pas encore de compte ?</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}> Créer un compte</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={() => setToast(t => ({...t, visible: false}))}
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
    fontSize: fonts.sizes.xxxl,
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
  forgotLink: {
    alignSelf: 'flex-end',
    marginTop: -spacing.sm,
    marginBottom: spacing.lg,
  },
  forgotText: {
    color: colors.primary,
    fontSize: fonts.sizes.sm,
    fontWeight: '500',
  },
  loginButton: {
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
