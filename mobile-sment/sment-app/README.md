# Sment App

Sment App is the mobile client of Sment, developed with React Native, Expo, Expo Router, and TypeScript. The app configuration includes image picker and location permissions for waste-photo capture and location features.

## Requirements

- Node.js (LTS recommended) and npm
- Android Studio with Android SDK for Android emulator/local native builds, or a physical Android device
- Expo tooling (used through `npx`)
- A configured Convex backend
- ML API endpoint accessible from the device for image classification

For iOS native builds, a macOS environment with Xcode is required. See the [Expo environment setup guide](https://docs.expo.dev/get-started/set-up-your-environment/).

## Installation

From the repository root:

```bash
cd mobile-sment/sment-app
npm install
```

## Environment Configuration

Configure the client URLs according to the variable names read in the app's source code. The EAS preview profile currently declares `EXPO_PUBLIC_CONVEX_URL` and `EXPO_PUBLIC_ML_API_URL`.

Create a local `.env` file:

```env
EXPO_PUBLIC_CONVEX_URL=https://<your-deployment>.convex.cloud
EXPO_PUBLIC_ML_API_URL=https://<your-ml-api-host>
```

Replace the placeholders with your own service endpoints. For local testing on a physical phone, use your computer's LAN IP or a secure tunnel for the ML API; `localhost` refers to the phone itself. Do not store secret keys in `EXPO_PUBLIC_*` variables because they are bundled into the client.

## Start the Development Server

```bash
npx expo start
``

Then select the appropriate target:

- Press `a` to open Android (with a configured emulator).
- Scan the QR code using a compatible Expo development client.
- Press `w` to run the web target if supported by the app.

## Android Local Development Build

With Android Studio and SDK configured:

```bash
npm run android
``

This runs Expo's Android native build command. A device/emulator should be connected and ready.

## Lint

```bash
npm run lint
``

## Build an APK with EAS

The repository includes an EAS configuration with a `preview` profile set for internal distribution and Android APK output.

1. Sign in to Expo:

   ```bash
   npx eas login
   ```

2. Install/use EAS CLI:

   ```bash
   npm install --global eas-cli
   ```

3. Start the preview APK build:

   ```bash
   eas build --platform android --profile preview
   ```

4. When the build completes, download the APK from the build page and install it on a compatible Android device.

Review `eas.json` and configure its environment values with the correct backend/API URLs before creating the build.

## Permissions

The Expo app configuration requests permissions for:

- Camera/image picker (capturing waste images)
- Location access (location-related app functionality)

Users must grant these permissions when prompted for the corresponding features.

## Tech Stack

- React Native
- Expo SDK 58
- Expo Router
- TypeScript
- Convex / Convex Auth
- Expo Image Picker
- Expo Location
- Expo Secure Store

## Related Documentation

- [Main Sment repository](../../README.md)
- [Sment Web](../../web-sment/sment-web/README.md)
- [Convex backend](../../convex/)
- [Machine Learning API](../../ml/README.md)
- [Expo documentation](https://docs.expo.dev/)
