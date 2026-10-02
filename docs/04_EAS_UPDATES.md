# 04. Over-The-Air (OTA) Updates with EAS Update

EAS Update allows you to push small JavaScript and asset changes (like UI tweaks, component changes, and color updates) directly to users **without going through the Google Play Store review process**. 

## When you can use EAS Update
✅ Changing styling (Tailwind classes, colors)
✅ Changing API endpoints in JS
✅ Modifying React components (`.tsx` files)
✅ Fixing frontend logic bugs

## When you CANNOT use EAS Update (Requires new Play Store Release)
❌ Upgrading Expo SDK version
❌ Installing new Native libraries (e.g. `expo-camera`, `react-native-reanimated`)
❌ Changing `app.json` (like app name, icon, splash screen, permissions)
❌ Changing `AndroidManifest.xml` or Gradle files

## Step-by-Step EAS Update

1. Ensure your changes work locally.
2. Ensure you are on the `main` or `master` branch in Git (EAS ties updates to the branch).
```powershell
git checkout main
```

3. Publish the update to the `production` channel:
```powershell
eas update --branch main --message "Fixing styling issues on task cards"
```

4. Wait for it to upload.

### How Users Receive It
Users with the app installed from the Play Store (or the preview APK) will download the update silently in the background when they open the app. The next time they restart the app, the new code will instantly take effect.

## Rollbacks
If you push a broken update, you can list all updates and re-publish an old one:
```powershell
eas update:list
```
