import React from 'react';
import {View, Text, Image, StyleSheet, TouchableOpacity, Linking} from 'react-native';
import {colors, radius, fonts, spacing, shadows} from '../theme';
import {ProgressBar} from './ProgressBar';
import {formatPrice, getProgressPercent} from '../utils/format';

type ItemCardProps = {
  item: {
    id: string;
    name: string;
    price: number;
    image_url: string | null;
    link: string | null;
    total_funded: number;
    contributor_count: number;
    status: string;
  };
  currency: string;
  onPress?: () => void;
  showActions?: boolean;
  onDelete?: () => void;
};

export function ItemCard({item, currency, onPress, showActions, onDelete}: ItemCardProps) {
  const percent = getProgressPercent(item.total_funded, item.price);
  const isFullyFunded = item.status === 'FULLY_FUNDED';

  return (
    <TouchableOpacity
      style={styles.card}
      onPress={onPress}
      activeOpacity={0.7}
      disabled={!onPress}>
      <View style={styles.imageContainer}>
        {item.image_url ? (
          <Image source={{uri: item.image_url}} style={styles.image} />
        ) : (
          <View style={styles.placeholder}>
            <Text style={styles.placeholderText}>🎁</Text>
          </View>
        )}
        {isFullyFunded && (
          <View style={styles.fundedBadge}>
            <Text style={styles.fundedBadgeText}>Financé !</Text>
          </View>
        )}
      </View>

      <View style={styles.info}>
        <Text style={styles.name} numberOfLines={2}>
          {item.name}
        </Text>

        <Text style={styles.price}>{formatPrice(item.price, currency)}</Text>

        <ProgressBar percent={percent} style={styles.progress} />

        <View style={styles.stats}>
          <Text style={styles.statText}>{percent}%</Text>
          <Text style={styles.statText}>
            {item.contributor_count} contributeur{item.contributor_count !== 1 ? 's' : ''}
          </Text>
        </View>

        {item.link && (
          <TouchableOpacity
            onPress={() => Linking.openURL(item.link!)}
            style={styles.linkButton}>
            <Text style={styles.linkText}>Voir le produit</Text>
          </TouchableOpacity>
        )}

        {showActions && onDelete && (
          <TouchableOpacity onPress={onDelete} style={styles.deleteButton}>
            <Text style={styles.deleteText}>Supprimer</Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    marginBottom: spacing.md,
    overflow: 'hidden',
    ...shadows.sm,
    borderWidth: 1,
    borderColor: colors.gray100,
  },
  imageContainer: {
    height: 160,
    backgroundColor: colors.gray50,
    position: 'relative',
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
    fontSize: 40,
  },
  fundedBadge: {
    position: 'absolute',
    top: spacing.sm,
    right: spacing.sm,
    backgroundColor: colors.success,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
    borderRadius: radius.sm,
  },
  fundedBadgeText: {
    color: colors.white,
    fontSize: fonts.sizes.xs,
    fontWeight: '700',
  },
  info: {
    padding: spacing.lg,
  },
  name: {
    fontSize: fonts.sizes.md,
    fontWeight: '600',
    color: colors.gray900,
    marginBottom: spacing.xs,
  },
  price: {
    fontSize: fonts.sizes.lg,
    fontWeight: '700',
    color: colors.primary,
    marginBottom: spacing.md,
  },
  progress: {
    marginBottom: spacing.sm,
  },
  stats: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statText: {
    fontSize: fonts.sizes.xs,
    color: colors.gray500,
  },
  linkButton: {
    marginTop: spacing.md,
  },
  linkText: {
    fontSize: fonts.sizes.sm,
    color: colors.primary,
    fontWeight: '500',
  },
  deleteButton: {
    marginTop: spacing.sm,
  },
  deleteText: {
    fontSize: fonts.sizes.sm,
    color: colors.error,
    fontWeight: '500',
  },
});
