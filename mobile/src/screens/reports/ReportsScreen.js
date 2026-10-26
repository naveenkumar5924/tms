import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  TextInput,
  ScrollView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import { colors, shadows } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import {
  complaintService,
  departmentService,
  programmeService,
  userService,
} from '../../services/api';
import { StatusBadge } from '../../components/StatusBadge';
import { ModalPicker } from '../../components/ModalPicker';

export const ReportsScreen = ({ navigation }) => {
  const { user, isSuperAdmin } = useContext(AuthContext);

  const [departments, setDepartments] = useState([]);
  const [programmes, setProgrammes] = useState([]);
  const [users, setUsers] = useState([]);

  // Filter values
  const [departmentId, setDepartmentId] = useState('');
  const [deptName, setDeptName] = useState('');
  const [programmeId, setProgrammeId] = useState('');
  const [progName, setProgName] = useState('');
  const [status, setStatus] = useState('');
  const [assigneeId, setAssigneeId] = useState('');
  const [assigneeName, setAssigneeName] = useState('');
  const [complaintType, setComplaintType] = useState('');

  // Picker modals
  const [deptPickerVisible, setDeptPickerVisible] = useState(false);
  const [progPickerVisible, setProgPickerVisible] = useState(false);
  const [statusPickerVisible, setStatusPickerVisible] = useState(false);
  const [assigneePickerVisible, setAssigneePickerVisible] = useState(false);

  // Results
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);

  useEffect(() => {
    if (!isSuperAdmin) return;
    departmentService.getAll().then((d) => setDepartments(Array.isArray(d) ? d : [])).catch(() => {});
    programmeService.getAll().then((p) => setProgrammes(Array.isArray(p) ? p : [])).catch(() => {});
    userService.getAll().then((u) => setUsers(Array.isArray(u) ? u : [])).catch(() => {});
    // Auto fetch initial
    fetchReport();
  }, [isSuperAdmin]);

  const fetchReport = async () => {
    try {
      setLoading(true);
      const params = {};
      if (departmentId) params.department = departmentId;
      if (programmeId) params.programme = programmeId;
      if (status) params.status = status;
      if (assigneeId) params.assignee = assigneeId;
      if (complaintType.trim()) params.complaintType = complaintType.trim();

      const res = await complaintService.report(params);
      setResults(Array.isArray(res) ? res : []);
    } catch (err) {
      Alert.alert('Error', err.message || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  const clearFilters = () => {
    setDepartmentId('');
    setDeptName('');
    setProgrammeId('');
    setProgName('');
    setStatus('');
    setAssigneeId('');
    setAssigneeName('');
    setComplaintType('');
  };

  const handleExportCSV = async () => {
    if (results.length === 0) {
      Alert.alert('No Data', 'No records available to export.');
      return;
    }

    try {
      setExporting(true);
      const headers = ['Date', 'Block', 'Room', 'Category', 'Status', 'Reporter', 'Assignee', 'Remarks'];
      const rows = results.map((r) => [
        new Date(r.createdAt).toLocaleString().replace(/,/g, ' '),
        r.blockName || '',
        r.roomNumber || '',
        r.complaintType || '',
        r.status || '',
        r.createdBy?.username || r.createdBy?.email || '',
        r.assignedTo?.username || r.assignedTo?.email || '',
        (r.remarks || '').replace(/[\n\r,]/g, ' '),
      ]);

      const csvContent = [headers.join(','), ...rows.map((row) => row.join(','))].join('\n');

      if (Platform.OS === 'web') {
        const blob = new Blob([csvContent], { type: 'text/csv' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `complaints_report_${Date.now()}.csv`;
        a.click();
        URL.revokeObjectURL(url);
        Alert.alert('Success', 'Report downloaded successfully');
      } else {
        const fileUri = `${FileSystem.documentDirectory}complaints_report_${Date.now()}.csv`;
        await FileSystem.writeAsStringAsync(fileUri, csvContent, {
          encoding: FileSystem.EncodingType.UTF8,
        });

        const isAvailable = await Sharing.isAvailableAsync();
        if (isAvailable) {
          await Sharing.shareAsync(fileUri, {
            mimeType: 'text/csv',
            dialogTitle: 'Export Complaints Report',
            UTI: 'public.comma-separated-values-text',
          });
        } else {
          Alert.alert('Exported', `Saved file to: ${fileUri}`);
        }
      }
    } catch (err) {
      Alert.alert('Export Failed', err.message || 'Could not export file');
    } finally {
      setExporting(false);
    }
  };

  const deptOptions = [
    { label: 'All Departments', value: '' },
    ...departments.map((d) => ({ label: d.name, value: d._id })),
  ];

  const progOptions = [
    { label: 'All Programmes', value: '' },
    ...programmes.map((p) => ({ label: p.name, value: p._id })),
  ];

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Assigned', value: 'Assigned' },
    { label: 'In-Progress', value: 'In-Progress' },
    { label: 'Onhold', value: 'Onhold' },
    { label: 'Closed', value: 'Closed' },
  ];

  const assigneeOptions = [
    { label: 'Any Assignee', value: '' },
    ...users.map((u) => ({
      label: `${u.username} (${u.role})`,
      value: u._id,
      subtitle: u.department?.name,
    })),
  ];

  if (!isSuperAdmin) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.restrictedBox}>
          <Ionicons name="lock-closed-outline" size={48} color={colors.danger} />
          <Text style={styles.restrictedTitle}>Access Restricted</Text>
          <Text style={styles.restrictedSub}>
            Only SuperAdmin accounts can view and export system-wide reports.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>Reports & Analytics</Text>
          <Text style={styles.headerSubtitle}>{results.length} total records</Text>
        </View>
        <TouchableOpacity
          onPress={handleExportCSV}
          disabled={exporting || results.length === 0}
          style={[styles.exportBtn, results.length === 0 && { opacity: 0.5 }]}
        >
          {exporting ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="download-outline" size={18} color="#FFFFFF" />
              <Text style={styles.exportBtnText}>Export CSV</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={results}
        keyExtractor={(item) => item._id}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListHeaderComponent={
          <View style={styles.filterSection}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Parameters</Text>
              {(departmentId || programmeId || status || assigneeId || complaintType) ? (
                <TouchableOpacity onPress={clearFilters}>
                  <Text style={styles.clearText}>Reset</Text>
                </TouchableOpacity>
              ) : null}
            </View>

            {/* Filter Pills */}
            <View style={styles.filterGrid}>
              {/* Dept */}
              <TouchableOpacity
                onPress={() => setDeptPickerVisible(true)}
                style={styles.filterPill}
              >
                <Text style={styles.filterPillLabel}>Dept:</Text>
                <Text style={styles.filterPillVal} numberOfLines={1}>
                  {deptName || 'All'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Status */}
              <TouchableOpacity
                onPress={() => setStatusPickerVisible(true)}
                style={styles.filterPill}
              >
                <Text style={styles.filterPillLabel}>Status:</Text>
                <Text style={styles.filterPillVal}>{status || 'All'}</Text>
                <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Programme */}
              <TouchableOpacity
                onPress={() => setProgPickerVisible(true)}
                style={styles.filterPill}
              >
                <Text style={styles.filterPillLabel}>Prog:</Text>
                <Text style={styles.filterPillVal} numberOfLines={1}>
                  {progName || 'All'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
              </TouchableOpacity>

              {/* Assignee */}
              <TouchableOpacity
                onPress={() => setAssigneePickerVisible(true)}
                style={styles.filterPill}
              >
                <Text style={styles.filterPillLabel}>Staff:</Text>
                <Text style={styles.filterPillVal} numberOfLines={1}>
                  {assigneeName || 'Any'}
                </Text>
                <Ionicons name="chevron-down" size={14} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            {/* Category Search & Submit */}
            <View style={styles.searchRow}>
              <TextInput
                value={complaintType}
                onChangeText={setComplaintType}
                placeholder="Category (e.g. Hardware, Network...)"
                placeholderTextColor={colors.textMuted}
                style={styles.categoryInput}
              />
              <TouchableOpacity onPress={fetchReport} style={styles.applyBtn}>
                <Ionicons name="filter" size={16} color="#FFFFFF" />
                <Text style={styles.applyBtnText}>Apply</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        ListEmptyComponent={
          loading ? (
            <ActivityIndicator size="large" color={colors.primary} style={{ marginTop: 30 }} />
          ) : (
            <View style={styles.emptyContainer}>
              <Ionicons name="bar-chart-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No matching records</Text>
              <Text style={styles.emptySub}>Adjust your filters to see complaints.</Text>
            </View>
          )
        }
        renderItem={({ item }) => (
          <View style={[styles.recordCard, shadows.card]}>
            <View style={styles.recordTop}>
              <View>
                <Text style={styles.recordType}>{item.complaintType || 'Complaint'}</Text>
                <Text style={styles.recordDate}>
                  {new Date(item.createdAt).toLocaleDateString()}
                </Text>
              </View>
              <StatusBadge status={item.status} size="small" />
            </View>

            <View style={styles.recordLocation}>
              <Text style={styles.locText}>
                {item.blockName || 'Block'} • Room {item.roomNumber || '-'}
              </Text>
            </View>

            {item.remarks ? (
              <Text style={styles.remarksSnippet} numberOfLines={2}>
                {item.remarks}
              </Text>
            ) : null}

            <View style={styles.recordFooter}>
              <Text style={styles.reporterText}>
                By: {item.createdBy?.username || item.createdBy?.email || 'User'}
              </Text>
              <Text style={styles.assigneeText}>
                Staff: {item.assignedTo?.username || 'Unassigned'}
              </Text>
            </View>
          </View>
        )}
      />

      {/* Pickers */}
      <ModalPicker
        visible={deptPickerVisible}
        onClose={() => setDeptPickerVisible(false)}
        title="Filter by Department"
        options={deptOptions}
        selectedValue={departmentId}
        onSelect={(val, item) => {
          setDepartmentId(val);
          setDeptName(val ? item.label : '');
        }}
      />

      <ModalPicker
        visible={progPickerVisible}
        onClose={() => setProgPickerVisible(false)}
        title="Filter by Programme"
        options={progOptions}
        selectedValue={programmeId}
        onSelect={(val, item) => {
          setProgrammeId(val);
          setProgName(val ? item.label : '');
        }}
      />

      <ModalPicker
        visible={statusPickerVisible}
        onClose={() => setStatusPickerVisible(false)}
        title="Filter by Status"
        options={statusOptions}
        selectedValue={status}
        onSelect={(val, item) => {
          setStatus(val);
        }}
      />

      <ModalPicker
        visible={assigneePickerVisible}
        onClose={() => setAssigneePickerVisible(false)}
        title="Filter by Assignee"
        options={assigneeOptions}
        selectedValue={assigneeId}
        onSelect={(val, item) => {
          setAssigneeId(val);
          setAssigneeName(val ? item.label : '');
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
  headerSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  exportBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.success,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
  },
  exportBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
    marginLeft: 5,
  },
  listContent: {
    padding: 16,
    paddingBottom: 30,
  },
  filterSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  filterTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  clearText: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.danger,
  },
  filterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  filterPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 10,
    width: '48%',
  },
  filterPillLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: colors.textMuted,
    marginRight: 4,
  },
  filterPillVal: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.textPrimary,
    flex: 1,
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  categoryInput: {
    flex: 1,
    height: 42,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: 10,
    paddingHorizontal: 12,
    fontSize: 13,
    color: colors.textPrimary,
  },
  applyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingHorizontal: 14,
    height: 42,
    borderRadius: 10,
  },
  applyBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '600',
    marginLeft: 4,
  },
  recordCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  recordTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  recordType: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  recordDate: {
    fontSize: 11,
    color: colors.textMuted,
    marginTop: 2,
  },
  recordLocation: {
    marginBottom: 6,
  },
  locText: {
    fontSize: 13,
    color: colors.primaryDark,
    fontWeight: '600',
  },
  remarksSnippet: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
    marginBottom: 10,
  },
  recordFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  reporterText: {
    fontSize: 11,
    color: colors.textMuted,
  },
  assigneeText: {
    fontSize: 11,
    color: colors.textSecondary,
    fontWeight: '600',
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
  restrictedBox: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 30,
  },
  restrictedTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  restrictedSub: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 6,
  },
});
