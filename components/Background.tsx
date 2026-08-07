import React from 'react';
import { View, StyleSheet } from 'react-native';
import { useColorScheme } from 'nativewind';

export default function Background({ children }: { children: React.ReactNode }) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';

  return (
    <View style={styles.container} className="bg-white dark:bg-zinc-950">
      {!isDark ? (
        <>
          <View className="absolute top-0 right-0 w-96 h-96 bg-blue-200 rounded-full opacity-40 -mt-20 -mr-20" style={{ filter: 'blur(60px)' } as any} />
          <View className="absolute bottom-0 left-0 w-96 h-96 bg-purple-200 rounded-full opacity-40 -mb-20 -ml-20" style={{ filter: 'blur(60px)' } as any} />
        </>
      ) : (
        <>
          <View className="absolute top-0 right-0 w-96 h-96 bg-blue-900 rounded-full opacity-25 -mt-20 -mr-20" style={{ filter: 'blur(70px)' } as any} />
          <View className="absolute bottom-0 left-0 w-96 h-96 bg-purple-900 rounded-full opacity-25 -mb-20 -ml-20" style={{ filter: 'blur(70px)' } as any} />
        </>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});
