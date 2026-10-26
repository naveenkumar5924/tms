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
import { roleService } from '../../services/api';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export const RolesScreen = ({ navigation }) => {
  const [roles, setRoles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Form modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingRole, setEditingRole] = useState(null);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [permissions, setPermissions] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchRoles = async () => {
    try {
      setLoading(true);
      const res = await roleService.getAll();
      setRoles(Array.isArray(res) ? res : []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch roles');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRoles();
  }, []);

  const openAddModal = () => {
    setEditingRole(null);
    setName('');
    setDescription('');
    setPermissions('');
    setFormError('');
    setModalVisible(true);
  };

  const openEditModal = (r) => {
    setEditingRole(r);
    setName(r.name || '');
    setDescription(r.description || '');
    const permString = Array.isArray(r.permissions)
      ? r.permissions.join(', ')
      : r.permissions || '';
    setPermissions(permString);
    setFormError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!name.trim()) {
      setFormError('Role name is required');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const permArray = permissions
        .split(',')
        .map((p) => p.trim())
        .filter((p) => p);

      const payload = {
        name: name.trim(),
        description: description.trim(),
        permissions: permArray,
      };

      if (editingRole) {
        await roleService.update(editingRole._id, payload);
      } else {
        await roleService.create(payload);
      }

      setModalVisible(false);
      fetchRoles();
    } catch (err) {
      setFormError(err.message || 'Failed to save role');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (r) => {
    Alert.alert(
      'Delete Role',
      `Are you sure you want to delete role "${r.name}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await roleService.delete(r._id);
              fetchRoles();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete');
            }
          },
        },
      ]
    );
  };

  const filtered = roles.filter((r) => {
    if (!search.trim()) return true;
    const q = search.toLowerCase();
    return (
      (r.name || '').toLowerCase().includes(q) ||
      (r.description || '').toLowerCase().includes(q)
    );
  });

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>User Roles</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search roles..."
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
              <Ionicons name="shield-checkmark-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No roles found</Text>
              <Text style={styles.emptySub}>Tap '+' above to define a role.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, shadows.card]}>
              <View style={styles.cardMain}>
                <View style={styles.row}>
                  <Text style={styles.roleName}>{item.name}</Text>
                  {item.permissions && item.permissions.length > 0 ? (
                    <View style={styles.permBadge}>
                      <Text style={styles.permText}>
                        {item.permissions.length} perms
                      </Text>
                    </View>
                  ) : null}
                </View>

                {item.description ? (
                  <Text style={styles.descText}>{item.description}</Text>
                ) : null}

                {Array.isArray(item.permissions) && item.permissions.length > 0 ? (
                  <View style={styles.chipsRow}>
                    {item.permissions.slice(0, 3).map((perm, idx) => (
                      <View key={idx} style={styles.chip}>
                        <Text style={styles.chipText}>{perm}</Text>
                      </View>
                    ))}
                    {item.permissions.length > 3 && (
                      <Text style={styles.moreText}>
                        +{item.permissions.length - 3} more
                      </Text>
                    )}
                  </View>
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
                {editingRole ? 'Edit Role' : 'Add Role'}
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
              label="Role Name *"
              value={name}
              onChangeText={setName}
              placeholder="e.g. Electrician, PC Technician"
              icon="shield-outline"
            />

            <CustomInput
              label="Permissions (Comma separated)"
              value={permissions}
              onChangeText={setPermissions}
              placeholder="e.g. read:complaints, update:status"
              icon="key-outline"
            />

            <CustomInput
              label="Description (Optional)"
              value={description}
              onChangeText={setDescription}
              placeholder="Scope of work and responsibilities"
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
                title={editingRole ? 'Update' : 'Create'}
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
  roleName: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
  },
  permBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  permText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#D97706',
  },
  descText: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 6,
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    alignItems: 'center',
  },
  chip: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  chipText: {
    fontSize: 11,
    color: colors.textSecondary,
  },
  moreText: {
    fontSize: 11,
    color: colors.textMuted,
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
