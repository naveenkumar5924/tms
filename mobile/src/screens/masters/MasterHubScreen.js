import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, shadows } from '../../theme/colors';
import {
  departmentService,
  programmeService,
  blockService,
  roomService,
  roleService,
  userService,
} from '../../services/api';

export const MasterHubScreen = ({ navigation }) => {
  const [counts, setCounts] = useState({
    departments: 0,
    programmes: 0,
    blocks: 0,
    rooms: 0,
    roles: 0,
    users: 0,
  });
  const [loading, setLoading] = useState(true);

  const fetchMasterStats = async () => {
    try {
      const [d, p, b, r, ro, u] = await Promise.all([
        departmentService.getAll().catch(() => []),
        programmeService.getAll().catch(() => []),
        blockService.getAll().catch(() => []),
        roomService.getAll().catch(() => []),
        roleService.getAll().catch(() => []),
        userService.getAll().catch(() => []),
      ]);

      setCounts({
        departments: Array.isArray(d) ? d.length : 0,
        programmes: Array.isArray(p) ? p.length : 0,
        blocks: Array.isArray(b) ? b.length : 0,
        rooms: Array.isArray(r) ? r.length : 0,
        roles: Array.isArray(ro) ? ro.length : 0,
        users: Array.isArray(u) ? u.length : 0,
      });
    } catch (e) {
      console.warn('Master counts error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const unsub = navigation.addListener('focus', () => {
      fetchMasterStats();
    });
    return unsub;
  }, [navigation]);

  const masterItems = [
    {
      title: 'Departments',
      subtitle: 'Manage university & office depts',
      count: counts.departments,
      icon: 'business-outline',
      color: '#4F46E5',
      bgColor: '#EEF2FF',
      screen: 'DepartmentsMaster',
    },
    {
      title: 'Programmes',
      subtitle: 'Degree & curriculum streams',
      count: counts.programmes,
      icon: 'school-outline',
      color: '#0284C7',
      bgColor: '#E0F2FE',
      screen: 'ProgrammesMaster',
    },
    {
      title: 'Blocks',
      subtitle: 'Campus buildings & facilities',
      count: counts.blocks,
      icon: 'cube-outline',
      color: '#7C3AED',
      bgColor: '#F3E8FF',
      screen: 'BlocksMaster',
    },
    {
      title: 'Rooms',
      subtitle: 'Classrooms, labs & offices',
      count: counts.rooms,
      icon: 'key-outline',
      color: '#059669',
      bgColor: '#D1FAE5',
      screen: 'RoomsMaster',
    },
    {
      title: 'Roles',
      subtitle: 'System permissions & access',
      count: counts.roles,
      icon: 'shield-checkmark-outline',
      color: '#D97706',
      bgColor: '#FEF3C7',
      screen: 'RolesMaster',
    },
    {
      title: 'Users & Staff',
      subtitle: 'Technicians, admins & users',
      count: counts.users,
      icon: 'people-outline',
      color: '#DC2626',
      bgColor: '#FEE2E2',
      screen: 'UsersMaster',
    },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.textPrimary} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Master Data Hub</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={styles.banner}>
          <Text style={styles.bannerTitle}>Organization & Infrastructure</Text>
          <Text style={styles.bannerSub}>
            Configure university departments, blocks, room layouts, user roles and staff directory.
          </Text>
        </View>

        {loading ? (
          <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: 30 }} />
        ) : (
          <View style={styles.grid}>
            {masterItems.map((item, index) => (
              <TouchableOpacity
                key={index}
                activeOpacity={0.8}
                onPress={() => navigation.navigate(item.screen)}
                style={[styles.card, shadows.card]}
              >
                <View style={styles.cardHeader}>
                  <View style={[styles.iconContainer, { backgroundColor: item.bgColor }]}>
                    <Ionicons name={item.icon} size={24} color={item.color} />
                  </View>
                  <View style={[styles.countBadge, { backgroundColor: item.bgColor }]}>
                    <Text style={[styles.countText, { color: item.color }]}>
                      {item.count} items
                    </Text>
                  </View>
                </View>

                <Text style={styles.cardTitle}>{item.title}</Text>
                <Text style={styles.cardSub}>{item.subtitle}</Text>

                <View style={styles.cardFooter}>
                  <Text style={[styles.manageLink, { color: item.color }]}>
                    Manage Database
                  </Text>
                  <Ionicons name="chevron-forward" size={16} color={item.color} />
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}
      </ScrollView>
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
  scrollContent: {
    padding: 16,
    paddingBottom: 30,
  },
  banner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  bannerTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 4,
  },
  bannerSub: {
    fontSize: 13,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  grid: {
    gap: 14,
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  iconContainer: {
    width: 46,
    height: 46,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  countBadge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
  },
  countText: {
    fontSize: 12,
    fontWeight: '700',
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.textPrimary,
    marginBottom: 2,
  },
  cardSub: {
    fontSize: 13,
    color: colors.textSecondary,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F8FAFC',
  },
  manageLink: {
    fontSize: 13,
    fontWeight: '600',
  },
});
