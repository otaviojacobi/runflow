'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Building2, UserPlus, ArrowRight } from 'lucide-react'

import React from 'react';
import { SketchPicker } from 'react-color';

class Component extends React.Component {

  render() {
    return <SketchPicker />;
  }
}

export default function OrganizationSetupPage() {
  const router = useRouter()
  const t = useTranslations('Organizations')
  const [loading, setLoading] = useState(false)

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center">
        <h1 className="text-3xl font-bold tracking-tight">{t('Studio')}</h1>
      </div>

      <div className="grid gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div>
              <CardTitle>{t('primaryColor')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {(<SketchPicker />)}
            <Button className="w-full mt-6" onClick={(e) => {
              e.stopPropagation()
            }}>
              {t('changeColor')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
      <div className="grid gap-4">
        <Card className="cursor-pointer hover:shadow-lg transition-shadow">
          <CardHeader>
            <div>
              <CardTitle>{t('secondaryColor')}</CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            {(<SketchPicker />)}

            <Button className="w-full mt-6" onClick={(e) => {
              e.stopPropagation()
            }}>
              {t('changeColor')}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}