import React from 'react';
import { ActiveTab, User } from '../types';
import { Hero3DCanvas } from './3d/Hero3DCanvas';
import { Card3D } from './3d/Card3D';
import SpotlightCard from './SpotlightCard';
import BorderGlow from './BorderGlow';
import SplitText from './SplitText';
import StrokeText from './StrokeText';
import {
  Sparkles,
  CalendarRange,
  Zap,
  ShieldCheck,
  Flame,
  ArrowRight,
  Play,
  CheckCircle2,
  Bot,
  BookOpen,
  Clock,
  Sliders,
  CheckSquare,
  TrendingUp
} from 'lucide-react';

interface LandingPageProps {
  onStartPlanner: () => void;
  onExploreDemo: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  currentUser?: User | null;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanner,
  onExploreDemo,
  setActiveTab,
  currentUser
}) => {
  return (
    <div className="relative min-h-screen bg-[#030507] text-slate-100 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-10 pb-20 px-4 sm:px-8 lg:px-12 w-full max-w-full flex flex-col lg:flex-row items-center gap-12">
        {/* Left Hero Content */}
        <div className="flex-1 space-y-6 text-center lg:text-left z-10 w-full flex flex-col items-center lg:items-start">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-mono shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>AI-POWERED ACADEMIC SCHEDULING PLATFORM</span>
          </div>

          <h1 className="w-full space-y-1">
            <StrokeText
              text="Build your"
              strokeColor="#FFFFFF"
              fillColor="#FFFFFF"
              strokeWidth={1.5}
              drawDuration={0.65}
              fillDelay={0.06}
              stagger={0.015}
              ease="power2.out"
              trigger="mount"
              fillMode="wipe"
              fontSize={110}
              fontWeight={800}
              letterSpacing={-3}
              align="responsive"
            />
            <StrokeText
              text="smartest study plan."
              strokeColor="#FFFFFF"
              fillColor="#FFFFFF"
              strokeWidth={1.5}
              drawDuration={0.7}
              fillDelay={0.08}
              stagger={0.015}
              ease="power2.out"
              trigger="mount"
              fillMode="wipe"
              fontSize={110}
              fontWeight={800}
              letterSpacing={-3}
              align="responsive"
            />
          </h1>

          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto lg:mx-0 font-normal leading-relaxed">
            Turn your subjects, deadlines, and available time into an intelligent study schedule that adapts with you when life happens.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              id="landing-hero-cta-btn"
              onClick={onStartPlanner}
              className="w-full sm:w-auto flex items-center justify-center gap-3 px-7 py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-semibold text-sm shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(56,189,248,0.7)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-200"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create My Study Plan</span>
              <ArrowRight className="w-4 h-4 ml-1" />
            </button>

            <button
              id="landing-demo-cta-btn"
              onClick={onExploreDemo}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-blue-950/40 border border-blue-500/30 text-slate-200 font-medium text-sm hover:bg-blue-900/40 hover:text-cyan-300 transition-all"
            >
              <Play className="w-4 h-4 text-cyan-400 fill-cyan-400" />
              <span>{currentUser ? 'Go to Dashboard' : 'Explore Demo Dashboard'}</span>
            </button>
          </div>

          <div className="pt-6 flex items-center justify-center lg:justify-start gap-6 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Zero setup required</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>Adaptive rescheduling</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-cyan-400" />
              <span>AI Engine powered</span>
            </div>
          </div>
        </div>

        {/* Right 3D Visual Hero Component */}
        <div className="flex-1 w-full relative">
          <Card3D glowColor="blue" className="w-full overflow-hidden p-2 bg-[#050810]/80">
            <div className="relative rounded-lg overflow-hidden border border-blue-500/20 bg-[#030509]">
              {/* Overlay Glass Badge */}
              <div className="absolute top-4 left-4 z-10 px-3 py-1.5 rounded-lg bg-black/60 backdrop-blur-md border border-blue-500/30 text-xs text-cyan-300 font-mono flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping" />
                <span>3D INTELLIGENCE CORE</span>
              </div>

              {/* Three.js Scene */}
              <Hero3DCanvas variant="hero" interactive={true} />

              {/* Floating Stat Chip */}
              <div className="absolute bottom-4 right-4 z-10 px-4 py-2 rounded-xl bg-gradient-to-r from-blue-950/90 to-black/90 backdrop-blur-md border border-blue-500/30 text-xs text-slate-200 flex items-center gap-3">
                <Flame className="w-4 h-4 text-amber-400" />
                <div>
                  <p className="font-bold text-white font-mono">94% Retention</p>
                  <p className="text-[10px] text-slate-400">Exam-driven scheduling</p>
                </div>
              </div>
            </div>
          </Card3D>
        </div>
      </section>

      {/* Engineered for Academic Mastery — Quick Start Guide & Workflow */}
      <section className="py-16 px-4 sm:px-8 w-full max-w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-mono mb-3">
            <Sparkles className="w-3 h-3" />
            <span>QUICK START GUIDE & SYSTEM ARCHITECTURE</span>
          </div>
          <SplitText
            text="Engineered for Academic Mastery"
            className="text-2xl sm:text-3xl font-bold text-white"
            delay={25}
            duration={0.6}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0, y: 20 }}
            to={{ opacity: 1, y: 0 }}
            textAlign="center"
            tag="h2"
          />
          <p className="text-sm text-slate-400 mt-2">
            Follow this 4-step intelligent workflow to eliminate study paralysis, prioritize high-impact exam topics, and stay in total control when your schedule changes.
          </p>
        </div>

        {/* 4 Steps Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Step 1: Subjects */}
          <BorderGlow
            glowColor="180 90 60"
            backgroundColor="#081424"
            colors={['#06b6d4', '#38bdf8', '#22d3ee']}
            borderRadius={20}
            glowRadius={30}
            glowIntensity={1.2}
            edgeSensitivity={25}
            className="group hover:scale-[1.02] transition-transform duration-200"
          >
            <SpotlightCard
              spotlightColor="rgba(6, 182, 212, 0.35)"
              className="bg-transparent border-none p-6 flex flex-col justify-between h-full rounded-[inherit]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-cyan-950/80 text-cyan-300 border border-cyan-500/30">
                    STEP 01
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                  Setup Subjects & Goals
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Add your courses, set difficulty ratings, input knowledge levels, and link upcoming exam dates.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-cyan-900/30 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('subjects')}
                  className="w-full py-2 px-3 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 text-cyan-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <span>Manage Subjects</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </SpotlightCard>
          </BorderGlow>

          {/* Step 2: AI Plan */}
          <BorderGlow
            glowColor="210 100 60"
            backgroundColor="#0A1326"
            colors={['#0070F3', '#3b82f6', '#60a5fa']}
            borderRadius={20}
            glowRadius={30}
            glowIntensity={1.2}
            edgeSensitivity={25}
            className="group hover:scale-[1.02] transition-transform duration-200"
          >
            <SpotlightCard
              spotlightColor="rgba(0, 112, 243, 0.35)"
              className="bg-transparent border-none p-6 flex flex-col justify-between h-full rounded-[inherit]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/30 flex items-center justify-center text-[#0070F3]">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-blue-950/80 text-blue-300 border border-blue-500/30">
                    STEP 02
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-[#0070F3] transition-colors">
                  Generate AI Timetable
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Choose your daily hours and preferred start time. AI generates a balanced, consecutive schedule.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-blue-900/30 flex items-center justify-between">
                <button
                  onClick={onStartPlanner}
                  className="w-full py-2 px-3 rounded-lg bg-[#0070F3]/10 hover:bg-[#0070F3]/25 border border-[#0070F3]/30 text-blue-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Sparkles className="w-3 h-3" />
                  <span>Build Study Plan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </SpotlightCard>
          </BorderGlow>

          {/* Step 3: Focus Timer */}
          <BorderGlow
            glowColor="270 90 65"
            backgroundColor="#140A22"
            colors={['#a855f7', '#c084fc', '#e879f9']}
            borderRadius={20}
            glowRadius={30}
            glowIntensity={1.2}
            edgeSensitivity={25}
            className="group hover:scale-[1.02] transition-transform duration-200"
          >
            <SpotlightCard
              spotlightColor="rgba(168, 85, 247, 0.35)"
              className="bg-transparent border-none p-6 flex flex-col justify-between h-full rounded-[inherit]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400">
                    <Clock className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-purple-950/80 text-purple-300 border border-purple-500/30">
                    STEP 03
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-purple-400 transition-colors">
                  3D Focus & Soundscapes
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Start focus blocks with a 3D visual gyroscope, ambient soundscapes, and automatic minutes logging.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-purple-900/30 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('timer')}
                  className="w-full py-2 px-3 rounded-lg bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 text-purple-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Play className="w-3 h-3 fill-current" />
                  <span>Launch Timer</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </SpotlightCard>
          </BorderGlow>

          {/* Step 4: Assistant & Adaptive Adjust */}
          <BorderGlow
            glowColor="150 90 55"
            backgroundColor="#081816"
            colors={['#10b981', '#34d399', '#6ee7b7']}
            borderRadius={20}
            glowRadius={30}
            glowIntensity={1.2}
            edgeSensitivity={25}
            className="group hover:scale-[1.02] transition-transform duration-200"
          >
            <SpotlightCard
              spotlightColor="rgba(16, 185, 129, 0.35)"
              className="bg-transparent border-none p-6 flex flex-col justify-between h-full rounded-[inherit]"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <span className="text-[11px] font-mono font-bold px-2.5 py-1 rounded-md bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                    STEP 04
                  </span>
                </div>
                <h3 className="text-base font-bold text-white group-hover:text-emerald-400 transition-colors">
                  Alex AI & Adaptive Sync
                </h3>
                <p className="text-xs text-slate-300 mt-2 leading-relaxed">
                  Ask Alex for instant explanations and formula sheets, or use one-click adaptation to redistribute sessions.
                </p>
              </div>

              <div className="mt-6 pt-4 border-t border-emerald-900/30 flex items-center justify-between">
                <button
                  onClick={() => setActiveTab('assistant')}
                  className="w-full py-2 px-3 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-300 text-xs font-semibold flex items-center justify-center gap-1.5 transition-all"
                >
                  <Bot className="w-3.5 h-3.5" />
                  <span>Ask Alex Tutor</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </SpotlightCard>
          </BorderGlow>
        </div>

        {/* Quick Direct Views Navigator */}
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3 text-xs">
          <span className="text-slate-400 font-medium">Quick explore:</span>
          <button
            onClick={() => setActiveTab('planner')}
            className="px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/20 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all flex items-center gap-1.5"
          >
            <CalendarRange className="w-3.5 h-3.5 text-cyan-400" />
            <span>Interactive Timetable</span>
          </button>
          <button
            onClick={() => setActiveTab('tasks')}
            className="px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/20 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all flex items-center gap-1.5"
          >
            <CheckSquare className="w-3.5 h-3.5 text-cyan-400" />
            <span>Today's Task Stream</span>
          </button>
          <button
            onClick={() => setActiveTab('progress')}
            className="px-3 py-1.5 rounded-lg bg-blue-950/40 border border-blue-500/20 text-slate-300 hover:text-cyan-300 hover:border-cyan-500/40 transition-all flex items-center gap-1.5"
          >
            <TrendingUp className="w-3.5 h-3.5 text-cyan-400" />
            <span>Knowledge Analytics</span>
          </button>
        </div>
      </section>

      {/* Quick Interactive Demo Callout */}
      <section className="py-12 px-4 sm:px-8 w-full max-w-full">
        <div className="rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0a1228] to-cyan-950/40 border border-blue-500/30 p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-[0_0_40px_rgba(59,130,246,0.15)]">
          <div className="space-y-2 text-center md:text-left">
            <h3 className="text-xl font-bold text-white">Ready to transform your study routine?</h3>
            <p className="text-xs text-slate-300">
              Start with demo data loaded instantly or enter your own custom subjects and exam dates.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('dashboard')}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-semibold text-xs shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] transition-all"
            >
              Open Dashboard
            </button>
            <button
              onClick={() => setActiveTab('assistant')}
              className="px-5 py-3 rounded-xl bg-blue-950/60 border border-blue-500/30 text-cyan-300 font-medium text-xs hover:bg-blue-900/40 transition-all flex items-center gap-2"
            >
              <Bot className="w-4 h-4 text-cyan-400" />
              <span>Ask AI Tutor</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

