import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  FlatList,
  TextInput,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

export const ModalPicker = ({
  visible,
  onClose,
  onSelect,
  title = 'Select Option',
  options = [], // [{ label, value, subtitle }] or array of strings
  selectedValue,
  searchPlaceholder = 'Search...',
}) => {
  const [search, setSearch] = useState('');

  const normalizedOptions = options.map((item) => {
    if (typeof item === 'string') {
      return { label: item, value: item, subtitle: null };
    }
    return item;
  });

  const filtered = normalizedOptions.filter((item) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const l = (item.label || '').toLowerCase();
    const s = (item.subtitle || '').toLowerCase();
    return l.includes(q) || s.includes(q);
  });

  const handleSelect = (item) => {
    onSelect(item.value, item);
    setSearch('');
    onClose();
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={styles.overlay}
      >
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={onClose}
        />
        <View style={[styles.sheet, shadows.lg]}>
          <View style={styles.handle} />
          <View style={styles.header}>
            <Text style={styles.title}>{title}</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {normalizedOptions.length > 5 && (
            <View style={styles.searchBox}>
              <Ionicons
                name="search-outline"
                size={18}
                color={colors.textMuted}
                style={styles.searchIcon}
              />
              <TextInput
                value={search}
                onChangeText={setSearch}
                placeholder={searchPlaceholder}
                placeholderTextColor={colors.textMuted}
                style={styles.searchInput}
                clearButtonMode="while-editing"
              />
            </View>
          )}

          <FlatList
            data={filtered}
            keyExtractor={(item, index) => `${item.value}_${index}`}
            showsVerticalScrollIndicator={false}
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={styles.listContent}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <Ionicons
                  name="file-tray-outline"
                  size={36}
                  color={colors.textMuted}
                />
                <Text style={styles.emptyText}>No options found</Text>
              </View>
            }
            renderItem={({ item }) => {
              const isSelected = selectedValue === item.value;
              return (
                <TouchableOpacity
                  activeOpacity={0.7}
                  onPress={() => handleSelect(item)}
                  style={[
                    styles.itemRow,
                    isSelected && styles.selectedItemRow,
                  ]}
                >
                  <View style={styles.itemTextContainer}>
                    <Text
                      style={[
                        styles.itemLabel,
                        isSelected && styles.selectedItemLabel,
                      ]}
                    >
                      {item.label}
                    </Text>
                    {item.subtitle ? (
                      <Text style={styles.itemSubtitle}>{item.subtitle}</Text>
                    ) : null}
                  </View>
                  {isSelected && (
                    <Ionicons
                      name="checkmark-circle"
                      size={22}
                      color={colors.primary}
                    />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.45)',
    justifyContent: 'flex-end',
  },
  backdrop: {
    flex: 1,
  },
  sheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
    paddingBottom: 24,
  },
  handle: {
    width: 36,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 6,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 40,
    fontSize: 14,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 20,
  },
  itemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 14,
    borderRadius: 12,
    marginBottom: 6,
    backgroundColor: '#FFFFFF',
  },
  selectedItemRow: {
    backgroundColor: colors.primarySoft,
  },
  itemTextContainer: {
    flex: 1,
    marginRight: 12,
  },
  itemLabel: {
    fontSize: 15,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  selectedItemLabel: {
    fontWeight: '700',
    color: colors.primaryDark,
  },
  itemSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    paddingVertical: 32,
    alignItems: 'center',
  },
  emptyText: {
    marginTop: 8,
    fontSize: 14,
    color: colors.textMuted,
  },
});
