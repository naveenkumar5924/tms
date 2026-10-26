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
import { departmentService } from '../../services/api';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export const DepartmentsScreen = ({ navigation }) => {
  const [departments, setDepartments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingDept, setEditingDept] = useState(null);
  const [name, setName] = useState('');
  const [shortName, setShortName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await departmentService.getAll();
      setDepartments(Array.isArray(res) ? res : []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch departments');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const openAddModal = () => {
    setEditingDept(null);
    setName('');
    setShortName('');
    setDescription('');
    setFormError('');
    setModalVisible(true);
  };

  const openEditModal = (dept) => {
    setEditingDept(dept);
    setName(dept.name || '');
    setShortName(dept.shortName || '');
    setDescription(dept.description || '');
    setFormError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError('Department name is required');
      return;
    }
    const shortLen = shortName.trim().length;
    if (shortLen < 2 || shortLen > 8) {
      setFormError('Short name must be between 2 and 8 characters');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');
      const payload = {
        name: name.trim(),
        shortName: shortName.trim().toUpperCase(),
        description: description.trim(),
      };

      if (editingDept) {
        await departmentService.update(editingDept._id, payload);
      } else {
        await departmentService.create(payload);
      }

      setModalVisible(false);
      fetchDepartments();
    } catch (err) {
      setFormError(err.message || 'Failed to save department');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (dept) => {
    Alert.alert(
      'Delete Department',
      `Are you sure you want to delete "${dept.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await departmentService.delete(dept._id);
              fetchDepartments();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const filtered = departments.filter((d) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (d.name || '').toLowerCase().includes(q) ||
      (d.shortName || '').toLowerCase().includes(q) ||
      (d.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Departments</Text>
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
          placeholder="Search departments..."
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
              <Ionicons name="business-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No departments found</Text>
              <Text style={styles.emptySub}>Tap '+' above to add your first department.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.deptCard, shadows.card]}>
              <View style={styles.deptMain}>
                <View style={styles.deptHeader}>
                  <Text style={styles.deptName}>{item.name}</Text>
                  <View style={styles.codeBadge}>
                    <Text style={styles.codeText}>{item.shortName || 'N/A'}</Text>
                  </View>
                </View>
                {item.description ? (
                  <Text style={styles.deptDesc}>{item.description}</Text>
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
                {editingDept ? 'Edit Department' : 'Add Department'}
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
              label="Department Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Computer Science & Engineering"
              icon="business-outline"
            />

            <CustomInput
              label="Short Name / Code (2-8 chars) *"
              value={shortName}
              onChangeText={setShortName}
              placeholder="e.g. CSE"
              icon="barcode-outline"
              autoCapitalize="characters"
            />

            <CustomInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Brief department details"
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
                title={editingDept ? 'Update' : 'Create'}
                onPress={handleSave}
                loading={submitting}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
  deptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  deptMain: {
    flex: 1,
    marginRight: 10,
  },
  deptHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  deptName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
    flex: 1,
  },
  codeBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  codeText: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.primary,
  },
  deptDesc: {
    fontSize: 13,
    color: colors.textSecondary,
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
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
});
