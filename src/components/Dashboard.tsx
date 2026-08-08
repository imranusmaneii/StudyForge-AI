import React from 'react';
import { ActiveTab, ProgressStats, StudyPlan, Subject, User } from '../types';
import alexAvatar from '../assets/images/alex_avatar_1785976615133.jpg';
import { Card3D } from './3d/Card3D';
import { QuickStartGuide } from './QuickStartGuide';
import { formatTimeRange } from '../lib/timeUtils';
import {
  Sparkles,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Play,
  Sliders,
  Bot,
  Flame,
  ChevronRight,
  BookOpen,
  ArrowUpRight,
  Info
} from 'lucide-react';

interface DashboardProps {
  progress: ProgressStats;
  studyPlan: StudyPlan;
  subjects: Subject[];
  setActiveTab: (tab: ActiveTab) => void;
  onToggleSessionComplete: (dayIdx: number, sessionId: string) => void;
  onOpenCreateModal: () => void;
  onOpenAdjustModal: () => void;
  currentUser?: User | null;
}

export const Dashboard: React.FC<DashboardProps> = ({
  progress,
  studyPlan,
  subjects,
  setActiveTab,
  onToggleSessionComplete,
  onOpenCreateModal,
  onOpenAdjustModal,
  currentUser
}) => {
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const displayName = currentUser?.name ? currentUser.name.trim() : 'Student';

  const today = studyPlan.days?.[0];
  const todaySessions = today?.sessions || [];
  const completedCount = todaySessions.filter(s => s.completed).length;
  const totalCount = todaySessions.length;
  const todayProgressPercent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : progress.todayProgressPercent;

  // Find nearest upcoming exam
  const sortedExams = [...subjects]
    .filter(s => s.examDate)
    .sort((a, b) => new Date(a.examDate).getTime() - new Date(b.examDate).getTime());
  const nearestExam = sortedExams[0];
  const daysUntilExam = nearestExam
    ? Math.max(0, Math.ceil((new Date(nearestExam.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)))
    : null;

  // Total study minutes today formatted
  const totalMins = todaySessions.reduce((acc, s) => acc + (s.completed ? s.durationMinutes : 0), 0);
  const hours = Math.floor(totalMins / 60);
  const mins = totalMins % 60;
  const formattedStudyTime = `${hours}h ${mins}m`;

  return (
    <div className="space-y-8 pb-16">
      {/* Top Greeting & Purpose Explanation Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-[#080B12] border border-white/5 shadow-[0_0_30px_rgba(0,112,243,0.08)] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#0070F3] opacity-10 blur-[90px] rounded-full pointer-events-none" />
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-[#0070F3] text-xs font-mono font-medium mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DAILY ACADEMIC INTELLIGENCE OVERVIEW</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            {getGreeting()}, {displayName}.
          </h2>
          <p className="text-xs sm:text-sm text-gray-300 mt-1 max-w-2xl leading-relaxed">
            Welcome back to StudyForge AI. Track today's focus blocks, review upcoming exam deadlines, and keep your study streak alive.
          </p>
        </div>

        <div className="relative z-10 flex items-center gap-2 flex-wrap">
          <button
            id="dash-adjust-plan-btn"
            onClick={onOpenAdjustModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#080B12] border border-white/10 text-gray-200 font-medium text-xs hover:bg-white/5 hover:text-white transition-all"
          >
            <Sliders className="w-3.5 h-3.5 text-[#0070F3]" />
            <span>Adjust My Plan</span>
          </button>

          <button
            id="dash-create-plan-btn"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0070F3] hover:bg-[#0070F3]/90 text-white font-semibold text-xs shadow-[0_0_20px_rgba(0,112,243,0.3)] transition-all"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>New AI Plan</span>
          </button>
        </div>
      </div>

      {/* Onboarding Quick Start Guide */}
      <QuickStartGuide setActiveTab={setActiveTab} onOpenCreateModal={onOpenCreateModal} />

      {/* Metrics Row (4 Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Today's Progress */}
        <Card3D glowColor="blue">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Today's Progress</span>
              <div className="group relative cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <div className="absolute left-0 top-6 w-48 p-2 rounded-lg bg-black/90 border border-white/10 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                  Shows the percentage of study blocks you have completed today out of your total planned sessions.
                </div>
              </div>
            </div>
            <span className="p-2 rounded-lg bg-blue-500/10 text-cyan-400">
              <CheckCircle2 className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4 flex items-center justify-between">
            <div>
              <p className="text-3xl font-extrabold text-white font-mono tracking-tight">{todayProgressPercent}%</p>
              <p className="text-[11px] text-slate-400 mt-0.5">{completedCount} of {totalCount} sessions done</p>
            </div>

            {/* SVG Circular Progress Ring */}
            <div className="relative w-14 h-14 flex items-center justify-center">
              <svg className="w-full h-full transform -rotate-90">
                <circle cx="28" cy="28" r="22" stroke="#1e293b" strokeWidth="4" fill="transparent" />
                <circle
                  cx="28"
                  cy="28"
                  r="22"
                  stroke="#3b82f6"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={2 * Math.PI * 22}
                  strokeDashoffset={2 * Math.PI * 22 * (1 - todayProgressPercent / 100)}
                  strokeLinecap="round"
                  className="transition-all duration-700 ease-out"
                />
              </svg>
              <span className="absolute text-[10px] font-bold text-cyan-300 font-mono">{todayProgressPercent}%</span>
            </div>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic border-t border-white/5 pt-1.5">
            Completion rate of daily planned study blocks.
          </p>
        </Card3D>

        {/* Metric 2: Study Time */}
        <Card3D glowColor="cyan">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Study Time</span>
              <div className="group relative cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <div className="absolute left-0 top-6 w-48 p-2 rounded-lg bg-black/90 border border-white/10 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                  Tracks active hours & minutes spent studying today against your targeted study time goal.
                </div>
              </div>
            </div>
            <span className="p-2 rounded-lg bg-cyan-500/10 text-cyan-400">
              <Clock className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-white font-mono tracking-tight">{formattedStudyTime}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Logged today ({progress.todayStudyMinutes}m planned)</p>
          </div>
          <div className="mt-3 w-full h-1.5 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (totalMins / (progress.todayStudyMinutes || 1)) * 100)}%` }}
            />
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic border-t border-white/5 pt-1.5">
            Active focus time logged vs daily target.
          </p>
        </Card3D>

        {/* Metric 3: Tasks Completed */}
        <Card3D glowColor="purple">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Tasks & Streak</span>
              <div className="group relative cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <div className="absolute left-0 top-6 w-48 p-2 rounded-lg bg-black/90 border border-white/10 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                  Shows how many focus tasks you finished today and your consecutive daily study streak count.
                </div>
              </div>
            </div>
            <span className="p-2 rounded-lg bg-purple-500/10 text-purple-400">
              <Sparkles className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-3xl font-extrabold text-white font-mono tracking-tight">{completedCount} / {totalCount}</p>
            <p className="text-[11px] text-slate-400 mt-0.5">Focus sessions on schedule</p>
          </div>
          <div className="mt-3 flex items-center gap-1.5 text-xs text-purple-400">
            <Flame className="w-3.5 h-3.5 text-amber-400 animate-bounce" />
            <span className="font-semibold">{progress.currentStreakDays} Day Streak Active</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic border-t border-white/5 pt-1.5">
            Finished tasks & consecutive active days.
          </p>
        </Card3D>

        {/* Metric 4: Upcoming Exam */}
        <Card3D glowColor="sky">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Upcoming Exam</span>
              <div className="group relative cursor-help">
                <Info className="w-3.5 h-3.5 text-slate-400" />
                <div className="absolute right-0 top-6 w-48 p-2 rounded-lg bg-black/90 border border-white/10 text-[10px] text-gray-300 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-30 shadow-lg">
                  Countdown to your nearest scheduled exam date to help prioritize urgent study sessions.
                </div>
              </div>
            </div>
            <span className="p-2 rounded-lg bg-rose-500/10 text-rose-400">
              <AlertTriangle className="w-4 h-4" />
            </span>
          </div>
          <div className="mt-4">
            <p className="text-lg font-bold text-white truncate">{nearestExam ? nearestExam.name : 'No Exam Scheduled'}</p>
            <div className="flex items-center gap-2 mt-1">
              <span className="text-2xl font-black text-cyan-400 font-mono">{daysUntilExam !== null ? daysUntilExam : '--'}</span>
              <span className="text-xs text-slate-400">{daysUntilExam !== null ? 'days remaining' : 'No upcoming exam date'}</span>
            </div>
          </div>
          <div className="mt-2 text-[11px] text-rose-300/80 font-mono">
            Exam Date: {nearestExam ? nearestExam.examDate : 'Not set'}
          </div>
          <p className="text-[10px] text-slate-500 mt-2 italic border-t border-white/5 pt-1.5">
            Days remaining until next major exam.
          </p>
        </Card3D>
      </div>

      {/* Today's Timeline & Action Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left 2 Cols: Today's Timeline */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <h3 className="text-lg font-bold text-white">Today's Study Timeline</h3>
              <span className="text-xs px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 font-mono">
                {today?.dayName || 'Today'}
              </span>
            </div>
            <button
              onClick={() => setActiveTab('tasks')}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
            >
              <span>View Full Schedule</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {todaySessions.length === 0 ? (
              <div className="p-8 text-center rounded-xl bg-[#080B12] border border-white/5">
                <p className="text-sm text-gray-400">No study sessions generated for today yet.</p>
                <button
                  onClick={onOpenCreateModal}
                  className="mt-3 px-4 py-2 rounded-xl bg-[#0070F3] text-white text-xs font-semibold hover:bg-[#0070F3]/90 transition-all"
                >
                  Generate Plan Now
                </button>
              </div>
            ) : (
              todaySessions.map((session) => {
                const isBreak = session.type === 'break';
                return (
                  <div
                    key={session.id}
                    className={`group relative flex flex-col sm:flex-row sm:items-center justify-between p-4 rounded-xl border transition-all duration-200 ${
                      session.completed
                        ? 'bg-[#080B12]/50 border-white/5 opacity-60'
                        : isBreak
                        ? 'bg-[#080B12]/80 border-white/5'
                        : 'bg-[#080B12] border-white/10 hover:border-[#0070F3]/30 shadow-[0_0_20px_rgba(0,112,243,0.05)]'
                    }`}
                  >
                    {/* Time & Subject Info */}
                    <div className="flex items-start sm:items-center gap-3">
                      <button
                        onClick={() => onToggleSessionComplete(0, session.id)}
                        className={`mt-0.5 sm:mt-0 w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                          session.completed
                            ? 'bg-[#0070F3] border-[#0070F3] text-white shadow-[0_0_10px_rgba(0,112,243,0.5)]'
                            : 'border-gray-600 hover:border-[#0070F3] text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5 fill-current" />
                      </button>

                      <div className="font-mono text-xs text-gray-400 min-w-[120px]">
                        {formatTimeRange(session.startTime, session.endTime, session.durationMinutes)}
                      </div>

                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span
                            className="w-2.5 h-2.5 rounded-full"
                            style={{ backgroundColor: session.subjectColor || '#0070F3' }}
                          />
                          <h4 className={`text-sm font-semibold ${session.completed ? 'line-through text-gray-500' : 'text-white'}`}>
                            {session.subjectName}
                          </h4>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono uppercase font-semibold bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/20">
                            {session.type}
                          </span>
                        </div>
                        <p className="text-xs text-gray-400">{session.topic}</p>
                      </div>
                    </div>

                    {/* Meta Controls */}
                    <div className="mt-3 sm:mt-0 flex items-center gap-3 self-end sm:self-center">
                      <span className="text-xs text-gray-400 font-mono">{session.durationMinutes} min</span>
                      <button
                        onClick={() => setActiveTab('timer')}
                        className="px-3 py-1.5 rounded-xl bg-[#0070F3]/10 hover:bg-[#0070F3]/20 border border-[#0070F3]/30 text-[#0070F3] text-xs font-semibold flex items-center gap-1 transition-all"
                      >
                        <Play className="w-3 h-3 fill-[#0070F3] text-[#0070F3]" />
                        <span>Focus</span>
                      </button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Col: Alex Personal Study Assistant Card */}
        <div className="space-y-6">
          <Card3D glowColor="blue" className="bg-[#080B12] p-5 sm:p-6 border border-white/10 relative overflow-hidden">
            {/* Top ambient glow */}
            <div className="absolute top-0 right-0 w-40 h-40 bg-[#0070F3] opacity-15 blur-[50px] rounded-full pointer-events-none" />

            {/* Header with Alex Avatar */}
            <div className="flex items-center gap-3.5 mb-4 border-b border-white/10 pb-4">
              <div className="relative w-12 h-12 rounded-full border-2 border-[#0070F3] shadow-[0_0_20px_rgba(0,112,243,0.5)] overflow-hidden shrink-0">
                <img
                  src={alexAvatar}
                  alt="Alex — Your Personal AI Assistant"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-1">
                  <h3 className="text-base font-extrabold text-white tracking-tight flex items-center gap-1.5">
                    <span>Alex</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-medium">
                      Online
                    </span>
                  </h3>
                  <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0070F3]/20 text-[#0070F3] font-mono font-bold border border-[#0070F3]/30">
                    Personal AI
                  </span>
                </div>
                <p className="text-xs text-gray-300 font-medium truncate mt-0.5">
                  Your Personal Study Assistant
                </p>
              </div>
            </div>

            {/* Content & Capabilities */}
            <p className="text-xs text-gray-300 leading-relaxed mb-4">
              Need help with formulas, concept diagrams, exam strategy, or custom study advice? Ask Alex anytime for instant academic guidance.
            </p>

            {/* Quick Prompt Suggestions */}
            <div className="space-y-2 mb-4">
              <span className="text-[10px] font-mono uppercase tracking-wider text-gray-400 font-bold block">
                Quick Prompts for Alex:
              </span>
              <button
                onClick={() => setActiveTab('assistant')}
                className="w-full text-left p-2.5 rounded-xl bg-[#030507]/80 hover:bg-[#0070F3]/10 border border-white/5 hover:border-[#0070F3]/30 text-xs text-gray-200 hover:text-white transition-all flex items-center justify-between group"
              >
                <span>📐 "Generate a Math & Physics Formula Sheet"</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#0070F3] transition-colors" />
              </button>
              <button
                onClick={() => setActiveTab('assistant')}
                className="w-full text-left p-2.5 rounded-xl bg-[#030507]/80 hover:bg-[#0070F3]/10 border border-white/5 hover:border-[#0070F3]/30 text-xs text-gray-200 hover:text-white transition-all flex items-center justify-between group"
              >
                <span>🔄 "Show active recall study diagram"</span>
                <ArrowUpRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-[#0070F3] transition-colors" />
              </button>
            </div>

            {/* Primary Action Button */}
            <button
              id="dash-ask-alex-btn"
              onClick={() => setActiveTab('assistant')}
              className="w-full py-3 px-4 rounded-xl bg-[#0070F3] hover:bg-[#0070F3]/90 text-white font-semibold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,112,243,0.35)] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Ask Alex Anything</span>
              <ArrowUpRight className="w-4 h-4" />
            </button>
          </Card3D>
        </div>
      </div>
    </div>
  );
};
