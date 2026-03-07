import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ActivityIndicator,
  Platform,
} from 'react-native';
import {
  GoogleSignin,
  statusCodes,
} from '@react-native-google-signin/google-signin';
import {useTranslation} from 'react-i18next';
import {authApi} from '../api/auth';
import {colors, fonts, spacing, radius} from '../theme';

interface GoogleSignInButtonProps {
  onSuccess: (credential: string) => void;
  onError?: (message: string) => void;
}

export function GoogleSignInButton({onSuccess, onError}: GoogleSignInButtonProps) {
  const {t} = useTranslation('auth');
  const [loading, setLoading] = useState(false);
  const [configured, setConfigured] = useState(false);

  useEffect(() => {
    authApi.getGoogleClientId().then(res => {
      if (res?.client_id) {
        try {
          const config: Parameters<typeof GoogleSignin.configure>[0] = {
            webClientId: res.client_id,
            offlineAccess: false,
          };
          if (Platform.OS === 'ios' && res.ios_client_id) {
            config.iosClientId = res.ios_client_id;
          }
          GoogleSignin.configure(config);
          setConfigured(true);
        } catch {
          // Configuration failed (e.g. missing iOS client ID)
        }
      }
    }).catch(() => {
      // Google sign-in not available
    });
  }, []);

  const handlePress = async () => {
    if (!configured) return;
    setLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const response = await GoogleSignin.signIn();
      const idToken = response.data?.idToken;
      if (idToken) {
        onSuccess(idToken);
      } else {
        onError?.('No ID token received');
      }
    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // User cancelled, do nothing
      } else if (error.code === statusCodes.IN_PROGRESS) {
        // Already in progress
      } else {
        onError?.(error.message || 'Google sign-in failed');
      }
    } finally {
      setLoading(false);
    }
  };

  if (!configured) return null;

  return (
    <View style={styles.container}>
      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>{t('login.or', {defaultValue: 'or'})}</Text>
        <View style={styles.dividerLine} />
      </View>

      <TouchableOpacity
        style={styles.button}
        onPress={handlePress}
        disabled={loading}
        activeOpacity={0.7}>
        {loading ? (
          <ActivityIndicator size="small" color={colors.gray700} />
        ) : (
          <>
            <Text style={styles.googleIcon}>G</Text>
            <Text style={styles.buttonText}>
              {t('login.continueWithGoogle', {defaultValue: 'Continue with Google'})}
            </Text>
          </>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.lg,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing.lg,
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.gray200,
  },
  dividerText: {
    paddingHorizontal: spacing.md,
    fontSize: fonts.sizes.xs,
    color: colors.gray400,
  },
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: radius.full,
    borderWidth: 1,
    borderColor: colors.gray200,
    backgroundColor: colors.white,
    gap: spacing.sm,
  },
  googleIcon: {
    fontSize: 18,
    fontWeight: '700',
    color: '#4285F4',
  },
  buttonText: {
    fontSize: fonts.sizes.md,
    fontWeight: '500',
    color: colors.gray700,
  },
});
