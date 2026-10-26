import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Modal,
  Alert,
  ActivityIndicator,
  TextInput,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import { roomService, blockService } from '../../services/api';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { ModalPicker } from '../../components/ModalPicker';

export const RoomsScreen = ({ navigation }) => {
  const [rooms, setRooms] = useState([]);
  const [blocks, setBlocks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRoom, setEditingRoom] = useState(null);
  const [roomNumber, setRoomNumber] = useState('');
  const [blockId, setBlockId] = useState('');
  const [blockName, setBlockName] = useState('');
  const [floor, setFloor] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');

  const [blockPickerVisible, setBlockPickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [roomRes, blockRes] = await Promise.all([
        roomService.getAll(),
        blockService.getAll(),
      ]);
      setRooms(Array.isArray(roomRes) ? roomRes : []);
      setBlocks(Array.isArray(blockRes) ? blockRes : []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch rooms data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingRoom(null);
    setRoomNumber('');
    setBlockId('');
    setBlockName('');
    setFloor('');
    setCapacity('');
    setDescription('');
    setFormError('');
    setModalVisible(true);
  };

  const openEditModal = (r) => {
    setEditingRoom(r);
    setRoomNumber(r.roomNumber || '');
    const currentBlockId = r.block?._id || r.block || '';
    setBlockId(currentBlockId);
    const b = blocks.find((blk) => blk._id === currentBlockId);
    setBlockName(b?.name || r.block?.name || '');
    setFloor(r.floor ? String(r.floor) : '');
    setCapacity(r.capacity ? String(r.capacity) : '');
    setDescription(r.description || '');
    setFormError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!roomNumber.trim()) {
      setFormError('Room number is required');
      return;
    }
    if (!blockId) {
      setFormError('Please select a block');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      const payload = {
        roomNumber: roomNumber.trim(),
        block: blockId,
        floor: floor.trim(),
        capacity: capacity ? Number(capacity) : undefined,
        description: description.trim(),
      };

      if (editingRoom) {
        await roomService.update(editingRoom._id, payload);
      } else {
        await roomService.create(payload);
      }

      setModalVisible(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save room');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (r) => {
    Alert.alert(
      'Delete Room',
      `Are you sure you want to delete Room "${r.roomNumber}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await roomService.delete(r._id);
              fetchData();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const filtered = rooms.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const bName = r.block?.name || '';
    return (
      (r.roomNumber || '').toLowerCase().includes(q) ||
      bName.toLowerCase().includes(q) ||
      (r.floor || '').toLowerCase().includes(q)
    );
  });

  const blockOptions = blocks.map((b) => ({
    label: b.name,
    value: b._id,
    subtitle: b.department?.name || '',
  }));

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Rooms</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by room #, block, floor..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
      </View>

      {loading ? (
        <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 40 }} />
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="key-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No rooms found</Text>
              <Text style={styles.emptySub}>Tap '+' above to register a room.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, shadows.card]}>
              <View style={styles.cardMain}>
                <View style={styles.row}>
                  <Text style={styles.roomNum}>Room {item.roomNumber}</Text>
                  {item.floor ? (
                    <View style={styles.floorBadge}>
                      <Text style={styles.floorText}>Floor {item.floor}</Text>
                    </View>
                  ) : null}
                </View>

                <View style={styles.blockRow}>
                  <Ionicons name="cube-outline" size={13} color={colors.primary} />
                  <Text style={styles.blockText}>
                    {item.block?.name || 'Assigned Block'}
                  </Text>
                </View>

                {item.capacity ? (
                  <Text style={styles.capText}>Capacity: {item.capacity} seats</Text>
                ) : null}
              </View>

              <View style={styles.actionsRow}>
                <TouchableOpacity
                  onPress={() => openEditModal(item)}
                  style={[styles.actionBtn, styles.editBtn]}
                >
                  <Ionicons name="pencil-outline" size={16} color={colors.primary} />
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => handleDelete(item)}
                  style={[styles.actionBtn, styles.deleteBtn]}
                >
                  <Ionicons name="trash-outline" size={16} color={colors.danger} />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      {/* Add / Edit Modal */}
      <Modal visible={modalVisible} transparent animationType="slide">
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, shadows.lg]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>
                {editingRoom ? 'Edit Room' : 'Add Room'}
              </Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {formError ? (
              <View style={styles.formErrorBox}>
                <Ionicons name="alert-circle" size={16} color={colors.danger} />
                <Text style={styles.formErrorText}>{formError}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Room Number *"
              value={roomNumber}
              onChangeText={setRoomNumber}
              placeholder="e.g. 101, Lab-A, Seminar-1"
              icon="key-outline"
            />

            <Text style={styles.label}>Block *</Text>
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => setBlockPickerVisible(true)}
              style={styles.selectBtn}
            >
              <Ionicons
                name="cube-outline"
                size={20}
                color={colors.primary}
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.selectText, !blockName && styles.placeholderText]}>
                {blockName || 'Select Block'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="Floor"
                  value={floor}
                  onChangeText={setFloor}
                  placeholder="e.g. 1, 2, Ground"
                  icon="layers-outline"
                />
              </View>
              <View style={{ flex: 1 }}>
                <CustomInput
                  label="Capacity"
                  value={capacity}
                  onChangeText={setCapacity}
                  placeholder="e.g. 60"
                  icon="people-outline"
                  keyboardType="numeric"
                />
              </View>
            </View>

            <CustomInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Equipment, projector status, etc."
              icon="document-text-outline"
              multiline
            />

            <View style={styles.modalBtnRow}>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => setModalVisible(false)}
                style={{ flex: 1, marginRight: 10 }}
              />
              <CustomButton
                title={editingRoom ? 'Update' : 'Create'}
                onPress={handleSave}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Block Picker */}
      <ModalPicker
        visible={blockPickerVisible}
        onClose={() => setBlockPickerVisible(false)}
        title="Select Block"
        options={blockOptions}
        selectedValue={blockId}
        onSelect={(val, item) => {
          setBlockId(val);
          setBlockName(item.label);
        }}
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
  backBtn: {
    padding: 6,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  addBtn: {
    backgroundColor: colors.primary,
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginVertical: 12,
    paddingHorizontal: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: colors.border,
    height: 44,
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    color: colors.textPrimary,
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardMain: {
    flex: 1,
    marginRight: 10,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  roomNum: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
  },
  floorBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  floorText: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  blockRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 2,
  },
  blockText: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '600',
    marginLeft: 4,
  },
  capText: {
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 2,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  actionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
  },
  editBtn: {
    backgroundColor: '#EEF2FF',
  },
  deleteBtn: {
    backgroundColor: '#FEF2F2',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 10,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    paddingBottom: 36,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  formErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    padding: 10,
    borderRadius: 8,
    marginBottom: 14,
  },
  formErrorText: {
    color: colors.danger,
    fontSize: 12,
    marginLeft: 6,
    flex: 1,
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
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
});
