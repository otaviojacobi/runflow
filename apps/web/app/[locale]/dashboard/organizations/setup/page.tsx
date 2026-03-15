'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Flag, UserPlus, ArrowRight } from 'lucide-react'

export default function OrganizationSetupPage() {
  const router = useRouter()
  const t = useTranslations('Organizations')
  const [loading, setLoading] = useState(false)

  const handleCreateOrganization = () => {
    router.push('/dashboard/organizations/new')
  }

  const handleJoinOrganization = () => {
    router.push('/dashboard/organizations/join')
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('welcomeToRunFlow')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('setupPrompt')}
        </p>
      </div>

      <div className="grid gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleCreateOrganization}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Flag className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{t('createNewOrganization')}</CardTitle>
                <CardDescription>
                  {t('createDescription')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('setupBenefits.coaches')}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                <span>{t('setupBenefits.unlimited')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                <span>{t('setupBenefits.custom')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-green-600"></div>
                <span>{t('setupBenefits.track')}</span>
              </div>
            </div>
            <Button className="w-full mt-6" onClick={(e) => {
              e.stopPropagation()
              handleCreateOrganization()
            }}>
              {t('createOrganization')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>

        <Card className="cursor-pointer hover:shadow-lg transition-shadow" onClick={handleJoinOrganization}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-secondary/50 flex items-center justify-center">
                <UserPlus className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <CardTitle>{t('joinExistingOrganization')}</CardTitle>
                <CardDescription>
                  {t('joinDescription')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">
              {t('dontHaveCodeDescription')}
            </p>
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                <span>{t('setupBenefits.join')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                <span>{t('setupBenefits.access')}</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="h-1.5 w-1.5 rounded-full bg-blue-600"></div>
                <span>{t('setupBenefits.connect')}</span>
              </div>
            </div>
            <Button variant="outline" className="w-full mt-6" onClick={(e) => {
              e.stopPropagation()
              handleJoinOrganization()
            }}>
              {t('joinOrganization')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}