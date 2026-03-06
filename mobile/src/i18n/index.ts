import 'intl-pluralrules';
import i18n from 'i18next';
import {initReactI18next} from 'react-i18next';

import enCommon from './locales/en/common.json';
import enAuth from './locales/en/auth.json';
import enDashboard from './locales/en/dashboard.json';
import enWishlistEditor from './locales/en/wishlistEditor.json';
import enContributions from './locales/en/contributions.json';
import enProfile from './locales/en/profile.json';
import enPublicWishlist from './locales/en/publicWishlist.json';
import enComponents from './locales/en/components.json';
import enNavigation from './locales/en/navigation.json';

import ruCommon from './locales/ru/common.json';
import ruAuth from './locales/ru/auth.json';
import ruDashboard from './locales/ru/dashboard.json';
import ruWishlistEditor from './locales/ru/wishlistEditor.json';
import ruContributions from './locales/ru/contributions.json';
import ruProfile from './locales/ru/profile.json';
import ruPublicWishlist from './locales/ru/publicWishlist.json';
import ruComponents from './locales/ru/components.json';
import ruNavigation from './locales/ru/navigation.json';

const ns = [
  'common',
  'auth',
  'dashboard',
  'wishlistEditor',
  'contributions',
  'profile',
  'publicWishlist',
  'components',
  'navigation',
] as const;

i18n.use(initReactI18next).init({
  lng: 'en',
  fallbackLng: 'en',
  ns,
  defaultNS: 'common',
  resources: {
    en: {
      common: enCommon,
      auth: enAuth,
      dashboard: enDashboard,
      wishlistEditor: enWishlistEditor,
      contributions: enContributions,
      profile: enProfile,
      publicWishlist: enPublicWishlist,
      components: enComponents,
      navigation: enNavigation,
    },
    ru: {
      common: ruCommon,
      auth: ruAuth,
      dashboard: ruDashboard,
      wishlistEditor: ruWishlistEditor,
      contributions: ruContributions,
      profile: ruProfile,
      publicWishlist: ruPublicWishlist,
      components: ruComponents,
      navigation: ruNavigation,
    },
  },
  interpolation: {
    escapeValue: false,
  },
});

export default i18n;
