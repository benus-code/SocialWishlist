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
import {useSafeAreaInsets} from 'react-native-safe-area-context';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {useTranslation} from 'react-i18next';
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
  const {t} = useTranslation('wishlistEditor');
  const {t: tCommon} = useTranslation('common');
  const insets = useSafeAreaInsets();
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

  const loadData = useCallback(async (silent = false) => {
    try {
      const [wl, itms] = await Promise.all([
        wishlistsApi.get(wishlistId),
        itemsApi.list(wishlistId),
      ]);
      setWishlist(wl);
      setItems(itms);
    } catch {
      if (!silent) {
        setToast({visible: true, message: tCommon('loadingError'), type: 'error'});
      }
    } finally {
      if (!silent) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [wishlistId, tCommon]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Poll every 3 seconds as fallback when WebSocket is disconnected
  useEffect(() => {
    const interval = setInterval(() => {
      loadData(true);
    }, 3000);
    return () => clearInterval(interval);
  }, [loadData]);

  const handleScrape = async () => {
    if (!itemUrl.trim()) return;
    setScraping(true);
    try {
      const result = await scrapeApi.scrapeUrl(itemUrl.trim());
      if (result.title && !itemName) setItemName(result.title);
      if (result.price && !itemPrice) setItemPrice((result.price / 100).toString());
      if (result.image && !itemImage) setItemImage(result.image);
      setToast({visible: true, message: t('infoRetrieved'), type: 'success'});
    } catch {
      // Scraping optional, ignore errors
    } finally {
      setScraping(false);
    }
  };

  const handleAddItem = async () => {
    if (!itemName.trim()) {
      setToast({visible: true, message: t('nameRequired'), type: 'error'});
      return;
    }
    if (!itemPrice || isNaN(Number(itemPrice)) || Number(itemPrice) <= 0) {
      setToast({visible: true, message: t('pricePositive'), type: 'error'});
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
      setToast({visible: true, message: t('itemAdded'), type: 'success'});
    } catch (err: any) {
      setToast({visible: true, message: err.message || tCommon('error'), type: 'error'});
    } finally {
      setAddingItem(false);
    }
  };

  const handleDeleteItem = (item: Item) => {
    Alert.alert(
      t('deleteItemTitle'),
      t('deleteItemMessage', {name: item.name}),
      [
        {text: tCommon('cancel'), style: 'cancel'},
        {
          text: tCommon('delete'),
          style: 'destructive',
          onPress: async () => {
            try {
              await itemsApi.delete(wishlistId, item.id);
              setItems(prev => prev.filter(i => i.id !== item.id));
              setToast({visible: true, message: t('itemDeleted'), type: 'success'});
            } catch {
              setToast({visible: true, message: t('deleteItemError'), type: 'error'});
            }
          },
        },
      ],
    );
  };

  const handleShare = async () => {
    if (!wishlist) return;
    const shareUrl = `https://socialwishlist-frontend.onrender.com/list/${wishlist.slug}`;
    try {
      await Share.share({
        message: t('shareMessage', {title: wishlist.title, url: shareUrl}),
        url: shareUrl,
      });
    } catch {
      Clipboard.setString(shareUrl);
      setToast({visible: true, message: t('linkCopied'), type: 'success'});
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
        message: updated.is_archived ? t('listArchived') : t('listRestored'),
        type: 'success',
      });
    } catch {
      setToast({visible: true, message: tCommon('error'), type: 'error'});
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
    <View style={[styles.container, {paddingTop: insets.top}]}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.headerTop}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.headerButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.backButton}>{t('back')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={handleShare}
            style={styles.headerButton}
            hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
            <Text style={styles.shareButton}>{t('share')}</Text>
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
            title={wishlist.is_archived ? t('restore') : t('archive')}
            onPress={handleToggleArchive}
            variant="secondary"
            size="sm"
          />
          <Button
            title={t('addItem')}
            onPress={() => setModalVisible(true)}
            size="sm"
          />
        </View>
      </View>

      {/* Items */}
      {items.length === 0 ? (
        <EmptyState
          icon="🎁"
          title={t('emptyTitle')}
          description={t('emptyDescription')}
          actionLabel={t('emptyAction')}
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
              <Text style={styles.modalCancel}>{t('modal.cancel')}</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{t('modal.title')}</Text>
            <View style={{width: 60}} />
          </View>

          <View style={styles.modalContent}>
            <Input
              label={t('modal.productUrl')}
              placeholder={t('modal.urlPlaceholder')}
              value={itemUrl}
              onChangeText={setItemUrl}
              autoCapitalize="none"
              keyboardType="url"
              onEndEditing={handleScrape}
            />
            {scraping && (
              <Text style={styles.scrapingText}>{t('modal.scraping')}</Text>
            )}

            <Input
              label={t('modal.itemName')}
              placeholder={t('modal.itemNamePlaceholder')}
              value={itemName}
              onChangeText={setItemName}
            />

            <Input
              label={t('modal.price', {currency: wishlist.currency})}
              placeholder={t('modal.pricePlaceholder')}
              value={itemPrice}
              onChangeText={setItemPrice}
              keyboardType="decimal-pad"
            />

            <Input
              label={t('modal.imageUrl')}
              placeholder={t('modal.urlPlaceholder')}
              value={itemImage}
              onChangeText={setItemImage}
              autoCapitalize="none"
              keyboardType="url"
            />

            <Button
              title={t('modal.addItem')}
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
        onDismiss={() => setToast(prev => ({...prev, visible: false}))}
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
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing.md,
  },
  headerButton: {
    paddingVertical: spacing.xs,
    paddingHorizontal: spacing.sm,
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
