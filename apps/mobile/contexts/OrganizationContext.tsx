import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
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

  // Fetch user and organizations on mount
  useEffect(() => {
    fetchUserAndOrganizations();
  }, []);

  // Update current organization when user changes
  useEffect(() => {
    if (user && user.currentOrganizationId) {
      const current = organizations.find(org => org.id === user.currentOrganizationId);
      setCurrentOrganization(current || null);

      // Update theme when organization changes
      if (current) {
        updateTheme(current.id);
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

      setUser(userData);
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

      // Update theme
      await updateTheme(organizationId);
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
