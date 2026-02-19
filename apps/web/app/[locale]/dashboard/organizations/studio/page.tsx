'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, UserPlus, ArrowRight } from 'lucide-react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { SketchPicker } from 'react-color'

export default function OrganizationSetupPage() {
  const router = useRouter()
  const t = useTranslations('Organizations')
  const { currentOrganization, refreshOrganizations } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [primaryColor, setPrimaryColor] = useState('#007bff')
  const [secondaryColor, setSecondaryColor] = useState('#6c757d')

  useEffect(() => {
    if (currentOrganization) {
      setPrimaryColor(currentOrganization.primaryColor || '#007bff')
      setSecondaryColor(currentOrganization.secondaryColor || '#6c757d')
    }
  }, [currentOrganization])

  const handlePrimaryColorChange = (color: any) => {
    setPrimaryColor(color.hex)
  }

  const handleSecondaryColorChange = (color: any) => {
    setSecondaryColor(color.hex)
  }

  const saveColors = async () => {
    if (!currentOrganization) return

    setLoading(true)
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/studio`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          primaryColor,
          secondaryColor,
        }),
      })

      if (response.ok) {
        // Colors are already displayed in component state, no need to refresh
        // This keeps the current selection visible without any visual changes
      } else {
        console.error('Failed to save colors')
      }
    } catch (error) {
      console.error('Error saving colors:', error)
    } finally {
      setLoading(false)
    }
  }


  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('Studio')}</h1>
      </div>

      <div className="flex justify-center">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow w-full max-w-md">
          <CardHeader>
            <div className="text-center">
              <CardTitle>{t('primaryColor')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-row items-center justify-between gap-8 py-6 px-6">
            <SketchPicker
              color={primaryColor}
              onChangeComplete={handlePrimaryColorChange}
            />
            <div className="flex flex-col items-center space-y-3">
              <div
                style={{
                  backgroundColor: primaryColor,
                  width: '128px',
                  height: '128px',
                  borderRadius: '50%',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '4px solid #d1d5db'
                }}
              />
              <p className="text-sm font-medium text-gray-700">{primaryColor}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow w-full max-w-md">
          <CardHeader>
            <div className="text-center">
              <CardTitle>{t('secondaryColor')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent className="flex flex-row items-center justify-between gap-8 py-6 px-6">
            <SketchPicker
              color={secondaryColor}
              onChangeComplete={handleSecondaryColorChange}
            />
            <div className="flex flex-col items-center space-y-3">
              <div
                style={{
                  backgroundColor: secondaryColor,
                  width: '128px',
                  height: '128px',
                  borderRadius: '50%',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '4px solid #d1d5db'
                }}
              />
              <p className="text-sm font-medium text-gray-700">{secondaryColor}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button onClick={saveColors} disabled={loading}>
          {loading ? t('savingColors') : t('saveColors')}
        </Button>
      </div>
    </div>
  )
}