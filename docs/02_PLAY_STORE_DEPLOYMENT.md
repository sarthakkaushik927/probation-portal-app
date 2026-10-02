# 02. Google Play Store Deployment (.aab)

This document covers everything required to successfully build and deploy an Android App Bundle (`.aab`) to the Google Play Store.

## Step 1: Version Bumping (CRITICAL)
Google Play Store will **REJECT** your upload if the `versionCode` is the same or lower than the previous upload. 

1. Open `app.json` (in `probation-portal`):
   - Increase `version` (e.g. `"1.5.0"` -> `"1.5.1"`) - *This is what the user sees.*
   - Increase `android.versionCode` (e.g. `8` -> `9`) - *This is the internal Play Store ID.*

2. Open `android/app/build.gradle`:
   - Match `versionName` to `"1.5.1"`
   - Match `versionCode` to `9`

## Step 2: Keystore & Signing
For production, you MUST use a Release Keystore, not the debug keystore.
If you don't have one, EAS can generate it automatically during the build, or you can create one manually:
```powershell
keytool -genkey -v -keystore release.keystore -alias probation-portal -keyalg RSA -keysize 2048 -validity 10000
```
Keep this `.keystore` file safe. If you lose it, you cannot update the app on Play Store.

## Step 3: Run the Cloud Build (EAS)
Ensure you are logged in to EAS (`eas login`).
Run the production build:
```powershell
eas build --platform android --profile production
```
This will:
- Check `eas.json` for the `production` profile settings.
- Inject your `.env` variables securely.
- Generate a signed `.aab` file.

EAS will provide a dashboard link. Download the `.aab` file once it completes.

## Step 4: ProGuard & R8 Obfuscation
The Play Console requires code to be obfuscated/minified to prevent reverse engineering and reduce app size. This is already configured!
- In `android/app/build.gradle`, `minifyEnabled true` and `shrinkResources true` are active.
- `android/app/proguard-rules.pro` contains exceptions so React Native and Firebase don't crash when minified.

*(Note: Play Console might say "1% obfuscated". This is normal for React Native apps because the JS bundle is handled separately from the Java code.)*

## Step 5: Uploading to Play Console
1. Go to [Google Play Console](https://play.google.com/console).
2. Select **CCC_Probation**.
3. Go to **Testing -> Internal Testing** (for tests) OR **Production -> Releases**.
4. Click **Create new release**.
5. Upload the `.aab` file downloaded from EAS.
6. Enter Release Notes.
7. Click Next -> Save -> Send for Review.

## Common Play Console Warnings & Errors
* **"Deprecated Edge-to-Edge APIs"**: This is a warning (not a rejection). It comes from internal libraries like `react-native-screens` and `expo-image-picker`. You cannot fix this manually; it will be resolved automatically when you update Expo SDK versions in the future.
* **"Version Code Already Used"**: You forgot Step 1. Bump the `versionCode` in both `app.json` and `build.gradle`.
* **"Unsupported class file major version 69"**: This is an IDE warning, NOT a build error. Ignore it.
