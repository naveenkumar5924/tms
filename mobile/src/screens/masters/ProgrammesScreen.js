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
import { programmeService, departmentService } from '../../services/api';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { ModalPicker } from '../../components/ModalPicker';

export const ProgrammesScreen = ({ navigation }) => {
  const [programmes, setProgrammes] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingProg, setEditingProg] = useState(null);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [deptId, setDeptId] = useState('');
  const [deptName, setDeptName] = useState('');
  const [description, setDescription] = useState('');
  const [deptPickerVisible, setDeptPickerVisible] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [progRes, deptRes] = await Promise.all([
        programmeService.getAll(),
        departmentService.getAll(),
      ]);
      setProgrammes(Array.isArray(progRes) ? progRes : []);
      setDepartments(Array.isArray(deptRes) ? deptRes : []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch programmes');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingProg(null);
    setName('');
    setShortName('');
    setDeptId('');
    setDeptName('');
    setDescription('');
    setFormError('');
    setModalVisible(true);
  };

  const openEditModal = (prog) => {
    setEditingProg(prog);
    setName(prog.name || '');
    setShortName(prog.shortName || '');
    const currentDeptId = prog.department?._id || prog.department || '';
    setDeptId(currentDeptId);
    const d = departments.find((dep) => dep._id === currentDeptId);
    setDeptName(d?.name || prog.department?.name || '');
    setDescription(prog.description || '');
    setFormError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError('Programme name is required');
      return;
    }
    const shortLen = shortName.trim().length;
    if (shortLen < 2 || shortLen > 8) {
      setFormError('Short name must be between 2 and 8 characters');
      return;
    }
    if (!deptId) {
      setFormError('Please select a department');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      const payload = {
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
        department: deptId,
        description: description.trim(),
      };

      if (editingProg) {
        await programmeService.update(editingProg._id, payload);
      } else {
        await programmeService.create(payload);
      }

      setModalVisible(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save programme');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (prog) => {
    Alert.alert(
      'Delete Programme',
      `Are you sure you want to delete "${prog.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await programmeService.delete(prog._id);
              fetchData();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const filtered = programmes.filter((p) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const dName = p.department?.name || '';
    return (
      (p.name || '').toLowerCase().includes(q) ||
      (p.shortName || '').toLowerCase().includes(q) ||
      dName.toLowerCase().includes(q)
    );
  });

  const deptOptions = departments.map((d) => ({
    label: d.name,
    value: d._id,
    subtitle: d.shortName,
  }));

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Programmes</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* Search */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search programmes or departments..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
      </View>

      {/* List */}
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
              <Ionicons name="school-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No programmes found</Text>
              <Text style={styles.emptySub}>Tap '+' above to create a programme.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, shadows.card]}>
              <View style={styles.cardMain}>
                <View style={styles.cardHeader}>
                  <Text style={styles.cardTitle}>{item.name}</Text>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{item.shortName || 'N/A'}</Text>
                  </View>
                </View>

                <View style={styles.deptBadge}>
                  <Ionicons name="business-outline" size={13} color={colors.textSecondary} />
                  <Text style={styles.deptText}>
                    {item.department?.name || 'Department'}
                  </Text>
                </View>

                {item.description ? (
                  <Text style={styles.descText}>{item.description}</Text>
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
                {editingProg ? 'Edit Programme' : 'Add Programme'}
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
              label="Programme Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. B.Tech Artificial Intelligence"
              icon="school-outline"
            />

            <CustomInput
              label="Short Name / Code (2-8 chars) *"
              value={shortName}
              onChangeText={setShortName}
              placeholder="e.g. BTECH-AI"
              icon="barcode-outline"
              autoCapitalize="characters"
            />

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
                style={{ marginRight: 10 }}
              />
              <Text style={[styles.selectText, !deptName && styles.placeholderText]}>
                {deptName || 'Select Department'}
              </Text>
              <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <CustomInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Brief details"
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
                title={editingProg ? 'Update' : 'Create'}
                onPress={handleSave}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Dept Picker */}
      <ModalPicker
        visible={deptPickerVisible}
        onClose={() => setDeptPickerVisible(false)}
        title="Select Department"
        options={deptOptions}
        selectedValue={deptId}
        onSelect={(val, item) => {
          setDeptId(val);
          setDeptName(item.label);
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
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
    flex: 1,
  },
  codeBadge: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0284C7',
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
    marginBottom: 4,
  },
  deptText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginLeft: 4,
  },
  descText: {
    fontSize: 13,
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
