'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ResendConfirmationButton } from '@/components/auth/ResendConfirmationButton'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { User, Mail, Calendar, Shield, Edit, Save, X } from 'lucide-react'
import { toast } from 'sonner'

interface UserProfile {
  id: string
  email: string
  email_confirmed_at: string | null
  created_at: string
  user_metadata: {
    name?: string
    avatar_url?: string
  }
}

export default function ProfilePage() {
  const t = useTranslations('Profile')
  const [user, setUser] = useState<UserProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')

  useEffect(() => {
    async function loadUser() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUser(user as UserProfile)
        setName(user.user_metadata?.name || '')
      }
      setLoading(false)
    }
    loadUser()
  }, [])

  const handleSaveProfile = async () => {
    setSaving(true)
    try {
      const supabase = createClient()
      const { error } = await supabase.auth.updateUser({
        data: { name }
      })

      if (error) {
        toast.error(t('updateError'))
      } else {
        toast.success(t('updateSuccess'))
        setEditing(false)

        // Refresh user data
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          setUser(user as UserProfile)
        }
      }
    } catch (error) {
      console.error('Failed to update profile:', error)
      toast.error(t('updateError'))
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  const isEmailConfirmed = user.email_confirmed_at !== null

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
        <p className="text-muted-foreground mt-2">
          {t('description')}
        </p>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <CardTitle>{name || user.email}</CardTitle>
                <CardDescription>{user.email}</CardDescription>
              </div>
            </div>
            {!editing && (
              <Button variant="outline" onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                {t('edit')}
              </Button>
            )}
          </div>
        </CardHeader>
        {editing && (
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">{t('nameLabel')}</Label>
              <Input
                id="name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('namePlaceholder')}
                disabled={saving}
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSaveProfile} disabled={saving}>
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {t('saving')}
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {t('save')}
                  </>
                )}
              </Button>
              <Button
                variant="outline"
                onClick={() => {
                  setEditing(false)
                  setName(user.user_metadata?.name || '')
                }}
                disabled={saving}
              >
                <X className="h-4 w-4 mr-2" />
                {t('cancel')}
              </Button>
            </div>
          </CardContent>
        )}
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5" />
            {t('emailVerificationTitle')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t('emailStatusLabel')}
              </p>
              {isEmailConfirmed ? (
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-500">
                    <Shield className="h-3 w-3 mr-1" />
                    {t('verifiedBadge')}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {t('confirmedOn', {
                      date: new Date(user.email_confirmed_at!).toLocaleDateString()
                    })}
                  </span>
                </div>
              ) : (
                <div className="space-y-3">
                  <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                    {t('notVerifiedBadge')}
                  </Badge>
                  <p className="text-sm text-muted-foreground">
                    {t('checkEmailMessage')}
                  </p>
                  <ResendConfirmationButton email={user.email} />
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            {t('accountInfo')}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('memberSince')}</span>
              <span className="font-medium">
                {new Date(user.created_at).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t('userId')}</span>
              <span className="font-mono text-xs">{user.id}</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
