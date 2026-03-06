import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useAuth} from '../contexts/AuthContext';
import {authApi} from '../api/auth';
import {Input} from '../components/Input';
import {Button} from '../components/Button';
import {Toast} from '../components/Toast';
import {colors, fonts, spacing, radius, shadows} from '../theme';
import {formatDate} from '../utils/format';

export function ProfileScreen() {
  const insets = useSafeAreaInsets();
  const {user, logout, refreshUser} = useAuth();
  const [displayName, setDisplayName] = useState(user?.display_name || '');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState({visible: false, message: '', type: 'success' as 'success' | 'error'});

  const handleSave = async () => {
    setSaving(true);
    try {
      await authApi.updateMe({display_name: displayName.trim()});
      await refreshUser();
      setToast({visible: true, message: 'Profil mis à jour !', type: 'success'});
    } catch (err: any) {
      setToast({visible: true, message: err.message || 'Erreur', type: 'error'});
    } finally {
      setSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Déconnexion',
      'Voulez-vous vous déconnecter ?',
      [
        {text: 'Annuler', style: 'cancel'},
        {text: 'Se déconnecter', style: 'destructive', onPress: logout},
      ],
    );
  };

  if (!user) return null;

  const initials = (user.display_name || user.email)
    .slice(0, 2)
    .toUpperCase();

  return (
    <ScrollView
      style={[styles.container, {paddingTop: insets.top}]}
      contentContainerStyle={styles.content}>
      {/* Avatar */}
      <View style={styles.avatarSection}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.email}>{user.email}</Text>
        {user.oauth_provider && (
          <View style={styles.oauthBadge}>
            <Text style={styles.oauthText}>
              Connecté via {user.oauth_provider}
            </Text>
          </View>
        )}
      </View>

      {/* Info Card */}
      <View style={styles.card}>
        <Input
          label="Nom d'affichage"
          placeholder="Votre nom"
          value={displayName}
          onChangeText={setDisplayName}
          autoCapitalize="words"
        />

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Email</Text>
          <Text style={styles.infoValue}>{user.email}</Text>
        </View>

        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Membre depuis</Text>
          <Text style={styles.infoValue}>{formatDate(user.created_at)}</Text>
        </View>

        <Button
          title="Enregistrer"
          onPress={handleSave}
          loading={saving}
          disabled={displayName.trim() === (user.display_name || '')}
          style={styles.saveButton}
        />
      </View>

      {/* Logout */}
      <Button
        title="Se déconnecter"
        onPress={handleLogout}
        variant="danger"
        style={styles.logoutButton}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={() => setToast(t => ({...t, visible: false}))}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  content: {
    padding: spacing.xxl,
  },
  avatarSection: {
    alignItems: 'center',
    marginBottom: spacing.xxl,
  },
  avatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.md,
  },
  avatarText: {
    color: colors.white,
    fontSize: fonts.sizes.xxl,
    fontWeight: '700',
  },
  email: {
    fontSize: fonts.sizes.md,
    color: colors.gray600,
  },
  oauthBadge: {
    marginTop: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.xs,
    backgroundColor: colors.primaryBg,
    borderRadius: radius.full,
  },
  oauthText: {
    fontSize: fonts.sizes.xs,
    color: colors.primary,
    fontWeight: '500',
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.xxl,
    marginBottom: spacing.xxl,
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.gray100,
  },
  infoLabel: {
    fontSize: fonts.sizes.sm,
    color: colors.gray500,
  },
  infoValue: {
    fontSize: fonts.sizes.sm,
    color: colors.gray900,
    fontWeight: '500',
  },
  saveButton: {
    marginTop: spacing.lg,
  },
  logoutButton: {
    marginBottom: spacing.xxxl,
  },
});
