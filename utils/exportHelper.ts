import { Alert, Platform } from 'react-native';
import * as FileSystem from 'expo-file-system/legacy';
import * as Sharing from 'expo-sharing';

export const handleFileExport = (fileName: string, data: string, mimeType: string = 'text/csv') => {
  Alert.alert(
    'Export Options',
    'Would you like to save the file or share it directly?',
    [
      {
        text: 'Save to Device',
        onPress: async () => {
          try {
            if (Platform.OS === 'android') {
              const permissions = await FileSystem.StorageAccessFramework.requestDirectoryPermissionsAsync();
              if (permissions.granted) {
                const uri = await FileSystem.StorageAccessFramework.createFileAsync(permissions.directoryUri, fileName, mimeType);
                await FileSystem.writeAsStringAsync(uri, data, { encoding: FileSystem.EncodingType.UTF8 });
                Alert.alert('Success', 'File saved successfully!');
              }
            } else {
              // iOS fallback to share sheet which has "Save to Files" built-in
              const fileUri = FileSystem.documentDirectory + fileName;
              await FileSystem.writeAsStringAsync(fileUri, data);
              await Sharing.shareAsync(fileUri, { mimeType });
            }
          } catch (e: any) {
            Alert.alert('Save Error', e?.message || 'Failed to save file');
          }
        }
      },
      {
        text: 'Share',
        onPress: async () => {
          try {
            const fileUri = FileSystem.documentDirectory + fileName;
            await FileSystem.writeAsStringAsync(fileUri, data);
            await Sharing.shareAsync(fileUri, { mimeType });
          } catch (e: any) {
            Alert.alert('Share Error', e?.message || 'Failed to share file');
          }
        }
      },
      { text: 'Cancel', style: 'cancel' }
    ]
  );
};
