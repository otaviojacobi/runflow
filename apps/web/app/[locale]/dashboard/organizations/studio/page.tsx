'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOrganization } from '@/contexts/OrganizationContext'
import { HexColorPicker } from "react-colorful";

export default function OrganizationSetupPage() {
  const t = useTranslations('Organizations')
  const { currentOrganization, loading: orgLoading, updateCurrentOrganizationColors } = useOrganization()
  const [loading, setLoading] = useState(false)

  const [draftPrimaryColor, setDraftPrimaryColor] = useState('#007bff')
  const [draftSecondaryColor, setDraftSecondaryColor] = useState('#6c757d')
  const [synced, setSynced] = useState(false)

  useEffect(() => {
    if (currentOrganization) {
      setDraftPrimaryColor(currentOrganization.primaryColor || '#007bff')
      setDraftSecondaryColor(currentOrganization.secondaryColor || '#6c757d')
      setSynced(true)
    }
  }, [currentOrganization])

  // react-colorful returns a hex string directly, so handlers update drafts only
  const handlePrimaryColorChange = (color: string) => {
    setDraftPrimaryColor(color)
  }

  const handleSecondaryColorChange = (color: string) => {
    setDraftSecondaryColor(color)
  }

  const colorsUnchanged =
    currentOrganization &&
    currentOrganization.primaryColor === draftPrimaryColor &&
    currentOrganization.secondaryColor === draftSecondaryColor

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
          primaryColor: draftPrimaryColor,
          secondaryColor: draftSecondaryColor,
        }),
      })

      if (response.ok) {
        const data = await response.json()
        const org = data.organization
        // Update context with authoritative values returned by server
        updateCurrentOrganizationColors(org.primaryColor ?? draftPrimaryColor, org.secondaryColor ?? draftSecondaryColor)
        // update drafts to match saved authoritative values
        setDraftPrimaryColor(org.primaryColor ?? draftPrimaryColor)
        setDraftSecondaryColor(org.secondaryColor ?? draftSecondaryColor)
      } else {
        console.error('Failed to save colors')
      }
    } catch (error) {
      console.error('Error saving colors:', error)
    } finally {
      setLoading(false)
    }
  }

  if (orgLoading || !synced) {
    return (
      <div className="max-w-2xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />

        <div className="flex justify-center">
          <Card className="w-full max-w-md">
            <CardHeader>
              <div className="text-center">
                <CardTitle>
                  <div className="h-6 bg-gray-200 rounded w-24 mx-auto" />
                </CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-row items-center justify-between gap-8 py-6 px-6">
              <div className="h-40 w-40 bg-gray-200 rounded" />
              <div className="flex flex-col items-center space-y-3">
                <div className="h-32 w-32 bg-gray-200 rounded-full" />
                <div className="h-4 bg-gray-200 rounded w-24" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
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
            <HexColorPicker
              color={draftPrimaryColor}
              onChange={handlePrimaryColorChange}
            />
            <div className="flex flex-col items-center space-y-3">
              <div
                style={{
                  backgroundColor: draftPrimaryColor,
                  width: '128px',
                  height: '128px',
                  borderRadius: '50%',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '4px solid #d1d5db'
                }}
              />
              <p className="text-sm font-medium text-gray-700">{draftPrimaryColor}</p>
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
            <HexColorPicker
              color={draftSecondaryColor}
              onChange={handleSecondaryColorChange}
            />
            <div className="flex flex-col items-center space-y-3">
              <div
                style={{
                  backgroundColor: draftSecondaryColor,
                  width: '128px',
                  height: '128px',
                  borderRadius: '50%',
                  boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
                  border: '4px solid #d1d5db'
                }}
              />
              <p className="text-sm font-medium text-gray-700">{draftSecondaryColor}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-center pt-4">
        <Button
          onClick={saveColors}
          disabled={loading || !!colorsUnchanged}
          variant={colorsUnchanged ? 'secondary' : 'default'}
        >
          {loading
            ? t('savingColors')
            : colorsUnchanged
            ? t('colorsAlreadySaved')
            : t('saveColors')}
        </Button>
      </div>
    </div>
  )
}