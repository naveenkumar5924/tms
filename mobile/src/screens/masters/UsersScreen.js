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
import { userService, departmentService, programmeService } from '../../services/api';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';
import { ModalPicker } from '../../components/ModalPicker';

const userRoles = [
  'SuperAdmin',
  'User',
  'Networking Staff',
  'Plumber',
  'Electrician',
  'Software Developer',
  'Application',
  'PC Hardware',
];

export const UsersScreen = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('All');

  // Form modal
  const [modalVisible, setModalVisible] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('User');
  const [deptId, setDeptId] = useState('');
  const [deptName, setDeptName] = useState('');
  const [progId, setProgId] = useState('');
  const [progName, setProgName] = useState('');

  const [rolePickerVisible, setRolePickerVisible] = useState(false);
  const [deptPickerVisible, setDeptPickerVisible] = useState(false);
  const [progPickerVisible, setProgPickerVisible] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState('');

  const fetchData = async () => {
    try {
      setLoading(true);
      const [uRes, dRes, pRes] = await Promise.all([
        userService.getAll(),
        departmentService.getAll(),
        programmeService.getAll(),
      ]);
      setUsers(Array.isArray(uRes) ? uRes : []);
      setDepartments(Array.isArray(dRes) ? dRes : []);
      setProgrammes(Array.isArray(pRes) ? pRes : []);
    } catch (err) {
      Alert.alert('Error', 'Failed to fetch users data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const openAddModal = () => {
    setEditingUser(null);
    setUsername('');
    setEmail('');
    setPhone('');
    setPassword('');
    setRole('User');
    setDeptId('');
    setDeptName('');
    setProgId('');
    setProgName('');
    setFormError('');
    setModalVisible(true);
  };

  const openEditModal = (u) => {
    setEditingUser(u);
    setUsername(u.username || '');
    setEmail(u.email || '');
    setPhone(u.phone || '');
    setPassword(''); // leave blank if keeping same password
    setRole(u.role || 'User');

    const currentDeptId = u.department?._id || u.department || '';
    setDeptId(currentDeptId);
    const d = departments.find((dep) => dep._id === currentDeptId);
    setDeptName(d?.name || u.department?.name || '');

    const currentProgId = u.programme?._id || u.programme || '';
    setProgId(currentProgId);
    const p = programmes.find((pr) => pr._id === currentProgId);
    setProgName(p?.name || u.programme?.name || '');

    setFormError('');
    setModalVisible(true);
  };

  const handleSave = async () => {
    if (!username.trim()) {
      setFormError('Username is required');
      return;
    }
    if (!email.trim()) {
      setFormError('Email address is required');
      return;
    }
    if (!editingUser && !password.trim()) {
      setFormError('Password is required for new user');
      return;
    }

    try {
      setSubmitting(true);
      setFormError('');

      const payload = {
        username: username.trim(),
        email: email.trim(),
        phone: phone.trim(),
        role,
        department: deptId || undefined,
        programme: progId || undefined,
      };

      if (password.trim()) {
        payload.password = password.trim();
      }

      if (editingUser) {
        await userService.update(editingUser._id, payload);
      } else {
        await userService.create(payload);
      }

      setModalVisible(false);
      fetchData();
    } catch (err) {
      setFormError(err.message || 'Failed to save user');
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (u) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user "${u.username}" (${u.email})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await userService.delete(u._id);
              fetchData();
            } catch (err) {
              Alert.alert('Error', err.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const filtered = users.filter((u) => {
    if (roleFilter !== 'All' && u.role !== roleFilter) return false;

    if (!search.trim()) return true;
    const q = search.toLowerCase();
    const uname = (u.username || '').toLowerCase();
    const uemail = (u.email || '').toLowerCase();
    const urole = (u.role || '').toLowerCase();
    const udept = (u.department?.name || '').toLowerCase();

    return (
      uname.includes(q) ||
      uemail.includes(q) ||
      urole.includes(q) ||
      udept.includes(q)
    );
  });

  const deptOptions = [
    { label: 'None', value: '' },
    ...departments.map((d) => ({
      label: d.name,
      value: d._id,
      subtitle: d.shortName,
    })),
  ];

  const progOptions = [
    { label: 'None', value: '' },
    ...programmes.map((p) => ({
      label: p.name,
      value: p._id,
      subtitle: p.shortName,
    })),
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Users & Staff</Text>
        <TouchableOpacity onPress={openAddModal} style={styles.addBtn}>
          <Ionicons name="add" size={22} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by name, email or role..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
      </View>

      {/* Role filter chips */}
      <View style={{ marginBottom: 6 }}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={['All', ...userRoles]}
          keyExtractor={(r) => r}
          contentContainerStyle={{ paddingHorizontal: 16, gap: 8, paddingBottom: 6 }}
          renderItem={({ item }) => {
            const active = roleFilter === item;
            return (
              <TouchableOpacity
                onPress={() => setRoleFilter(item)}
                style={[styles.roleChip, active && styles.activeRoleChip]}
              >
                <Text style={[styles.roleChipText, active && styles.activeRoleChipText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
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
              <Ionicons name="people-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No users found</Text>
              <Text style={styles.emptySub}>Tap '+' above to add a staff or user account.</Text>
            </View>
          }
          renderItem={({ item }) => (
            <View style={[styles.card, shadows.card]}>
              <View style={styles.avatar}>
                <Ionicons
                  name={
                    item.role === 'SuperAdmin'
                      ? 'shield-checkmark'
                      : item.role === 'User'
                      ? 'person'
                      : 'construct'
                  }
                  size={20}
                  color={item.role === 'SuperAdmin' ? '#DC2626' : colors.primary}
                />
              </View>

              <View style={styles.cardMain}>
                <View style={styles.row}>
                  <Text style={styles.userName}>{item.username}</Text>
                  <View style={[
                    styles.roleBadge,
                    item.role === 'SuperAdmin' && { backgroundColor: '#FEE2E2' },
                    item.role !== 'User' && item.role !== 'SuperAdmin' && { backgroundColor: '#F3E8FF' },
                  ]}>
                    <Text style={[
                      styles.roleText,
                      item.role === 'SuperAdmin' && { color: '#DC2626' },
                      item.role !== 'User' && item.role !== 'SuperAdmin' && { color: '#7E22CE' },
                    ]}>
                      {item.role}
                    </Text>
                  </View>
                </View>

                <Text style={styles.userEmail}>{item.email}</Text>
                {item.department?.name ? (
                  <View style={styles.deptRow}>
                    <Ionicons name="business-outline" size={12} color={colors.textMuted} />
                    <Text style={styles.deptText}>{item.department.name}</Text>
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
                {editingUser ? 'Edit User' : 'Add New User'}
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

            <FlatList
              showsVerticalScrollIndicator={false}
              data={[1]}
              keyExtractor={() => 'form'}
              renderItem={() => (
                <View>
                  <CustomInput
                    label="Username *"
                    value={username}
                    onChangeText={setUsername}
                    placeholder="e.g. john_doe"
                    icon="person-outline"
                  />

                  <CustomInput
                    label="Email Address *"
                    value={email}
                    onChangeText={setEmail}
                    placeholder="e.g. john@university.edu"
                    icon="mail-outline"
                    keyboardType="email-address"
                    autoCapitalize="none"
                  />

                  <CustomInput
                    label="Phone Number"
                    value={phone}
                    onChangeText={setPhone}
                    placeholder="e.g. +91 9876543210"
                    icon="call-outline"
                    keyboardType="phone-pad"
                  />

                  <CustomInput
                    label={editingUser ? 'New Password (Leave blank to keep)' : 'Password *'}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Enter password"
                    icon="lock-closed-outline"
                    secureTextEntry
                  />

                  <Text style={styles.label}>Role *</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setRolePickerVisible(true)}
                    style={styles.selectBtn}
                  >
                    <Ionicons name="shield-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={styles.selectText}>{role}</Text>
                    <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  <Text style={styles.label}>Department</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setDeptPickerVisible(true)}
                    style={styles.selectBtn}
                  >
                    <Ionicons name="business-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={[styles.selectText, !deptName && styles.placeholderText]}>
                      {deptName || 'Select Department (Optional)'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  <Text style={styles.label}>Programme</Text>
                  <TouchableOpacity
                    activeOpacity={0.8}
                    onPress={() => setProgPickerVisible(true)}
                    style={styles.selectBtn}
                  >
                    <Ionicons name="school-outline" size={20} color={colors.primary} style={{ marginRight: 10 }} />
                    <Text style={[styles.selectText, !progName && styles.placeholderText]}>
                      {progName || 'Select Programme (Optional)'}
                    </Text>
                    <Ionicons name="chevron-down" size={18} color={colors.textMuted} />
                  </TouchableOpacity>

                  <View style={styles.modalBtnRow}>
                    <CustomButton
                      title="Cancel"
                      variant="outline"
                      onPress={() => setModalVisible(false)}
                      style={{ flex: 1, marginRight: 10 }}
                    />
                    <CustomButton
                      title={editingUser ? 'Update' : 'Create User'}
                      onPress={handleSave}
                      loading={submitting}
                      style={{ flex: 1 }}
                    />
                  </View>
                </View>
              )}
            />
          </View>
        </KeyboardAvoidingView>
      </Modal>

      {/* Role Picker */}
      <ModalPicker
        visible={rolePickerVisible}
        onClose={() => setRolePickerVisible(false)}
        title="Select User Role"
        options={userRoles}
        selectedValue={role}
        onSelect={(val) => setRole(val)}
      />

      {/* Dept Picker */}
      <ModalPicker
        visible={deptPickerVisible}
        onClose={() => setDeptPickerVisible(false)}
        title="Select Department"
        options={deptOptions}
        selectedValue={deptId}
        onSelect={(val, item) => {
          setDeptId(val);
          setDeptName(item.label === 'None' ? '' : item.label);
        }}
      />

      {/* Prog Picker */}
      <ModalPicker
        visible={progPickerVisible}
        onClose={() => setProgPickerVisible(false)}
        title="Select Programme"
        options={progOptions}
        selectedValue={progId}
        onSelect={(val, item) => {
          setProgId(val);
          setProgName(item.label === 'None' ? '' : item.label);
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
    marginVertical: 10,
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
  roleChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 18,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeRoleChip: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  roleChipText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeRoleChipText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 30,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  cardMain: {
    flex: 1,
    marginRight: 8,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 2,
    flexWrap: 'wrap',
  },
  userName: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
    marginRight: 8,
  },
  roleBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  roleText: {
    fontSize: 10,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  userEmail: {
    fontSize: 13,
    color: colors.textSecondary,
  },
  deptRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 3,
  },
  deptText: {
    fontSize: 11,
    color: colors.textMuted,
    marginLeft: 4,
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
    maxHeight: '90%',
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
    marginTop: 14,
    marginBottom: 20,
  },
});
