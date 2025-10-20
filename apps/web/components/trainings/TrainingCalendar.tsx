'use client'

import { useState, useCallback, useEffect, useMemo } from 'react'
import { Calendar, dateFnsLocalizer } from 'react-big-calendar'
import { format, parse, startOfWeek, getDay, startOfDay } from 'date-fns'
import { enUS, ptBR } from 'date-fns/locale'
import 'react-big-calendar/lib/css/react-big-calendar.css'
import { useOrganization } from '@/contexts/OrganizationContext'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Plus, Loader2, Search } from 'lucide-react'
import { toast } from 'sonner'
import { useTranslations, useLocale } from 'next-intl'
import TrainingForm from './TrainingForm'

const locales = {
  'en-US': enUS,
  'pt-BR': ptBR,
}

const localizer = dateFnsLocalizer({
  format,
  parse,
  startOfWeek: (date: Date, options?: any) => startOfWeek(date, { ...options, weekStartsOn: 1 }),
  getDay,
  locales,
})

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
  member: {
    id: string
    name: string
  }
}

interface CalendarEvent {
  id: string
  title: string
  start: Date
  end: Date
  allDay: boolean
  resource: Training
}

interface Athlete {
  id: string
  name: string
  email: string
}

export default function TrainingCalendar() {
  const { currentOrganization } = useOrganization()
  const t = useTranslations('Trainings')
  const locale = useLocale()
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(false)
  const [selectedTraining, setSelectedTraining] = useState<Training | null>(null)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [athletes, setAthletes] = useState<Athlete[]>([])
  const [selectedAthlete, setSelectedAthlete] = useState<string>('')
  const [loadingAthletes, setLoadingAthletes] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')

  // Calendar messages based on locale
  const messages = useMemo(() => {
    if (locale === 'pt') {
      return {
        allDay: 'Dia inteiro',
        previous: 'Anterior',
        next: 'Próximo',
        today: 'Hoje',
        month: 'Mês',
        week: 'Semana',
        day: 'Dia',
        agenda: 'Agenda',
        date: 'Data',
        time: 'Hora',
        event: 'Evento',
        noEventsInRange: 'Não há treinos neste período.',
        showMore: (total: number) => `+ (${total}) treinos`,
      }
    }
    return {
      allDay: 'All Day',
      previous: 'Back',
      next: 'Next',
      today: 'Today',
      month: 'Month',
      week: 'Week',
      day: 'Day',
      agenda: 'Agenda',
      date: 'Date',
      time: 'Time',
      event: 'Event',
      noEventsInRange: 'There are no trainings in this range.',
      showMore: (total: number) => `+ (${total}) trainings`,
    }
  }, [locale])

  const culture = locale === 'pt' ? 'pt-BR' : 'en-US'

  useEffect(() => {
    if (currentOrganization) {
      fetchAthletes()
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentOrganization])

  const fetchAthletes = async () => {
    if (!currentOrganization) return

    setLoadingAthletes(true)
    try {
      const response = await fetch(`/api/organizations/${currentOrganization.id}/members`)

      if (response.ok) {
        const data = await response.json()
        // Include all members: athletes, trainers, and owners
        const members = data.members.map((m: any) => ({
          id: m.userId,
          name: m.user.name,
          email: m.user.email,
        }))
        setAthletes(members)

        // Auto-select first athlete if none selected
        if (members.length > 0) {
          setSelectedAthlete(members[0].id)
        }
      } else {
        toast.error(t('errors.failedToFetch'))
      }
    } catch (error) {
      console.error('Error fetching athletes:', error)
      toast.error(t('errors.failedToFetch'))
    } finally {
      setLoadingAthletes(false)
    }
  }

  const fetchTrainings = useCallback(async () => {
    if (!currentOrganization || !selectedAthlete) return

    setLoading(true)
    try {
      // Always filter by selected athlete
      const url = `/api/trainings?organizationId=${currentOrganization.id}&memberId=${selectedAthlete}`

      const response = await fetch(url)

      if (response.ok) {
        const trainings: Training[] = await response.json()

        // Convert trainings to calendar events - all day events
        const calendarEvents: CalendarEvent[] = trainings
          .map((training) => {
            // Parse date as local time to avoid timezone issues
            const dateString = training.scheduledDate.split('T')[0] // Get just YYYY-MM-DD part
            if (!dateString) return null
            const parts = dateString.split('-').map(Number)
            const year = parts[0]
            const month = parts[1]
            const day = parts[2]
            if (year === undefined || month === undefined || day === undefined) return null
            const date = new Date(year, month - 1, day) // month is 0-indexed

            // Build title with subtitle if available
            const title = training.subtitle
              ? `${training.title}, ${training.subtitle}`
              : training.title

            return {
              id: training.id,
              title,
              start: date,
              end: date,
              allDay: true,
              resource: training,
            }
          })
          .filter((event): event is CalendarEvent => event !== null)

        setEvents(calendarEvents)
      } else {
        toast.error(t('errors.failedToFetch'))
      }
    } catch (error) {
      console.error('Error fetching trainings:', error)
      toast.error(t('errors.failedToFetch'))
    } finally {
      setLoading(false)
    }
  }, [currentOrganization, selectedAthlete, t])

  useEffect(() => {
    fetchTrainings()
  }, [fetchTrainings])

  const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
    // Use the date directly as it's already in local time
    setSelectedDate(slotInfo.start)
    setSelectedTraining(null)
    setIsFormOpen(true)
  }, [])

  const handleSelectEvent = useCallback((event: CalendarEvent) => {
    setSelectedTraining(event.resource)
    // Use the event's start date which is already in local time
    setSelectedDate(event.start)
    setIsFormOpen(true)
  }, [])

  const handleFormClose = () => {
    setIsFormOpen(false)
    setSelectedTraining(null)
    setSelectedDate(null)
  }

  const handleFormSuccess = () => {
    handleFormClose()
    fetchTrainings()
  }

  const eventStyleGetter = (event: CalendarEvent) => {
    const training = event.resource
    let backgroundColor = '#1F56E3' // default blue

    if (training.status === 'COMPLETED') {
      backgroundColor = '#10b981' // green
    } else if (training.status === 'MISSED') {
      backgroundColor = '#ef4444' // red
    } else if (training.type === 'STRENGTH') {
      backgroundColor = '#8b5cf6' // purple
    }

    return {
      style: {
        backgroundColor,
        borderRadius: '4px',
        opacity: 0.9,
        color: 'white',
        border: '0px',
        display: 'block',
        padding: '2px 4px',
      },
    }
  }

  // Filter athletes based on search query
  const filteredAthletes = athletes.filter((athlete) =>
    athlete.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    athlete.email.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-4">
      {/* Mobile: Dropdown selector */}
      <div className="md:hidden space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('trainingCalendar')}</h2>
          {loading && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>

        <div className="flex items-center gap-2">
          <Select value={selectedAthlete} onValueChange={setSelectedAthlete} disabled={loadingAthletes}>
            <SelectTrigger className="flex-1 bg-white">
              <SelectValue placeholder={loadingAthletes ? t('loadingMembers') : t('selectAthlete')} />
            </SelectTrigger>
            <SelectContent>
              {athletes.map((athlete) => (
                <SelectItem key={athlete.id} value={athlete.id}>
                  {athlete.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={() => setIsFormOpen(true)} disabled={!selectedAthlete} size="icon">
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-3 flex-wrap text-xs">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />
            <span>{t('legend.runningTodo')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-purple-600" />
            <span>{t('legend.strengthTodo')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-green-600" />
            <span>{t('legend.completed')}</span>
          </div>
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-600" />
            <span>{t('legend.missed')}</span>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-2" style={{ height: '500px' }}>
          {selectedAthlete ? (
            <Calendar
              localizer={localizer}
              events={events}
              startAccessor="start"
              endAccessor="end"
              style={{ height: '100%' }}
              onSelectSlot={handleSelectSlot}
              onSelectEvent={handleSelectEvent}
              selectable={!isFormOpen}
              eventPropGetter={eventStyleGetter}
              views={['month']}
              defaultView="month"
              date={currentDate}
              onNavigate={setCurrentDate}
              popup
              messages={messages}
              culture={culture}
            />
          ) : (
            <div className="flex items-center justify-center h-full text-gray-500">
              {loadingAthletes ? t('loadingMembers') : t('selectAthlete')}
            </div>
          )}
        </div>
      </div>

      {/* Desktop: Sidebar layout */}
      <div className="hidden md:flex gap-4 h-[calc(100vh-12rem)]">
        {/* Left Sidebar - Athletes List */}
        <div className="w-64 flex-shrink-0 bg-white rounded-lg shadow p-4 flex flex-col">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-lg">{t('athlete')}</h3>
            {loadingAthletes && <Loader2 className="h-4 w-4 animate-spin" />}
          </div>

          <div className="relative mb-4">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={t('selectAthlete')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          <div className="flex-1 overflow-y-auto space-y-2">
            {filteredAthletes.map((athlete) => (
              <button
                key={athlete.id}
                onClick={() => setSelectedAthlete(athlete.id)}
                className={`w-full text-left px-3 py-2 rounded-md transition-colors ${
                  selectedAthlete === athlete.id
                    ? 'bg-blue-600 text-white'
                    : 'hover:bg-gray-100'
                }`}
              >
                <div className="font-medium">{athlete.name}</div>
                <div className={`text-sm ${selectedAthlete === athlete.id ? 'text-blue-100' : 'text-gray-500'}`}>
                  {athlete.email}
                </div>
              </button>
            ))}

            {!loadingAthletes && filteredAthletes.length === 0 && searchQuery && (
              <p className="text-sm text-gray-500 text-center py-8">
                {t('noAthletes')}
              </p>
            )}

            {loadingAthletes && athletes.length === 0 && (
              <p className="text-sm text-gray-500 text-center py-8">
                {t('loadingMembers')}
              </p>
            )}
          </div>
        </div>

        {/* Right Side - Calendar */}
        <div className="flex-1 flex flex-col space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">
                {selectedAthlete && athletes.find(a => a.id === selectedAthlete)?.name}
              </h2>
              <p className="text-sm text-gray-600">{t('scheduleAndManage')}</p>
            </div>
            <div className="flex items-center gap-2">
              {loading && <Loader2 className="h-4 w-4 animate-spin" />}
              <Button onClick={() => setIsFormOpen(true)} disabled={!selectedAthlete}>
                <Plus className="h-4 w-4 mr-2" />
                {t('newTraining')}
              </Button>
            </div>
          </div>

          <div className="flex items-center gap-4 flex-wrap">
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-blue-600" />
              <span className="text-sm">{t('legend.runningTodo')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-purple-600" />
              <span className="text-sm">{t('legend.strengthTodo')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-green-600" />
              <span className="text-sm">{t('legend.completed')}</span>
            </div>
            <div className="flex items-center gap-2">
              <div className="w-3 h-3 rounded-full bg-red-600" />
              <span className="text-sm">{t('legend.missed')}</span>
            </div>
          </div>

          <div className="flex-1 bg-white rounded-lg shadow p-4">
            {selectedAthlete ? (
              <Calendar
                localizer={localizer}
                events={events}
                startAccessor="start"
                endAccessor="end"
                style={{ height: '100%' }}
                onSelectSlot={handleSelectSlot}
                onSelectEvent={handleSelectEvent}
                selectable={!isFormOpen}
                eventPropGetter={eventStyleGetter}
                views={['month']}
                defaultView="month"
                date={currentDate}
                onNavigate={setCurrentDate}
                popup
                messages={messages}
                culture={culture}
              />
            ) : (
              <div className="flex items-center justify-center h-full text-gray-500">
                {loadingAthletes ? t('loadingMembers') : t('selectAthlete')}
              </div>
            )}
          </div>
        </div>
      </div>

      <Dialog open={isFormOpen} onOpenChange={setIsFormOpen}>
        <DialogContent className="w-[95vw] max-w-[95vw] sm:max-w-[90vw] md:max-w-[85vw] lg:max-w-[1400px] max-h-[95vh] bg-white">
          <DialogHeader>
            <DialogTitle>
              {selectedTraining ? t('editTraining') : t('createTraining')}
            </DialogTitle>
            <DialogDescription>
              {selectedTraining
                ? t('editTrainingDescription')
                : t('createTrainingDescription')}
            </DialogDescription>
          </DialogHeader>
          <TrainingForm
            training={selectedTraining}
            selectedDate={selectedDate}
            preselectedAthleteId={selectedAthlete || undefined}
            onSuccess={handleFormSuccess}
            onCancel={handleFormClose}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
