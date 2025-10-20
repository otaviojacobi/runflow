'use client'

import { useState, useEffect } from 'react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { toast } from 'sonner'
import { Loader2, Trash2 } from 'lucide-react'
import dynamic from 'next/dynamic'
import { format, startOfDay } from 'date-fns'
import { useTranslations } from 'next-intl'
import '@uiw/react-md-editor/markdown-editor.css'
import '@uiw/react-markdown-preview/markdown.css'

// Dynamic import to avoid SSR issues
const MDEditor = dynamic(() => import('@uiw/react-md-editor'), { ssr: false })

interface Training {
  id: string
  title: string
  subtitle?: string
  description?: string
  type: 'RUNNING' | 'STRENGTH'
  status: 'TODO' | 'COMPLETED' | 'MISSED'
  scheduledDate: string
  trainerId: string
  memberId: string
  organizationId: string
}

interface Member {
  id: string
  name: string
  email: string
  role?: string
}

interface TrainingFormProps {
  training?: Training | null
  selectedDate?: Date | null
  preselectedAthleteId?: string
  onSuccess: () => void
  onCancel: () => void
}

export default function TrainingForm({ training, selectedDate, preselectedAthleteId, onSuccess, onCancel }: TrainingFormProps) {
  const { currentOrganization } = useOrganization()
  const t = useTranslations('Trainings')
  const [loading, setLoading] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [showDeleteDialog, setShowDeleteDialog] = useState(false)
  const [members, setMembers] = useState<Member[]>([])
  const [loadingMembers, setLoadingMembers] = useState(false)

  const [formData, setFormData] = useState({
    title: training?.title || '',
    subtitle: training?.subtitle || '',
    description: training?.description || '',
    type: training?.type || 'RUNNING',
    scheduledDate: training?.scheduledDate
      ? format(new Date(training.scheduledDate), 'yyyy-MM-dd')
      : selectedDate
      ? format(selectedDate, 'yyyy-MM-dd')
      : format(new Date(), 'yyyy-MM-dd'),
    memberId: training?.memberId || preselectedAthleteId || '',
  })

  useEffect(() => {
    if (currentOrganization) {
      fetchMembers()
    }
  }, [currentOrganization])

  const fetchMembers = async () => {
    if (!currentOrganization) return

    setLoadingMembers(true)
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/members`)

      if (response.ok) {
        const data = await response.json()
        // Include all members: athletes, trainers, and owners
        setMembers(data.members.map((m: any) => ({
          id: m.userId,
          name: m.user.name,
          email: m.user.email,
          role: m.role,
        })))
      }
    } catch (error) {
      console.error('Error fetching members:', error)
    } finally {
      setLoadingMembers(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!currentOrganization) {
      toast.error(t('errors.noOrganization'))
      return
    }

    if (!formData.title.trim()) {
      toast.error(t('errors.titleRequired'))
      return
    }

    if (!formData.memberId) {
      toast.error(t('errors.athleteRequired'))
      return
    }

    if (!formData.scheduledDate) {
      toast.error(t('errors.dateRequired'))
      return
    }

    setLoading(true)

    try {
      // Parse the date string as local time to avoid timezone issues
      const parts = formData.scheduledDate.split('-').map(Number)
      const year = parts[0]
      const month = parts[1]
      const day = parts[2]
      if (year === undefined || month === undefined || day === undefined) {
        toast.error(t('errors.dateRequired'))
        setLoading(false)
        return
      }
      const localDate = new Date(year, month - 1, day, 0, 0, 0, 0)

      const payload = {
        title: formData.title,
        subtitle: formData.subtitle || undefined,
        description: formData.description || undefined,
        type: formData.type,
        scheduledDate: localDate.toISOString(),
        memberId: formData.memberId,
        organizationId: currentOrganization.id,
      }

      const url = training ? `/api/trainings/${training.id}` : '/api/trainings'
      const method = training ? 'PATCH' : 'POST'

      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        toast.success(training ? t('success.updated') : t('success.created'))
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.message || (training ? t('errors.failedToUpdate') : t('errors.failedToCreate')))
      }
    } catch (error) {
      console.error('Error saving training:', error)
      toast.error(training ? t('errors.failedToUpdate') : t('errors.failedToCreate'))
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (!training) return

    setDeleting(true)
    try {
      const response = await fetch(`/api/trainings/${training.id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        toast.success(t('success.deleted'))
        onSuccess()
      } else {
        const error = await response.json()
        toast.error(error.message || t('errors.failedToDelete'))
      }
    } catch (error) {
      console.error('Error deleting training:', error)
      toast.error(t('errors.failedToDelete'))
    } finally {
      setDeleting(false)
      setShowDeleteDialog(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 md:space-y-6">
      {/* Title and Subtitle Row */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="title">{t('title')} *</Label>
          <Input
            id="title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder={t('titlePlaceholder')}
            required
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subtitle">{t('subtitle')}</Label>
          <Input
            id="subtitle"
            value={formData.subtitle}
            onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
            placeholder={t('subtitlePlaceholder')}
          />
        </div>
      </div>

      {/* Type, Date, Assign Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">{t('type')} *</Label>
          <Select
            value={formData.type}
            onValueChange={(value) => setFormData({ ...formData, type: value as 'RUNNING' | 'STRENGTH' })}
          >
            <SelectTrigger>
              <SelectValue placeholder={t('selectType')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="RUNNING">{t('running')}</SelectItem>
              <SelectItem value="STRENGTH">{t('strength')}</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="scheduledDate">{t('date')} *</Label>
          <Input
            id="scheduledDate"
            type="date"
            value={formData.scheduledDate}
            onChange={(e) => setFormData({ ...formData, scheduledDate: e.target.value })}
            required
          />
        </div>

        <div className="space-y-2 sm:col-span-2 md:col-span-2">
          <Label htmlFor="member">{t('assignToAthlete')} *</Label>
          <Select
            value={formData.memberId}
            onValueChange={(value) => setFormData({ ...formData, memberId: value })}
          >
            <SelectTrigger>
              <SelectValue placeholder={loadingMembers ? t('loadingMembers') : t('selectAthlete')} />
            </SelectTrigger>
            <SelectContent>
              {members.map((member) => (
                <SelectItem key={member.id} value={member.id}>
                  {member.name} ({member.email})
                  {member.role && member.role !== 'ATHLETE' && ` - ${member.role}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Description */}
      <div className="space-y-2">
        <Label htmlFor="description">{t('description')}</Label>
        <div data-color-mode="light" className="hidden md:block markdown-editor-custom">
          <MDEditor
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value || '' })}
            preview="live"
            height={400}
            textareaProps={{
              placeholder: t('descriptionPlaceholder'),
            }}
            previewOptions={{
              rehypePlugins: [],
            }}
          />
        </div>
        <div data-color-mode="light" className="md:hidden markdown-editor-custom">
          <MDEditor
            value={formData.description}
            onChange={(value) => setFormData({ ...formData, description: value || '' })}
            preview="live"
            height={250}
            textareaProps={{
              placeholder: t('descriptionPlaceholder'),
            }}
            previewOptions={{
              rehypePlugins: [],
            }}
          />
        </div>
        <p className="text-sm text-gray-500">
          {t('descriptionHelp')}
        </p>
      </div>

      <style jsx global>{`
        .markdown-editor-custom .w-md-editor-toolbar {
          padding: 8px;
        }

        .markdown-editor-custom .w-md-editor-toolbar button {
          font-size: 18px !important;
          width: 32px !important;
          height: 32px !important;
        }

        .markdown-editor-custom .w-md-editor-toolbar svg {
          width: 18px !important;
          height: 18px !important;
        }

        /* Hide the preview mode toggle buttons */
        .markdown-editor-custom .w-md-editor-toolbar ul:last-child {
          display: none !important;
        }

        /* Style placeholder to look like rendered markdown */
        .markdown-editor-custom .w-md-editor-text-pre textarea::placeholder {
          color: #6b7280;
          font-style: italic;
        }
      `}</style>

      <div className="flex items-center gap-2 justify-between">
        {training && (
          <Button
            type="button"
            variant="destructive"
            onClick={() => setShowDeleteDialog(true)}
            disabled={loading || deleting}
          >
            <Trash2 className="h-4 w-4 mr-2" />
            {t('delete')}
          </Button>
        )}
        <div className="flex items-center gap-2 ml-auto">
          <Button type="button" variant="outline" onClick={onCancel} disabled={loading || deleting}>
            {t('cancel')}
          </Button>
          <Button type="submit" disabled={loading || deleting}>
            {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
            {training ? t('update') : t('create')}
          </Button>
        </div>
      </div>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{t('deleteConfirmTitle')}</AlertDialogTitle>
            <AlertDialogDescription>
              {t('deleteConfirmDescription')}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={deleting}>{t('cancel')}</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={deleting}
              className="bg-red-600 hover:bg-red-700"
            >
              {deleting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('delete')}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  )
}
