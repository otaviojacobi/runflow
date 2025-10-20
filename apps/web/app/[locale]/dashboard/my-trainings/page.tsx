'use client'

import StudentTrainingCards from '@/components/trainings/StudentTrainingCards'
import { useTranslations } from 'next-intl'

export default function MyTrainingsPage() {
  const t = useTranslations('Trainings')

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{t('myTrainings')}</h1>
        <p className="text-muted-foreground">
          {t('viewTrainings')}
        </p>
      </div>
      <StudentTrainingCards />
    </div>
  )
}
