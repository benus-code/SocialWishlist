import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {wishlistsApi, Wishlist, Item} from '../../api/wishlists';
import {contributionsApi, Contribution} from '../../api/contributions';
import {useAuth} from '../../contexts/AuthContext';
import {useSocket} from '../../hooks/useSocket';
import {ItemCard} from '../../components/ItemCard';
import {ProgressBar} from '../../components/ProgressBar';
import {Button} from '../../components/Button';
import {Toast} from '../../components/Toast';
import {LoadingScreen} from '../../components/LoadingScreen';
import {EmptyState} from '../../components/EmptyState';
import {colors, fonts, spacing, radius, shadows} from '../../theme';
import {formatPrice, getProgressPercent, getCurrencySymbol} from '../../utils/format';

type Props = NativeStackScreenProps<any, 'PublicWishlist'>;

export function PublicWishlistScreen({route, navigation}: Props) {
  const {slug} = route.params as {slug: string};
  const {isAuthenticated} = useAuth();
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [toast, setToast] = useState({visible: false, message: '', type: 'success' as 'success' | 'error'});

  // Contribution state
  const [selectedItem, setSelectedItem] = useState<Item | null>(null);
  const [amount, setAmount] = useState('');
  const [contributing, setContributing] = useState(false);
  const [myContribution, setMyContribution] = useState<Contribution | null>(null);
  const [editingContribution, setEditingContribution] = useState(false);

  useSocket(wishlist?.id ?? null, data => {
    setItems(prev =>
      prev.map(item =>
        item.id === data.itemId
          ? {
              ...item,
              total_funded: data.total,
              contributor_count: data.contributors,
              status: data.status,
            }
          : item,
      ),
    );
  });

  const loadData = useCallback(async () => {
    try {
      const wl = await wishlistsApi.getPublic(slug);
      setWishlist(wl);
      setItems(wl.items || []);
    } catch {
      setToast({visible: true, message: 'Liste introuvable', type: 'error'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [slug]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const loadMyContribution = async (itemId: string) => {
    if (!isAuthenticated) return;
    try {
      const contrib = await contributionsApi.getMine(itemId);
      setMyContribution(contrib);
    } catch {
      setMyContribution(null);
    }
  };

  const handleItemPress = (item: Item) => {
    setSelectedItem(item);
    setAmount('');
    setEditingContribution(false);
    loadMyContribution(item.id);
  };

  const handleReserve = async () => {
    if (!selectedItem || !isAuthenticated) return;
    setContributing(true);
    try {
      await contributionsApi.reserve(selectedItem.id);
      setToast({visible: true, message: 'Article réservé !', type: 'success'});
      setSelectedItem(null);
      loadData();
    } catch (err: any) {
      setToast({visible: true, message: err.message || 'Erreur', type: 'error'});
    } finally {
      setContributing(false);
    }
  };

  const handleContribute = async () => {
    if (!selectedItem || !amount) return;
    const amountCents = Math.round(Number(amount) * 100);
    if (isNaN(amountCents) || amountCents <= 0) {
      setToast({visible: true, message: 'Montant invalide', type: 'error'});
      return;
    }

    setContributing(true);
    try {
      if (editingContribution && myContribution) {
        await contributionsApi.update(selectedItem.id, amountCents);
        setToast({visible: true, message: 'Contribution modifiée !', type: 'success'});
      } else {
        await contributionsApi.create(selectedItem.id, amountCents);
        setToast({visible: true, message: 'Merci pour votre contribution !', type: 'success'});
      }
      setSelectedItem(null);
      loadData();
    } catch (err: any) {
      setToast({visible: true, message: err.message || 'Erreur', type: 'error'});
    } finally {
      setContributing(false);
    }
  };

  const handleWithdraw = () => {
    if (!selectedItem) return;
    Alert.alert(
      'Retirer ma contribution',
      'Voulez-vous vraiment retirer votre contribution ?',
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Retirer',
          style: 'destructive',
          onPress: async () => {
            try {
              await contributionsApi.update(selectedItem.id, 0);
              setToast({visible: true, message: 'Contribution retirée', type: 'success'});
              setSelectedItem(null);
              loadData();
            } catch {
              setToast({visible: true, message: 'Erreur', type: 'error'});
            }
          },
        },
      ],
    );
  };

  if (loading) return <LoadingScreen />;
  if (!wishlist) {
    return (
      <EmptyState
        icon="🔍"
        title="Liste introuvable"
        description="Cette liste n'existe pas ou a été supprimée."
      />
    );
  }

  const totalPrice = items.reduce((sum, i) => sum + i.price, 0);
  const totalFunded = items.reduce((sum, i) => sum + i.total_funded, 0);
  const overallPercent = getProgressPercent(totalFunded, totalPrice);
  const currency = wishlist.currency;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Retour</Text>
        </TouchableOpacity>
        <Text style={styles.title}>{wishlist.title}</Text>
        {wishlist.owner && (
          <Text style={styles.owner}>
            par {wishlist.owner.display_name || 'Anonyme'}
          </Text>
        )}
        {wishlist.occasion && (
          <Text style={styles.occasion}>{wishlist.occasion}</Text>
        )}
        {items.length > 0 && (
          <View style={styles.progressSection}>
            <ProgressBar percent={overallPercent} height={10} />
            <Text style={styles.progressText}>
              {formatPrice(totalFunded, currency)} / {formatPrice(totalPrice, currency)} ({overallPercent}%)
            </Text>
          </View>
        )}
        {wishlist.is_archived && (
          <View style={styles.archivedBanner}>
            <Text style={styles.archivedBannerText}>Cette liste est archivée</Text>
          </View>
        )}
        {!isAuthenticated && (
          <TouchableOpacity
            style={styles.signInBanner}
            onPress={() => navigation.navigate('AuthStack', {screen: 'Login'})}>
            <Text style={styles.signInText}>
              Connectez-vous pour contribuer
            </Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Items */}
      <FlatList
        data={items}
        keyExtractor={item => item.id}
        renderItem={({item}) => (
          <ItemCard
            item={item}
            currency={currency}
            onPress={() => handleItemPress(item)}
          />
        )}
        contentContainerStyle={styles.itemsList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              loadData();
            }}
            tintColor={colors.primary}
          />
        }
        ListEmptyComponent={
          <EmptyState
            icon="📋"
            title="Aucun article"
            description="Cette liste est vide pour le moment."
          />
        }
      />

      {/* Contribution Bottom Sheet */}
      {selectedItem && isAuthenticated && !wishlist.is_archived && (
        <View style={styles.contributionSheet}>
          <View style={styles.sheetHeader}>
            <Text style={styles.sheetTitle} numberOfLines={1}>
              {selectedItem.name}
            </Text>
            <TouchableOpacity onPress={() => setSelectedItem(null)}>
              <Text style={styles.sheetClose}>✕</Text>
            </TouchableOpacity>
          </View>

          <Text style={styles.sheetPrice}>
            {formatPrice(selectedItem.price, currency)}
          </Text>

          {myContribution && !editingContribution ? (
            <View style={styles.myContrib}>
              <Text style={styles.myContribText}>
                Votre contribution : {formatPrice(myContribution.amount, currency)}
              </Text>
              <View style={styles.contribActions}>
                <Button
                  title="Modifier"
                  onPress={() => {
                    setEditingContribution(true);
                    setAmount((myContribution.amount / 100).toString());
                  }}
                  variant="secondary"
                  size="sm"
                />
                <Button
                  title="Retirer"
                  onPress={handleWithdraw}
                  variant="danger"
                  size="sm"
                />
              </View>
            </View>
          ) : selectedItem.status !== 'FULLY_FUNDED' ? (
            <>
              {selectedItem.contributor_count === 0 && (
                <Button
                  title="Réserver (prix complet)"
                  onPress={handleReserve}
                  loading={contributing}
                  variant="secondary"
                  style={styles.reserveButton}
                />
              )}
              <View style={styles.chipInRow}>
                <View style={styles.amountInput}>
                  <Text style={styles.currencyLabel}>{getCurrencySymbol(currency)}</Text>
                  <TextInput
                    style={styles.amountField}
                    value={amount}
                    onChangeText={setAmount}
                    placeholder="0.00"
                    keyboardType="decimal-pad"
                    placeholderTextColor={colors.gray400}
                  />
                </View>
                <Button
                  title={editingContribution ? 'Modifier' : 'Contribuer'}
                  onPress={handleContribute}
                  loading={contributing}
                  size="md"
                />
              </View>
            </>
          ) : (
            <View style={styles.fullyFundedBanner}>
              <Text style={styles.fullyFundedText}>Entièrement financé !</Text>
            </View>
          )}
        </View>
      )}

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
    backgroundColor: colors.gray50,
  },
  header: {
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  backButton: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: '500',
    marginBottom: spacing.md,
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: '700',
    color: colors.gray900,
  },
  owner: {
    fontSize: fonts.sizes.sm,
    color: colors.gray500,
    marginTop: spacing.xs,
  },
  occasion: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  progressSection: {
    marginTop: spacing.lg,
  },
  progressText: {
    fontSize: fonts.sizes.xs,
    color: colors.gray500,
    marginTop: spacing.xs,
    textAlign: 'right',
  },
  archivedBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.warningBg,
    borderRadius: radius.sm,
  },
  archivedBannerText: {
    color: colors.warning,
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  signInBanner: {
    marginTop: spacing.md,
    padding: spacing.md,
    backgroundColor: colors.primaryBg,
    borderRadius: radius.sm,
  },
  signInText: {
    color: colors.primary,
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
    textAlign: 'center',
  },
  itemsList: {
    padding: spacing.lg,
  },
  // Contribution sheet
  contributionSheet: {
    backgroundColor: colors.white,
    padding: spacing.xl,
    borderTopWidth: 1,
    borderTopColor: colors.gray200,
    ...shadows.lg,
  },
  sheetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  sheetTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: '600',
    color: colors.gray900,
    flex: 1,
    marginRight: spacing.md,
  },
  sheetClose: {
    fontSize: 20,
    color: colors.gray400,
    padding: spacing.xs,
  },
  sheetPrice: {
    fontSize: fonts.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.lg,
  },
  myContrib: {
    backgroundColor: colors.primaryBg,
    padding: spacing.lg,
    borderRadius: radius.md,
  },
  myContribText: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: '600',
    marginBottom: spacing.md,
  },
  contribActions: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  reserveButton: {
    marginBottom: spacing.md,
  },
  chipInRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.md,
  },
  amountInput: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    borderRadius: radius.md,
    paddingHorizontal: spacing.md,
  },
  currencyLabel: {
    fontSize: fonts.sizes.md,
    color: colors.gray500,
    marginRight: spacing.sm,
  },
  amountField: {
    flex: 1,
    paddingVertical: 14,
    fontSize: fonts.sizes.md,
    color: colors.gray900,
  },
  fullyFundedBanner: {
    backgroundColor: colors.successBg,
    padding: spacing.lg,
    borderRadius: radius.md,
    alignItems: 'center',
  },
  fullyFundedText: {
    color: colors.success,
    fontSize: fonts.sizes.md,
    fontWeight: '700',
  },
});
