import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import { AuthContext } from '../../context/AuthContext';
import { complaintService, userService } from '../../services/api';
import { StatCard } from '../../components/StatCard';
import { ComplaintCard } from '../../components/ComplaintCard';
import { ComplaintDetailModal } from '../../components/ComplaintDetailModal';

export const HomeScreen = ({ navigation }) => {
  const { user, isSuperAdmin, isStaff } = useContext(AuthContext);

  const [stats, setStats] = useState({ total: 0, pending: 0, assigned: 0, closed: 0 });
  const [recentComplaints, setRecentComplaints] = useState([]);
  const [usersList, setUsersList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailVisible, setDetailVisible] = useState(false);

  const loadDashboardData = useCallback(async () => {
    try {
      const [statsRes, complaintsRes] = await Promise.all([
        complaintService.getStats().catch(() => ({ total: 0, pending: 0, assigned: 0, closed: 0 })),
        complaintService.getAll().catch(() => []),
      ]);

      setStats(statsRes || { total: 0, pending: 0, assigned: 0, closed: 0 });

      let list = Array.isArray(complaintsRes) ? complaintsRes : [];
      // Filter for regular users
      if (!isSuperAdmin && !isStaff) {
        const myId = user?.id || user?._id;
        list = list.filter(
          (c) =>
            String(c.createdBy?._id || c.createdBy) === String(myId)
        );
      }
      setRecentComplaints(list.slice(0, 5));

      if (isSuperAdmin) {
        userService.getAll().then((res) => {
          setUsersList(Array.isArray(res) ? res : []);
        }).catch(() => {});
      }
    } catch (e) {
      console.warn('Dashboard load error:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user, isSuperAdmin, isStaff]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  const onRefresh = () => {
    setRefreshing(true);
    loadDashboardData();
  };

  const handleOpenDetail = (complaint) => {
    setSelectedComplaint(complaint);
    setDetailVisible(true);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Top App Header */}
      <View style={styles.header}>
        <View style={styles.headerUser}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={20} color={colors.primary} />
          </View>
          <View>
            <Text style={styles.greetingText}>Welcome back,</Text>
            <Text style={styles.userName}>{user?.username || 'User'}</Text>
          </View>
        </View>

        <View style={styles.headerBadge}>
          <Text style={styles.roleText}>{user?.role || 'User'}</Text>
        </View>
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
          />
        }
        contentContainerStyle={styles.scrollContent}
      >
        {/* Quick Raise Ticket CTA for Users & Admins */}
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={() => navigation.navigate('RaiseComplaint')}
          style={[styles.raiseBanner, shadows.md]}
        >
          <View style={styles.raiseBannerLeft}>
            <View style={styles.raiseIconCircle}>
              <Ionicons name="add" size={24} color="#FFFFFF" />
            </View>
            <View>
              <Text style={styles.raiseBannerTitle}>Raise a Complaint</Text>
              <Text style={styles.raiseBannerSub}>
                Hardware, Software, Network or Repairs
              </Text>
            </View>
          </View>
          <Ionicons name="arrow-forward" size={20} color="#FFFFFF" />
        </TouchableOpacity>

        {/* Stats Section */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Overview</Text>
          <Text style={styles.sectionSubtitle}>Real-time ticket status</Text>
        </View>

        <View style={styles.statsGrid}>
          <View style={styles.statsRow}>
            <StatCard
              label="Total Tickets"
              value={stats.total || 0}
              icon="layers-outline"
              color={colors.primary}
              bgColor="#EEF2FF"
              onPress={() => navigation.navigate('ComplaintsTab', { filter: 'All' })}
            />
            <StatCard
              label="Pending"
              value={stats.pending || 0}
              icon="time-outline"
              color="#D97706"
              bgColor="#FEF3C7"
              onPress={() => navigation.navigate('ComplaintsTab', { filter: 'Pending' })}
            />
          </View>
          <View style={styles.statsRow}>
            <StatCard
              label="Assigned"
              value={stats.assigned || 0}
              icon="construct-outline"
              color="#7E22CE"
              bgColor="#F3E8FF"
              onPress={() => navigation.navigate('ComplaintsTab', { filter: 'Assigned' })}
            />
            <StatCard
              label="Resolved"
              value={stats.closed || 0}
              icon="checkmark-circle-outline"
              color="#059669"
              bgColor="#D1FAE5"
              onPress={() => navigation.navigate('ComplaintsTab', { filter: 'Closed' })}
            />
          </View>
        </View>

        {/* Quick Hub Navigation Cards */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Quick Access</Text>
        </View>

        <View style={styles.quickGrid}>
          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ComplaintsTab')}
            style={[styles.quickCard, shadows.sm]}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#EEF2FF' }]}>
              <Ionicons name="receipt-outline" size={22} color={colors.primary} />
            </View>
            <Text style={styles.quickCardTitle}>
              {isSuperAdmin ? 'All Tickets' : 'My Tickets'}
            </Text>
            <Text style={styles.quickCardSub}>View & track list</Text>
          </TouchableOpacity>

          {isSuperAdmin && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('MasterHub')}
              style={[styles.quickCard, shadows.sm]}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#F0FDF4' }]}>
                <Ionicons name="grid-outline" size={22} color="#16A34A" />
              </View>
              <Text style={styles.quickCardTitle}>Master Data</Text>
              <Text style={styles.quickCardSub}>Depts, Blocks, Rooms</Text>
            </TouchableOpacity>
          )}

          {isSuperAdmin && (
            <TouchableOpacity
              activeOpacity={0.8}
              onPress={() => navigation.navigate('Reports')}
              style={[styles.quickCard, shadows.sm]}
            >
              <View style={[styles.quickIconCircle, { backgroundColor: '#FEF3C7' }]}>
                <Ionicons name="bar-chart-outline" size={22} color="#D97706" />
              </View>
              <Text style={styles.quickCardTitle}>Reports</Text>
              <Text style={styles.quickCardSub}>Export & insights</Text>
            </TouchableOpacity>
          )}

          <TouchableOpacity
            activeOpacity={0.8}
            onPress={() => navigation.navigate('ProfileTab')}
            style={[styles.quickCard, shadows.sm]}
          >
            <View style={[styles.quickIconCircle, { backgroundColor: '#F1F5F9' }]}>
              <Ionicons name="settings-outline" size={22} color={colors.textSecondary} />
            </View>
            <Text style={styles.quickCardTitle}>Settings</Text>
            <Text style={styles.quickCardSub}>Profile & server IP</Text>
          </TouchableOpacity>
        </View>

        {/* Recent Complaints Section */}
        <View style={[styles.sectionHeader, { marginTop: 24 }]}>
          <View>
            <Text style={styles.sectionTitle}>Recent Tickets</Text>
            <Text style={styles.sectionSubtitle}>Latest registered issues</Text>
          </View>
          <TouchableOpacity
            onPress={() => navigation.navigate('ComplaintsTab')}
            style={styles.seeAllBtn}
          >
            <Text style={styles.seeAllText}>See All</Text>
            <Ionicons name="chevron-forward" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: 20 }} />
        ) : recentComplaints.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="file-tray-outline" size={40} color={colors.textMuted} />
            <Text style={styles.emptyTitle}>No complaints found</Text>
            <Text style={styles.emptySub}>
              Everything is running smoothly or no tickets were raised yet.
            </Text>
          </View>
        ) : (
          recentComplaints.map((item) => (
            <ComplaintCard
              key={item._id}
              complaint={item}
              onPress={() => handleOpenDetail(item)}
            />
          ))
        )}
      </ScrollView>

      {/* Complaint Detail Inspector Modal */}
      <ComplaintDetailModal
        visible={detailVisible}
        complaint={selectedComplaint}
        currentUser={user}
        usersList={usersList}
        onClose={() => setDetailVisible(false)}
        onRefresh={loadDashboardData}
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
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  headerUser: {
    flexDirection: 'row',
    alignItems: 'center',
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
  greetingText: {
    fontSize: 12,
    color: colors.textSecondary,
    fontWeight: '500',
  },
  userName: {
    fontSize: 17,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  headerBadge: {
    backgroundColor: '#EEF2FF',
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.primaryDark,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  raiseBanner: {
    backgroundColor: colors.primary,
    borderRadius: 18,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 22,
  },
  raiseBannerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  raiseIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 14,
  },
  raiseBannerTitle: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  raiseBannerSub: {
    color: 'rgba(255, 255, 255, 0.85)',
    fontSize: 12,
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  sectionSubtitle: {
    fontSize: 12,
    color: colors.textSecondary,
    marginTop: 2,
  },
  seeAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  seeAllText: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.primary,
    marginRight: 2,
  },
  statsGrid: {
    gap: 12,
    marginBottom: 22,
  },
  statsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  quickGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  quickCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    width: '48%',
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  quickIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10,
  },
  quickCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.textPrimary,
  },
  quickCardSub: {
    fontSize: 11,
    color: colors.textSecondary,
    marginTop: 2,
  },
  emptyContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#F1F5F9',
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
    textAlign: 'center',
    marginTop: 4,
  },
});
