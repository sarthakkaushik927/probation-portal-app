import { TouchableOpacity, View, Text } from 'react-native';
import { useColorScheme } from 'nativewind';
import { MaterialIcons } from '@expo/vector-icons';

export default function ThemeToggle() {
  const { colorScheme, toggleColorScheme, setColorScheme } = useColorScheme();

  const isDark = colorScheme === 'dark';

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={toggleColorScheme}
      className="p-2 rounded-full bg-gray-100 dark:bg-slate-800 items-center justify-center border border-gray-200 dark:border-slate-700"
    >
      <MaterialIcons
        name={isDark ? 'light-mode' : 'dark-mode'}
        size={22}
        color={isDark ? '#f59e0b' : '#6366f1'}
      />
    </TouchableOpacity>
  );
}
