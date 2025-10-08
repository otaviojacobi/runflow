import Constants from 'expo-constants';
import { supabase } from './supabase';
import type { UserProfile } from '@repo/schemas/user';
import type {
  OrganizationResponse,
  MemberResponse,
  InviteResponse
} from '@repo/schemas/organization';
import type { OrganizationTheme } from '@repo/schemas/theme';

const API_URL = Constants.expoConfig?.extra?.apiUrl || process.env.EXPO_PUBLIC_API_URL || 'http://localhost:3000';

// Helper to get auth headers
async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (session?.access_token) {
    headers['Authorization'] = `Bearer ${session.access_token}`;
  }

  return headers;
}

// Helper for API requests
async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const headers = await getAuthHeaders();
  const response = await fetch(`${API_URL}${endpoint}`, {
    ...options,
    headers: {
      ...headers,
      ...options.headers,
    },
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data.error || data.message || 'Request failed');
  }

  return data;
}

export const api = {
  // ============ Auth API ============
  async login(email: string, password: string) {
    return apiRequest('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
    });
  },

  async register(name: string, email: string, password: string, captchaToken?: string) {
    return apiRequest('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ name, email, password, captchaToken }),
    });
  },

  async logout() {
    return apiRequest('/api/auth/logout', {
      method: 'POST',
    });
  },

  async resendConfirmation(email: string) {
    return apiRequest('/api/auth/resend-confirmation', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });
  },

  // ============ User API ============
  async getCurrentUser() {
    return apiRequest<UserProfile>('/api/users/me');
  },

  async getPendingInvites() {
    return apiRequest<Array<InviteResponse & {
      organization: { id: string; name: string; description: string | null };
      invitedBy: { id: string; name: string | null; email: string };
    }>>('/api/users/me/pending-invites');
  },

  async switchOrganization(organizationId: string) {
    return apiRequest('/api/users/switch-organization', {
      method: 'POST',
      body: JSON.stringify({ organizationId }),
    });
  },

  // ============ Organizations API ============
  async getOrganizations() {
    return apiRequest<Array<OrganizationResponse & { role: string; joinedAt?: string }>>('/api/organizations');
  },

  async getOrganization(organizationId: string) {
    return apiRequest<OrganizationResponse>(`/api/organizations/${organizationId}`);
  },

  async createOrganization(name: string, description?: string) {
    return apiRequest('/api/organizations', {
      method: 'POST',
      body: JSON.stringify({ name, description }),
    });
  },

  async updateOrganization(organizationId: string, name: string, description?: string) {
    return apiRequest(`/api/organizations/${organizationId}`, {
      method: 'PUT',
      body: JSON.stringify({ name, description }),
    });
  },

  async deleteOrganization(organizationId: string) {
    return apiRequest(`/api/organizations/${organizationId}`, {
      method: 'DELETE',
    });
  },

  async getOrganizationTheme(organizationId: string) {
    return apiRequest<Partial<OrganizationTheme>>(`/api/organizations/${organizationId}/theme`);
  },

  // ============ Members API ============
  async getOrganizationMembers(organizationId: string) {
    return apiRequest<{ members: MemberResponse[] }>(`/api/organizations/${organizationId}/members`);
  },

  async removeMember(organizationId: string, userId: string) {
    return apiRequest(`/api/organizations/${organizationId}/members/${userId}`, {
      method: 'DELETE',
    });
  },

  async updateMemberRole(organizationId: string, userId: string, role: string) {
    return apiRequest(`/api/organizations/${organizationId}/members/${userId}`, {
      method: 'PUT',
      body: JSON.stringify({ role }),
    });
  },

  // ============ Invites API ============
  async getOrganizationInvites(organizationId: string) {
    return apiRequest<InviteResponse[]>(`/api/organizations/${organizationId}/invites`);
  },

  async createInvite(organizationId: string, email: string, role: string) {
    return apiRequest(`/api/organizations/${organizationId}/invites`, {
      method: 'POST',
      body: JSON.stringify({ email, role }),
    });
  },

  async revokeInvite(organizationId: string, inviteId: string) {
    return apiRequest(`/api/organizations/${organizationId}/invites/${inviteId}`, {
      method: 'DELETE',
    });
  },

  async acceptInvite(token: string) {
    return apiRequest(`/api/invites/${token}/accept`, {
      method: 'POST',
    });
  },

  async declineInvite(token: string) {
    return apiRequest(`/api/invites/${token}`, {
      method: 'DELETE',
    });
  },

  // ============ Athletes API ============
  // Note: Athletes are just members with ATHLETE role
  async getAthletes(organizationId: string) {
    const response = await this.getOrganizationMembers(organizationId);
    return {
      athletes: response.members.filter(member => member.role === 'ATHLETE'),
    };
  },

  async inviteAthlete(organizationId: string, email: string) {
    return this.createInvite(organizationId, email, 'ATHLETE');
  },

  async removeAthlete(organizationId: string, userId: string) {
    return this.removeMember(organizationId, userId);
  },
};
