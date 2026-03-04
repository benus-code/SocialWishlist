# Wishly iOS — React Native CLI

## Overview
Rebuild the Wishly web app as a native iOS application using **React Native CLI** (no Expo).
The app connects to the **existing FastAPI backend** already deployed on Render.

---

## Tech Stack
- **React Native CLI** (not Expo)
- **TypeScript**
- **React Navigation 6** — Stack + Bottom Tabs
- **AsyncStorage** — persisted key-value storage
- **Socket.IO Client** — real-time updates
- **React Native Share** — native iOS share sheet
- **React Native Keychain** — secure JWT storage (optional, AsyncStorage fallback)

---

## Project Structure
```
WishlyApp/
├── src/
│   ├── api/
│   │   ├── client.ts              # Axios/fetch wrapper with auth headers
│   │   ├── auth.ts                # Auth API calls
│   │   ├── wishlists.ts           # Wishlist API calls
│   │   ├── items.ts               # Item API calls
│   │   ├── contributions.ts       # Contribution API calls
│   │   └── scrape.ts              # URL scraping API call
│   ├── contexts/
│   │   └── AuthContext.tsx         # Auth state + token management
│   ├── hooks/
│   │   ├── useSocket.ts           # Socket.IO connection hook
│   │   └── useApi.ts              # Generic fetch hook with loading/error
│   ├── navigation/
│   │   ├── RootNavigator.tsx      # Auth check → AuthStack or MainTabs
│   │   ├── AuthStack.tsx          # Login, Register, ForgotPassword, ResetPassword
│   │   └── MainTabs.tsx           # Dashboard, Contributions, Profile tabs
│   ├── screens/
│   │   ├── auth/
│   │   │   ├── LoginScreen.tsx
│   │   │   ├── RegisterScreen.tsx
│   │   │   ├── ForgotPasswordScreen.tsx
│   │   │   └── ResetPasswordScreen.tsx
│   │   ├── dashboard/
│   │   │   ├── DashboardScreen.tsx       # Wishlists list
│   │   │   └── WishlistEditorScreen.tsx  # Edit wishlist + items
│   │   ├── public/
│   │   │   └── PublicWishlistScreen.tsx   # Shared view + contribute
│   │   ├── ContributionsScreen.tsx       # My contributions history
│   │   └── ProfileScreen.tsx             # User profile
│   ├── components/
│   │   ├── Button.tsx              # Reusable button
│   │   ├── Input.tsx               # Styled text input
│   │   ├── Toast.tsx               # Toast notification
│   │   ├── EmptyState.tsx          # Empty state illustration
│   │   ├── ProgressBar.tsx         # Funding progress bar
│   │   ├── ItemCard.tsx            # Item display card
│   │   ├── ConfirmDialog.tsx       # Confirmation alert
│   │   └── LoadingScreen.tsx       # Full-screen spinner
│   ├── theme/
│   │   └── index.ts                # Colors, fonts, spacing constants
│   └── utils/
│       ├── format.ts               # Price formatting, dates
│       └── storage.ts              # AsyncStorage helpers
├── App.tsx                         # Entry point
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
```

---

## Screens & Features

### Phase 1 — Foundation
- [x] Project initialization (React Native CLI + TypeScript)
- [x] Theme constants (colors, typography, spacing)
- [x] API client with auth interceptor
- [x] AsyncStorage helpers for token management
- [x] AuthContext provider
- [x] Navigation structure (RootNavigator, AuthStack, MainTabs)

### Phase 2 — Authentication
- [x] Login screen (email/password)
- [x] Register screen (name, email, password)
- [x] Forgot password screen
- [x] Reset password screen
- [x] Google Sign-In integration (react-native-google-signin)
- [x] Auto-redirect based on auth state

### Phase 3 — Dashboard & Wishlists
- [x] Dashboard screen — list of user's wishlists
- [x] Create wishlist modal (title, occasion, event_date, currency)
- [x] Wishlist editor screen
- [x] Add item modal (name, price, URL, image)
- [x] URL auto-fill (paste → scrape API)
- [x] Item list with progress bars
- [x] Delete item with confirmation
- [x] Archive/restore wishlist

### Phase 4 — Public Wishlist & Contributions
- [x] Public wishlist screen (shared view)
- [x] Reserve item flow
- [x] Chip in / contribute flow
- [x] Edit contribution
- [x] Withdraw contribution
- [x] Contribution history screen (My Contributions tab)

### Phase 5 — Real-time & Polish
- [x] Socket.IO integration (join/leave rooms, item_updated events)
- [x] Profile screen (display name, avatar, member since)
- [x] Native share sheet (Share Link, WhatsApp, Telegram, Email)
- [x] Deep linking for shared wishlist URLs
- [x] Toast notifications
- [x] Loading states & skeleton placeholders
- [x] Empty states

---

## API Endpoints Reference

### Auth (`/api/auth`)
| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | /register             | Create account                 |
| POST   | /login                | Login (email/password)         |
| POST   | /google               | Google OAuth                   |
| GET    | /google/client-id     | Get Google Client ID           |
| POST   | /logout               | Logout                         |
| POST   | /forgot-password      | Request reset email            |
| POST   | /reset-password       | Reset password with token      |
| GET    | /me                   | Get current user               |
| PUT    | /me                   | Update profile                 |
| GET    | /me/contributions     | List user contributions        |

### Wishlists (`/api/wishlists`)
| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | /                     | Create wishlist                |
| GET    | /                     | List user's wishlists          |
| GET    | /{id}                 | Get wishlist (owner)           |
| PUT    | /{id}                 | Update wishlist                |
| DELETE | /{id}                 | Delete wishlist                |
| GET    | /public/{slug}        | Get public wishlist            |

### Items (`/api/wishlists/{wishlist_id}/items`)
| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | /                     | Create item                    |
| GET    | /                     | List items                     |
| PUT    | /{item_id}            | Update item                    |
| GET    | /{item_id}/deletion-info | Get deletion warning        |
| DELETE | /{item_id}            | Delete item                    |

### Contributions (`/api/items/{item_id}/contributions`)
| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | /                     | Contribute                     |
| POST   | /reserve              | Reserve item                   |
| PUT    | /                     | Update/withdraw contribution   |
| GET    | /mine                 | Get my contribution            |

### Scrape (`/api/scrape`)
| Method | Endpoint              | Description                    |
|--------|-----------------------|--------------------------------|
| POST   | /                     | Scrape URL for metadata        |

---

## Environment Variables
```
API_BASE_URL=https://your-backend.onrender.com
GOOGLE_IOS_CLIENT_ID=your-google-ios-client-id
```

---

## iOS-Specific Considerations
- Use iOS native date picker (`@react-native-community/datetimepicker`)
- Use `ActionSheetIOS` or custom bottom sheet for actions
- Use `Alert.alert()` for confirmations
- Use `Linking` API for deep links and opening product URLs
- Use `SafeAreaView` for iPhone notch/dynamic island
- Use `KeyboardAvoidingView` for forms
- Support both light mode (primary target)
- Min iOS version: 15.0
