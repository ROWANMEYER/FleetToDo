import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { useRouter, usePathname } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

interface DrawerMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function DrawerMenu({ isOpen, onClose }: DrawerMenuProps) {
  const router = useRouter();
  const pathname = usePathname();

  const menuItems = [
    { name: 'My Day', icon: 'sunny-outline' as const, route: '/' },
    { name: 'All', icon: 'infinite-outline' as const, route: '/all' },
    { name: 'Completed', icon: 'checkmark-done-circle-outline' as const, route: '/completed' },
    { name: 'Tasks', icon: 'list-outline' as const, route: '/tasks' },
    { name: 'Dashboard', icon: 'analytics-outline' as const, route: '/dashboard' },
    { name: 'Reports', icon: 'document-text-outline' as const, route: '/reports' },
    { name: 'Settings', icon: 'settings-outline' as const, route: '/settings' },
  ];

  const handleNavigation = (route: string) => {
    router.push(route);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.overlay} onPress={onClose} />
      <View style={styles.drawer}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>FleetToDo</Text>
          <Text style={styles.headerSubtitle}>Fleet Management</Text>
        </View>
        
        <ScrollView style={styles.menuContainer}>
          {menuItems.map((item) => (
            <TouchableOpacity
              key={item.name}
              style={[
                styles.menuItem,
                pathname === item.route && styles.activeMenuItem
              ]}
              onPress={() => handleNavigation(item.route)}
            >
              <Ionicons 
                name={item.icon} 
                size={22} 
                color={pathname === item.route ? '#3B82F6' : '#64748B'} 
                style={styles.menuIcon}
              />
              <Text style={[
                styles.menuText,
                pathname === item.route && styles.activeMenuText
              ]}>
                {item.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  overlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  drawer: {
    position: 'absolute',
    top: 0,
    left: 0,
    bottom: 0,
    width: '80%',
    maxWidth: 320,
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 2, height: 0 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  header: {
    backgroundColor: '#3B82F6',
    padding: 24,
    paddingTop: 48,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#E0E7FF',
  },
  menuContainer: {
    flex: 1,
    paddingVertical: 16,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 8,
    marginHorizontal: 16,
    marginVertical: 2,
  },
  activeMenuItem: {
    backgroundColor: '#EFF6FF',
  },
  menuIcon: {
    marginRight: 16,
  },
  menuText: {
    fontSize: 16,
    color: '#374151',
    fontWeight: '500',
  },
  activeMenuText: {
    color: '#3B82F6',
    fontWeight: '600',
  },
});
