import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/routing';
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Calendar, Send, TrendingUp, Dumbbell, Users, BookTemplate } from "lucide-react";

export default function Home() {
  const t = useTranslations();
  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container max-w-7xl mx-auto flex h-16 items-center justify-between px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center space-x-2">
              <span className="text-2xl font-bold bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                RunFlow
              </span>
            </Link>
            <nav className="hidden md:flex gap-6">
              <a href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('Navigation.features')}
              </a>
              <a href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('Navigation.pricing')}
              </a>
              <a href="#for-trainers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('Navigation.forTrainers')}
              </a>
              <a href="#for-athletes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                {t('Navigation.forAthletes')}
              </a>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="outline" asChild className="border-gray-400 hover:bg-gray-50">
              <Link href="/login">{t('Navigation.signIn')}</Link>
            </Button>
            <Button asChild className="bg-blue-600 hover:bg-blue-700 text-white">
              <Link href="/register">{t('Navigation.getStarted')}</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden bg-white">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-50" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.2),transparent_50%)]" />

        <div className="relative container max-w-7xl mx-auto px-8 py-32 md:py-48">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="text-sm border-transparent bg-transparent hover:bg-transparent">
              {t('Hero.badge')}
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              {t('Hero.title')}{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                {t('Hero.titleHighlight')}
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              {t('Hero.description')}
            </p>
            <div className="w-full max-w-md pt-4">
              <div className="relative flex items-center">
                <Input
                  type="email"
                  placeholder={t('Hero.emailPlaceholder')}
                  className="h-14 pr-36 text-lg"
                />
                <Button
                  size="lg"
                  className="absolute right-1 h-12 px-6"
                >
                  {t('Hero.ctaButton')}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground text-center mt-4">
                {t('Hero.freeText')}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 container max-w-7xl mx-auto px-8">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">
            {t('Features.title')}
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            {t('Features.subtitle')}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-cyan-200 transition-colors bg-white">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle>{t('Features.planBuilder.title')}</CardTitle>
              <CardDescription>
                {t('Features.planBuilder.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-teal-200 transition-colors bg-white">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-white" />
              </div>
              <CardTitle>{t('Features.scheduleDelivery.title')}</CardTitle>
              <CardDescription>
                {t('Features.scheduleDelivery.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-200 transition-colors bg-white">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle>{t('Features.progressTracking.title')}</CardTitle>
              <CardDescription>
                {t('Features.progressTracking.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-amber-200 transition-colors bg-white">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <CardTitle>{t('Features.runningStrength.title')}</CardTitle>
              <CardDescription>
                {t('Features.runningStrength.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-rose-200 transition-colors bg-white">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>{t('Features.athleteManagement.title')}</CardTitle>
              <CardDescription>
                {t('Features.athleteManagement.description')}
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 transition-colors bg-white">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mb-4">
                <BookTemplate className="w-6 h-6 text-white" />
              </div>
              <CardTitle>{t('Features.templateLibrary.title')}</CardTitle>
              <CardDescription>
                {t('Features.templateLibrary.description')}
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-12 mt-auto">
        <div className="container max-w-7xl mx-auto px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <h3 className="font-semibold mb-4">{t('Footer.product')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#features" className="hover:text-foreground transition-colors">{t('Footer.features')}</a></li>
                <li><a href="#pricing" className="hover:text-foreground transition-colors">{t('Footer.pricing')}</a></li>
                <li><a href="#for-trainers" className="hover:text-foreground transition-colors">{t('Footer.forTrainers')}</a></li>
                <li><a href="#for-athletes" className="hover:text-foreground transition-colors">{t('Footer.forAthletes')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t('Footer.resources')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{t('Footer.helpCenter')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('Footer.trainingGuides')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('Footer.workoutLibrary')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('Footer.community')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t('Footer.company')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{t('Footer.about')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('Footer.blog')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('Footer.contact')}</a></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">{t('Footer.legal')}</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-foreground transition-colors">{t('Footer.privacy')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('Footer.terms')}</a></li>
                <li><a href="#" className="hover:text-foreground transition-colors">{t('Footer.cookiePolicy')}</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>{t('Footer.copyright')}</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
