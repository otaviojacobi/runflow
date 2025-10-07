'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, ArrowLeft } from 'lucide-react'
import { useOrganization } from '@/contexts/OrganizationContext'

export default function NewOrganizationPage() {
  const router = useRouter()
  const t = useTranslations('Organizations')
  const { refreshOrganizations } = useOrganization()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [formData, setFormData] = useState({
    name: '',
    description: ''
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const response = await fetch('/api/organizations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to create organization')
      }

      await refreshOrganizations()
      router.push('/dashboard')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="flex items-center gap-4">
        <Button
          variant="outline"
          size="icon"
          onClick={() => router.back()}
          className="border-gray-300 hover:bg-gray-50"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {t('createOrganization')}
          </h1>
          <p className="text-muted-foreground mt-1">
            {t('createDescription')}
          </p>
        </div>
      </div>

      <Card>
        <form onSubmit={handleSubmit}>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Building2 className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle>
                  {t('organizationName')}
                </CardTitle>
                <CardDescription>
                  {t('nameRequired')}
                </CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">
                {t('organizationName')} *
              </Label>
              <Input
                id="name"
                type="text"
                placeholder={t('organizationNamePlaceholder')}
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {t('nameRequired')}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">
                {t('organizationDescription')} {t('descriptionOptional')}
              </Label>
              <Textarea
                id="description"
                placeholder={t('organizationDescriptionPlaceholder')}
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                disabled={loading}
              />
              <p className="text-xs text-muted-foreground">
                {t('helpAthletesUnderstand')}
              </p>
            </div>

            {error && (
              <div className="rounded-md bg-destructive/10 p-3">
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}
          </CardContent>
          <CardFooter className="flex gap-2">
            <Button
              type="button"
              variant="cancel"
              onClick={() => router.back()}
              disabled={loading}
            >
              {t('cancel')}
            </Button>
            <Button type="submit" disabled={loading || !formData.name.trim()}>
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  {t('creating')}
                </>
              ) : (
                t('createOrganization')
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <Card className="border-muted">
        <CardHeader>
          <CardTitle className="text-lg">
            {t('whatsNext')}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">1</span>
            </div>
            <div>
              <p className="font-medium">
                {t('nextSteps.invite.title')}
              </p>
              <p className="text-muted-foreground">
                {t('nextSteps.invite.description')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">2</span>
            </div>
            <div>
              <p className="font-medium">
                {t('nextSteps.sheets.title')}
              </p>
              <p className="text-muted-foreground">
                {t('nextSteps.sheets.description')}
              </p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <div className="h-5 w-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
              <span className="text-xs font-bold text-primary">3</span>
            </div>
            <div>
              <p className="font-medium">
                {t('nextSteps.progress.title')}
              </p>
              <p className="text-muted-foreground">
                {t('nextSteps.progress.description')}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}