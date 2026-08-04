import React from 'react';
import { ActiveTab } from '../types';
import { Hero3DCanvas } from './3d/Hero3DCanvas';
import { Card3D } from './3d/Card3D';
import SplitText from './SplitText';
import { Sparkles, CalendarRange, Zap, ShieldCheck, Flame, ArrowRight, Play, CheckCircle2, Bot, BookOpen } from 'lucide-react';

interface LandingPageProps {
  onStartPlanner: () => void;
  onExploreDemo: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  onStartPlanner,
  onExploreDemo,
  setActiveTab
}) => {
  return (
    <div className="relative min-h-screen bg-[#030507] text-slate-100 overflow-hidden">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-blue-600/10 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-10 right-10 w-[500px] h-[300px] bg-cyan-600/10 rounded-full blur-[120px] pointer-events-none" />

      {/* Hero Section */}
      <section className="relative pt-12 pb-20 px-4 sm:px-8 max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-12">
        {/* Left Hero Content */}
        <div className="flex-1 space-y-6 text-center lg:text-left z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-blue-950/60 border border-blue-500/30 text-cyan-400 text-xs font-mono shadow-[0_0_20px_rgba(59,130,246,0.2)]">
            <Sparkles className="w-3.5 h-3.5 text-cyan-400 animate-spin-slow" />
            <span>AI-POWERED ACADEMIC SCHEDULING PLATFORM</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold text-white tracking-tight leading-tight sm:leading-[1.15]">
            <span className="block mb-2">Build your</span>
            <SplitText
              text="smartest study plan."
              className="block bg-gradient-to-r from-blue-400 via-cyan-300 to-blue-500 bg-clip-text text-transparent drop-shadow-[0_0_35px_rgba(59,130,246,0.6)] py-1"
              delay={40}
              duration={0.8}
              ease="power3.out"
              splitType="words"
              from={{ opacity: 0, y: 30 }}
              to={{ opacity: 1, y: 0 }}
              textAlign="left"
              tag="div"
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
              <span>Explore Demo Dashboard</span>
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
              <span>Gemini AI powered</span>
            </div>
          </div>
        </div>

        {/* Right 3D Visual Hero Component */}
        <div className="flex-1 w-full relative">
          <Card3D glowColor="blue" className="w-full max-w-lg mx-auto overflow-hidden p-2 bg-[#050810]/80">
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

      {/* Core Features Bento Grid */}
      <section className="py-16 px-4 sm:px-8 max-w-7xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <SplitText
            text="Engineered for Academic Mastery"
            className="text-2xl sm:text-3xl font-bold text-white"
            delay={35}
            duration={0.7}
            ease="power3.out"
            splitType="words"
            from={{ opacity: 0, y: 25 }}
            to={{ opacity: 1, y: 0 }}
            textAlign="center"
            tag="h2"
          />
          <p className="text-sm text-slate-400 mt-2">
            Every feature is designed to eliminate study paralysis, prioritize high-impact subjects, and adapt to schedule changes.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card3D glowColor="blue" onClick={() => setActiveTab('planner')}>
            <div className="w-10 h-10 rounded-lg bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <CalendarRange className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">AI Study Plan Generator</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Input subjects, difficulty levels, exam deadlines, and daily available hours. Gemini AI constructs a balanced multi-day timeline.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
              <span>Generate Plan</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card3D>

          <Card3D glowColor="cyan" onClick={() => setActiveTab('planner')}>
            <div className="w-10 h-10 rounded-lg bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 mb-4">
              <Zap className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">Adaptive "Adjust My Plan"</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Missed a session or running low on time? Click one button to dynamically redistribute remaining study sessions without falling behind.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-cyan-400 font-medium">
              <span>Test Adaptation</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card3D>

          <Card3D glowColor="purple" onClick={() => setActiveTab('timer')}>
            <div className="w-10 h-10 rounded-lg bg-purple-500/10 border border-purple-500/30 flex items-center justify-center text-purple-400 mb-4">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="text-lg font-bold text-white">3D Focus Timer Environment</h3>
            <p className="text-xs text-slate-400 mt-2 leading-relaxed">
              Pomodoro focus timer with glowing ambient visual effects, white noise ambient sounds, and automatic task progress logging.
            </p>
            <div className="mt-4 flex items-center gap-1.5 text-xs text-purple-400 font-medium">
              <span>Launch Timer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </div>
          </Card3D>
        </div>
      </section>

      {/* Quick Interactive Demo Callout */}
      <section className="py-12 px-4 sm:px-8 max-w-5xl mx-auto">
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
