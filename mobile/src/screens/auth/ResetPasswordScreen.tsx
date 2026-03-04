import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {authApi} from '../../api/auth';
import {Input} from '../../components/Input';
import {Button} from '../../components/Button';
import {Toast} from '../../components/Toast';
import {colors, fonts, spacing, radius} from '../../theme';
import type {AuthStackParamList} from '../../navigation/AuthStack';

type Props = NativeStackScreenProps<AuthStackParamList, 'ResetPassword'>;

export function ResetPasswordScreen({navigation, route}: Props) {
  const token = route.params?.token;
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [toast, setToast] = useState({visible: false, message: '', type: 'error' as 'success' | 'error'});

  const handleReset = async () => {
    if (!password || !confirmPassword) {
      setToast({visible: true, message: 'Veuillez remplir tous les champs', type: 'error'});
      return;
    }
    if (password.length < 6) {
      setToast({visible: true, message: 'Le mot de passe doit contenir au moins 6 caractères', type: 'error'});
      return;
    }
    if (password !== confirmPassword) {
      setToast({visible: true, message: 'Les mots de passe ne correspondent pas', type: 'error'});
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      Alert.alert(
        'Mot de passe modifié',
        'Votre mot de passe a été réinitialisé avec succès.',
        [{text: 'Se connecter', onPress: () => navigation.navigate('Login')}],
      );
    } catch (err: any) {
      setToast({
        visible: true,
        message: err.message || 'Le lien est invalide ou expiré',
        type: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <View style={styles.errorContainer}>
        <Text style={styles.errorText}>Lien invalide</Text>
        <Button
          title="Retour à la connexion"
          onPress={() => navigation.navigate('Login')}
        />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        <View style={styles.header}>
          <View style={styles.iconCircle}>
            <Text style={styles.icon}>🔒</Text>
          </View>
          <Text style={styles.title}>Nouveau mot de passe</Text>
          <Text style={styles.subtitle}>
            Choisissez un nouveau mot de passe pour votre compte.
          </Text>
        </View>

        <View style={styles.form}>
          <Input
            label="Nouveau mot de passe"
            placeholder="Minimum 6 caractères"
            value={password}
            onChangeText={setPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          <Input
            label="Confirmer le mot de passe"
            placeholder="Retapez votre mot de passe"
            value={confirmPassword}
            onChangeText={setConfirmPassword}
            secureTextEntry
            textContentType="newPassword"
          />

          <Button
            title="Réinitialiser"
            onPress={handleReset}
            loading={loading}
            size="lg"
          />
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
  },
  form: {
    marginBottom: spacing.xxl,
  },
  errorContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xxl,
    backgroundColor: colors.white,
  },
  errorText: {
    fontSize: fonts.sizes.lg,
    color: colors.error,
    marginBottom: spacing.lg,
  },
});
