import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { colors, shadows } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import {
  departmentService,
  blockService,
  roomService,
  complaintService,
} from '../../services/api';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { ModalPicker } from '../../components/ModalPicker';

const complaintTypes = [
  'PC Hardware',
  'PC Software',
  'Application Issues',
  'Network',
  'Electronics',
  'Plumbing',
  'Other',
];

export const CreateComplaintScreen = ({ navigation }) => {
  const { user } = useContext(AuthContext);

  // Form State
  const [departmentId, setDepartmentId] = useState('');
  const [selectedDeptName, setSelectedDeptName] = useState('');
  const [blockId, setBlockId] = useState('');
  const [selectedBlockName, setSelectedBlockName] = useState('');
  const [roomId, setRoomId] = useState('');
  const [customRoomNumber, setCustomRoomNumber] = useState('');
  const [selectedRoomNumber, setSelectedRoomNumber] = useState('');
  const [complaintType, setComplaintType] = useState(complaintTypes[0]);
  const [remarks, setRemarks] = useState('');
  const [attachment, setAttachment] = useState(null);

  // Data lists
  const [departments, setDepartments] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [rooms, setRooms] = useState([]);

  // Modal pickers
  const [deptPickerVisible, setDeptPickerVisible] = useState(false);
  const [blockPickerVisible, setBlockPickerVisible] = useState(false);
  const [roomPickerVisible, setRoomPickerVisible] = useState(false);
  const [typePickerVisible, setTypePickerVisible] = useState(false);

  // Loaders & Errors
  const [loadingData, setLoadingData] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  // 1. Fetch departments on mount
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const resp = await departmentService.getAll();
        const list = Array.isArray(resp) ? resp : [];
        setDepartments(list);
      } catch (err) {
        setError('Failed to load departments');
      } finally {
        setLoadingData(false);
      }
    };
    fetchDepartments();
  }, []);

  // 2. Fetch blocks when department changes
  useEffect(() => {
    if (!departmentId) {
      setBlocks([]);
      setBlockId('');
      setSelectedBlockName('');
      return;
    }

    const fetchBlocks = async () => {
      try {
        const resp = await blockService.getAll({ departmentId });
        const list = Array.isArray(resp) ? resp : [];
        setBlocks(list);
      } catch (err) {
        console.warn('Failed to fetch blocks:', err);
      }
    };

    fetchBlocks();
    setBlockId('');
    setSelectedBlockName('');
    setRoomId('');
    setSelectedRoomNumber('');
    setRooms([]);
  }, [departmentId]);

  // 3. Fetch rooms when block changes
  useEffect(() => {
    if (!blockId) {
      setRooms([]);
      setRoomId('');
      setSelectedRoomNumber('');
      return;
    }

    const fetchRooms = async () => {
      try {
        const resp = await roomService.getAll({ blockId });
        const list = Array.isArray(resp) ? resp : [];
        setRooms(list);
      } catch (err) {
        console.warn('Failed to fetch rooms:', err);
      }
    };

    fetchRooms();
    setRoomId('');
    setSelectedRoomNumber('');
  }, [blockId]);

  // Image Picker options: Camera or Library
  const handlePickImage = async (fromCamera = false) => {
    try {
      const permissionResult = fromCamera
        ? await ImagePicker.requestCameraPermissionsAsync()
        : await ImagePicker.requestMediaLibraryPermissionsAsync();

      if (!permissionResult.granted) {
        Alert.alert(
          'Permission required',
          'Please allow permission to select photos for ticket attachments.'
        );
        return;
      }

      const result = fromCamera
        ? await ImagePicker.launchCameraAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            allowsEditing: true,
          })
        : await ImagePicker.launchImageLibraryAsync({
            mediaTypes: ['images'],
            quality: 0.7,
            allowsEditing: true,
          });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        setAttachment(result.assets[0]);
      }
    } catch (err) {
      Alert.alert('Error', 'Failed to pick image');
    }
  };

  const showImageSourceAlert = () => {
    Alert.alert('Attach Photo', 'Choose source:', [
      { text: 'Take Photo', onPress: () => handlePickImage(true) },
      { text: 'Choose from Gallery', onPress: () => handlePickImage(false) },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // Form Submit
  const handleSubmit = async () => {
    setError('');

    const finalRoom =
      roomId === '__manual__' ? customRoomNumber.trim() : selectedRoomNumber;

    if (!departmentId) {
      setError('Please select a department');
      return;
    }
    if (!blockId) {
      setError('Please select a block');
      return;
    }
    if (!finalRoom) {
      setError('Please select or specify a room number');
      return;
    }
    if (!remarks.trim()) {
      setError('Please enter a description or remarks for the issue');
      return;
    }

    try {
      setSubmitting(true);

      const formData = new FormData();
      formData.append('departmentName', selectedDeptName);
      formData.append('blockName', selectedBlockName);
      formData.append('roomNumber', finalRoom);
      formData.append('complaintType', complaintType);
      formData.append('remarks', remarks.trim());

      if (user?.id || user?._id) {
        formData.append('userId', user.id || user._id);
      }

      if (attachment) {
        const uri = attachment.uri;
        const uriParts = uri.split('/');
        const fileName = uriParts[uriParts.length - 1] || 'photo.jpg';
        const fileType = attachment.mimeType || 'image/jpeg';

        formData.append('attachment', {
          uri: Platform.OS === 'ios' ? uri.replace('file://', '') : uri,
          name: fileName,
          type: fileType,
        });
      }

      await complaintService.create(formData);

      Alert.alert(
        'Success',
        'Your complaint has been successfully registered!',
        [
          {
            text: 'View Tickets',
            onPress: () => {
              navigation.navigate('ComplaintsTab');
            },
          },
        ]
      );
    } catch (err) {
      setError(err.message || 'Failed to submit complaint');
    } finally {
      setSubmitting(false);
    }
  };

  // Options mapping
  const deptOptions = departments.map((d) => ({
    label: d.name,
    value: d._id,
    subtitle: d.shortName,
  }));

  const blockOptions = blocks.map((b) => ({
    label: b.name,
    value: b._id,
    subtitle: b.code || '',
  }));

  const roomOptions = [
    ...rooms.map((r) => ({
      label: `Room ${r.roomNumber}`,
      value: r._id,
      subtitle: r.floor ? `Floor: ${r.floor}` : '',
      roomNumber: r.roomNumber,
    })),
    {
      label: 'Other (Enter manually)',
      value: '__manual__',
      subtitle: 'Type custom room code',
      roomNumber: '__manual__',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Raise Complaint</Text>
          <View style={{ width: 40 }} />
        </View>

        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {error ? (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          {/* Form Card */}
          <View style={[styles.formCard, shadows.card]}>
            <Text style={styles.formSectionTitle}>Location Information</Text>

            {/* Department Picker */}
            <Text style={styles.label}>Department *</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setDeptPickerVisible(true)}
              style={styles.selectBtn}
            >
              <Ionicons
                name="business-outline"
                size={20}
                color={colors.primary}
                style={styles.selectIcon}
              />
              <Text
                style={[
                  styles.selectText,
                  !selectedDeptName && styles.placeholderText,
                ]}
              >
                {selectedDeptName || 'Select Department'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Block Picker */}
            <Text style={styles.label}>Block *</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!departmentId}
              onPress={() => setBlockPickerVisible(true)}
              style={[styles.selectBtn, !departmentId && styles.disabledBtn]}
            >
              <Ionicons
                name="cube-outline"
                size={20}
                color={departmentId ? colors.primary : colors.textMuted}
                style={styles.selectIcon}
              />
              <Text
                style={[
                  styles.selectText,
                  !selectedBlockName && styles.placeholderText,
                ]}
              >
                {!departmentId
                  ? 'Select department first'
                  : selectedBlockName || 'Select Block'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Room Picker */}
            <Text style={styles.label}>Room Number *</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              disabled={!blockId}
              onPress={() => setRoomPickerVisible(true)}
              style={[styles.selectBtn, !blockId && styles.disabledBtn]}
            >
              <Ionicons
                name="key-outline"
                size={20}
                color={blockId ? colors.primary : colors.textMuted}
                style={styles.selectIcon}
              />
              <Text
                style={[
                  styles.selectText,
                  !selectedRoomNumber && styles.placeholderText,
                ]}
              >
                {!blockId
                  ? 'Select block first'
                  : roomId === '__manual__'
                  ? 'Custom Room'
                  : selectedRoomNumber
                  ? `Room ${selectedRoomNumber}`
                  : 'Select Room'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {roomId === '__manual__' && (
              <CustomInput
                label="Enter Room Number *"
                value={customRoomNumber}
                onChangeText={setCustomRoomNumber}
                placeholder="e.g. Lab 304 or Staff Room B"
                icon="create-outline"
              />
            )}

            <View style={styles.divider} />
            <Text style={styles.formSectionTitle}>Issue Details</Text>

            {/* Complaint Type */}
            <Text style={styles.label}>Complaint Category *</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setTypePickerVisible(true)}
              style={styles.selectBtn}
            >
              <Ionicons
                name="construct-outline"
                size={20}
                color={colors.primary}
                style={styles.selectIcon}
              />
              <Text style={styles.selectText}>{complaintType}</Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            {/* Description / Remarks */}
            <CustomInput
              label="Description of the Issue *"
              value={remarks}
              onChangeText={setRemarks}
              placeholder="Describe the problem in detail (e.g. PC not powering on, leak under sink, etc.)"
              icon="document-text-outline"
              multiline
              numberOfLines={4}
            />

            {/* Image Attachment */}
            <Text style={styles.label}>Photo Attachment (Optional)</Text>
            {attachment ? (
              <View style={styles.imagePreviewContainer}>
                <Image
                  source={{ uri: attachment.uri }}
                  style={styles.previewImage}
                />
                <TouchableOpacity
                  onPress={() => setAttachment(null)}
                  style={styles.removeImageBtn}
                >
                  <Ionicons name="trash-outline" size={18} color="#FFFFFF" />
                </TouchableOpacity>
              </View>
            ) : (
              <TouchableOpacity
                activeOpacity={0.8}
                onPress={showImageSourceAlert}
                style={styles.uploadBox}
              >
                <View style={styles.uploadIconBadge}>
                  <Ionicons name="camera-outline" size={26} color={colors.primary} />
                </View>
                <Text style={styles.uploadTitle}>Take a photo or upload</Text>
                <Text style={styles.uploadSub}>
                  Help technicians diagnose the issue faster
                </Text>
              </TouchableOpacity>
            )}

            {/* Submit Button */}
            <CustomButton
              title="Submit Complaint"
              onPress={handleSubmit}
              loading={submitting}
              icon="checkmark-circle-outline"
              style={{ marginTop: 24 }}
            />
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Department Picker */}
      <ModalPicker
        visible={deptPickerVisible}
        onClose={() => setDeptPickerVisible(false)}
        title="Select Department"
        options={deptOptions}
        selectedValue={departmentId}
        onSelect={(val, item) => {
          setDepartmentId(val);
          setSelectedDeptName(item.label);
        }}
      />

      {/* Block Picker */}
      <ModalPicker
        visible={blockPickerVisible}
        onClose={() => setBlockPickerVisible(false)}
        title="Select Block"
        options={blockOptions}
        selectedValue={blockId}
        onSelect={(val, item) => {
          setBlockId(val);
          setSelectedBlockName(item.label);
        }}
      />

      {/* Room Picker */}
      <ModalPicker
        visible={roomPickerVisible}
        onClose={() => setRoomPickerVisible(false)}
        title="Select Room"
        options={roomOptions}
        selectedValue={roomId}
        onSelect={(val, item) => {
          setRoomId(val);
          if (val === '__manual__') {
            setSelectedRoomNumber('');
          } else {
            setSelectedRoomNumber(item.roomNumber || item.label);
          }
        }}
      />

      {/* Type Picker */}
      <ModalPicker
        visible={typePickerVisible}
        onClose={() => setTypePickerVisible(false)}
        title="Select Category"
        options={complaintTypes}
        selectedValue={complaintType}
        onSelect={(val) => setComplaintType(val)}
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  backButton: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.danger,
    fontSize: 13,
    marginLeft: 8,
    flex: 1,
  },
  formCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  formSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 14,
  },
  divider: {
    height: 1,
    backgroundColor: '#F1F5F9',
    marginVertical: 18,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textPrimary,
    marginBottom: 6,
  },
  selectBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderWidth: 1.5,
    borderColor: colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 48,
    marginBottom: 16,
  },
  disabledBtn: {
    backgroundColor: '#F8FAFC',
    borderColor: '#E2E8F0',
  },
  selectIcon: {
    marginRight: 10,
  },
  selectText: {
    flex: 1,
    fontSize: 14,
    fontWeight: '500',
    color: colors.textPrimary,
  },
  placeholderText: {
    color: colors.textMuted,
    fontWeight: '400',
  },
  uploadBox: {
    borderWidth: 2,
    borderStyle: 'dashed',
    borderColor: '#CBD5E1',
    borderRadius: 16,
    paddingVertical: 24,
    alignItems: 'center',
    backgroundColor: '#FAFAFF',
  },
  uploadIconBadge: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  uploadTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  uploadSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  imagePreviewContainer: {
    position: 'relative',
    borderRadius: 16,
    overflow: 'hidden',
    height: 180,
    backgroundColor: '#F1F5F9',
  },
  previewImage: {
    width: '100%',
    height: '100%',
  },
  removeImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(239, 68, 68, 0.85)',
    width: 34,
    height: 34,
    borderRadius: 17,
    justifyContent: 'center',
    alignItems: 'center',
  },
});
