import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  StyleSheet,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  loading = false,
  disabled = false,
  icon,
  iconPosition = 'left',
  style,
  textStyle,
}) => {
  const isPrimary = variant === 'primary';
  const isSecondary = variant === 'secondary';
  const isOutline = variant === 'outline';
  const isDanger = variant === 'danger';
  const isSuccess = variant === 'success';

  let btnBg = colors.primary;
  let textColor = '#FFFFFF';
  let borderColor = 'transparent';

  if (isSecondary) {
    btnBg = colors.primarySoft;
    textColor = colors.primaryDark;
  } else if (isOutline) {
    btnBg = 'transparent';
    textColor = colors.primary;
    borderColor = colors.border;
  } else if (isDanger) {
    btnBg = colors.danger;
    textColor = '#FFFFFF';
  } else if (isSuccess) {
    btnBg = colors.success;
    textColor = '#FFFFFF';
  }

  const isDisabled = disabled || loading;

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      onPress={onPress}
      disabled={isDisabled}
      style={[
        styles.button,
        {
          backgroundColor: isDisabled ? '#CBD5E1' : btnBg,
          borderColor: isOutline ? (isDisabled ? '#CBD5E1' : borderColor) : 'transparent',
          borderWidth: isOutline ? 1.5 : 0,
        },
        isPrimary && !isDisabled && shadows.sm,
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={isOutline || isSecondary ? colors.primary : '#FFFFFF'}
        />
      ) : (
        <View style={styles.content}>
          {icon && iconPosition === 'left' && (
            <Ionicons
              name={icon}
              size={18}
              color={isDisabled ? '#94A3B8' : textColor}
              style={styles.leftIcon}
            />
          )}
          <Text
            style={[
              styles.text,
              { color: isDisabled ? '#94A3B8' : textColor },
              textStyle,
            ]}
          >
            {title}
          </Text>
          {icon && iconPosition === 'right' && (
            <Ionicons
              name={icon}
              size={18}
              color={isDisabled ? '#94A3B8' : textColor}
              style={styles.rightIcon}
            />
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  button: {
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  text: {
    fontSize: 15,
    fontWeight: '600',
    letterSpacing: 0.2,
  },
  leftIcon: {
    marginRight: 8,
  },
  rightIcon: {
    marginLeft: 8,
  },
});
