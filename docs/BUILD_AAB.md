# Building .AAB for Google Play Store

## Prerequisites

1. **Expo CLI** and **EAS CLI** installed:
   ```bash
   npm install -g eas-cli
   ```

2. **Logged into Expo**:
   ```bash
   eas login
   # Account: sarthakkaushik927
   ```

3. **EAS Project ID**: `e8a6c504-9a3d-488e-a866-b8ae2d2bc708`

---

## Step-by-Step: Build .AAB

### 1. Bump Version (if not already done)

In `app.json`:
```json
{
  "expo": {
    "version": "1.5.0",        // ← semantic version for Play Store
    "android": {
      "versionCode": 8          // ← MUST increment for each Play Store upload
    }
  }
}
```

Also update `android/app/build.gradle` to match:
```gradle
defaultConfig {
    versionCode 8
    versionName "1.5.0"
}
```

> ⚠️ **CRITICAL**: `versionCode` MUST be higher than the previous upload or Play Store will reject it.

### 2. Run EAS Build

```bash
eas build --platform android --profile production
```

This will:
- Build in the cloud using EAS Build
- Use the `production` profile from `eas.json`
- Produce a signed `.aab` file

### 3. Build Configuration

The `eas.json` production profile:
```json
{
  "production": {
    "android": {},
    "env": {
      "EXPO_PUBLIC_API_URL": "https://probation-portal-backend.vercel.app/api",
      "EXPO_PUBLIC_USE_PUSHER": "true",
      "EXPO_PUBLIC_PUSHER_KEY": "05b36ebd8cbd750f01b6",
      "EXPO_PUBLIC_PUSHER_CLUSTER": "ap2"
    },
    "channel": "production"
  }
}
```

### 4. Download the .AAB

After the build completes:
```bash
# EAS will provide a download link in terminal output
# Or go to: https://expo.dev/accounts/sarthakkaushik927/projects/probation-portal/builds
```

### 5. Upload to Play Console

1. Go to [Google Play Console](https://play.google.com/console)
2. Select **CCC_Probation** app
3. Go to **Production** → **Create new release**
4. Upload the `.aab` file
5. Add release notes
6. Review and roll out

---

## R8 / ProGuard (Obfuscation)

This build has R8 enabled with:
- `minifyEnabled true` — enables code shrinking and obfuscation
- `shrinkResources true` — removes unused resources
- `proguard-android-optimize.txt` — uses the optimized default rules
- Custom `proguard-rules.pro` — keeps React Native, Expo, Firebase, etc.

This fixes the Play Console warning about **1% obfuscation**.

---

## EAS Keystore & Push Notification Credentials (FCM V1)

We are now using EAS remote credentials to securely manage both the Keystore and Firebase Push Notifications.

### To Manage Credentials on Expo Servers:
1. Run `npx eas-cli credentials` in your terminal.
2. Select **Android** → **production** profile.

#### 1. Push Notifications (FCM V1)
- In the menu, select **Google Service Account**.
- You MUST provide a **Service Account JSON Private Key** (downloaded from Firebase Console → Project Settings → Service Accounts → Generate new private key).
- *Note: Do NOT upload `google-services.json` here, as that is only the client configuration.*

#### 2. Keystore (App Signing)
- In the menu, select **Keystore**.
- Expo will use the `release.keystore` file to sign the app.
- **Passwords:** `probation123`
- **Key Alias:** `release-alias`
- *Never change the Keystore once the app is on Google Play!*

---

## Local Builds (Windows)

If you want to build locally on your Windows PC instead of using Expo's cloud queue, you can use Gradle directly (since EAS local builds require macOS/Linux).

### Building a Local APK
To build an APK you can install directly on a device:
```bash
npx expo run:android --variant release
```
*The output will be in: `android/app/build/outputs/apk/release/`*

### Building a Local AAB (For Google Play)
To build an App Bundle locally on Windows:
```bash
cd android
.\gradlew bundleRelease
```
*The output will be in: `android/app/build/outputs/bundle/release/`*

### Critical Gradle Configurations for Local Builds

If you are building locally, the Android project (`android/` folder) MUST be configured properly or the build will fail or be unsigned. 

**1. Enable New Architecture & Bump Memory (`android/gradle.properties`)**
Because we are using React Native Reanimated & Worklets, we MUST force the new architecture to be enabled locally. Also, compiling these heavy C++ libraries causes the Android NDK (`clang++`) to run out of RAM and crash on Windows, so we must increase Gradle's JVM memory to `8GB`!

Change/ensure these lines:
```properties
org.gradle.jvmargs=-Xmx8192m -XX:MaxMetaspaceSize=1024m
newArchEnabled=true
```

**2. Attach the Release Keystore (`android/app/build.gradle`)**
By default, local release builds sign with a debug key. To ensure your local `.aab` is correctly signed for Google Play, we manually modified the `signingConfigs` and `buildTypes` blocks:

```gradle
    signingConfigs {
        debug { ... }
        
        // ADDED THIS BLOCK
        release {
            storeFile file('../../release.keystore')
            storePassword 'probation123'
            keyAlias 'release-alias'
            keyPassword 'probation123'
        }
    }
    buildTypes {
        debug { ... }
        release {
            // CHANGED signingConfigs.debug to signingConfigs.release
            signingConfig signingConfigs.release
            shrinkResources true
            minifyEnabled true
            // ...
        }
    }
```
If you ever run `npx expo prebuild --clean`, Expo will overwrite `build.gradle` and you will need to re-add that `release {}` block to sign your local AAB builds!

---

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `versionCode already used` | Increment `versionCode` in both `app.json` and `build.gradle` |
| `Obfuscation too low` | Ensure `minifyEnabled true` and `shrinkResources true` in release build |
| `Deprecated edge-to-edge APIs` | These come from React Native internals, not fixable without upgrading RN |
| `screenOrientation restriction` | Changed to `"unspecified"` in AndroidManifest, `"default"` in app.json |
| Build fails on EAS | Check `eas build --platform android --profile production --no-wait` for logs |
| `clang++: error: clang frontend command failed due to signal` | **Windows Out-of-Memory.** The C++ compiler crashed. Open `android/gradle.properties` and change `org.gradle.jvmargs=-Xmx2048m` to `org.gradle.jvmargs=-Xmx8192m` to give it 8GB of RAM. |
| `Execution failed for task ':app:mergeReleaseNativeLibs'` | **C++ File Collision.** Reanimated and Worklets both generate `libworklets.so`. Open `android/app/build.gradle` and add `pickFirst 'lib/**/libworklets.so'` inside the `packagingOptions` block. |
| `Filename longer than 260 characters` | **Windows Only limit.** See the Robocopy workaround script below! |

### 🛠️ The "All-in-One" Windows Path Limit Fix (Robocopy Script)

If you get the `Filename longer than 260 characters` error while building locally, the absolute easiest fix is to just copy the project to a short path (like `D:\portal`) and build it from there. 

You can do this entirely with this **All-In-One PowerShell Command**:

```powershell
robocopy "D:\Coding Language\react-native\probation portal" "D:\portal" /E /MT:32 /NFL /NDL /NJH /NJS; cd "D:\portal\probation-portal\android"; .\gradlew bundleRelease
```
*(This will clone your entire project to `D:\portal`, jump into that short folder, and run the AAB build, bypassing the Windows character limit instantly!)*
