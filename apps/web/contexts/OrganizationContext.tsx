'use client'

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'

export interface Organization {
  id: string
  name: string
  slug: string
  description?: string | null
  logo?: string | null
  primaryColor?: string | null
  secondaryColor?: string | null
  role?: string
  joinedAt?: string
}

export interface PendingInvite {
  id: string
  token: string
  role: string
  expiresAt: string
  organization: {
    id: string
    name: string
    slug: string
    description?: string | null
    logo?: string | null
  }
  invitedBy: {
    id: string
    email: string
    name?: string | null
  }
}

interface UserProfile {
  id: string
  email: string
  name?: string | null
  currentOrganizationId?: string | null
  createdAt: string
  updatedAt: string
  organizations?: Organization[]
}

interface OrganizationContextType {
  currentOrganization: Organization | null
  organizations: Organization[]
  pendingInvites: PendingInvite[]
  user: UserProfile | null
  loading: boolean
  switchOrganization: (organizationId: string) => Promise<void>
  refreshOrganizations: () => Promise<void>
  acceptInvite: (token: string) => Promise<void>
  declineInvite: (inviteId: string) => Promise<void>
}

const OrganizationContext = createContext<OrganizationContextType | undefined>(undefined)

export function useOrganization() {
  const context = useContext(OrganizationContext)
  if (context === undefined) {
    throw new Error('useOrganization must be used within an OrganizationProvider')
  }
  return context
}

interface OrganizationProviderProps {
  children: React.ReactNode
}

export function OrganizationProvider({ children }: OrganizationProviderProps) {
  const [currentOrganization, setCurrentOrganization] = useState<Organization | null>(null)
  const [organizations, setOrganizations] = useState<Organization[]>([])
  const [pendingInvites, setPendingInvites] = useState<PendingInvite[]>([])
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  const fetchUserData = useCallback(async () => {
    try {
      const response = await fetch('/api/users/me')
      if (response.ok) {
        const data = await response.json()
        setUser(data.user)
        setCurrentOrganization(data.currentOrganization)
        setOrganizations(data.organizations || [])
        setPendingInvites(data.pendingInvites || [])
      }
    } catch (error) {
      console.error('Failed to fetch user data:', error)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchUserData()
  }, [fetchUserData])

  const switchOrganization = async (organizationId: string) => {
    try {
      const response = await fetch('/api/users/switch-organization', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ organizationId }),
      })

      if (response.ok) {
        const data = await response.json()
        setCurrentOrganization(data.currentOrganization)
        setUser(data.user)
        // Force refresh the user data to get updated organization list
        await fetchUserData()
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to switch organization:', error)
    }
  }

  const refreshOrganizations = async () => {
    await fetchUserData()
  }

  const acceptInvite = async (token: string) => {
    try {
      const response = await fetch(`/api/invites/${token}/accept`, {
        method: 'POST',
      })

      if (response.ok) {
        await fetchUserData()
        router.refresh()
      }
    } catch (error) {
      console.error('Failed to accept invite:', error)
    }
  }

  const declineInvite = async (inviteId: string) => {
    // For now, just remove from local state
    // In the future, you might want to add an API endpoint to decline invites
    setPendingInvites(invites => invites.filter(invite => invite.id !== inviteId))
  }

  return (
    <OrganizationContext.Provider
      value={{
        currentOrganization,
        organizations,
        pendingInvites,
        user,
        loading,
        switchOrganization,
        refreshOrganizations,
        acceptInvite,
        declineInvite,
      }}
    >
      {children}
    </OrganizationContext.Provider>
  )
}