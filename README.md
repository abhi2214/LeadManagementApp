# Lead Management — CRM Mobile App (Machine Test)

React Native (bare CLI) + TypeScript. Redux Toolkit for state, a fully
in-memory mock API for auth/leads, AsyncStorage for session persistence.

## Setup

This repo ships the `src/`, config files (`package.json`, `babel.config.js`,
`metro.config.js`, `index.js`, `app.json`, `tsconfig.json`) and `App.tsx` —
but **not** the native `android/` and `ios/` folders, since those are
generated binaries specific to your machine/RN version. Generate them once,
then drop this `src/` in:

```bash
# 1. Scaffold a fresh bare RN TypeScript project (creates android/ + ios/)
npx @react-native-community/cli init LeadManagementApp --version 0.74.5

# 2. Copy this project's src/, App.tsx, index.js, package.json,
#    babel.config.js, metro.config.js, tsconfig.json, app.json into it,
#    overwriting the generated ones (keep the generated android/ and ios/)

cd LeadManagementApp
npm install

# iOS only — install native pods
cd ios && pod install && cd ..

# 3. Run
npx react-native start          # Metro bundler, separate terminal
npx react-native run-android    # or: npx react-native run-ios
```

To produce a release APK for submission:

```bash
cd android
./gradlew assembleRelease
# output: android/app/build/outputs/apk/release/app-release.apk
```

**Demo login:** `sales@example.com` / `password123` (see `src/services/mockServer.ts`)

**Prerequisite:** a working RN CLI environment (Android Studio + SDK, or
Xcode for iOS) — see the official [Environment Setup guide](https://reactnative.dev/docs/set-up-your-environment)
if `npx react-native run-android` fails on a fresh machine.

## Architecture

```
src/
├── components/     Reusable presentational pieces (StatusBadge, LeadListItem,
│                   FormInput/AppButton, Loading/Empty/Error views)
├── screens/        Login, Dashboard, LeadDetails, AddEditLead
├── navigation/      RootNavigator (auth-gated) → AuthNavigator / MainNavigator
├── services/       api layer — authService/leadService are thin wrappers around
│                   mockServer.ts, which is the ONLY file that touches fake data.
│                   Swap mockServer.ts for real fetch() calls later without
│                   touching screens or Redux.
├── store/          Redux Toolkit: authSlice (session), leadsSlice (list state,
│                   search/filter/pagination, CRUD thunks)
├── hooks/          useDebounce
├── utils/          validation.ts, storage.ts (AsyncStorage helpers)
├── types/          Shared TS types + navigation param lists
└── constants/       colors, spacing, statuses, page size
```

**Why this split:** the task explicitly asks to keep API logic separate from
UI and use a maintainable structure — `mockServer.ts` simulates the backend
(latency + optional random failures), `authService`/`leadService` are the
"API client", and slices/screens never call the mock functions directly.

## What's already wired up

- Login → session persisted to AsyncStorage → app reopens straight to
  Dashboard (`hydrateSession` thunk runs on boot in `RootNavigator`)
- Dashboard: search (debounced), status filter chips, pull-to-refresh,
  "load more" pagination, loading/empty/error states
- Lead Details: call/WhatsApp/email deep links, inline status changer, notes
- Add/Edit Lead: single form + validation used for both create and edit
- Redux slices cover auth + leads + loading/error + search/filter state

## What's left for you (roughly in priority order for a 3–4h test)

1. **Run it once** — `npx expo start`, log in, click through all 4 screens.
   Fix any RN-version/package mismatches Expo complains about on first boot.
2. **Polish the status picker** on Lead Details — currently a plain chip
   list (marked `TODO`); a small modal/bottom-sheet would look sharper.
3. **FlatList perf pass** — `initialNumToRender`/`windowSize` are already
   set as a starting point; profile and adjust, and consider `React.memo`
   on `LeadListItem` (also marked `TODO`).
4. **Decide on `LeadDetailsScreen`'s data source** — right now it reads the
   lead from the already-fetched `items` array in Redux, and re-triggers a
   list fetch if the lead isn't found yet (e.g. deep link/cold start). Add
   a dedicated `fetchLeadById` thunk if you want it to work fully standalone.
5. **Optional enhancements** (pick 2–3 to stand out): dark mode, offline
   caching of the leads list, React Hook Form on `AddEditLeadScreen`, unit
   tests for `utils/validation.ts` and `leadsSlice.ts` reducers.
6. **Empty/error copy pass** — the state components are generic; add
   context-specific messages if you have time.

## Assumptions

- No real backend — `mockServer.ts` holds 37 seeded leads in memory and
  resets on app restart (persistence is for the *session*, not the lead
  data — call this out in your submission notes, or wire AsyncStorage
  caching for leads too as an enhancement).
- Single hardcoded demo user, no registration flow (not in spec).
- WhatsApp deep link requires WhatsApp installed on the test device/emulator.

## Libraries used

`@reduxjs/toolkit`, `react-redux`, `@react-navigation/native` +
`native-stack`, `@react-native-async-storage/async-storage`,
`react-native-safe-area-context`, `react-native-screens`, React Native CLI
0.74.5 (no Expo).
