'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Popover, PopoverTrigger, PopoverContent } from '@/components/ui/popover'
import { useOrganization } from '@/contexts/OrganizationContext'
import { HexColorPicker } from "react-colorful"
import { ShieldAlert, X, ImageIcon, Loader2 } from 'lucide-react'

// ─── Color Swatch (opens picker in a popover) ───────────────────────────────

function ColorSwatch({
  label,
  color,
  onChange,
}: {
  label: string
  color: string
  onChange: (color: string) => void
}) {
  const [inputValue, setInputValue] = useState(color)

  useEffect(() => {
    setInputValue(color)
  }, [color])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let val = e.target.value
    if (!val.startsWith('#')) val = '#' + val
    setInputValue(val)
    if (/^#[0-9a-fA-F]{6}$/.test(val)) {
      onChange(val)
    }
  }

  const handleInputBlur = () => {
    if (!/^#[0-9a-fA-F]{6}$/.test(inputValue)) {
      setInputValue(color)
    }
  }

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="flex flex-col items-center gap-2 group cursor-pointer"
        >
          <div
            className="w-12 h-12 rounded-full border-2 border-gray-300 shadow-sm transition-transform group-hover:scale-110"
            style={{ backgroundColor: color }}
          />
          <span className="text-xs font-medium text-gray-500 group-hover:text-gray-700 transition-colors">
            {label}
          </span>
          <span className="text-[11px] font-mono text-gray-400">{color}</span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-3 space-y-3" side="top">
        <HexColorPicker color={color} onChange={onChange} />
        <input
          type="text"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          maxLength={7}
          className="w-full text-center text-sm font-mono border border-gray-300 rounded-md px-2 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          onClick={(e) => e.stopPropagation()}
        />
      </PopoverContent>
    </Popover>
  )
}

// ─── Logo Dropzone ───────────────────────────────────────────────────────────

function LogoDropzone({
  logoUrl,
  uploading,
  onUpload,
  onRemove,
  t,
}: {
  logoUrl: string | null
  uploading: boolean
  onUpload: (file: File) => void
  onRemove: () => void
  t: (key: string) => string
}) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [dragActive, setDragActive] = useState(false)

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }, [])

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault()
      e.stopPropagation()
      setDragActive(false)
      const file = e.dataTransfer.files?.[0]
      if (file) onUpload(file)
    },
    [onUpload]
  )

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) onUpload(file)
    e.target.value = ''
  }

  if (logoUrl) {
    return (
      <div className="flex items-center gap-4">
        <div className="relative group shrink-0">
          <img
            src={logoUrl}
            alt="Organization logo"
            className="w-20 h-20 rounded-2xl object-cover border-2 border-gray-200 shadow-sm"
          />
          <button
            type="button"
            onClick={onRemove}
            disabled={uploading}
            className="absolute -top-2 -right-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-1 shadow-md opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
          >
            <X className="w-3 h-3" />
          </button>
        </div>
        <div className="flex flex-col gap-1.5">
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={uploading}
            onClick={() => inputRef.current?.click()}
          >
            {uploading ? (
              <><Loader2 className="w-3.5 h-3.5 animate-spin" /> {t('uploadingLogo')}</>
            ) : (
              t('logoDropzoneText').split(',')[1]?.trim() || 'Browse'
            )}
          </Button>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            disabled={uploading}
            onClick={onRemove}
            className="text-red-500 hover:text-red-600 hover:bg-red-50"
          >
            {t('removeLogo')}
          </Button>
        </div>
        <input
          ref={inputRef}
          type="file"
          accept="image/png,image/jpeg,image/webp,image/svg+xml"
          className="hidden"
          onChange={handleChange}
        />
      </div>
    )
  }

  return (
    <div
      onDragEnter={handleDrag}
      onDragLeave={handleDrag}
      onDragOver={handleDrag}
      onDrop={handleDrop}
      onClick={() => !uploading && inputRef.current?.click()}
      className={`
        cursor-pointer rounded-2xl border-2 border-dashed transition-all duration-200
        flex items-center gap-4 py-5 px-5
        ${dragActive
          ? 'border-blue-400 bg-blue-50/60 scale-[1.01]'
          : 'border-gray-300 hover:border-gray-400 hover:bg-gray-50/50'
        }
        ${uploading ? 'pointer-events-none opacity-60' : ''}
      `}
    >
      {uploading ? (
        <Loader2 className="w-8 h-8 text-blue-500 animate-spin shrink-0" />
      ) : (
        <div
          className={`
            w-12 h-12 rounded-xl flex items-center justify-center transition-colors shrink-0
            ${dragActive ? 'bg-blue-100' : 'bg-gray-100'}
          `}
        >
          <ImageIcon className={`w-6 h-6 ${dragActive ? 'text-blue-500' : 'text-gray-400'}`} />
        </div>
      )}
      <div>
        <p className={`text-sm font-medium ${dragActive ? 'text-blue-600' : 'text-gray-600'}`}>
          {uploading ? t('uploadingLogo') : t('logoDropzoneText')}
        </p>
        <p className="text-xs text-gray-400 mt-0.5">{t('logoDropzoneHint')}</p>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/png,image/jpeg,image/webp,image/svg+xml"
        className="hidden"
        onChange={handleChange}
      />
    </div>
  )
}

