import React, { useState, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { CustomInput } from '../../components/CustomInput';
import { CustomButton } from '../../components/CustomButton';

export const LoginScreen = () => {
  const { login, serverUrl, updateServerUrl } = useContext(AuthContext);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Server settings modal
  const [settingsVisible, setSettingsVisible] = useState(false);
  const [newServerUrl, setNewServerUrl] = useState(serverUrl || '');

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please enter your email and password');
      return;
    }

    try {
      setError('');
      setLoading(true);
      await login(email.trim(), password);
    } catch (err) {
      setError(err.message || 'Login failed. Please check credentials.');
    } finally {
      setLoading(false);
    }
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

  // Demo user fast fill
  const setDemoCreds = (demoEmail, demoPass) => {
    setEmail(demoEmail);
    setPassword(demoPass);
    setError('');
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Top server settings icon */}
          <View style={styles.topBar}>
            <TouchableOpacity
              onPress={() => {
                setNewServerUrl(serverUrl);
                setSettingsVisible(true);
              }}
              style={styles.serverBtn}
            >
              <Ionicons name="server-outline" size={16} color={colors.primary} />
              <Text style={styles.serverBtnText}>Server IP</Text>
            </TouchableOpacity>
          </View>

          {/* Logo & Brand Header */}
          <View style={styles.brandContainer}>
            <View style={[styles.logoBadge, shadows.md]}>
              <Ionicons name="construct" size={38} color="#FFFFFF" />
            </View>
            <Text style={styles.appName}>TMS Complaints</Text>
            <Text style={styles.appTagline}>
              Complaint & Facilities Management System
            </Text>
          </View>

          {/* Form Card */}
          <View style={[styles.card, shadows.lg]}>
            <Text style={styles.cardTitle}>Sign In</Text>
            <Text style={styles.cardSubtitle}>
              Enter your credentials to continue
            </Text>

            {error ? (
              <View style={styles.errorBanner}>
                <Ionicons name="alert-circle" size={18} color={colors.danger} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <CustomInput
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="e.g. admin@example.com"
              icon="mail-outline"
              keyboardType="email-address"
              autoCapitalize="none"
            />

            <CustomInput
              label="Password"
              value={password}
              onChangeText={setPassword}
              placeholder="Enter your password"
              icon="lock-closed-outline"
              secureTextEntry
            />

            <CustomButton
              title="Sign In"
              onPress={handleLogin}
              loading={loading}
              icon="log-in-outline"
              style={{ marginTop: 8 }}
            />

            {/* Quick Demo Credentials */}
            <View style={styles.demoSection}>
              <Text style={styles.demoTitle}>QUICK DEMO FILL</Text>
              <View style={styles.demoPillsRow}>
                <TouchableOpacity
                  onPress={() => setDemoCreds('admin@example.com', 'Passw0rd!')}
                  style={styles.demoPill}
                >
                  <Ionicons name="shield-outline" size={13} color={colors.primary} />
                  <Text style={styles.demoPillText}>SuperAdmin</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDemoCreds('user@example.com', 'Passw0rd!')}
                  style={styles.demoPill}
                >
                  <Ionicons name="person-outline" size={13} color={colors.accent} />
                  <Text style={styles.demoPillText}>User</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => setDemoCreds('staff@example.com', 'Passw0rd!')}
                  style={styles.demoPill}
                >
                  <Ionicons name="build-outline" size={13} color="#9333EA" />
                  <Text style={styles.demoPillText}>Staff</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* Server Endpoint Modal */}
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
          <View style={[styles.modalContent, shadows.lg]}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Backend Server Configuration</Text>
              <TouchableOpacity onPress={() => setSettingsVisible(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalSubtitle}>
              When using Expo on your mobile device, enter your computer's local IP address (e.g. http://192.168.209.29:5000/api).
            </Text>

            <CustomInput
              label="API Base URL"
              value={newServerUrl}
              onChangeText={setNewServerUrl}
              placeholder="http://10.127.158.223:5000/api"
              icon="link-outline"
              autoCapitalize="none"
            />

            <View style={styles.modalActions}>
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
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: 20,
    paddingBottom: 30,
    justifyContent: 'center',
  },
  topBar: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingTop: 10,
    paddingBottom: 10,
  },
  serverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  serverBtnText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.primary,
    marginLeft: 6,
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 28,
  },
  logoBadge: {
    width: 76,
    height: 76,
    borderRadius: 22,
    backgroundColor: colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
  },
  appName: {
    fontSize: 26,
    fontWeight: '800',
    color: colors.textPrimary,
    letterSpacing: -0.5,
  },
  appTagline: {
    fontSize: 14,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 24,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardTitle: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    color: colors.textSecondary,
    marginBottom: 20,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  errorText: {
    fontSize: 13,
    color: colors.danger,
    marginLeft: 8,
    flex: 1,
  },
  demoSection: {
    marginTop: 24,
    paddingTop: 18,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    letterSpacing: 0.6,
    marginBottom: 10,
  },
  demoPillsRow: {
    flexDirection: 'row',
    gap: 8,
    flexWrap: 'wrap',
    justifyContent: 'center',
  },
  demoPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
  },
  demoPillText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textSecondary,
    marginLeft: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
    marginBottom: 12,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  modalSubtitle: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 18,
  },
  modalActions: {
    flexDirection: 'row',
    marginTop: 10,
  },
});
