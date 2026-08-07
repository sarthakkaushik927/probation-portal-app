import React, { useState, useEffect } from 'react';
import { View, Text, Modal, TouchableOpacity, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useColorScheme } from 'nativewind';
import GlassCard from './GlassCard';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  domain?: string;
  isVerified: boolean;
  createdAt: string;
}

interface ExportUsersModalProps {
  visible: boolean;
  onClose: () => void;
  users: User[];
  onExport: (csvData: string) => void;
}

const AVAILABLE_FIELDS = [
  { key: 'name', label: 'Name' },
  { key: 'email', label: 'Email' },
  { key: 'role', label: 'Role' },
  { key: 'domain', label: 'Domain' },
  { key: 'isVerified', label: 'Verified Status' },
  { key: 'createdAt', label: 'Joined Date' },
];

export default function ExportUsersModal({ visible, onClose, users, onExport }: ExportUsersModalProps) {
  const { colorScheme } = useColorScheme();
  const isDark = colorScheme === 'dark';
  const iconColor = isDark ? '#fff' : '#000';

  const [selectedFields, setSelectedFields] = useState<string[]>(AVAILABLE_FIELDS.map(f => f.key));
  const [selectedUserIds, setSelectedUserIds] = useState<string[]>([]);

  useEffect(() => {
    if (visible && users) {
      setSelectedUserIds(users.map(u => u.id));
      setSelectedFields(AVAILABLE_FIELDS.map(f => f.key));
    }
  }, [visible, users]);

  const toggleField = (key: string) => {
    setSelectedFields(prev => prev.includes(key) ? prev.filter(k => k !== key) : [...prev, key]);
  };

  const toggleUser = (id: string) => {
    setSelectedUserIds(prev => prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]);
  };

  const generateCSV = () => {
    const selectedUsersData = users.filter(u => selectedUserIds.includes(u.id));
    
    // Header
    const header = AVAILABLE_FIELDS.filter(f => selectedFields.includes(f.key)).map(f => f.label).join(',');
    
    // Rows
    const rows = selectedUsersData.map(u => {
      const rowData = [];
      if (selectedFields.includes('name')) rowData.push((u.name || '').replace(/,/g, ' '));
      if (selectedFields.includes('email')) rowData.push(u.email);
      if (selectedFields.includes('role')) rowData.push(u.role);
      if (selectedFields.includes('domain')) rowData.push(u.domain || 'UNASSIGNED');
      if (selectedFields.includes('isVerified')) rowData.push(u.isVerified ? 'Yes' : 'No');
      if (selectedFields.includes('createdAt')) rowData.push(new Date(u.createdAt).toLocaleDateString());
      return rowData.join(',');
    });

    const csvString = [header, ...rows].join('\n');
    onExport(csvString);
  };

  return (
    <Modal visible={visible} animationType="slide" transparent={true} onRequestClose={onClose}>
      <View className="flex-1 justify-end bg-black/50">
        <View className="bg-zinc-50 dark:bg-zinc-900 rounded-t-3xl h-[80%] border-t-2 border-black dark:border-white shadow-2xl">
          <View className="p-4 border-b border-zinc-200 dark:border-zinc-800 flex-row justify-between items-center">
            <Text className="text-xl font-bold font-sans text-zinc-900 dark:text-white">Export Users</Text>
            <TouchableOpacity onPress={onClose}>
              <MaterialIcons name="close" size={24} color={iconColor} />
            </TouchableOpacity>
          </View>
          
          <ScrollView className="flex-1 p-4">
            {/* Fields Selection */}
            <Text className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Include Fields</Text>
            <GlassCard className="mb-6 p-2">
              <View className="flex-row flex-wrap">
                {AVAILABLE_FIELDS.map(field => (
                  <TouchableOpacity 
                    key={field.key} 
                    onPress={() => toggleField(field.key)}
                    className="flex-row items-center w-[50%] mb-3 px-2"
                  >
                    <MaterialIcons 
                      name={selectedFields.includes(field.key) ? "check-box" : "check-box-outline-blank"} 
                      size={20} 
                      color={selectedFields.includes(field.key) ? iconColor : '#a1a1aa'} 
                    />
                    <Text className="ml-2 font-mono text-sm text-zinc-700 dark:text-zinc-300">{field.label}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </GlassCard>

            {/* Users Selection */}
            <View className="flex-row justify-between items-end mb-2">
              <Text className="text-sm font-bold text-zinc-500 uppercase tracking-widest">Select Users ({selectedUserIds.length})</Text>
              <TouchableOpacity onPress={() => setSelectedUserIds(selectedUserIds.length === users.length ? [] : users.map(u => u.id))}>
                <Text className="text-blue-600 dark:text-blue-400 font-mono text-xs font-bold uppercase tracking-widest">
                  {selectedUserIds.length === users.length ? 'Deselect All' : 'Select All'}
                </Text>
              </TouchableOpacity>
            </View>
            
            <GlassCard className="mb-10 p-2">
              {users?.map(user => (
                <TouchableOpacity 
                  key={user.id} 
                  onPress={() => toggleUser(user.id)}
                  className="flex-row items-center justify-between p-3 border-b border-zinc-200 dark:border-zinc-800 last:border-0"
                >
                  <View>
                    <Text className="font-bold text-zinc-900 dark:text-white font-sans">{user.name}</Text>
                    <Text className="text-zinc-500 font-mono text-xs mt-1">{user.email}</Text>
                  </View>
                  <MaterialIcons 
                    name={selectedUserIds.includes(user.id) ? "check-box" : "check-box-outline-blank"} 
                    size={24} 
                    color={selectedUserIds.includes(user.id) ? iconColor : '#a1a1aa'} 
                  />
                </TouchableOpacity>
              ))}
            </GlassCard>
          </ScrollView>

          <View className="p-4 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 pb-8">
            <TouchableOpacity 
              className={`p-4 rounded-xl items-center border-2 border-black dark:border-white shadow-sm ${selectedUserIds.length === 0 || selectedFields.length === 0 ? 'bg-zinc-300 dark:bg-zinc-800 opacity-50' : 'bg-black dark:bg-white'}`}
              onPress={generateCSV}
              disabled={selectedUserIds.length === 0 || selectedFields.length === 0}
            >
              <Text className="text-white dark:text-black font-bold font-mono tracking-widest uppercase">
                Generate CSV
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}
