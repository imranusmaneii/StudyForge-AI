import React, { useState } from 'react';
import { StudyPlan, ActiveTab } from '../../types';
import { Card3D } from '../3d/Card3D';
import { formatTimeRange, formatTime12h, calculateEndTime } from '../../lib/timeUtils';
import {
  Sparkles,
  Sliders,
  Calendar,
  Clock,
  CheckCircle2,
  Play,
  Brain,
  PlusCircle,
  AlertCircle,
  Edit2,
  X,
  Check,
  Search,
  Copy,
  Plus,
  Minus,
  Filter
} from 'lucide-react';

interface PlanViewProps {
  studyPlan: StudyPlan;
  onToggleSessionComplete: (dayIdx: number, sessionId: string) => void;
  onOpenCreateModal: () => void;
  onOpenAdjustModal: () => void;
  setActiveTab: (tab: ActiveTab) => void;
  onUpdateSessionTime?: (dayIdx: number, sessionId: string, newStartTime: string, newDurationMins?: number) => void;
}

export const PlanView: React.FC<PlanViewProps> = ({
  studyPlan,
  onToggleSessionComplete,
  onOpenCreateModal,
  onOpenAdjustModal,
  setActiveTab,
  onUpdateSessionTime
}) => {
  const [activeDayIdx, setActiveDayIdx] = useState(0);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<'all' | 'urgent' | 'high' | 'medium' | 'low'>('all');
  const [isCopied, setIsCopied] = useState(false);

  // Time editing modal state
  const [editingSession, setEditingSession] = useState<{
    id: string;
    startTime: string;
    duration: number;
    subjectName: string;
  } | null>(null);

  const days = studyPlan?.days || [];
  const currentDay = days[activeDayIdx] || days[0];
  const allSessions = currentDay?.sessions || [];

  const sessions = allSessions.filter(s => {
    const matchesSearch = searchQuery === '' ||
      s.subjectName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.topic.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPriority = priorityFilter === 'all' || s.priority === priorityFilter;
    return matchesSearch && matchesPriority;
  });

  const handleCopySchedule = () => {
    if (!currentDay) return;
    const text = `StudyForge AI Plan - ${currentDay.dayName}\n` +
      allSessions.map((s, idx) => `${idx + 1}. [${s.startTime} - ${s.endTime}] ${s.subjectName}: ${s.topic} (${s.durationMinutes}m)`).join('\n');
    navigator.clipboard.writeText(text);
    setIsCopied(true);
    setTimeout(() => setIsCopied(false), 2500);
  };

  const handleSaveTimeEdit = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingSession && onUpdateSessionTime) {
      onUpdateSessionTime(
        activeDayIdx,
        editingSession.id,
        editingSession.startTime,
        editingSession.duration
      );
    }
    setEditingSession(null);
  };

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

      {/* Quick Search, Filter & Export Toolbar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-xl bg-[#060a17] border border-blue-900/30">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search topics or subjects..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-1.5 rounded-lg bg-[#080d22] border border-blue-900/40 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <div className="flex items-center gap-1 shrink-0 overflow-x-auto">
            {(['all', 'urgent', 'high', 'medium', 'low'] as const).map((pf) => (
              <button
                key={pf}
                onClick={() => setPriorityFilter(pf)}
                className={`px-2 py-1 rounded-md text-[11px] font-mono font-semibold capitalize transition-all ${
                  priorityFilter === pf
                    ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {pf}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={handleCopySchedule}
          className="flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-950/60 border border-blue-500/30 text-xs font-semibold text-cyan-300 hover:bg-blue-900/40 transition-all shrink-0"
        >
          {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{isCopied ? 'Copied Timetable!' : 'Copy Daily Schedule'}</span>
        </button>
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

                    {/* Time pill with quick edit trigger */}
                    <div className="group relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#070d1e] border border-blue-900/40 text-xs font-mono text-cyan-400 shrink-0">
                      <Clock className="w-3.5 h-3.5" />
                      <span>{formatTimeRange(session.startTime, session.endTime, session.durationMinutes)}</span>
                      {onUpdateSessionTime && (
                        <button
                          onClick={() => setEditingSession({
                            id: session.id,
                            startTime: session.startTime || '09:00',
                            duration: session.durationMinutes || 45,
                            subjectName: session.subjectName
                          })}
                          title="Change Session Time"
                          className="ml-1 p-0.5 rounded hover:bg-blue-800/40 text-slate-400 hover:text-cyan-300 transition-colors"
                        >
                          <Edit2 className="w-3 h-3" />
                        </button>
                      )}
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

      {/* Quick Time Editing Modal */}
      {editingSession && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-sm bg-[#050914] border border-cyan-500/40 rounded-2xl shadow-[0_0_40px_rgba(6,182,212,0.3)] p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-blue-900/30 pb-3">
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-cyan-400" />
                <h3 className="text-sm font-bold text-white">Adjust Session Time</h3>
              </div>
              <button
                onClick={() => setEditingSession(null)}
                className="p-1 text-slate-400 hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Set new start time and duration for <span className="text-cyan-300 font-bold">{editingSession.subjectName}</span>:
            </p>

            <form onSubmit={handleSaveTimeEdit} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Start Time
                </label>
                <input
                  type="time"
                  value={editingSession.startTime}
                  onChange={(e) => setEditingSession({ ...editingSession, startTime: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[#070d1e] border border-blue-900/40 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Duration (Minutes)
                </label>
                <div className="grid grid-cols-4 gap-2">
                  {[25, 45, 60, 90].map((dur) => (
                    <button
                      key={dur}
                      type="button"
                      onClick={() => setEditingSession({ ...editingSession, duration: dur })}
                      className={`py-1.5 rounded-lg text-xs font-mono font-semibold transition-all ${
                        editingSession.duration === dur
                          ? 'bg-cyan-500 text-black font-bold'
                          : 'bg-[#080e22] text-slate-400 border border-blue-900/30'
                      }`}
                    >
                      {dur}m
                    </button>
                  ))}
                </div>
              </div>

              <div className="p-3 rounded-xl bg-[#080e22] border border-blue-900/30 text-[11px] text-cyan-400 font-mono">
                Updated Time Range: {formatTime12h(editingSession.startTime)} – {formatTime12h(calculateEndTime(editingSession.startTime, editingSession.duration))}
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setEditingSession(null)}
                  className="px-3.5 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-black text-xs font-bold transition-all shadow-[0_0_15px_rgba(6,182,212,0.4)]"
                >
                  Save Time
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
