import { useState, useCallback, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, FlatList, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import { Image } from 'expo-image';
import { searchAdminUsers } from '../services/api';
import { UserSearchResult } from '../types';

interface MemberSelectorProps {
  selectedMembers: UserSearchResult[];
  onAdd: (user: UserSearchResult) => void;
  onRemove: (userId: string) => void;
}

export default function MemberSelector({ selectedMembers, onAdd, onRemove }: MemberSelectorProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<UserSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#fff' : '#000';
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const searchUsers = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 1) {
      setSuggestions([]);
      return;
    }

    setLoading(true);
    try {
      const res = await searchAdminUsers(searchQuery);
      const results = (res.data.data || []).filter(
        (u: UserSearchResult) => !selectedMembers.some(m => m.id === u.id)
      );
      setSuggestions(results);
    } catch (error) {
      console.error('Search failed:', error);
      setSuggestions([]);
    } finally {
      setLoading(false);
    }
  }, [selectedMembers]);

  const handleQueryChange = (text: string) => {
    setQuery(text);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => searchUsers(text), 300);
  };

  const handleSelect = (user: UserSearchResult) => {
    onAdd(user);
    setQuery('');
    setSuggestions([]);
  };

  return (
    <View>
      {/* Selected Members Chips */}
      {selectedMembers.length > 0 && (
        <View className="flex-row flex-wrap gap-2 mb-3">
          {selectedMembers.map(member => (
            <View
              key={member.id}
              className="flex-row items-center bg-zinc-100 dark:bg-zinc-800 rounded-full px-3 py-1.5 border border-black dark:border-white"
            >
              {member.avatarData ? (
                <Image source={{ uri: member.avatarData }} style={{ width: 20, height: 20, borderRadius: 10, marginRight: 6 }} />
              ) : (
                <View className="w-5 h-5 rounded-full bg-zinc-300 dark:bg-zinc-700 items-center justify-center mr-1.5">
                  <Text className="text-[8px] font-black text-zinc-600 dark:text-zinc-300">
                    {member.name?.charAt(0).toUpperCase() || '?'}
                  </Text>
                </View>
              )}
              <Text className="text-xs font-bold text-zinc-900 dark:text-white mr-1.5" numberOfLines={1}>
                {member.name || member.email}
              </Text>
              <TouchableOpacity onPress={() => onRemove(member.id)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
                <MaterialIcons name="close" size={14} color="#71717a" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
      )}

      {/* Search Input */}
      <View className="relative">
        <View className="flex-row items-center bg-white dark:bg-zinc-900 rounded-xl border-[3px] border-black dark:border-white px-4">
          <MaterialIcons name="search" size={20} color="#9ca3af" />
          <TextInput
            className="flex-1 py-3.5 px-2 text-zinc-900 dark:text-white font-mono"
            placeholder="Search by name or email..."
            placeholderTextColor="#9ca3af"
            value={query}
            onChangeText={handleQueryChange}
            autoCapitalize="none"
          />
          {loading && <ActivityIndicator size="small" color={iconColor} />}
        </View>

        {/* Suggestions Dropdown */}
        {suggestions.length > 0 && (
          <View className="absolute top-full left-0 right-0 mt-1 bg-white dark:bg-zinc-900 border-2 border-black dark:border-white rounded-xl overflow-hidden z-50" style={{ elevation: 10 }}>
            <FlatList
              data={suggestions}
              keyExtractor={item => item.id}
              keyboardShouldPersistTaps="handled"
              style={{ maxHeight: 200 }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  className="flex-row items-center px-4 py-3 border-b border-zinc-200 dark:border-zinc-800"
                  onPress={() => handleSelect(item)}
                >
                  {item.avatarData ? (
                    <Image source={{ uri: item.avatarData }} style={{ width: 32, height: 32, borderRadius: 16, marginRight: 12 }} />
                  ) : (
                    <View className="w-8 h-8 rounded-full bg-zinc-200 dark:bg-zinc-800 items-center justify-center mr-3 border border-zinc-300 dark:border-zinc-700">
                      <Text className="text-xs font-bold text-zinc-600 dark:text-zinc-300">
                        {item.name?.charAt(0).toUpperCase() || '?'}
                      </Text>
                    </View>
                  )}
                  <View className="flex-1">
                    <Text className="text-sm font-bold text-zinc-900 dark:text-white" numberOfLines={1}>
                      {item.name || 'Unnamed'}
                    </Text>
                    <Text className="text-xs text-zinc-500 dark:text-zinc-400" numberOfLines={1}>
                      {item.email}
                    </Text>
                  </View>
                  {item.domain && (
                    <View className="bg-zinc-100 dark:bg-zinc-800 px-2 py-0.5 rounded">
                      <Text className="text-[9px] font-bold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
                        {item.domain}
                      </Text>
                    </View>
                  )}
                  <MaterialIcons name="add" size={20} color="#71717a" style={{ marginLeft: 8 }} />
                </TouchableOpacity>
              )}
            />
          </View>
        )}
      </View>

      <Text className="text-zinc-400 dark:text-zinc-600 text-[10px] mt-1.5 ml-1 font-medium">
        {selectedMembers.length} member{selectedMembers.length !== 1 ? 's' : ''} selected
      </Text>
    </View>
  );
}
