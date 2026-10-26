import React, { useState } from 'react';
import {
  View,
  Text,
  Modal,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../theme/colors';
import { StatusBadge } from './StatusBadge';
import { getFileUrl, complaintService } from '../services/api';
import { CustomButton } from './CustomButton';
import { ModalPicker } from './ModalPicker';

export const ComplaintDetailModal = ({
  visible,
  complaint,
  onClose,
  onRefresh,
  currentUser,
  usersList = [],
}) => {
  const [updating, setUpdating] = useState(false);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [assignPickerVisible, setAssignPickerVisible] = useState(false);
  const [fullImageVisible, setFullImageVisible] = useState(false);

  if (!complaint) return null;

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

  const isSuperAdmin = currentUser?.role === 'SuperAdmin';
  const isStaff = currentUser && !isSuperAdmin && currentUser?.role !== 'User';
  const isAssignedToMe =
    isStaff &&
    (assignedTo?._id === currentUser?.id ||
      assignedTo?._id === currentUser?._id ||
      assignedTo === currentUser?.id ||
      assignedTo === currentUser?._id);

  const canChangeStatus = isSuperAdmin || isAssignedToMe;
  const canAssign = isSuperAdmin;

  const imageUrl = getFileUrl(attachment);
  const formattedDate = createdAt ? new Date(createdAt).toLocaleString() : '';

  const handleUpdateStatus = async (newStatus) => {
    try {
      setUpdating(true);
      await complaintService.updateStatus(_id, newStatus);
      Alert.alert('Success', `Status updated to ${newStatus}`);
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to update status');
    } finally {
      setUpdating(false);
    }
  };

  const handleAssignUser = async (userId) => {
    try {
      setUpdating(true);
      await complaintService.assign(_id, userId);
      Alert.alert('Success', 'Complaint assigned successfully');
      if (onRefresh) onRefresh();
      onClose();
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to assign complaint');
    } finally {
      setUpdating(false);
    }
  };

  const statusOptions = ['Pending', 'Assigned', 'In-Progress', 'Onhold', 'Closed'];

  const staffUsers = usersList.filter(
    (u) => u.role !== 'User' && u.role !== 'SuperAdmin'
  );
  const userOptions = staffUsers.map((u) => ({
    label: `${u.username} (${u.role})`,
    value: u._id,
    subtitle: u.department?.name || u.email,
  }));

  return (
    <Modal visible={visible} animationType="slide" onRequestClose={onClose}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.topBar}>
          <TouchableOpacity onPress={onClose} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.topBarTitle}>Complaint Details</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.contentContainer}
        >
          {/* Main Status & ID Card */}
          <View style={[styles.mainCard, shadows.card]}>
            <View style={styles.statusRow}>
              <View>
                <Text style={styles.ticketLabel}>TICKET REF</Text>
                <Text style={styles.ticketId}>#{String(_id).slice(-8).toUpperCase()}</Text>
              </View>
              <StatusBadge status={status} size="medium" />
            </View>

            <View style={styles.divider} />

            {/* Quick Timeline */}
            <View style={styles.timeline}>
              <View style={styles.timelineStep}>
                <View
                  style={[
                    styles.stepDot,
                    { backgroundColor: colors.success },
                  ]}
                />
                <Text style={styles.stepText}>Created</Text>
              </View>
              <View
                style={[
                  styles.stepLine,
                  status !== 'Pending' && { backgroundColor: colors.primary },
                ]}
              />
              <View style={styles.timelineStep}>
                <View
                  style={[
                    styles.stepDot,
                    status !== 'Pending'
                      ? { backgroundColor: colors.primary }
                      : { backgroundColor: '#E2E8F0' },
                  ]}
                />
                <Text style={styles.stepText}>Assigned</Text>
              </View>
              <View
                style={[
                  styles.stepLine,
                  ['In-Progress', 'Closed'].includes(status) && {
                    backgroundColor: colors.primary,
                  },
                ]}
              />
              <View style={styles.timelineStep}>
                <View
                  style={[
                    styles.stepDot,
                    status === 'Closed'
                      ? { backgroundColor: colors.success }
                      : ['In-Progress', 'Onhold'].includes(status)
                      ? { backgroundColor: '#9333EA' }
                      : { backgroundColor: '#E2E8F0' },
                  ]}
                />
                <Text style={styles.stepText}>Resolved</Text>
              </View>
            </View>
          </View>

          {/* Details Section */}
          <View style={[styles.sectionCard, shadows.card]}>
            <Text style={styles.sectionTitle}>Issue Details</Text>

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Category</Text>
                <Text style={styles.infoValue}>{complaintType || 'General'}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Reported Date</Text>
                <Text style={styles.infoValueSmall}>{formattedDate}</Text>
              </View>
            </View>

            <View style={styles.infoRow}>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Block</Text>
                <Text style={styles.infoValue}>{blockName || 'Main'}</Text>
              </View>
              <View style={styles.infoCol}>
                <Text style={styles.infoLabel}>Room Number</Text>
                <Text style={styles.infoValue}>{roomNumber || '-'}</Text>
              </View>
            </View>

            <View style={styles.remarksBox}>
              <Text style={styles.infoLabel}>Description / Remarks</Text>
              <Text style={styles.remarksText}>
                {remarks || 'No remarks provided.'}
              </Text>
            </View>
          </View>

          {/* Attachment Photo Section */}
          {imageUrl ? (
            <View style={[styles.sectionCard, shadows.card]}>
              <Text style={styles.sectionTitle}>Attachment</Text>
              <TouchableOpacity
                activeOpacity={0.9}
                onPress={() => setFullImageVisible(true)}
              >
                <Image
                  source={{ uri: imageUrl }}
                  style={styles.attachmentImage}
                  resizeMode="cover"
                />
                <View style={styles.zoomHint}>
                  <Ionicons name="expand-outline" size={14} color="#FFFFFF" />
                  <Text style={styles.zoomText}>Tap to enlarge</Text>
                </View>
              </TouchableOpacity>
            </View>
          ) : null}

          {/* People Section */}
          <View style={[styles.sectionCard, shadows.card]}>
            <Text style={styles.sectionTitle}>Personnel</Text>

            <View style={styles.personRow}>
              <View style={styles.avatar}>
                <Ionicons name="person" size={20} color={colors.primary} />
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personRole}>Reported By</Text>
                <Text style={styles.personName}>
                  {createdBy?.username || createdBy?.email || 'User'}
                </Text>
                {createdBy?.email ? (
                  <Text style={styles.personSub}>{createdBy.email}</Text>
                ) : null}
              </View>
            </View>

            <View style={styles.personDivider} />

            <View style={styles.personRow}>
              <View
                style={[
                  styles.avatar,
                  { backgroundColor: assignedTo ? '#EEF2FF' : '#F1F5F9' },
                ]}
              >
                <Ionicons
                  name="shield-checkmark"
                  size={20}
                  color={assignedTo ? colors.primary : colors.textMuted}
                />
              </View>
              <View style={styles.personInfo}>
                <Text style={styles.personRole}>Assigned Staff</Text>
                {assignedTo ? (
                  <>
                    <Text style={styles.personName}>
                      {assignedTo?.username || assignedTo?.email}
                    </Text>
                    <Text style={styles.personSub}>
                      {assignedTo?.role || 'Staff'} {assignedTo?.phone ? `• ${assignedTo.phone}` : ''}
                    </Text>
                  </>
                ) : (
                  <Text style={styles.unassignedLabel}>Not yet assigned</Text>
                )}
              </View>
            </View>
          </View>

          {/* Action Buttons */}
          <View style={styles.actionsContainer}>
            {canAssign && (
              <CustomButton
                title={assignedTo ? 'Reassign Staff' : 'Assign to Staff'}
                icon="person-add-outline"
                variant="outline"
                onPress={() => setAssignPickerVisible(true)}
                style={styles.actionButton}
              />
            )}

            {canChangeStatus && (
              <CustomButton
                title="Update Status"
                icon="sync-outline"
                variant="primary"
                onPress={() => setStatusPickerVisible(true)}
                style={styles.actionButton}
              />
            )}

            {canChangeStatus && status !== 'Closed' && (
              <CustomButton
                title="Mark as Closed"
                icon="checkmark-circle-outline"
                variant="success"
                loading={updating}
                onPress={() => handleUpdateStatus('Closed')}
                style={styles.actionButton}
              />
            )}
          </View>
        </ScrollView>

        {/* Status Picker Modal */}
        <ModalPicker
          visible={statusPickerVisible}
          onClose={() => setStatusPickerVisible(false)}
          onSelect={handleUpdateStatus}
          title="Update Ticket Status"
          options={statusOptions}
          selectedValue={status}
        />

        {/* Assign User Modal */}
        <ModalPicker
          visible={assignPickerVisible}
          onClose={() => setAssignPickerVisible(false)}
          onSelect={handleAssignUser}
          title="Assign Staff Member"
          options={userOptions}
          selectedValue={assignedTo?._id || assignedTo}
          searchPlaceholder="Search staff by name or dept..."
        />

        {/* Full Image Modal */}
        <Modal
          visible={fullImageVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setFullImageVisible(false)}
        >
          <View style={styles.fullImageOverlay}>
            <TouchableOpacity
              style={styles.fullImageClose}
              onPress={() => setFullImageVisible(false)}
            >
              <Ionicons name="close" size={28} color="#FFFFFF" />
            </TouchableOpacity>
            {imageUrl ? (
              <Image
                source={{ uri: imageUrl }}
                style={styles.fullImage}
                resizeMode="contain"
              />
            ) : null}
          </View>
        </Modal>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  topBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 50,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backButton: {
    padding: 6,
  },
  topBarTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 40,
  },
  mainCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  statusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  ticketLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.5,
  },
  ticketId: {
    fontSize: 18,
    fontWeight: '800',
    color: colors.textPrimary,
    marginTop: 2,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 14,
  },
  timeline: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
  },
  timelineStep: {
    alignItems: 'center',
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginBottom: 4,
  },
  stepText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  stepLine: {
    flex: 1,
    height: 2,
    backgroundColor: '#E2E8F0',
    marginHorizontal: 8,
    marginBottom: 16,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  infoRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  infoCol: {
    flex: 1,
  },
  infoLabel: {
    fontSize: 12,
    color: colors.textMuted,
    fontWeight: '500',
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  infoValueSmall: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.textSecondary,
  },
  remarksBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 12,
    marginTop: 4,
  },
  remarksText: {
    fontSize: 14,
    color: colors.textPrimary,
    lineHeight: 20,
    marginTop: 4,
  },
  attachmentImage: {
    width: '100%',
    height: 200,
    borderRadius: 12,
  },
  zoomHint: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  zoomText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 4,
  },
  personRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: colors.primarySoft,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  personInfo: {
    flex: 1,
  },
  personRole: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textMuted,
  },
  personName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 1,
  },
  personSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 1,
  },
  unassignedLabel: {
    fontSize: 14,
    color: colors.textMuted,
    fontStyle: 'italic',
    marginTop: 2,
  },
  personDivider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 12,
  },
  actionsContainer: {
    gap: 12,
    marginTop: 4,
  },
  actionButton: {
    marginVertical: 2,
  },
  fullImageOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  fullImageClose: {
    position: 'absolute',
    top: 50,
    right: 20,
    zIndex: 10,
    padding: 8,
  },
  fullImage: {
    width: '95%',
    height: '80%',
  },
});
