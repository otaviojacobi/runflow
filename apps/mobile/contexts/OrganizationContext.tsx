import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';
import { AppState } from 'react-native';
import type { UserProfile } from '@repo/schemas/user';
import type { OrganizationResponse, InviteResponse } from '@repo/schemas/organization';
import { api } from '../lib/api';
import { useTheme } from './ThemeContext';

type OrganizationWithRole = OrganizationResponse & { role: string; joinedAt?: string };
type PendingInvite = InviteResponse & {
  organization: { id: string; name: string; description: string | null };
  invitedBy: { id: string; name: string | null; email: string };
};

interface OrganizationContextType {
  user: UserProfile | null;
  organizations: OrganizationWithRole[];
  currentOrganization: OrganizationWithRole | null;
  pendingInvites: PendingInvite[];
  loading: boolean;
  refreshOrganizations: () => Promise<void>;
  switchOrganization: (organizationId: string) => Promise<void>;
  acceptInvite: (token: string) => Promise<void>;
  declineInvite: (inviteId: string) => Promise<void>;
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined);

interface OrganizationProviderProps {
  children: ReactNode;
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [organizations, setOrganizations] = useState<OrganizationWithRole[]>([]);
  const [currentOrganization, setCurrentOrganization] = useState<OrganizationWithRole | null>(null);
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([]);
  const [loading, setLoading] = useState(true);
  const { updateTheme } = useTheme();

  const appState = useRef(AppState.currentState);

  // Fetch user and organizations on mount
  useEffect(() => {
    fetchUserAndOrganizations();
  }, []);

  // Re-fetch when app comes back to foreground (e.g. after changing colors in studio)
  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (appState.current.match(/inactive|background/) && nextAppState === 'active') {
        refreshOrganizations();
      }
      appState.current = nextAppState;
    });

    return () => subscription.remove();
  }, [user?.currentOrganizationId]);

  // Update current organization when user changes
  useEffect(() => {
    if (user && user.currentOrganizationId) {
      const current = organizations.find(org => org.id === user.currentOrganizationId);
      setCurrentOrganization(current || null);

      // Apply organization colors to theme
      if (current) {
        updateTheme(current.id, {
          primaryColor: current.primaryColor,
          secondaryColor: current.secondaryColor,
        });
      }
    } else {
      setCurrentOrganization(null);
    }
  }, [user?.currentOrganizationId, organizations]);

  const fetchUserAndOrganizations = async () => {
    try {
      setLoading(true);

      // Fetch user, organizations, and invites in parallel
      const [userData, orgsData, invitesData] = await Promise.all([
        api.getCurrentUser(),
        api.getOrganizations(),
        api.getPendingInvites(),
      ]);

      // The /api/users/me endpoint returns { user: {...}, organizations: [...], ... }
      // Extract the nested user object
      const userProfile = (userData as any).user ?? userData;

      setUser(userProfile);
      setOrganizations(orgsData);
      setPendingInvites(invitesData);
    } catch (error) {
      console.error('Failed to fetch user and organizations:', error);
    } finally {
      setLoading(false);
    }
  };

  const refreshOrganizations = async () => {
    try {
      const [orgsData, invitesData] = await Promise.all([
        api.getOrganizations(),
        api.getPendingInvites(),
      ]);

      setOrganizations(orgsData);
      setPendingInvites(invitesData);

      // Re-apply theme colors in case they changed in studio
      if (user?.currentOrganizationId) {
        const current = orgsData.find((o: OrganizationWithRole) => o.id === user.currentOrganizationId);
        if (current) {
          await updateTheme(current.id, {
            primaryColor: current.primaryColor,
            secondaryColor: current.secondaryColor,
          });
        }
      }
    } catch (error) {
      console.error('Failed to refresh organizations:', error);
      throw error;
    }
  };

  const switchOrganization = async (organizationId: string) => {
    try {
      await api.switchOrganization(organizationId);

      // Update user's current organization
      setUser(prev => prev ? { ...prev, currentOrganizationId: organizationId } : null);

      // Apply theme from the org data we already have
      const org = organizations.find(o => o.id === organizationId);
      await updateTheme(organizationId, {
        primaryColor: org?.primaryColor,
        secondaryColor: org?.secondaryColor,
      });
    } catch (error) {
      console.error('Failed to switch organization:', error);
      throw error;
    }
  };

  const acceptInvite = async (token: string) => {
    try {
      await api.acceptInvite(token);
      await fetchUserAndOrganizations();
    } catch (error) {
      console.error('Failed to accept invite:', error);
      throw error;
    }
  };

  const declineInvite = async (inviteId: string) => {
    try {
      // Remove from local state immediately for better UX
      setPendingInvites(prev => prev.filter(invite => invite.id !== inviteId));

      // Get the invite to get its token
      const invite = pendingInvites.find(inv => inv.id === inviteId);
      if (invite) {
        await api.declineInvite(invite.token);
      }
    } catch (error) {
      console.error('Failed to decline invite:', error);
      // Refresh to get correct state
      await fetchUserAndOrganizations();
      throw error;
    }
  };

  return (
    <OrganizationContext.Provider
      value={{
        user,
        organizations,
        currentOrganization,
        pendingInvites,
        loading,
        refreshOrganizations,
        switchOrganization,
        acceptInvite,
        declineInvite,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  );
}

export function useOrganization() {
  const context = useContext(OrganizationContext);
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider');
  }
  return context;
}
