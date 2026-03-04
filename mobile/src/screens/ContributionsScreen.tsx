import React, {useState, useCallback} from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Image,
  RefreshControl,
} from 'react-native';
import {useFocusEffect} from '@react-navigation/native';
import {NativeStackScreenProps} from '@react-navigation/native-stack';
import {authApi} from '../api/auth';
import {EmptyState} from '../components/EmptyState';
import {LoadingScreen} from '../components/LoadingScreen';
import {colors, fonts, spacing, radius, shadows} from '../theme';
import {formatPrice, formatRelativeDate} from '../utils/format';

type ContributionItem = {
  id: string;
  amount: number;
  created_at: string;
  item_name: string;
  item_price: number;
  item_image_url: string | null;
  wishlist_title: string;
  wishlist_slug: string;
  currency: string;
};

type Props = NativeStackScreenProps<any>;

export function ContributionsScreen({navigation}: Props) {
  const [contributions, setContributions] = useState<ContributionItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const loadContributions = useCallback(async () => {
    try {
      const data = await authApi.getMyContributions();
      setContributions(data);
    } catch {
      // ignore
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadContributions();
    }, [loadContributions]),
  );

  if (loading) return <LoadingScreen />;

  const totalAmount = contributions.reduce((sum, c) => sum + c.amount, 0);

  const renderItem = ({item}: {item: ContributionItem}) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() =>
        navigation.navigate('PublicWishlist', {slug: item.wishlist_slug})
      }
      activeOpacity={0.7}>
      <View style={styles.imageContainer}>
        {item.item_image_url ? (
          <Image source={{uri: item.item_image_url}} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🎁</Text>
          </View>
        )}
      </View>
      <View style={styles.info}>
        <Text style={styles.itemName} numberOfLines={1}>
          {item.item_name}
        </Text>
        <Text style={styles.wishlistTitle} numberOfLines={1}>
          {item.wishlist_title}
        </Text>
        <Text style={styles.date}>{formatRelativeDate(item.created_at)}</Text>
      </View>
      <View style={styles.amountSection}>
        <Text style={styles.amount}>
          {formatPrice(item.amount, item.currency)}
        </Text>
        <Text style={styles.itemPrice}>
          / {formatPrice(item.item_price, item.currency)}
        </Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          Mes contributions ({contributions.length})
        </Text>
        {totalAmount > 0 && (
          <Text style={styles.totalAmount}>
            Total : {formatPrice(totalAmount, 'EUR')}
          </Text>
        )}
      </View>

      {contributions.length === 0 ? (
        <EmptyState
          icon="💝"
          title="Aucune contribution"
          description="Vous n'avez pas encore contribué à un cadeau. Parcourez les listes de vos proches !"
        />
      ) : (
        <FlatList
          data={contributions}
          keyExtractor={item => item.id}
          renderItem={renderItem}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={() => {
                setRefreshing(true);
                loadContributions();
              }}
              tintColor={colors.primary}
            />
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.gray50,
  },
  header: {
    padding: spacing.lg,
    paddingTop: spacing.sm,
    backgroundColor: colors.white,
    borderBottomWidth: 1,
    borderBottomColor: colors.gray100,
  },
  headerTitle: {
    fontSize: fonts.sizes.xl,
    fontWeight: '700',
    color: colors.gray900,
  },
  totalAmount: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    fontWeight: '600',
    marginTop: spacing.xs,
  },
  list: {
    padding: spacing.lg,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    padding: spacing.md,
    marginBottom: spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  imageContainer: {
    width: 48,
    height: 48,
    borderRadius: radius.sm,
    overflow: 'hidden',
    backgroundColor: colors.gray50,
    marginRight: spacing.md,
  },
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeholderText: {
    fontSize: 20,
  },
  info: {
    flex: 1,
    marginRight: spacing.md,
  },
  itemName: {
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
    color: colors.gray900,
  },
  wishlistTitle: {
    fontSize: fonts.sizes.xs,
    color: colors.gray500,
    marginTop: 2,
  },
  date: {
    fontSize: fonts.sizes.xs,
    color: colors.gray400,
    marginTop: 2,
  },
  amountSection: {
    alignItems: 'flex-end',
  },
  amount: {
    fontSize: fonts.sizes.sm,
    fontWeight: '700',
    color: colors.primary,
  },
  itemPrice: {
    fontSize: fonts.sizes.xs,
    color: colors.gray400,
  },
});
