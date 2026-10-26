import React, { useContext } from 'react';
import { View, ActivityIndicator, StyleSheet, Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';
import { AuthContext } from '../context/AuthContext';

// Screens
import { LoginScreen } from '../screens/auth/LoginScreen';
import { HomeScreen } from '../screens/dashboard/HomeScreen';
import { ComplaintsListScreen } from '../screens/complaints/ComplaintsListScreen';
import { CreateComplaintScreen } from '../screens/complaints/CreateComplaintScreen';
import { MasterHubScreen } from '../screens/masters/MasterHubScreen';
import { DepartmentsScreen } from '../screens/masters/DepartmentsScreen';
import { ProgrammesScreen } from '../screens/masters/ProgrammesScreen';
import { BlocksScreen } from '../screens/masters/BlocksScreen';
import { RoomsScreen } from '../screens/masters/RoomsScreen';
import { RolesScreen } from '../screens/masters/RolesScreen';
import { UsersScreen } from '../screens/masters/UsersScreen';
import { ReportsScreen } from '../screens/reports/ReportsScreen';
import { ProfileScreen } from '../screens/profile/ProfileScreen';

const Stack = createStackNavigator();
const Tab = createBottomTabNavigator();

const MainTabs = () => {
  const { isSuperAdmin, isStaff } = useContext(AuthContext);

  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopWidth: 1,
          borderTopColor: '#F1F5F9',
          height: Platform.OS === 'ios' ? 88 : 64,
          paddingTop: 8,
          paddingBottom: Platform.OS === 'ios' ? 28 : 10,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '600',
        },
      }}
    >
      <Tab.Screen
        name="HomeTab"
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'home' : 'home-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      <Tab.Screen
        name="ComplaintsTab"
        component={ComplaintsListScreen}
        options={{
          tabBarLabel: isSuperAdmin ? 'Complaints' : 'My Tickets',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'receipt' : 'receipt-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />

      {isSuperAdmin && (
        <Tab.Screen
          name="MasterTab"
          component={MasterHubScreen}
          options={{
            tabBarLabel: 'Master Data',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'grid' : 'grid-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
      )}

      {isSuperAdmin && (
        <Tab.Screen
          name="ReportsTab"
          component={ReportsScreen}
          options={{
            tabBarLabel: 'Reports',
            tabBarIcon: ({ color, size, focused }) => (
              <Ionicons
                name={focused ? 'bar-chart' : 'bar-chart-outline'}
                size={22}
                color={color}
              />
            ),
          }}
        />
      )}

      <Tab.Screen
        name="ProfileTab"
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color, size, focused }) => (
            <Ionicons
              name={focused ? 'person' : 'person-outline'}
              size={22}
              color={color}
            />
          ),
        }}
      />
    </Tab.Navigator>
  );
};

export const AppNavigator = () => {
  const { isAuthenticated, loading } = useContext(AuthContext);

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: false,
          cardStyle: { backgroundColor: colors.background },
        }}
      >
        {!isAuthenticated ? (
          <Stack.Screen name="Login" component={LoginScreen} />
        ) : (
          <>
            <Stack.Screen name="Main" component={MainTabs} />
            <Stack.Screen name="RaiseComplaint" component={CreateComplaintScreen} />
            <Stack.Screen name="MasterHub" component={MasterHubScreen} />
            <Stack.Screen name="DepartmentsMaster" component={DepartmentsScreen} />
            <Stack.Screen name="ProgrammesMaster" component={ProgrammesScreen} />
            <Stack.Screen name="BlocksMaster" component={BlocksScreen} />
            <Stack.Screen name="RoomsMaster" component={RoomsScreen} />
            <Stack.Screen name="RolesMaster" component={RolesScreen} />
            <Stack.Screen name="UsersMaster" component={UsersScreen} />
            <Stack.Screen name="Reports" component={ReportsScreen} />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
  },
});
