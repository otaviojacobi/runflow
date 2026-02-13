'use client'

import { useOrganization } from '@/contexts/OrganizationContext'


export default function InviteUsersPage() {
  const { currentOrganization } = useOrganization()

  return (
    <div className="max-w-4xl mx-auto space-y-6">

    {`${JSON.stringify(currentOrganization, null, 2)}`}

    </div>
  )
}
