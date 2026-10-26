import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  Alert,
  Modal,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export const ProfileScreen = ({ navigation }) => {
  const { user, logout, serverUrl, updateServerUrl, isSuperAdmin } = useContext(AuthContext);

  const [settingsVisible, setSettingsVisible] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState(serverUrl || '');

  const handleLogout = () => {
    Alert.alert('Sign Out', 'Are you sure you want to log out of TMS?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Sign Out',
        style: 'destructive',
        onPress: () => logout(),
      },
    ]);
  };

  const handleSaveServerUrl = async () => {
    try {
      await updateServerUrl(newServerUrl);
      setSettingsVisible(false);
      Alert.alert('Server Updated', `API endpoint set to: ${newServerUrl}`);
    } catch (e) {
      Alert.alert('Error', 'Failed to update server URL');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Account & Settings</Text>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Card */}
        <View style={[styles.profileCard, shadows.card]}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={36} color={colors.primary} />
          </View>
          <Text style={styles.username}>{user?.username || 'User'}</Text>
          <Text style={styles.email}>{user?.email || 'user@example.com'}</Text>

          <View style={styles.badgeRow}>
            <View style={styles.roleBadge}>
              <Ionicons name="shield-checkmark" size={13} color={colors.primaryDark} />
              <Text style={styles.roleText}>{user?.role || 'User'}</Text>
            </View>

            {user?.department?.name ? (
              <View style={styles.deptBadge}>
                <Ionicons name="business" size={13} color={colors.accent} />
                <Text style={styles.deptText}>{user.department.name}</Text>
              </View>
            ) : null}
          </View>
        </View>

        {/* User Details Details Section */}
        <View style={[styles.sectionCard, shadows.card]}>
          <Text style={styles.sectionTitle}>User Information</Text>

          <View style={styles.infoRow}>
            <Ionicons name="mail-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue}>{user?.email || '-'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="call-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Phone</Text>
              <Text style={styles.infoValue}>{user?.phone || 'Not provided'}</Text>
            </View>
          </View>

          <View style={styles.infoDivider} />

          <View style={styles.infoRow}>
            <Ionicons name="time-outline" size={18} color={colors.textSecondary} />
            <View style={styles.infoCol}>
              <Text style={styles.infoLabel}>Member Since</Text>
              <Text style={styles.infoValue}>
                {user?.createdAt
                  ? new Date(user.createdAt).toLocaleDateString()
                  : 'Active'}
              </Text>
            </View>
          </View>
        </View>

        {/* Server & Connectivity Settings */}
        <View style={[styles.sectionCard, shadows.card]}>
          <Text style={styles.sectionTitle}>Connectivity & Server</Text>

          <TouchableOpacity
            activeOpacity={0.7}
            onPress={() => {
              setNewServerUrl(serverUrl);
              setSettingsVisible(true);
            }}
            style={styles.actionRow}
          >
            <View style={styles.actionLeft}>
              <View style={[styles.actionIconBadge, { backgroundColor: '#EEF2FF' }]}>
                <Ionicons name="server-outline" size={18} color={colors.primary} />
              </View>
              <View>
                <Text style={styles.actionTitle}>Backend Server Endpoint</Text>
                <Text style={styles.actionSub} numberOfLines={1}>
                  {serverUrl}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        </View>

        {/* SuperAdmin shortcuts */}
        {isSuperAdmin && (
          <View style={[styles.sectionCard, shadows.card]}>
            <Text style={styles.sectionTitle}>SuperAdmin Shortcuts</Text>

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('MasterHub')}
              style={styles.actionRow}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconBadge, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="grid-outline" size={18} color="#16A34A" />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Master Data Hub</Text>
                  <Text style={styles.actionSub}>Depts, Blocks, Rooms, Roles, Users</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>

            <View style={styles.infoDivider} />

            <TouchableOpacity
              activeOpacity={0.7}
              onPress={() => navigation.navigate('Reports')}
              style={styles.actionRow}
            >
              <View style={styles.actionLeft}>
                <View style={[styles.actionIconBadge, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="bar-chart-outline" size={18} color="#D97706" />
                </View>
                <View>
                  <Text style={styles.actionTitle}>Reports & Export</Text>
                  <Text style={styles.actionSub}>Download CSV audit reports</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={18} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          activeOpacity={0.8}
          onPress={handleLogout}
          style={[styles.logoutBtn, shadows.sm]}
        >
          <Ionicons name="log-out-outline" size={20} color={colors.danger} />
          <Text style={styles.logoutBtnText}>Sign Out</Text>
        </TouchableOpacity>

        <Text style={styles.versionText}>TMS Complaints Mobile • v1.0.0 (Expo SDK 58)</Text>
      </ScrollView>

      {/* Server Endpoint Edit Modal */}
      <Modal
        visible={settingsVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setSettingsVisible(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalOverlay}
        >
          <View style={[styles.modalSheet, shadows.lg]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Backend Server IP</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              To connect from a physical mobile device running Expo Go, enter your computer's local Wi-Fi IP address.
            </Text>

            <CustomInput
              label="API Base URL"
              value={newServerUrl}
              onChangeText={setNewServerUrl}
              placeholder="http://10.127.158.223:5000/api"
              icon="link-outline"
              autoCapitalize="none"
            />

            <View style={styles.modalBtnRow}>
              <CustomButton
                title="Cancel"
                variant="outline"
                onPress={() => setSettingsVisible(false)}
                style={{ flex: 1, marginRight: 10 }}
              />
              <CustomButton
                title="Save & Connect"
                onPress={handleSaveServerUrl}
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
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 14,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 40,
  },
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  avatar: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: '#EEF2FF',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  username: {
    fontSize: 20,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  email: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 2,
    marginBottom: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
    marginLeft: 4,
  },
  deptBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.accentSoft,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  deptText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.accent,
    marginLeft: 4,
  },
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
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
    alignItems: 'center',
  },
  infoCol: {
    marginLeft: 12,
    flex: 1,
  },
  infoLabel: {
    fontSize: 11,
    fontWeight: '500',
    color: colors.textMuted,
  },
  infoValue: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
    marginTop: 1,
  },
  infoDivider: {
    height: 1,
    backgroundColor: '#F8FAFC',
    marginVertical: 12,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  actionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 10,
  },
  actionIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  actionTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.textPrimary,
  },
  actionSub: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
    maxWidth: 220,
  },
  logoutBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: '#FEE2E2',
    marginTop: 8,
  },
  logoutBtnText: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.danger,
    marginLeft: 8,
  },
  versionText: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    marginTop: 20,
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
    marginBottom: 8,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 16,
    lineHeight: 18,
  },
  modalBtnRow: {
    flexDirection: 'row',
    marginTop: 12,
  },
});
