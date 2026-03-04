import React, {useState, useCallback, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  Share,
  RefreshControl,
  Clipboard,
} from 'react-native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {wishlistsApi, Wishlist, Item} from '../../api/wishlists';
import {itemsApi} from '../../api/items';
import {scrapeApi} from '../../api/scrape';
import {useSocket} from '../../hooks/useSocket';
import {Button} from '../../components/Button';
import {Input} from '../../components/Input';
import {ItemCard} from '../../components/ItemCard';
import {ProgressBar} from '../../components/ProgressBar';
import {EmptyState} from '../../components/EmptyState';
import {Toast} from '../../components/Toast';
import {LoadingScreen} from '../../components/LoadingScreen';
import {colors, fonts, spacing, radius} from '../../theme';
import {formatPrice, formatDate, getProgressPercent} from '../../utils/format';

type Props = NativeStackScreenProps<any, 'WishlistEditor'>;

export function WishlistEditorScreen({route, navigation}: Props) {
  const {wishlistId} = route.params as {wishlistId: string};
  const [wishlist, setWishlist] = useState<Wishlist | null>(null);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [addingItem, setAddingItem] = useState(false);
  const [scraping, setScraping] = useState(false);
  const [toast, setToast] = useState({visible: false, message: '', type: 'success' as 'success' | 'error'});

  // Add item form
  const [itemUrl, setItemUrl] = useState('');
  const [itemName, setItemName] = useState('');
  const [itemPrice, setItemPrice] = useState('');
  const [itemImage, setItemImage] = useState('');

  useSocket(wishlistId, data => {
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
      const [wl, itms] = await Promise.all([
        wishlistsApi.get(wishlistId),
        itemsApi.list(wishlistId),
      ]);
      setWishlist(wl);
      setItems(itms);
    } catch {
      setToast({visible: true, message: 'Erreur de chargement', type: 'error'});
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [wishlistId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleScrape = async () => {
    if (!itemUrl.trim()) return;
    setScraping(true);
    try {
      const result = await scrapeApi.scrapeUrl(itemUrl.trim());
      if (result.title && !itemName) setItemName(result.title);
      if (result.price && !itemPrice) setItemPrice((result.price / 100).toString());
      if (result.image && !itemImage) setItemImage(result.image);
      setToast({visible: true, message: 'Informations récupérées !', type: 'success'});
    } catch {
      // Scraping optional, ignore errors
    } finally {
      setScraping(false);
    }
  };

  const handleAddItem = async () => {
    if (!itemName.trim()) {
      setToast({visible: true, message: 'Le nom est requis', type: 'error'});
      return;
    }
    if (!itemPrice || isNaN(Number(itemPrice)) || Number(itemPrice) <= 0) {
      setToast({visible: true, message: 'Le prix doit être un nombre positif', type: 'error'});
      return;
    }

    setAddingItem(true);
    try {
      const newItem = await itemsApi.create(wishlistId, {
        name: itemName.trim(),
        price: Math.round(Number(itemPrice) * 100),
        link: itemUrl.trim() || undefined,
        image_url: itemImage.trim() || undefined,
      });
      setItems(prev => [...prev, newItem]);
      setModalVisible(false);
      resetItemForm();
      setToast({visible: true, message: 'Article ajouté !', type: 'success'});
    } catch (err: any) {
      setToast({visible: true, message: err.message || 'Erreur', type: 'error'});
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = (item: Item) => {
    Alert.alert(
      'Supprimer l\'article',
      `Voulez-vous supprimer "${item.name}" ?`,
      [
        {text: 'Annuler', style: 'cancel'},
        {
          text: 'Supprimer',
          style: 'destructive',
          onPress: async () => {
            try {
              await itemsApi.delete(wishlistId, item.id);
              setItems(prev => prev.filter(i => i.id !== item.id));
              setToast({visible: true, message: 'Article supprimé', type: 'success'});
            } catch {
              setToast({visible: true, message: 'Erreur lors de la suppression', type: 'error'});
            }
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    if (!wishlist) return;
    const shareUrl = `https://wishly.app/list/${wishlist.slug}`;
    try {
      await Share.share({
        message: `Découvrez ma liste "${wishlist.title}" sur Wishly ! ${shareUrl}`,
        url: shareUrl,
      });
    } catch {
      Clipboard.setString(shareUrl);
      setToast({visible: true, message: 'Lien copié !', type: 'success'});
    }
  };

  const handleToggleArchive = async () => {
    if (!wishlist) return;
    try {
      const updated = await wishlistsApi.update(wishlistId, {
        is_archived: !wishlist.is_archived,
      });
      setWishlist(updated);
      setToast({
        visible: true,
        message: updated.is_archived ? 'Liste archivée' : 'Liste restaurée',
        type: 'success',
      });
    } catch {
      setToast({visible: true, message: 'Erreur', type: 'error'});
    }
  };

  const resetItemForm = () => {
    setItemUrl('');
    setItemName('');
    setItemPrice('');
    setItemImage('');
  };

  if (loading) return <LoadingScreen />;
  if (!wishlist) return null;

  const totalPrice = items.reduce((sum, i) => sum + i.price, 0);
  const totalFunded = items.reduce((sum, i) => sum + i.total_funded, 0);
  const overallPercent = getProgressPercent(totalFunded, totalPrice);

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Text style={styles.backButton}>← Retour</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={handleShare}>
            <Text style={styles.shareButton}>Partager</Text>
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>{wishlist.title}</Text>
        {wishlist.occasion && (
          <Text style={styles.occasion}>{wishlist.occasion}</Text>
        )}
        {wishlist.event_date && (
          <Text style={styles.date}>{formatDate(wishlist.event_date)}</Text>
        )}
        {items.length > 0 && (
          <View style={styles.progressSection}>
            <ProgressBar percent={overallPercent} height={10} />
            <Text style={styles.progressText}>
              {formatPrice(totalFunded, wishlist.currency)} / {formatPrice(totalPrice, wishlist.currency)} ({overallPercent}%)
            </Text>
          </View>
        )}
        <View style={styles.headerActions}>
          <Button
            title={wishlist.is_archived ? 'Restaurer' : 'Archiver'}
            onPress={handleToggleArchive}
            variant="secondary"
            size="sm"
          />
          <Button
            title="+ Ajouter un article"
            onPress={() => setModalVisible(true)}
            size="sm"
          />
        </View>
      </View>

      {/* Items */}
      {items.length === 0 ? (
        <EmptyState
          icon="🎁"
          title="Aucun article"
          description="Ajoutez des articles à votre liste de souhaits."
          actionLabel="Ajouter un article"
          onAction={() => setModalVisible(true)}
        />
      ) : (
        <FlatList
          data={items}
          keyExtractor={item => item.id}
          renderItem={({item}) => (
            <ItemCard
              item={item}
              currency={wishlist.currency}
              showActions
              onDelete={() => handleDeleteItem(item)}
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
        />
      )}

      {/* Add Item Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setModalVisible(false)}>
        <View style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => {setModalVisible(false); resetItemForm();}}>
              <Text style={styles.modalCancel}>Annuler</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Ajouter un article</Text>
            <View style={{width: 60}} />
          </View>

          <View style={styles.modalContent}>
            <Input
              label="URL du produit (optionnel)"
              placeholder="https://..."
              value={itemUrl}
              onChangeText={setItemUrl}
              autoCapitalize="none"
              keyboardType="url"
              onEndEditing={handleScrape}
            />
            {scraping && (
              <Text style={styles.scrapingText}>Récupération des infos...</Text>
            )}

            <Input
              label="Nom de l'article"
              placeholder="Ex: Casque Bluetooth"
              value={itemName}
              onChangeText={setItemName}
            />

            <Input
              label={`Prix (${wishlist.currency})`}
              placeholder="0.00"
              value={itemPrice}
              onChangeText={setItemPrice}
              keyboardType="decimal-pad"
            />

            <Input
              label="URL de l'image (optionnel)"
              placeholder="https://..."
              value={itemImage}
              onChangeText={setItemImage}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Button
              title="Ajouter l'article"
              onPress={handleAddItem}
              loading={addingItem}
              size="lg"
              style={styles.addButton}
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
    backgroundColor: colors.white,
    padding: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: spacing.md,
  },
  backButton: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: '500',
  },
  shareButton: {
    fontSize: fonts.sizes.md,
    color: colors.primary,
    fontWeight: '600',
  },
  title: {
    fontSize: fonts.sizes.xxl,
    fontWeight: '700',
    color: colors.gray900,
  },
  occasion: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    marginTop: spacing.xs,
  },
  date: {
    fontSize: fonts.sizes.sm,
    color: colors.gray400,
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
  headerActions: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginTop: spacing.lg,
  },
  itemsList: {
    padding: spacing.lg,
  },
  // Modal
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
  scrapingText: {
    fontSize: fonts.sizes.xs,
    color: colors.primary,
    marginTop: -spacing.md,
    marginBottom: spacing.md,
  },
  addButton: {
    marginTop: spacing.lg,
  },
});
