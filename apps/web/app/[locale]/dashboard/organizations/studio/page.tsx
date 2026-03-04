'use client'

import { useState, useEffect } from 'react'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useOrganization } from '@/contexts/OrganizationContext'
import { HexColorPicker } from "react-colorful";

function PhonePreview({ primaryColor, secondaryColor, orgName }: { primaryColor: string; secondaryColor: string; orgName: string }) {
  const quickActions = [
    { icon: '👥', title: 'Team Management', description: 'Manage your athletes' },
    { icon: '📋', title: 'Create Training', description: 'Design training sheets' },
    { icon: '✉️', title: 'Invitations', description: 'Manage invites' },
    { icon: '📊', title: 'Team Analytics', description: 'Track progress' },
  ]

  return (
    <div className="flex flex-col items-center gap-3">
      <p className="text-lg font-semibold text-muted-foreground">App Preview</p>
      {/* Phone frame */}
      <div
        className="relative rounded-[2.5rem] shadow-xl overflow-hidden"
        style={{ width: 320, height: 640 }}
      >
        {/* Screen */}
        <div className="w-full h-full bg-white flex flex-col">
          {/* Status bar */}
          <div
            className="flex items-center justify-between px-6 pt-7 pb-1 text-[10px] font-medium text-white"
            style={{ backgroundColor: primaryColor }}
          >
            <span>9:41</span>
            <span className="flex gap-1 text-[9px]">●●●</span>
          </div>

          {/* Header bar */}
          <div
            className="px-4 py-3 border-b border-white/20"
            style={{ backgroundColor: primaryColor }}
          >
            <p className="text-base font-semibold text-white truncate">{orgName || 'Dashboard'}</p>
          </div>

          {/* Content area — mimics DashboardScreen */}
          <div className="flex-1 p-3 space-y-2.5 bg-gray-50 overflow-y-auto">
            {/* Welcome banner */}
            <div
              className="rounded-xl p-3 text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              <p className="text-[11px] font-bold">Welcome back!</p>
              <p className="text-[9px] opacity-80 mt-0.5">{orgName || 'Organization'} Dashboard</p>
              <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-20 bg-white" />
              <div className="absolute -right-1 -top-4 w-10 h-10 rounded-full opacity-10 bg-white" />
            </div>

            {/* Quick Actions Grid — 2x2 */}
            <div className="grid grid-cols-2 gap-2">
              {quickActions.map((action, i) => (
                <div key={i} className="rounded-xl bg-white p-2.5 shadow-sm border border-gray-200">
                  <div
                    className="w-8 h-8 rounded-lg flex items-center justify-center text-sm mb-1.5"
                    style={{ backgroundColor: i % 2 === 0 ? `${primaryColor}20` : `${secondaryColor}20` }}
                  >
                    {action.icon}
                  </div>
                  <p className="text-[10px] font-semibold text-gray-900 leading-tight">{action.title}</p>
                  <p className="text-[8px] text-gray-400 mt-0.5">{action.description}</p>
                </div>
              ))}
            </div>

            {/* Organization Stats Card */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="px-3 py-2" style={{ backgroundColor: secondaryColor }}>
                <p className="text-[11px] font-semibold text-white">Organization Stats</p>
                <p className="text-[8px] text-white/70">Team overview</p>
              </div>
              <div className="bg-white px-3 py-2 space-y-1.5">
                {[
                  { label: 'Total Members', value: '24', icon: '👥' },
                  { label: 'Active Athletes', value: '18', icon: '🏃' },
                  { label: 'Pending Invites', value: '3', icon: '✉️' },
                ].map((stat, i) => (
                  <div key={i} className="flex justify-between items-center py-1 border-b border-gray-50 last:border-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[10px]">{stat.icon}</span>
                      <span className="text-[9px] text-gray-500">{stat.label}</span>
                    </div>
                    <span className="text-[11px] font-bold" style={{ color: primaryColor }}>{stat.value}</span>
                  </div>
                ))}
              </div>
              {/* Mini bar chart */}
              <div className="bg-white px-3 pb-2 flex items-end gap-1 h-10">
                {[40, 65, 50, 80, 55, 70, 90].map((h, i) => (
                  <div
                    key={i}
                    className="flex-1 rounded-t-sm"
                    style={{
                      height: `${h}%`,
                      backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor,
                      opacity: 0.7,
                    }}
                  />
                ))}
              </div>
            </div>

            {/* Training Programs Card */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="px-3 py-2" style={{ backgroundColor: primaryColor }}>
                <p className="text-[11px] font-semibold text-white">Training Programs</p>
                <p className="text-[8px] text-white/70">Active sheets</p>
              </div>
              <div className="bg-white p-3 space-y-2">
                {/* Program items */}
                {[
                  { name: 'Strength A', progress: 75 },
                  { name: 'Cardio B', progress: 40 },
                ].map((prog, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-7 h-7 rounded-lg flex items-center justify-center text-[9px] text-white font-bold shrink-0"
                      style={{ backgroundColor: i === 0 ? primaryColor : secondaryColor }}
                    >
                      {prog.name[0]}
                    </div>
                    <div className="flex-1">
                      <p className="text-[9px] font-medium text-gray-900">{prog.name}</p>
                      <div className="h-1.5 rounded-full bg-gray-100 w-full mt-0.5 overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${prog.progress}%`,
                            backgroundColor: i === 0 ? primaryColor : secondaryColor,
                          }}
                        />
                      </div>
                    </div>
                    <span className="text-[8px] font-medium" style={{ color: i === 0 ? primaryColor : secondaryColor }}>{prog.progress}%</span>
                  </div>
                ))}
                {/* Create button */}
                <button
                  className="w-full rounded-lg py-1.5 text-[9px] font-medium text-white mt-1"
                  style={{ backgroundColor: secondaryColor }}
                >
                  + Create new program
                </button>
              </div>
            </div>

            {/* Upcoming Schedule */}
            <div className="rounded-xl overflow-hidden shadow-sm border border-gray-200">
              <div className="px-3 py-2 flex justify-between items-center" style={{ backgroundColor: `${primaryColor}10` }}>
                <p className="text-[10px] font-semibold text-gray-900">Upcoming Schedule</p>
                <span className="text-[8px] font-medium" style={{ color: primaryColor }}>See all</span>
              </div>
              <div className="bg-white px-3 py-2 space-y-2">
                {[
                  { time: '08:00', title: 'Morning Run', tag: 'Cardio' },
                  { time: '14:00', title: 'Weight Training', tag: 'Strength' },
                  { time: '17:30', title: 'Team Practice', tag: 'Group' },
                ].map((event, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div
                      className="w-1 h-8 rounded-full shrink-0"
                      style={{ backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor }}
                    />
                    <div className="flex-1">
                      <p className="text-[9px] font-medium text-gray-900">{event.title}</p>
                      <p className="text-[8px] text-gray-400">{event.time}</p>
                    </div>
                    <span
                      className="text-[7px] font-medium px-1.5 py-0.5 rounded-full text-white"
                      style={{ backgroundColor: i % 2 === 0 ? primaryColor : secondaryColor }}
                    >
                      {event.tag}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Bottom Tab Bar */}
          <div className="flex items-center justify-around py-2 border-t" style={{ borderColor: '#E5E7EB', backgroundColor: 'white' }}>
            {[
              { icon: '▦', label: 'Dashboard', active: true },
              { icon: '🏢', label: 'Orgs', active: false },
              { icon: '👥', label: 'Athletes', active: false },
              { icon: '👤', label: 'Profile', active: false },
            ].map((tab, i) => (
              <div key={i} className="flex flex-col items-center gap-0.5">
                <span className="text-sm" style={{ color: tab.active ? primaryColor : secondaryColor }}>{tab.icon}</span>
                <span className="text-[8px] font-medium" style={{ color: tab.active ? primaryColor : secondaryColor }}>{tab.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

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
        updateCurrentOrganizationColors(org.primaryColor ?? draftPrimaryColor, org.secondaryColor ?? draftSecondaryColor)
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
      <div className="max-w-5xl mx-auto space-y-6 animate-pulse">
        <div className="h-8 bg-gray-200 rounded w-1/3 mx-auto" />
        <div className="flex gap-8">
          <div className="flex-1 space-y-6">
            <div className="h-64 bg-gray-200 rounded-lg" />
            <div className="h-64 bg-gray-200 rounded-lg" />
          </div>
          <div className="w-[260px] h-[520px] bg-gray-200 rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  return (
    <div className="relative left-1/2 right-1/2 -ml-[50vw] -mr-[50vw] w-screen space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('Studio')}</h1>
      </div>

      <div className="flex flex-row max-w-7xl mx-auto">
        {/* Color pickers column — left half */}
        <div className="w-1/2 flex justify-center">
        <div className="space-y-6 w-full max-w-md">
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-center">
                <CardTitle>{t('primaryColor')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-4 px-6">
              <HexColorPicker
                color={draftPrimaryColor}
                onChange={handlePrimaryColorChange}
              />
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: draftPrimaryColor }}
                />
                <p className="text-sm font-mono font-medium text-gray-700">{draftPrimaryColor}</p>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="text-center">
                <CardTitle>{t('secondaryColor')}</CardTitle>
              </div>
            </CardHeader>
            <CardContent className="flex flex-col items-center gap-4 py-4 px-6">
              <HexColorPicker
                color={draftSecondaryColor}
                onChange={handleSecondaryColorChange}
              />
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-full border-2 border-gray-300 shadow-sm"
                  style={{ backgroundColor: draftSecondaryColor }}
                />
                <p className="text-sm font-mono font-medium text-gray-700">{draftSecondaryColor}</p>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-center pt-2">
            <Button
              onClick={saveColors}
              disabled={loading || !!colorsUnchanged}
              variant={colorsUnchanged ? 'secondary' : 'default'}
              className="w-full"
            >
              {loading
                ? t('savingColors')
                : colorsUnchanged
                ? t('colorsAlreadySaved')
                : t('saveColors')}
            </Button>
          </div>
        </div>
        </div>

        {/* Phone preview column */}
        <div className="w-1/2 flex justify-center">
          <PhonePreview
            primaryColor={draftPrimaryColor}
            secondaryColor={draftSecondaryColor}
            orgName={currentOrganization?.name || ''}
          />
        </div>
      </div>
    </div>
  )
}