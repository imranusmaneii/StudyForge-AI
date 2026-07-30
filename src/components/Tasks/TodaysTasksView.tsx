import React, { useState } from 'react';
import { StudyPlan, ActiveTab } from '../../types';
import { Card3D } from '../3d/Card3D';
import confetti from 'canvas-confetti';
import {
  CheckCircle2,
  Clock,
  Play,
  Filter,
  Flame,
  Calendar,
  Sparkles,
  ArrowRight
} from 'lucide-react';

interface TodaysTasksViewProps {
  studyPlan: StudyPlan;
  onToggleSessionComplete: (dayIdx: number, sessionId: string) => void;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateModal: () => void;
}

export const TodaysTasksView: React.FC<TodaysTasksViewProps> = ({
  studyPlan,
  onToggleSessionComplete,
  setActiveTab,
  onOpenCreateModal
}) => {
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const today = studyPlan?.days?.[0];
  const allSessions = today?.sessions || [];

  const filteredSessions = allSessions.filter(s => {
    if (filter === 'pending') return !s.completed;
    if (filter === 'completed') return s.completed;
    return true;
  });

  const completedCount = allSessions.filter(s => s.completed).length;
  const progressPercent = allSessions.length > 0 ? Math.round((completedCount / allSessions.length) * 100) : 0;

  const handleToggleWithConfetti = (sessionId: string, wasCompleted: boolean) => {
    if (!wasCompleted) {
      // Trigger confetti celebration!
      confetti({
        particleCount: 40,
        spread: 60,
        origin: { y: 0.7 },
        colors: ['#3b82f6', '#06b6d4', '#38bdf8', '#8b5cf6']
      });
    }
    onToggleSessionComplete(0, sessionId);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0a1228] to-cyan-950/40 border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>DAY 1 ACTIVE TASK TIMELINE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Today's Study Schedule</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            {today?.dayName || 'Today'} ({today?.dateString || new Date().toISOString().split('T')[0]}) — {completedCount} of {allSessions.length} sessions completed ({progressPercent}%).
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-1.5 p-1 rounded-xl bg-[#060a17] border border-blue-900/30">
          {(['all', 'pending', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                filter === f
                  ? 'bg-blue-600 text-white font-bold shadow-sm'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Progress Bar */}
      <div className="p-4 rounded-xl bg-[#050812] border border-blue-900/30 flex items-center gap-4">
        <Flame className="w-5 h-5 text-amber-400 shrink-0" />
        <div className="flex-1 space-y-1">
          <div className="flex justify-between text-xs font-mono">
            <span className="text-slate-300 font-bold">Today's Execution Target</span>
            <span className="text-cyan-400 font-bold">{progressPercent}% Completed</span>
          </div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 via-cyan-400 to-blue-400 transition-all duration-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Sessions Timeline Stream */}
      <div className="space-y-4 relative">
        {/* Vertical Glow Axis Line */}
        <div className="absolute left-6 sm:left-24 top-4 bottom-4 w-0.5 bg-gradient-to-b from-blue-500/40 via-cyan-500/20 to-transparent hidden sm:block" />

        {filteredSessions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-black/40 border border-blue-900/30">
            <p className="text-sm text-slate-400">No sessions match the selected filter ({filter}).</p>
          </div>
        ) : (
          filteredSessions.map((session, sIdx) => {
            const isBreak = session.type === 'break';
            return (
              <div key={session.id} className="relative flex flex-col sm:flex-row sm:items-center gap-4 sm:gap-8">
                {/* Time Stamp Node */}
                <div className="sm:w-20 text-xs font-mono font-bold text-cyan-400 flex items-center gap-2 sm:justify-end shrink-0">
                  <div className="w-3 h-3 rounded-full bg-cyan-400 shadow-[0_0_10px_rgba(6,182,212,0.8)] hidden sm:block absolute left-[91px] z-10" />
                  <span>{session.startTime || `0${9 + sIdx}:00`}</span>
                </div>

                {/* Card Container */}
                <Card3D
                  glowColor={isBreak ? 'purple' : 'blue'}
                  className={`flex-1 ${session.completed ? 'opacity-70 bg-blue-950/10' : ''}`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-3.5">
                      <button
                        onClick={() => handleToggleWithConfetti(session.id, session.completed)}
                        className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                          session.completed
                            ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_15px_rgba(6,182,212,0.8)]'
                            : 'border-slate-600 hover:border-cyan-400 text-transparent'
                        }`}
                      >
                        <CheckCircle2 className="w-4 h-4 fill-current" />
                      </button>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: session.subjectColor || '#3b82f6' }} />
                          <h3 className={`text-base font-bold ${session.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                            {session.subjectName}
                          </h3>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-blue-950 text-cyan-300 border border-blue-500/30">
                            {session.type}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-slate-800 text-slate-300">
                            {session.priority} Priority
                          </span>
                        </div>
                        <p className="text-xs text-slate-300">{session.topic}</p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-3 pt-2 sm:pt-0 border-t sm:border-t-0 border-blue-900/20">
                      <span className="text-xs text-slate-400 font-mono">{session.durationMinutes} min</span>
                      <button
                        onClick={() => setActiveTab('timer')}
                        className="px-3.5 py-1.5 rounded-lg bg-blue-900/40 hover:bg-blue-600/50 border border-blue-500/30 text-cyan-300 text-xs font-semibold flex items-center gap-1.5 transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
                        <span>Focus Session</span>
                      </button>
                    </div>
                  </div>
                </Card3D>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
