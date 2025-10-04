import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Send, TrendingUp, Dumbbell, Users, BookTemplate } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
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
              <Link href="#features" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Features
              </Link>
              <Link href="#pricing" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                Pricing
              </Link>
              <Link href="#for-trainers" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                For Trainers
              </Link>
              <Link href="#for-athletes" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
                For Athletes
              </Link>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <Button variant="ghost" asChild>
              <Link href="/login">Sign in</Link>
            </Button>
            <Button asChild>
              <Link href="/signup">Get started</Link>
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section with Gradient */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-cyan-50 via-blue-50 to-violet-50 dark:from-cyan-950/20 dark:via-blue-950/20 dark:to-violet-950/20" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(6,182,212,0.2),transparent_50%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_60%,rgba(59,130,246,0.2),transparent_50%)]" />

        <div className="relative container max-w-7xl mx-auto px-8 py-32 md:py-48">
          <div className="flex flex-col items-center text-center space-y-8 max-w-4xl mx-auto">
            <Badge variant="secondary" className="text-sm">
              Trusted by coaches worldwide
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              Empower your athletes{" "}
              <span className="bg-gradient-to-r from-cyan-600 to-blue-600 bg-clip-text text-transparent">
                with RunFlow
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-2xl">
              The training platform built for coaches and runners. Create, schedule, and deliver personalized running and strength training programs to your athletes.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              <Button size="lg" className="text-lg px-8 h-12">
                Start coaching
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8 h-12">
                View demo
              </Button>
            </div>
            <p className="text-sm text-muted-foreground">
              Free for individual coaches · No credit card required
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 md:py-32 container max-w-7xl mx-auto px-8">
        <div className="flex flex-col items-center text-center space-y-4 mb-16">
          <h2 className="text-3xl md:text-5xl font-bold">
            Everything you need to coach better
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl">
            Powerful features designed for coaches and athletes
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          <Card className="border-2 hover:border-cyan-200 dark:hover:border-cyan-800 transition-colors">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Training Plan Builder</CardTitle>
              <CardDescription>
                Create detailed running and strength training schedules tailored to each athlete's goals
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-teal-200 dark:hover:border-teal-800 transition-colors">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center mb-4">
                <Send className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Schedule Delivery</CardTitle>
              <CardDescription>
                Send weekly or custom training schedules directly to your athletes' phones
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-purple-200 dark:hover:border-purple-800 transition-colors">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-violet-500 to-purple-500 flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Progress Tracking</CardTitle>
              <CardDescription>
                Monitor your athletes' training completion, performance, and feedback in real-time
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-amber-200 dark:hover:border-amber-800 transition-colors">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-orange-500 to-amber-500 flex items-center justify-center mb-4">
                <Dumbbell className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Running & Strength Training</CardTitle>
              <CardDescription>
                Support for all running workouts (intervals, tempo, long runs) plus comprehensive strength training
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-rose-200 dark:hover:border-rose-800 transition-colors">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Athlete Management</CardTitle>
              <CardDescription>
                Manage multiple athletes with individual plans, goals, and communication in one place
              </CardDescription>
            </CardHeader>
          </Card>

          <Card className="border-2 hover:border-blue-200 dark:hover:border-blue-800 transition-colors">
            <CardHeader className="pb-4">
              <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-indigo-500 to-blue-500 flex items-center justify-center mb-4">
                <BookTemplate className="w-6 h-6 text-white" />
              </div>
              <CardTitle>Template Library</CardTitle>
              <CardDescription>
                Build reusable workout templates and training blocks to save time planning
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
              <h3 className="font-semibold mb-4">Product</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#features" className="hover:text-foreground transition-colors">Features</Link></li>
                <li><Link href="#pricing" className="hover:text-foreground transition-colors">Pricing</Link></li>
                <li><Link href="#for-trainers" className="hover:text-foreground transition-colors">For Trainers</Link></li>
                <li><Link href="#for-athletes" className="hover:text-foreground transition-colors">For Athletes</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Resources</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Help Center</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Training Guides</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Workout Library</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Community</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Company</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">About</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Blog</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Contact</Link></li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><Link href="#" className="hover:text-foreground transition-colors">Privacy</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Terms</Link></li>
                <li><Link href="#" className="hover:text-foreground transition-colors">Cookie Policy</Link></li>
              </ul>
            </div>
          </div>
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2025 RunFlow. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
