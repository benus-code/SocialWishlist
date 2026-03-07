import React, {useState, useEffect} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {useTranslation} from 'react-i18next';
import {colors, fonts, spacing, radius, shadows} from '../theme';

const TOUR_KEY = 'wishly_onboarding_done';
const {width} = Dimensions.get('window');

const STEP_ICONS = ['🎁', '➕', '🔗', '📤', '💰', '✅'];

interface OnboardingTourProps {
  onComplete?: () => void;
}

export function OnboardingTour({onComplete}: OnboardingTourProps) {
  const {t} = useTranslation('onboarding');
  const [visible, setVisible] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    AsyncStorage.getItem(TOUR_KEY).then(val => {
      if (!val) setVisible(true);
    });
  }, []);

  const finish = () => {
    AsyncStorage.setItem(TOUR_KEY, '1');
    setVisible(false);
    onComplete?.();
  };

  const next = () => {
    if (step < 5) {
      setStep(step + 1);
    } else {
      finish();
    }
  };

  const prev = () => {
    if (step > 0) setStep(step - 1);
  };

  if (!visible) return null;

  const isLast = step === 5;
  const isFirst = step === 0;

  return (
    <Modal transparent animationType="fade" visible={visible}>
      <View style={styles.overlay}>
        <View style={styles.card}>
          {/* Top accent bar */}
          <View style={styles.accentBar} />

          {/* Skip */}
          {!isLast && (
            <TouchableOpacity style={styles.skipButton} onPress={finish}>
              <Text style={styles.skipText}>{t('skip')}</Text>
            </TouchableOpacity>
          )}

          {/* Content */}
          <View style={styles.content}>
            <View style={styles.iconContainer}>
              <Text style={styles.icon}>{STEP_ICONS[step]}</Text>
            </View>
            <Text style={styles.title}>{t(`steps.${step}.title`)}</Text>
            <Text style={styles.description}>{t(`steps.${step}.description`)}</Text>
          </View>

          {/* Progress dots */}
          <View style={styles.dots}>
            {STEP_ICONS.map((_, i) => (
              <TouchableOpacity
                key={i}
                onPress={() => setStep(i)}
                style={[styles.dot, i === step && styles.dotActive]}
              />
            ))}
          </View>

          {/* Actions */}
          <View style={styles.actions}>
            {isFirst ? (
              <View style={{width: 60}} />
            ) : (
              <TouchableOpacity onPress={prev} style={styles.backButton}>
                <Text style={styles.backText}>{t('back')}</Text>
              </TouchableOpacity>
            )}
            <TouchableOpacity
              onPress={next}
              style={[styles.nextButton, isLast && styles.nextButtonLast]}>
              <Text style={styles.nextText}>
                {isLast ? t('getStarted') : t('next')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: colors.overlay,
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.xl,
  },
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.xl,
    width: width - spacing.xl * 2,
    maxWidth: 400,
    overflow: 'hidden',
    ...shadows.lg,
  },
  accentBar: {
    height: 4,
    backgroundColor: colors.primary,
  },
  skipButton: {
    position: 'absolute',
    top: spacing.lg,
    right: spacing.lg,
    zIndex: 1,
  },
  skipText: {
    fontSize: fonts.sizes.xs,
    color: colors.gray400,
    fontWeight: '500',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingTop: spacing.xxxl,
    paddingBottom: spacing.lg,
  },
  iconContainer: {
    width: 64,
    height: 64,
    borderRadius: radius.lg,
    backgroundColor: colors.primaryBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing.lg,
  },
  icon: {
    fontSize: 32,
  },
  title: {
    fontSize: fonts.sizes.xl,
    fontWeight: '700',
    color: colors.gray900,
    textAlign: 'center',
    marginBottom: spacing.sm,
  },
  description: {
    fontSize: fonts.sizes.sm,
    color: colors.gray500,
    textAlign: 'center',
    lineHeight: 22,
    maxWidth: 300,
  },
  dots: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: 6,
    paddingBottom: spacing.lg,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.gray200,
  },
  dotActive: {
    width: 24,
    backgroundColor: colors.primary,
  },
  actions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.xxl,
    paddingBottom: spacing.xxl,
  },
  backButton: {
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
  },
  backText: {
    fontSize: fonts.sizes.sm,
    color: colors.gray400,
    fontWeight: '500',
  },
  nextButton: {
    backgroundColor: colors.primary,
    paddingVertical: spacing.md,
    paddingHorizontal: spacing.xxl,
    borderRadius: radius.md,
  },
  nextButtonLast: {
    backgroundColor: colors.primaryDark,
  },
  nextText: {
    color: colors.white,
    fontSize: fonts.sizes.sm,
    fontWeight: '600',
  },
});