// ─── Phone Preview ───────────────────────────────────────────────────────────

function PhonePreview({
  primaryColor,
  secondaryColor,
  orgName,
  logoUrl,
}: {
  primaryColor: string
  secondaryColor: string
  orgName: string
  logoUrl: string | null
}) {
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
            <span className="flex gap-1 text-[9px]">&bull;&bull;&bull;</span>
          </div>

          {/* Header bar with logo */}
          <div
            className="px-4 py-3 border-b border-white/20 flex items-center gap-2.5"
            style={{ backgroundColor: primaryColor }}
          >
            {logoUrl ? (
              <img
                src={logoUrl}
                alt=""
                className="w-7 h-7 rounded-lg object-cover border border-white/30 shrink-0"
              />
            ) : (
              <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                <span className="text-[11px] font-bold text-white">
                  {(orgName ?? 'O').charAt(0).toUpperCase()}
                </span>
              </div>
            )}
            <p className="text-base font-semibold text-white truncate">{orgName || 'Dashboard'}</p>
          </div>

          {/* Content area */}
          <div className="flex-1 p-3 space-y-2.5 bg-gray-50 overflow-y-auto">
            {/* Welcome banner */}
            <div
              className="rounded-xl p-3 text-white relative overflow-hidden"
              style={{ background: `linear-gradient(135deg, ${primaryColor}, ${secondaryColor})` }}
            >
              <div className="flex items-center gap-2">
                {logoUrl && (
                  <img
                    src={logoUrl}
                    alt=""
                    className="w-8 h-8 rounded-lg object-cover border border-white/30 shrink-0"
                  />
                )}
                <div>
                  <p className="text-[11px] font-bold">Welcome back!</p>
                  <p className="text-[9px] opacity-80 mt-0.5">{orgName || 'Organization'} Dashboard</p>
                </div>
              </div>
              <div className="absolute -right-3 -bottom-3 w-16 h-16 rounded-full opacity-20 bg-white" />
              <div className="absolute -right-1 -top-4 w-10 h-10 rounded-full opacity-10 bg-white" />
            </div>

            {/* Quick Actions Grid */}
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

// ─── Main Page ───────────────────────────────────────────────────────────────

export default function OrganizationSetupPage() {
  const router = useRouter()
  const t = useTranslations('Organizations')
  const {
    currentOrganization,
    organizations,
    loading: orgLoading,
    updateCurrentOrganizationColors,
    updateCurrentOrganizationLogo,
  } = useOrganization()

  const [loading, setLoading] = useState(false)
  const [logoUploading, setLogoUploading] = useState(false)
  const [logoError, setLogoError] = useState<string | null>(null)

  const [draftPrimaryColor, setDraftPrimaryColor] = useState('#007bff')
  const [draftSecondaryColor, setDraftSecondaryColor] = useState('#6c757d')
  const [logoPreviewUrl, setLogoPreviewUrl] = useState<string | null>(null)
  const [synced, setSynced] = useState(false)

  const userRole = currentOrganization
    ? (organizations.find(org => org.id === currentOrganization.id)?.role || 'ATHLETE')
    : 'ATHLETE'

  useEffect(() => {
    if (currentOrganization) {
      setDraftPrimaryColor(currentOrganization.primaryColor || '#007bff')
      setDraftSecondaryColor(currentOrganization.secondaryColor || '#6c757d')
      setLogoPreviewUrl(currentOrganization.logo || null)
      setSynced(true)
    }
  }, [currentOrganization])

  const colorsUnchanged =
    currentOrganization &&
    currentOrganization.primaryColor === draftPrimaryColor &&
    currentOrganization.secondaryColor === draftSecondaryColor

  const handleLogoUpload = async (file: File) => {
    if (!currentOrganization) return
    setLogoError(null)
    setLogoUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const response = await fetch(`/api/organizations/${currentOrganization.id}/logo`, {
        method: 'POST',
        body: formData,
      })
      const data = await response.json()
      if (response.ok) {
        setLogoPreviewUrl(data.logo)
        updateCurrentOrganizationLogo(data.logo)
      } else {
        setLogoError(data.error || t('logoUploadError'))
      }
    } catch {
      setLogoError(t('logoUploadError'))
    } finally {
      setLogoUploading(false)
    }
  }

  const handleLogoRemove = async () => {
    if (!currentOrganization) return
    setLogoError(null)
    setLogoUploading(true)
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/logo`, {
        method: 'DELETE',
      })
      if (response.ok) {
        setLogoPreviewUrl(null)
        updateCurrentOrganizationLogo(null)
      } else {
        const data = await response.json()
        setLogoError(data.error || t('logoDeleteError'))
      }
    } catch {
      setLogoError(t('logoDeleteError'))
    } finally {
      setLogoUploading(false)
    }
  }

  const saveColors = async () => {
    if (!currentOrganization) return
    setLoading(true)
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/studio`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
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
            <div className="h-48 bg-gray-200 rounded-lg" />
            <div className="h-20 bg-gray-200 rounded-lg" />
          </div>
          <div className="w-[320px] h-[640px] bg-gray-200 rounded-[2.5rem]" />
        </div>
      </div>
    )
  }

  if (userRole !== 'OWNER') {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Card className="max-w-md w-full text-center">
          <CardHeader className="flex flex-col items-center gap-3">
            <ShieldAlert className="h-12 w-12 text-destructive" />
            <CardTitle>{t('studioAccessDenied')}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {t('studioAccessDeniedDescription')}
            </p>
            <Button onClick={() => router.push('/dashboard')} variant="default">
              {t('backToDashboard')}
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="-mx-4 -my-8 h-[calc(100vh-4rem-1px)] overflow-hidden flex">
        {/* Left half — settings */}
        <div className="w-1/2 flex flex-col items-center justify-start pt-6 px-8 border-r border-gray-200">
          <h1 className="text-3xl font-bold tracking-tight mb-4">{t('Studio')}</h1>
          <div className="space-y-3 w-full max-w-md">
            {/* Logo */}
            <Card className="hover:shadow-lg transition-shadow py-4 gap-3">
              <CardHeader className="pb-0">
                <div className="text-center">
                  <CardTitle>{t('organizationLogo')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="px-6">
                <LogoDropzone
                  logoUrl={logoPreviewUrl}
                  uploading={logoUploading}
                  onUpload={handleLogoUpload}
                  onRemove={handleLogoRemove}
                  t={t}
                />
                {logoError && (
                  <p className="text-sm text-red-500 text-center mt-3">{logoError}</p>
                )}
              </CardContent>
            </Card>

            {/* Colors */}
            <Card className="hover:shadow-lg transition-shadow py-4 gap-3">
              <CardHeader className="pb-0">
                <div className="text-center">
                  <CardTitle>{t('colors')}</CardTitle>
                </div>
              </CardHeader>
              <CardContent className="flex justify-center gap-10 px-6">
                <ColorSwatch
                  label={t('primaryColor')}
                  color={draftPrimaryColor}
                  onChange={setDraftPrimaryColor}
                />
                <ColorSwatch
                  label={t('secondaryColor')}
                  color={draftSecondaryColor}
                  onChange={setDraftSecondaryColor}
                />
              </CardContent>
            </Card>

            {/* Save button */}
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

        {/* Right half — phone preview */}
        <div className="w-1/2 flex justify-center pt-6 px-8">
          <PhonePreview
            primaryColor={draftPrimaryColor}
            secondaryColor={draftSecondaryColor}
            orgName={currentOrganization?.name || ''}
            logoUrl={logoPreviewUrl}
          />
        </div>
    </div>
  )
}
