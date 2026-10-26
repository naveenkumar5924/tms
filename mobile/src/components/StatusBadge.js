import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

export const StatusBadge = ({ status, size = 'medium' }) => {
  const norm = (status || 'Pending').toLowerCase().replace(/[^a-z]/g, '');

  let config = {
    bg: colors.status.pending.bg,
    color: colors.status.pending.text,
    border: colors.status.pending.border,
    dot: colors.status.pending.dot,
    icon: 'time-outline',
    label: status || 'Pending',
  };

  if (norm === 'pending') {
    config = {
      bg: '#FEF3C7',
      color: '#B45309',
      border: '#FDE68A',
      dot: '#F59E0B',
      icon: 'hourglass-outline',
      label: 'Pending',
    };
  } else if (norm === 'assigned') {
    config = {
      bg: '#EEF2FF',
      color: '#4338CA',
      border: '#C7D2FE',
      dot: '#6366F1',
      icon: 'person-outline',
      label: 'Assigned',
    };
  } else if (norm === 'inprogress') {
    config = {
      bg: '#F3E8FF',
      color: '#7E22CE',
      border: '#E9D5FF',
      dot: '#A855F7',
      icon: 'sync-outline',
      label: 'In-Progress',
    };
  } else if (norm === 'closed') {
    config = {
      bg: '#ECFDF5',
      color: '#065F46',
      border: '#A7F3D0',
      dot: '#10B981',
      icon: 'checkmark-circle-outline',
      label: 'Closed',
    };
  } else if (norm === 'onhold') {
    config = {
      bg: '#FFF7ED',
      color: '#C2410C',
      border: '#FED7AA',
      dot: '#F97316',
      icon: 'pause-circle-outline',
      label: 'On Hold',
    };
  } else if (norm === 'active') {
    config = {
      bg: '#ECFDF5',
      color: '#047857',
      border: '#A7F3D0',
      dot: '#10B981',
      icon: 'checkmark-outline',
      label: 'Active',
    };
  }

  const isSmall = size === 'small';

  return (
    <View
      style={[
        styles.badge,
        {
          backgroundColor: config.bg,
          borderColor: config.border,
          paddingVertical: isSmall ? 3 : 5,
          paddingHorizontal: isSmall ? 8 : 11,
        },
      ]}
    >
      <View style={[styles.dot, { backgroundColor: config.dot }]} />
      <Text
        style={[
          styles.text,
          {
            color: config.color,
            fontSize: isSmall ? 11 : 12,
            fontWeight: '600',
          },
        ]}
      >
        {config.label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 20,
    borderWidth: 1,
    alignSelf: 'flex-start',
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  text: {
    letterSpacing: 0.2,
  },
});
