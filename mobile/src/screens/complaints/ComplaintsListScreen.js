import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  FlatList,
  TextInput,
  TouchableOpacity,
  RefreshControl,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { complaintService, userService } from '../../services/api';
import { ComplaintCard } from '../../components/ComplaintCard';
import { ComplaintDetailModal } from '../../components/ComplaintDetailModal';

export const ComplaintsListScreen = ({ route, navigation }) => {
  const { user, isSuperAdmin, isStaff } = useContext(AuthContext);

  const initialFilter = route.params?.filter || 'All';
  const [activeFilter, setActiveFilter] = useState(initialFilter);
  const [complaints, setComplaints] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const fetchComplaints = useCallback(async () => {
    try {
      const res = await complaintService.getAll();
      let list = Array.isArray(res) ? res : [];

      // Filter for regular users: show only their tickets
      if (!isSuperAdmin && !isStaff) {
        const myId = user?.id || user?._id;
        list = list.filter(
          (c) =>
            String(c.createdBy?._id || c.createdBy) === String(myId) ||
            String(c.assignedTo?._id || c.assignedTo) === String(myId)
        );
      }

      setComplaints(list);

      if (isSuperAdmin) {
        userService.getAll().then((u) => setUsersList(Array.isArray(u) ? u : [])).catch(() => {});
      }
    } catch (err) {
      console.warn('Fetch complaints error:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, isSuperAdmin, isStaff]);

  useEffect(() => {
    fetchComplaints();
  }, [fetchComplaints]);

  useEffect(() => {
    if (route.params?.filter) {
      setActiveFilter(route.params.filter);
    }
  }, [route.params?.filter]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchComplaints();
  };

  const filterTabs = ['All', 'Pending', 'Assigned', 'In-Progress', 'Closed'];

  const filteredComplaints = complaints.filter((c) => {
    // Status filter
    if (activeFilter !== 'All') {
      const normCardStatus = (c.status || '').toLowerCase().replace(/[^a-z]/g, '');
      const normActive = activeFilter.toLowerCase().replace(/[^a-z]/g, '');
      if (normCardStatus !== normActive) return false;
    }

    // Search query filter
    if (search.trim()) {
      const q = search.toLowerCase();
      const type = (c.complaintType || '').toLowerCase();
      const block = (c.blockName || '').toLowerCase();
      const room = (c.roomNumber || '').toLowerCase();
      const remarks = (c.remarks || '').toLowerCase();
      const reporter = (c.createdBy?.username || c.createdBy?.email || '').toLowerCase();
      const assignee = (c.assignedTo?.username || c.assignedTo?.email || '').toLowerCase();

      return (
        type.includes(q) ||
        block.includes(q) ||
        room.includes(q) ||
        remarks.includes(q) ||
        reporter.includes(q) ||
        assignee.includes(q)
      );
    }

    return true;
  });

  const handleOpenDetail = (item) => {
    setSelectedComplaint(item);
    setDetailVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerTitle}>
            {isSuperAdmin ? 'All Complaints' : 'My Complaints'}
          </Text>
          <Text style={styles.headerSubtitle}>
            {filteredComplaints.length} tickets found
          </Text>
        </View>

        {!isStaff && (
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('RaiseComplaint')}
            style={styles.addBtn}
          >
            <Ionicons name="add" size={20} color="#FFFFFF" />
            <Text style={styles.addBtnText}>New</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Search Input */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={colors.textMuted} style={{ marginRight: 8 }} />
        <TextInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search by room, category, keyword..."
          placeholderTextColor={colors.textMuted}
          style={styles.searchInput}
          clearButtonMode="while-editing"
        />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textMuted} />
          </TouchableOpacity>
        )}
      </View>

      {/* Filter Tabs */}
      <View style={styles.filterTabsWrapper}>
        <FlatList
          horizontal
          showsHorizontalScrollIndicator={false}
          data={filterTabs}
          keyExtractor={(item) => item}
          contentContainerStyle={styles.filterTabsList}
          renderItem={({ item }) => {
            const isActive = activeFilter === item;
            return (
              <TouchableOpacity
                onPress={() => setActiveFilter(item)}
                style={[styles.filterTab, isActive && styles.activeFilterTab]}
              >
                <Text style={[styles.filterTabText, isActive && styles.activeFilterTabText]}>
                  {item}
                </Text>
              </TouchableOpacity>
            );
          }}
        />
      </View>

      {/* Complaints List */}
      {loading ? (
        <View style={styles.centerContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.loadingText}>Loading complaints...</Text>
        </View>
      ) : (
        <FlatList
          data={filteredComplaints}
          keyExtractor={(item) => item._id}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={onRefresh}
              colors={[colors.primary]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="file-tray-outline" size={48} color={colors.textMuted} />
              <Text style={styles.emptyTitle}>No tickets found</Text>
              <Text style={styles.emptySub}>
                {search
                  ? 'No results match your search query.'
                  : 'No tickets in this category.'}
              </Text>
            </View>
          }
          renderItem={({ item }) => (
            <ComplaintCard
              complaint={item}
              onPress={() => handleOpenDetail(item)}
              canAssign={isSuperAdmin}
              canUpdateStatus={isSuperAdmin || isStaff}
              onAssignPress={() => handleOpenDetail(item)}
              onStatusPress={() => handleOpenDetail(item)}
            />
          )}
        />
      )}

      {/* Detail Modal */}
      <ComplaintDetailModal
        visible={detailVisible}
        complaint={selectedComplaint}
        currentUser={user}
        usersList={usersList}
        onClose={() => setDetailVisible(false)}
        onRefresh={fetchComplaints}
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
  addBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 12,
  },
  addBtnText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    marginLeft: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 8,
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
  filterTabsWrapper: {
    marginBottom: 8,
  },
  filterTabsList: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    gap: 8,
  },
  filterTab: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: colors.border,
  },
  activeFilterTab: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.textSecondary,
  },
  activeFilterTabText: {
    color: '#FFFFFF',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 30,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 14,
    color: colors.textSecondary,
  },
  emptyContainer: {
    paddingVertical: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyTitle: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
    marginTop: 12,
  },
  emptySub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginTop: 4,
    textAlign: 'center',
    paddingHorizontal: 30,
  },
});
