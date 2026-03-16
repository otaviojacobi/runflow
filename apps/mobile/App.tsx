import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { ActivityIndicator, View, Text, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from 'react-i18next';
import './i18n'; // Initialize i18n
import { supabase } from './lib/supabase';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { OrganizationProvider, useOrganization } from './contexts/OrganizationContext';

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
import { CreateOrganizationScreen } from './screens/CreateOrganizationScreen';
import { InviteMembersScreen } from './screens/InviteMembersScreen';
import { CreateTrainingScreen } from './screens/CreateTrainingScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabs() {
  const { theme } = useTheme();
  const { t } = useTranslation();
  const { refreshOrganizations, currentOrganization, organizations, user, loading } = useOrganization();

  const currentUserRole = currentOrganization
    ? organizations.find(org => org.id === currentOrganization.id)?.role ?? null
    : null;
  const organizationName = currentOrganization?.name ?? null;

  const isTrainerOrOwner = currentUserRole === 'OWNER' || currentUserRole === 'TRAINER';
  const isAthlete = currentUserRole === 'ATHLETE';

  return (
    <Tab.Navigator
      key={`tabs-${currentUserRole}-${organizationName}`}
      screenListeners={{
        tabPress: () => {
          refreshOrganizations().catch(() => {});
        },
      }}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap = 'grid-outline';

          if (route.name === 'Dashboard') {
            iconName = focused ? 'grid' : 'grid-outline';
          } else if (route.name === 'Schedule') {
            iconName = focused ? 'calendar' : 'calendar-outline';
          } else if (route.name === 'Organizations') {
            iconName = focused ? 'flag' : 'flag-outline';
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
          backgroundColor: `${theme.primary}10`,
          borderTopColor: `${theme.primary}30`,
          borderTopWidth: 1,
          elevation: 0,
        },
        headerStyle: {
          backgroundColor: theme.primary,
        },
        headerTintColor: theme.primaryForeground,
        headerTitleStyle: {
          fontWeight: '600',
        },
        headerLeft: () => (
          <View style={{ marginLeft: 16 }}>
            {currentOrganization?.logo ? (
              <Image
                source={{ uri: currentOrganization.logo }}
                style={{ width: 28, height: 28, borderRadius: 8, borderWidth: 1, borderColor: 'rgba(255,255,255,0.3)' }}
              />
            ) : (
              <View style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: 'rgba(255,255,255,0.2)', alignItems: 'center', justifyContent: 'center' }}>
                <Text style={{ fontSize: 13, fontWeight: 'bold', color: '#FFFFFF' }}>
                  {(organizationName || 'O').charAt(0).toUpperCase()}
                </Text>
              </View>
            )}
          </View>
        ),
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
            backgroundColor: theme.primary,
          },
          headerTintColor: theme.primaryForeground,
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
            <Stack.Screen
              name="CreateOrganization"
              component={CreateOrganizationScreen}
              options={{ title: t('navigation.createOrganization', 'Create Organization') }}
            />
            <Stack.Screen
              name="InviteMembers"
              component={InviteMembersScreen}
              options={{ title: t('navigation.inviteMembers', 'Invite Members') }}
            />
            <Stack.Screen
              name="CreateTraining"
              component={CreateTrainingScreen}
              options={{ title: t('navigation.createTraining', 'Create Training') }}
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
