import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  Modal,
  Alert,
  Platform,
} from 'react-native';
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import DateTimePicker from '@react-native-community/datetimepicker';
import {wishlistsApi, Wishlist} from '../../api/wishlists';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {EmptyState} from '../../components/EmptyState';
import {Toast} from '../../components/Toast';
import {colors, fonts, spacing, radius, shadows} from '../../theme';
import {formatDate} from '../../utils/format';

const OCCASIONS = [
  'Anniversaire',
  'Noël',
  'Mariage',
  'Crémaillère',
  'Baby Shower',
  'Diplôme',
  'Autre',
];

const CURRENCIES = ['EUR', 'USD', 'GBP', 'CHF', 'CAD', 'XOF', 'XAF'];

type Props = NativeStackScreenProps<any>;

export function DashboardScreen({navigation}: Props) {
  const insets = useSafeAreaInsets();
  const [wishlists, setWishlists] = useState<Wishlist[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [creating, setCreating] = useState(false);
  const [toast, setToast] = useState({visible: false, message: '', type: 'success' as 'success' | 'error'});

  // New wishlist form
  const [title, setTitle] = useState('');
  const [occasion, setOccasion] = useState('');
  const [currency, setCurrency] = useState('EUR');
  const [eventDate, setEventDate] = useState<Date | undefined>(undefined);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const loadWishlists = useCallback(async () => {
    try {
      const data = await wishlistsApi.list();
      setWishlists(data);
    } catch {
      setToast({visible: true, message: 'Erreur de chargement', type: 'error'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadWishlists();
    }, [loadWishlists]),
  );

  const handleCreate = async () => {
    if (!title.trim()) {
      setToast({visible: true, message: 'Le titre est requis', type: 'error'});
      return;
    }

    setCreating(true);
    try {
      const newWishlist = await wishlistsApi.create({
        title: title.trim(),
        occasion: occasion || undefined,
        currency,
        event_date: eventDate?.toISOString().split('T')[0],
      });
      setWishlists(prev => [newWishlist, ...prev]);
      setModalVisible(false);
      resetForm();
      setToast({visible: true, message: 'Liste créée !', type: 'success'});
    } catch (err: any) {
      setToast({visible: true, message: err.message || 'Erreur', type: 'error'});
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = (wishlist: Wishlist) => {
    Alert.alert(
      'Supprimer la liste',
      `Voulez-vous vraiment supprimer "${wishlist.title}" ? Cette action est irréversible.`,
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await wishlistsApi.delete(wishlist.id);
              setWishlists(prev => prev.filter(w => w.id !== wishlist.id));
              setToast({visible: true, message: 'Liste supprimée', type: 'success'});
            } catch {
              setToast({visible: true, message: 'Erreur lors de la suppression', type: 'error'});
            }
          },
        },
      ],
    );
  };

  const resetForm = () => {
    setTitle('');
    setOccasion('');
    setCurrency('EUR');
    setEventDate(undefined);
  };

  const renderWishlistItem = ({item}: {item: Wishlist}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => navigation.navigate('WishlistEditor', {wishlistId: item.id})}
      activeOpacity={0.7}>
      <View style={styles.cardHeader}>
        <View style={styles.cardTitleRow}>
          <Text style={styles.cardTitle} numberOfLines={1}>
            {item.title}
          </Text>
          {item.is_archived && (
            <View style={styles.archivedBadge}>
              <Text style={styles.archivedText}>Archivée</Text>
            </View>
          )}
        </View>
        {item.occasion && (
          <Text style={styles.cardOccasion}>{item.occasion}</Text>
        )}
        {item.event_date && (
          <Text style={styles.cardDate}>{formatDate(item.event_date)}</Text>
        )}
      </View>
      <View style={styles.cardActions}>
        <TouchableOpacity
          onPress={() => handleDelete(item)}
          hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
          <Text style={styles.deleteIcon}>🗑️</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={[styles.container, {paddingTop: insets.top}]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Mes listes ({wishlists.length})
        </Text>
        <Button
          title="+ Nouvelle liste"
          onPress={() => setModalVisible(true)}
          size="sm"
        />
      </View>

      {wishlists.length === 0 && !loading ? (
        <EmptyState
          icon="🎁"
          title="Aucune liste pour le moment"
          description="Créez votre première liste de souhaits et partagez-la avec vos proches."
          actionLabel="Créer ma première liste"
          onAction={() => setModalVisible(true)}
        />
      ) : (
        <FlatList
          data={wishlists}
          keyExtractor={item => item.id}
          renderItem={renderWishlistItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadWishlists();
              }}
              tintColor={colors.primary}
            />
          }
        />
      )}

      {/* Create Wishlist Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {setModalVisible(false); resetForm();}}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Nouvelle liste</Text>
            <View style={{width: 60}} />
          </View>

          <View style={styles.modalContent}>
            <Input
              label="Titre"
              placeholder="Ex: Mon anniversaire 2026"
              value={title}
              onChangeText={setTitle}
            />

            <Text style={styles.fieldLabel}>Occasion</Text>
            <View style={styles.chipRow}>
              {OCCASIONS.map(o => (
                <TouchableOpacity
                  key={o}
                  style={[styles.chip, occasion === o && styles.chipActive]}
                  onPress={() => setOccasion(occasion === o ? '' : o)}>
                  <Text style={[styles.chipText, occasion === o && styles.chipTextActive]}>
                    {o}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Devise</Text>
            <View style={styles.chipRow}>
              {CURRENCIES.map(c => (
                <TouchableOpacity
                  key={c}
                  style={[styles.chip, currency === c && styles.chipActive]}
                  onPress={() => setCurrency(c)}>
                  <Text style={[styles.chipText, currency === c && styles.chipTextActive]}>
                    {c}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Date de l'événement</Text>
            <TouchableOpacity
              style={styles.dateButton}
              onPress={() => setShowDatePicker(true)}>
              <Text style={styles.dateButtonText}>
                {eventDate ? formatDate(eventDate.toISOString()) : 'Choisir une date (optionnel)'}
              </Text>
            </TouchableOpacity>
            {showDatePicker && (
              <DateTimePicker
                value={eventDate || new Date()}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                minimumDate={new Date()}
                onChange={(_, date) => {
                  setShowDatePicker(Platform.OS === 'ios');
                  if (date) setEventDate(date);
                }}
              />
            )}

            <Button
              title="Créer la liste"
              onPress={handleCreate}
              loading={creating}
              size="lg"
              style={styles.createButton}
            />
          </View>
        </View>
      </Modal>

      <Toast
        message={toast.message}
        type={toast.type}
        visible={toast.visible}
        onDismiss={() => setToast(t => ({...t, visible: false}))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: '700',
    color: colors.gray900,
  },
  list: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.lg,
    marginBottom: spacing.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  cardHeader: {
    flex: 1,
    marginRight: spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
  },
  cardTitle: {
    fontSize: fonts.sizes.md,
    fontWeight: '600',
    color: colors.gray900,
    flexShrink: 1,
  },
  archivedBadge: {
    backgroundColor: colors.warningBg,
    paddingHorizontal: spacing.sm,
    paddingVertical: 2,
    borderRadius: radius.sm,
  },
  archivedText: {
    fontSize: fonts.sizes.xs,
    color: colors.warning,
    fontWeight: '600',
  },
  cardOccasion: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  cardDate: {
    fontSize: fonts.sizes.xs,
    color: colors.gray400,
    marginTop: spacing.xs,
  },
  cardActions: {
    padding: spacing.xs,
  },
  deleteIcon: {
    fontSize: 18,
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  modalCancel: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: '500',
  },
  modalTitle: {
    fontSize: fonts.sizes.lg,
    fontWeight: '600',
    color: colors.gray900,
  },
  modalContent: {
    padding: spacing.xxl,
  },
  fieldLabel: {
    fontSize: fonts.sizes.sm,
    fontWeight: '500',
    color: colors.gray700,
    marginBottom: spacing.sm,
  },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.sm,
    marginBottom: spacing.lg,
  },
  chip: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderRadius: radius.full,
    backgroundColor: colors.gray100,
    borderWidth: 1,
    borderColor: colors.gray200,
  },
  chipActive: {
    backgroundColor: colors.primaryBg,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: fonts.sizes.sm,
    color: colors.gray600,
  },
  chipTextActive: {
    color: colors.primary,
    fontWeight: '600',
  },
  dateButton: {
    padding: spacing.lg,
    borderRadius: radius.md,
    backgroundColor: colors.gray50,
    borderWidth: 1,
    borderColor: colors.gray200,
    marginBottom: spacing.lg,
  },
  dateButtonText: {
    fontSize: fonts.sizes.md,
    color: colors.gray500,
  },
  createButton: {
    marginTop: spacing.lg,
  },
});
