import { BlurView } from 'expo-blur';
import { View, StyleSheet, ViewProps } from 'react-native';
import { useColorScheme } from 'nativewind';

interface GlassCardProps extends ViewProps {
  intensity?: number;
  tint?: 'light' | 'dark' | 'default';
  className?: string;
  children?: React.ReactNode;
}

export default function GlassCard({ 
  intensity = 80, 
  tint,
  className = '', 
  children, 
  ...props 
}: GlassCardProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const resolvedTint = tint || (isDark ? 'dark' : 'light');
  
  return (
    <View className={`overflow-hidden rounded-xl border-2 border-black dark:border-white ${className}`} {...props}>
      <BlurView 
        intensity={40} 
        tint={resolvedTint} 
        style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? 'rgba(9, 9, 11, 0.1)' : 'rgba(255, 255, 255, 0.2)' }]} 
      />
      <View className="p-5 relative z-10 w-full">
        {children}
      </View>
    </View>
  );
}
