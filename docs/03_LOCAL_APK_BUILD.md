# 03. Building an APK (For Local Testing/Distribution)

If you want to send the app directly to users (outside the Play Store) or test it locally on a physical device, you need to build an `.apk` file. `.aab` files cannot be installed directly on a phone.

There are two ways to build an APK: Cloud (EAS) and Local (Android Studio/Gradle).

## Method 1: Cloud Build with EAS (Recommended)
This uses Expo's servers so your PC doesn't need heavy Android SDKs installed.

1. Create a `preview` profile in `eas.json` (if not exists):
```json
{
  "build": {
    "preview": {
      "android": {
        "buildType": "apk"
      },
      "env": {
        "EXPO_PUBLIC_API_URL": "https://probation-portal-backend.vercel.app/api"
      }
    }
  }
}
```

2. Run the EAS build command:
```powershell
eas build -p android --profile preview
```

3. Wait for the build to finish in the cloud. It will give you a link to download the `.apk`. You can share this link or file directly with candidates.

## Method 2: Local Gradle Build (Faster if Android Studio is setup)
If you have Android Studio, JDK 17, and Android SDK configured, you can build it directly on your Windows machine for free, without waiting in EAS queues.

1. Navigate to the android folder:
```powershell
cd probation-portal/android
```

2. Clean the project (Optional but recommended):
```powershell
./gradlew clean
```

3. Build the Release APK:
```powershell
./gradlew assembleRelease
```
*(This uses the production API URL from your local `.env` file! Ensure your `.env` is pointing to Vercel, not localhost!)*

4. Locate the APK:
The built APK will be located at:
`probation-portal/android/app/build/outputs/apk/release/app-release.apk`

You can move this file to your phone and install it.
