'use client'

import { useState, useEffect, useCallback } from 'react'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { toast } from 'sonner'
import { CheckCircle2, Clock, XCircle, Dumbbell, Activity, Loader2, WifiOff, Wifi, ChevronLeft, ChevronRight } from 'lucide-react'
import { format, startOfWeek, endOfWeek, addWeeks, subWeeks, isWithinInterval, isSameDay } from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'
import { useTranslations, useLocale } from 'next-intl'
import dynamic from 'next/dynamic'
import '@uiw/react-markdown-preview/markdown.css'

// Dynamic import for markdown preview
const MarkdownPreview = dynamic(() => import('@uiw/react-markdown-preview'), { ssr: false })

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
  createdAt: string
  updatedAt: string
  trainer: {
    id: string
    name: string
  }
}

const CACHE_KEY = 'student_trainings_cache'
const CACHE_TIMESTAMP_KEY = 'student_trainings_cache_timestamp'

export default function StudentTrainingCards() {
  const { currentOrganization, user } = useOrganization()
  const t = useTranslations('Trainings')
  const locale = useLocale()
  const dateLocale = locale === 'pt' ? ptBR : enUS
  const [trainings, setTrainings] = useState<Training[]>([])
  const [loading, setLoading] = useState(true)
  const [initialLoad, setInitialLoad] = useState(true)
  const [isOnline, setIsOnline] = useState(true)
  const [lastSync, setLastSync] = useState<Date | null>(null)
  const [currentWeekStart, setCurrentWeekStart] = useState(startOfWeek(new Date(), { weekStartsOn: 1 }))

  // Check online status
  useEffect(() => {
    const updateOnlineStatus = () => {
      setIsOnline(navigator.onLine)
    }

    window.addEventListener('online', updateOnlineStatus)
    window.addEventListener('offline', updateOnlineStatus)

    return () => {
      window.removeEventListener('online', updateOnlineStatus)
      window.removeEventListener('offline', updateOnlineStatus)
    }
  }, [])

  // Load from cache on mount
  useEffect(() => {
    loadFromCache()
  }, [])

  // Fetch trainings when online and organization changes
  useEffect(() => {
    if (currentOrganization && user && isOnline) {
      fetchTrainings()
    }
  }, [currentOrganization, user, isOnline])

  const loadFromCache = () => {
    try {
      const cached = localStorage.getItem(CACHE_KEY)
      const timestamp = localStorage.getItem(CACHE_TIMESTAMP_KEY)

      if (cached) {
        setTrainings(JSON.parse(cached))
        if (timestamp) {
          setLastSync(new Date(parseInt(timestamp)))
        }
      }
    } catch (error) {
      console.error('Error loading from cache:', error)
    }
  }

  const saveToCache = (data: Training[]) => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(data))
      localStorage.setItem(CACHE_TIMESTAMP_KEY, Date.now().toString())
      setLastSync(new Date())
    } catch (error) {
      console.error('Error saving to cache:', error)
    }
  }

  const fetchTrainings = async () => {
    if (!currentOrganization || !user) {
      setLoading(false)
      setInitialLoad(false)
      return
    }

    setLoading(true)
    try {
      // Fetch trainings for the current user as a member
      const response = await fetch(
        `/api/trainings?organizationId=${currentOrganization.id}&memberId=${user.id}`
      )

      if (response.ok) {
        const data: Training[] = await response.json()
        setTrainings(data)
        saveToCache(data)
        if (!initialLoad) {
          toast.success(t('syncSuccess'))
        }
      } else {
        toast.error(t('errors.failedToFetch'))
      }
    } catch (error) {
      console.error('Error fetching trainings:', error)
      toast.error(t('syncErrorUsingCache'))
    } finally {
      setLoading(false)
      setInitialLoad(false)
    }
  }

  const handleStatusChange = async (trainingId: string, newStatus: 'COMPLETED' | 'MISSED' | 'TODO', previousStatus: 'COMPLETED' | 'MISSED' | 'TODO') => {
    if (!isOnline) {
      toast.error(t('needOnlineToChange'))
      return
    }

    try {
      const response = await fetch(`/api/trainings/${trainingId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus,
        }),
      })

      if (response.ok) {
        // Show success message with undo option
        const statusMessage = newStatus === 'COMPLETED' ? t('markedAsDone') :
                             newStatus === 'MISSED' ? t('markedAsMissed') :
                             t('markedAsTodo')

        toast.success(statusMessage, {
          action: {
            label: t('undo'),
            onClick: () => handleStatusChange(trainingId, previousStatus, newStatus),
          },
          duration: 5000,
        })
        fetchTrainings()
      } else {
        toast.error(t('failedToChangeStatus'))
      }
    } catch (error) {
      console.error('Error changing status:', error)
      toast.error(t('failedToChangeStatus'))
    }
  }

  const handleMarkAsDone = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId)
    const previousStatus = training?.status || 'TODO'
    handleStatusChange(trainingId, 'COMPLETED', previousStatus)
  }

  const handleMarkAsMissed = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId)
    const previousStatus = training?.status || 'TODO'
    handleStatusChange(trainingId, 'MISSED', previousStatus)
  }

  const handleMarkAsTodo = (trainingId: string) => {
    const training = trainings.find(t => t.id === trainingId)
    const previousStatus = training?.status || 'TODO'
    handleStatusChange(trainingId, 'TODO', previousStatus)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <CheckCircle2 className="h-5 w-5 text-green-600" />
      case 'MISSED':
        return <XCircle className="h-5 w-5 text-red-600" />
      default:
        return <Clock className="h-5 w-5 text-blue-600" />
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return <Badge variant="outline" className="border-green-600 text-green-700 bg-white">{t('status.completed')}</Badge>
      case 'MISSED':
        return <Badge variant="outline" className="border-red-600 text-red-700 bg-white">{t('status.missed')}</Badge>
      default:
        return <Badge variant="outline" className="border-blue-600 text-blue-700 bg-white">{t('status.todo')}</Badge>
    }
  }

  const getTypeIcon = (type: string) => {
    return type === 'RUNNING' ? (
      <Activity className="h-5 w-5" />
    ) : (
      <Dumbbell className="h-5 w-5" />
    )
  }

  // Filter trainings for the current week
  const weekStart = currentWeekStart
  const weekEnd = endOfWeek(currentWeekStart, { weekStartsOn: 1 })

  const weekTrainings = trainings.filter((training) => {
    // Parse date as local time to avoid timezone issues
    const dateString = training.scheduledDate.split('T')[0]
    if (!dateString) return false
    const parts = dateString.split('-').map(Number)
    const year = parts[0]
    const month = parts[1]
    const day = parts[2]
    if (year === undefined || month === undefined || day === undefined) return false
    const trainingDate = new Date(year, month - 1, day)
    return isWithinInterval(trainingDate, { start: weekStart, end: weekEnd })
  })

  // Group trainings by day
  const trainingsByDay = weekTrainings.reduce((acc, training) => {
    // Parse date as local time to avoid timezone issues
    const dateString = training.scheduledDate.split('T')[0]
    if (!dateString) return acc
    const dateKey = dateString // Use the YYYY-MM-DD string directly
    if (!acc[dateKey]) {
      acc[dateKey] = []
    }
    acc[dateKey].push(training)
    return acc
  }, {} as Record<string, Training[]>)

  // Sort days
  const sortedDays = Object.keys(trainingsByDay).sort()

  const goToPreviousWeek = () => {
    const previousWeek = subWeeks(currentWeekStart, 1)
    setCurrentWeekStart(startOfWeek(previousWeek, { weekStartsOn: 1 }))
  }

  const goToNextWeek = () => {
    const nextWeek = addWeeks(currentWeekStart, 1)
    setCurrentWeekStart(startOfWeek(nextWeek, { weekStartsOn: 1 }))
  }

  const goToCurrentWeek = () => {
    setCurrentWeekStart(startOfWeek(new Date(), { weekStartsOn: 1 }))
  }

  const isCurrentWeek = isSameDay(currentWeekStart, startOfWeek(new Date(), { weekStartsOn: 1 }))

  if (initialLoad && loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold">{t('myTrainingSchedule')}</h2>
          <p className="text-sm text-gray-500">
            {format(weekStart, 'MMM d', { locale: dateLocale })} - {format(weekEnd, 'MMM d, yyyy', { locale: dateLocale })}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {isOnline ? (
            <div className="flex items-center gap-2 text-green-600">
              <Wifi className="h-4 w-4" />
              <span className="text-sm">{t('online')}</span>
            </div>
          ) : (
            <div className="flex items-center gap-2 text-orange-600">
              <WifiOff className="h-4 w-4" />
              <span className="text-sm">{t('offline')}</span>
            </div>
          )}
          {isOnline && (
            <Button onClick={fetchTrainings} disabled={loading} size="sm">
              {loading && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
              {t('sync')}
            </Button>
          )}
        </div>
      </div>

      {/* Week Navigation */}
      <div className="flex items-center justify-between gap-4 bg-white rounded-lg shadow p-4">
        <Button onClick={goToPreviousWeek} variant="outline" size="sm">
          <ChevronLeft className="h-4 w-4 md:mr-1" />
          <span className="hidden md:inline">{t('previousWeek')}</span>
        </Button>
        {!isCurrentWeek && (
          <Button onClick={goToCurrentWeek} variant="default" size="sm">
            {t('currentWeek')}
          </Button>
        )}
        <Button onClick={goToNextWeek} variant="outline" size="sm">
          <span className="hidden md:inline">{t('nextWeek')}</span>
          <ChevronRight className="h-4 w-4 md:ml-1" />
        </Button>
      </div>

      {!isOnline && (
        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <p className="text-sm text-orange-800">
            {t('offlineMessage')}
          </p>
        </div>
      )}

      {sortedDays.length === 0 && !loading && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <p className="text-gray-500 text-center">
              {t('noTrainingsThisWeek')}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="space-y-4">
        {sortedDays.map((dateKey) => {
          const dayTrainings = trainingsByDay[dateKey]
          // Parse date as local time
          const parts = dateKey.split('-').map(Number)
          const year = parts[0]
          const month = parts[1]
          const day = parts[2]
          if (year === undefined || month === undefined || day === undefined) return null
          const date = new Date(year, month - 1, day)

          if (!dayTrainings) return null

          return (
            <Card key={dateKey}>
              <CardHeader className="pb-3">
                <CardTitle className="text-xl">
                  {format(date, 'EEEE, MMMM d', { locale: dateLocale })}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-0">
                {dayTrainings.map((training, index) => (
                  <div key={training.id}>
                    {index > 0 && <div className="border-t border-gray-200 my-4" />}

                    <div className="space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1 space-y-1">
                          <div className="flex items-center gap-2">
                            {getTypeIcon(training.type)}
                            <h3 className="font-semibold text-lg">{training.title}</h3>
                          </div>
                          {training.subtitle && (
                            <p className="text-sm text-gray-600">{training.subtitle}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {getStatusBadge(training.status)}
                        </div>
                      </div>

                      {training.description && (
                        <div className="prose prose-sm max-w-none bg-gray-50 rounded-md p-3">
                          <MarkdownPreview
                            source={training.description}
                            style={{ backgroundColor: 'transparent', color: 'inherit' }}
                          />
                        </div>
                      )}

                      <div className="text-sm text-gray-500">
                        <p>{t('trainer')}: {training.trainer.name}</p>
                      </div>

                      <div className="flex gap-2 pt-2">
                        {training.status === 'TODO' && (
                          <>
                            <Button
                              onClick={() => handleMarkAsMissed(training.id)}
                              disabled={!isOnline}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-600 text-red-700 hover:bg-red-50 text-xs md:text-sm"
                            >
                              <XCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              <span className="truncate">{t('markAsMissed')}</span>
                            </Button>
                            <Button
                              onClick={() => handleMarkAsDone(training.id)}
                              disabled={!isOnline}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-green-600 text-green-700 hover:bg-green-50 text-xs md:text-sm"
                            >
                              <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              <span className="truncate">{t('markAsDone')}</span>
                            </Button>
                          </>
                        )}
                        {training.status === 'COMPLETED' && (
                          <>
                            <Button
                              onClick={() => handleMarkAsMissed(training.id)}
                              disabled={!isOnline}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-red-600 text-red-700 hover:bg-red-50 text-xs md:text-sm"
                            >
                              <XCircle className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              <span className="truncate">{t('markAsMissed')}</span>
                            </Button>
                            <Button
                              onClick={() => handleMarkAsTodo(training.id)}
                              disabled={!isOnline}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-blue-600 text-blue-700 hover:bg-blue-50 text-xs md:text-sm"
                            >
                              <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              <span className="truncate">{t('markAsTodo')}</span>
                            </Button>
                          </>
                        )}
                        {training.status === 'MISSED' && (
                          <>
                            <Button
                              onClick={() => handleMarkAsTodo(training.id)}
                              disabled={!isOnline}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-blue-600 text-blue-700 hover:bg-blue-50 text-xs md:text-sm"
                            >
                              <Clock className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              <span className="truncate">{t('markAsTodo')}</span>
                            </Button>
                            <Button
                              onClick={() => handleMarkAsDone(training.id)}
                              disabled={!isOnline}
                              variant="outline"
                              size="sm"
                              className="flex-1 border-green-600 text-green-700 hover:bg-green-50 text-xs md:text-sm"
                            >
                              <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2" />
                              <span className="truncate">{t('markAsDone')}</span>
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
