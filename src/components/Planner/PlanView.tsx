import React, { useState } from 'react';
import { StudyPlan, ActiveTab } from '../../types';
import { Card3D } from '../3d/Card3D';
import {
  Sparkles,
  Sliders,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  Brain,
  PlusCircle,
  AlertCircle
} from 'lucide-react';

interface PlanViewProps {
  studyPlan: StudyPlan;
  onToggleSessionComplete: (dayIdx: number, sessionId: string) => void;
  onOpenCreateModal: () => void;
  onOpenAdjustModal: () => void;
  setActiveTab: (tab: ActiveTab) => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  studyPlan,
  onToggleSessionComplete,
  onOpenCreateModal,
  onOpenAdjustModal,
  setActiveTab
}) => {
  const [activeDayIdx, setActiveDayIdx] = useState(0);

  const days = studyPlan?.days || [];
  const currentDay = days[activeDayIdx] || days[0];
  const sessions = currentDay?.sessions || [];

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner & Action Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0a1228] to-cyan-950/40 border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>ACTIVE ADAPTIVE SCHEDULE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Your Personalized Study Plan</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Optimized based on upcoming exam dates, topic difficulties, and daily availability ({studyPlan.availableHoursPerDay || 4} hrs/day).
          </p>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            id="plan-view-adjust-btn"
            onClick={onOpenAdjustModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-semibold text-xs shadow-[0_0_20px_rgba(6,182,212,0.4)] hover:scale-[1.02] transition-all"
          >
            <Sliders className="w-4 h-4 text-cyan-300" />
            <span>Adjust My Plan</span>
          </button>

          <button
            id="plan-view-regenerate-btn"
            onClick={onOpenCreateModal}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-950/60 border border-blue-500/30 text-slate-200 text-xs font-medium hover:bg-blue-900/50 hover:text-white transition-all"
          >
            <PlusCircle className="w-3.5 h-3.5 text-blue-400" />
            <span>New Plan</span>
          </button>
        </div>
      </div>

      {/* AI Strategy Reasoning Callout */}
      {studyPlan.aiReasoning && (
        <div className="p-4 rounded-xl bg-[#070e24] border border-blue-500/30 flex items-start gap-3">
          <Brain className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
          <div>
            <span className="text-xs font-bold text-cyan-300 uppercase tracking-wider font-mono">AI Optimization Logic</span>
            <p className="text-xs text-slate-300 mt-1 leading-relaxed">{studyPlan.aiReasoning}</p>
          </div>
        </div>
      )}

      {/* Day Selector Tabs */}
      <div className="flex items-center gap-2 border-b border-blue-900/30 pb-3 overflow-x-auto">
        {days.map((day, idx) => {
          const isActive = activeDayIdx === idx;
          const completedCount = day.sessions.filter(s => s.completed).length;
          const totalCount = day.sessions.length;

          return (
            <button
              key={idx}
              onClick={() => setActiveDayIdx(idx)}
              className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-medium transition-all shrink-0 ${
                isActive
                  ? 'bg-gradient-to-r from-blue-600/30 to-cyan-500/20 text-white border border-blue-400/50 shadow-[0_0_20px_rgba(59,130,246,0.2)]'
                  : 'bg-[#060a17] text-slate-400 hover:text-slate-200 border border-blue-900/20'
              }`}
            >
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span className="font-bold">{day.dayName}</span>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-blue-950 text-cyan-300 font-mono">
                {completedCount}/{totalCount}
              </span>
            </button>
          );
        })}
      </div>

      {/* Timeline Sessions List */}
      <div className="space-y-4">
        {sessions.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-black/40 border border-blue-900/30 space-y-3">
            <AlertCircle className="w-8 h-8 text-slate-500 mx-auto" />
            <h3 className="text-sm font-bold text-white">Your study plan is waiting.</h3>
            <p className="text-xs text-slate-400 max-w-md mx-auto">
              Tell us what you're studying and your exam dates, and StudyForge AI will build your schedule.
            </p>
            <button
              onClick={onOpenCreateModal}
              className="px-5 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold"
            >
              Create Study Plan
            </button>
          </div>
        ) : (
          sessions.map((session, sIdx) => {
            const isBreak = session.type === 'break';
            const priorityBadge = {
              urgent: 'bg-rose-500/20 text-rose-300 border-rose-500/30',
              high: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
              medium: 'bg-blue-500/20 text-cyan-300 border-blue-500/30',
              low: 'bg-slate-700/20 text-slate-400 border-slate-700/30'
            }[session.priority] || 'bg-blue-500/20 text-cyan-300 border-blue-500/30';

            return (
              <Card3D
                key={session.id}
                glowColor={isBreak ? 'purple' : 'blue'}
                className={`transition-all duration-300 ${
                  session.completed ? 'opacity-70 bg-blue-950/10' : ''
                }`}
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Left details */}
                  <div className="flex items-start gap-4">
                    {/* Checkbox */}
                    <button
                      onClick={() => onToggleSessionComplete(activeDayIdx, session.id)}
                      className={`mt-1 w-6 h-6 rounded-lg border flex items-center justify-center transition-all ${
                        session.completed
                          ? 'bg-cyan-500 border-cyan-400 text-black shadow-[0_0_12px_rgba(6,182,212,0.8)]'
                          : 'border-slate-600 hover:border-cyan-400 text-transparent'
                      }`}
                    >
                      <CheckCircle2 className="w-4 h-4 fill-current" />
                    </button>

                    {/* Time pill */}
                    <div className="px-3 py-1.5 rounded-lg bg-[#070d1e] border border-blue-900/40 text-xs font-mono text-cyan-400 flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{session.startTime && session.endTime ? `${session.startTime}–${session.endTime}` : `${session.durationMinutes}m`}</span>
                    </div>

                    {/* Subject & Topic */}
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: session.subjectColor || '#3b82f6' }} />
                        <h3 className={`text-base font-bold ${session.completed ? 'line-through text-slate-400' : 'text-white'}`}>
                          {session.subjectName}
                        </h3>
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase border ${priorityBadge}`}>
                          {session.priority} PRIORITY
                        </span>
                        <span className="text-[10px] px-2 py-0.5 rounded font-mono font-bold uppercase bg-blue-950 text-cyan-300 border border-blue-500/30">
                          {session.type}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300">{session.topic}</p>
                    </div>
                  </div>

                  {/* Right duration & Launch Focus */}
                  <div className="flex items-center justify-between md:justify-end gap-4 border-t md:border-t-0 border-blue-900/20 pt-3 md:pt-0">
                    <span className="text-xs text-slate-400 font-mono font-semibold">{session.durationMinutes} Minutes</span>

                    <button
                      onClick={() => setActiveTab('timer')}
                      className="px-4 py-2 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 hover:scale-[1.02] text-white text-xs font-bold flex items-center gap-1.5 shadow-md transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-white" />
                      <span>Start Focus</span>
                    </button>
                  </div>
                </div>
              </Card3D>
            );
          })
        )}
      </div>
    </div>
  );
};
