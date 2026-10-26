import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

export const StatCard = ({
  label,
  value,
  icon,
  color = colors.primary,
  bgColor = '#EEF2FF',
  isActive = false,
  onPress,
}) => {
  return (
    <TouchableOpacity
      activeOpacity={onPress ? 0.75 : 1}
      onPress={onPress}
      style={[
        styles.card,
        shadows.card,
        isActive && {
          borderColor: color,
          borderWidth: 2,
          backgroundColor: '#FFFFFF',
        },
      ]}
    >
      <View style={styles.topRow}>
        <View style={[styles.iconContainer, { backgroundColor: bgColor }]}>
          <Ionicons name={icon} size={20} color={color} />
        </View>
        {isActive && (
          <View style={[styles.activeDot, { backgroundColor: color }]} />
        )}
      </View>
      <Text style={styles.value}>{value}</Text>
      <Text style={styles.label}>{label}</Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    flex: 1,
    minWidth: 140,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  iconContainer: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activeDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  value: {
    fontSize: 24,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  label: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
});
