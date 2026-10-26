import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { StatusBadge } from './StatusBadge';
import { getFileUrl } from '../services/api';

const getTypeIcon = (type) => {
  const t = (type || '').toLowerCase();
  if (t.includes('hardware')) return 'desktop-outline';
  if (t.includes('software')) return 'code-slash-outline';
  if (t.includes('network')) return 'wifi-outline';
  if (t.includes('plumb')) return 'water-outline';
  if (t.includes('electr')) return 'flash-outline';
  if (t.includes('app')) return 'phone-portrait-outline';
  return 'construct-outline';
};

export const ComplaintCard = ({
  complaint,
  onPress,
  onStatusPress,
  onAssignPress,
  canAssign = false,
  canUpdateStatus = false,
}) => {
  const {
    _id,
    complaintType,
    blockName,
    roomNumber,
    remarks,
    status = 'Pending',
    createdAt,
    attachment,
    assignedTo,
    createdBy,
  } = complaint;

  const formattedDate = createdAt
    ? new Date(createdAt).toLocaleDateString(undefined, {
        month: 'short',
        day: 'numeric',
        year: 'numeric',
      })
    : '';

  const creatorName = createdBy?.username || createdBy?.email || 'User';
  const assigneeName = assignedTo?.username || assignedTo?.email || null;
  const imageUrl = getFileUrl(attachment);

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={onPress}
      style={[styles.card, shadows.card]}
    >
      {/* Top Header: Category + Status Badge */}
      <View style={styles.header}>
        <View style={styles.categoryBadge}>
          <Ionicons
            name={getTypeIcon(complaintType)}
            size={16}
            color={colors.primary}
            style={styles.categoryIcon}
          />
          <Text style={styles.categoryText}>{complaintType || 'Issue'}</Text>
        </View>
        <StatusBadge status={status} size="small" />
      </View>

      {/* Location Details: Block & Room */}
      <View style={styles.locationRow}>
        <View style={styles.locationPill}>
          <Ionicons name="business-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.locationText}>{blockName || 'Main Block'}</Text>
        </View>
        <View style={styles.locationDivider} />
        <View style={styles.locationPill}>
          <Ionicons name="key-outline" size={14} color={colors.textSecondary} />
          <Text style={styles.locationText}>Room {roomNumber || '-'}</Text>
        </View>
        {attachment ? (
          <View style={styles.attachmentChip}>
            <Ionicons name="image-outline" size={13} color={colors.accent} />
            <Text style={styles.attachmentChipText}>Photo</Text>
          </View>
        ) : null}
      </View>

      {/* Remarks / Description */}
      {remarks ? (
        <Text style={styles.remarks} numberOfLines={2} ellipsizeMode="tail">
          {remarks}
        </Text>
      ) : null}

      {/* Footer: Reporter / Assignee & Date */}
      <View style={styles.footer}>
        <View style={styles.peopleRow}>
          <View style={styles.userChip}>
            <Ionicons name="person-circle-outline" size={16} color={colors.textMuted} />
            <Text style={styles.userName} numberOfLines={1}>
              {creatorName}
            </Text>
          </View>
          {assigneeName ? (
            <View style={[styles.userChip, styles.assigneeChip]}>
              <Ionicons name="shield-checkmark-outline" size={14} color={colors.primary} />
              <Text style={styles.assigneeName} numberOfLines={1}>
                {assigneeName}
              </Text>
            </View>
          ) : (
            <Text style={styles.unassignedText}>Unassigned</Text>
          )}
        </View>
        <Text style={styles.dateText}>{formattedDate}</Text>
      </View>

      {/* Quick Action Buttons if enabled */}
      {(canAssign || canUpdateStatus) && (
        <View style={styles.actionsBar}>
          {canAssign && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onAssignPress}
              style={[styles.actionBtn, styles.assignBtn]}
            >
              <Ionicons name="person-add-outline" size={14} color={colors.primary} />
              <Text style={styles.assignBtnText}>
                {assigneeName ? 'Reassign' : 'Assign'}
              </Text>
            </TouchableOpacity>
          )}
          {canUpdateStatus && (
            <TouchableOpacity
              activeOpacity={0.7}
              onPress={onStatusPress}
              style={[styles.actionBtn, styles.statusBtn]}
            >
              <Ionicons name="sync-outline" size={14} color="#7E22CE" />
              <Text style={styles.statusBtnText}>Change Status</Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  categoryBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primarySoft,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 8,
  },
  categoryIcon: {
    marginRight: 6,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  locationPill: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  locationText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  locationDivider: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    marginHorizontal: 8,
  },
  attachmentChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  attachmentChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 3,
  },
  remarks: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginBottom: 12,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  peopleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  userChip: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
  },
  userName: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 4,
    maxWidth: 90,
  },
  assigneeChip: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  assigneeName: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.primaryDark,
    marginLeft: 3,
    maxWidth: 90,
  },
  unassignedText: {
    fontSize: 11,
    color: colors.textMuted,
    fontStyle: 'italic',
  },
  dateText: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
  },
  actionsBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 8,
    flex: 1,
  },
  assignBtn: {
    backgroundColor: '#EEF2FF',
  },
  assignBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 5,
  },
  statusBtn: {
    backgroundColor: '#F3E8FF',
  },
  statusBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#7E22CE',
    marginLeft: 5,
  },
});
