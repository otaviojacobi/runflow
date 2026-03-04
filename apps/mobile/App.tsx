import React, { useEffect, useState } from 'react';
import { NavigationContainer, useFocusEffect } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, TouchableOpacity, Text } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import Constants from 'expo-constants';
import './i18n'; // Initialize i18n
import { supabase } from './lib/supabase';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { OrganizationProvider } from './contexts/OrganizationContext';

// Auth Screens
import { LoginScreen } from './screens/LoginScreen';
import { RegisterScreen } from './screens/RegisterScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { VerifyEmailScreen } from './screens/VerifyEmailScreen';
import { ResetPasswordScreen } from './screens/ResetPasswordScreen';

// App Screens
import { DashboardScreen } from './screens/DashboardScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { SettingsScreen } from './screens/SettingsScreen';
import { OrganizationsScreen } from './screens/OrganizationsScreen';
import { AthletesScreen } from './screens/AthletesScreen';
import { InvitesScreen } from './screens/InvitesScreen';
import { ScheduleScreen } from './screens/ScheduleScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const [currentUserRole, setCurrentUserRole] = useState<string | null>(null);
  const [organizationName, setOrganizationName] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchUserRole();
  }, []);

  const fetchUserRole = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        setIsLoading(false);
        return;
      }

      const response = await fetch(`${Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'https://www.runflow.club'}/api/users/me`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        const currentOrg = data.currentOrganization;
        const organizations = data.organizations || [];

        // Find the role from the organizations array
        const role = currentOrg
          ? organizations.find((org: any) => org.id === currentOrg.id)?.role
          : null;

        setCurrentUserRole(role);
        setOrganizationName(currentOrg?.name);
      }
    } catch (error) {
      console.error('Failed to fetch user role:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const isTrainerOrOwner = currentUserRole === 'OWNER' || currentUserRole === 'TRAINER';
  const isAthlete = currentUserRole === 'ATHLETE';

  // Add listener for organization changes and refetch periodically
  useEffect(() => {
    const subscription = supabase.auth.onAuthStateChange(() => {
      fetchUserRole();
    });

    // Also refetch every time the component mounts or user navigates
    const interval = setInterval(fetchUserRole, 2000); // Check every 2 seconds

    return () => {
      subscription.data.subscription.unsubscribe();
      clearInterval(interval);
    };
  }, []);

  return (
    <Tab.Navigator
      key={`tabs-${currentUserRole}-${organizationName}`}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Organizations') {
            iconName = focused ? 'business' : 'business-outline';
          } else if (route.name === 'Athletes') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Profile') {
            iconName = focused ? 'person' : 'person-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.primary,
        tabBarInactiveTintColor: theme.mutedForeground,
        tabBarStyle: {
          backgroundColor: theme.card,
          borderTopColor: theme.border,
          borderTopWidth: 1,
        },
        headerStyle: {
          backgroundColor: theme.card,
          borderBottomColor: theme.border,
          borderBottomWidth: 1,
        },
        headerTintColor: theme.foreground,
        headerTitleStyle: {
          fontWeight: '600',
        },
      })}
    >
      <Tab.Screen
        name="Dashboard"
        component={DashboardScreen}
        options={{ title: organizationName || t('navigation.dashboard', 'Dashboard') }}
      />
      {isAthlete && (
        <Tab.Screen
          name="Schedule"
          component={ScheduleScreen}
          options={{ title: t('navigation.schedule', 'Schedule') }}
        />
      )}
      <Tab.Screen
        name="Organizations"
        component={OrganizationsScreen}
        options={{ title: t('navigation.organizations', 'Organizations') }}
      />
      {isTrainerOrOwner && (
        <Tab.Screen
          name="Athletes"
          component={AthletesScreen}
          options={{ title: t('navigation.athletes', 'Athletes') }}
        />
      )}
      <Tab.Screen
        name="Profile"
        component={ProfileScreen}
        options={{ title: t('navigation.profile', 'Profile') }}
      />
    </Tab.Navigator>
  );
}

function AppNavigator() {
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>(null);
  const { theme } = useTheme();
  const { t } = useTranslation();

  useEffect(() => {
    // Check current auth state
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setInitializing(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (initializing) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: theme.background }}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <Stack.Navigator
        screenOptions={{
          headerShown: true,
          headerStyle: {
            backgroundColor: theme.card,
          },
          headerTintColor: theme.foreground,
          headerTitleStyle: {
            fontWeight: '600',
          },
        }}
      >
        {!user ? (
          // Auth Stack
          <>
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Register"
              component={RegisterScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="ForgotPassword"
              component={ForgotPasswordScreen}
              options={{ title: t('navigation.forgotPassword', 'Forgot Password') }}
            />
            <Stack.Screen
              name="VerifyEmail"
              component={VerifyEmailScreen}
              options={{ title: t('navigation.verifyEmail', 'Verify Email') }}
            />
            <Stack.Screen
              name="ResetPassword"
              component={ResetPasswordScreen}
              options={{ headerShown: false }}
            />
          </>
        ) : (
          // Authenticated Stack
          <>
            <Stack.Screen
              name="MainTabs"
              component={MainTabs}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Settings"
              component={SettingsScreen}
              options={{ title: t('navigation.settings', 'Settings') }}
            />
            <Stack.Screen
              name="Invites"
              component={InvitesScreen}
              options={{ title: t('navigation.invitations', 'Invitations') }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

export default function App() {
  return (
    <ThemeProvider>
      <OrganizationProvider>
        <AppNavigator />
      </OrganizationProvider>
    </ThemeProvider>
  );
}
