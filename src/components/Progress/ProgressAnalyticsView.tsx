import React from 'react';
import { ProgressStats, Subject } from '../../types';
import { Card3D } from '../3d/Card3D';
import {
  TrendingUp,
  Clock,
  Award,
  Flame,
  BarChart2,
  PieChart,
  CheckCircle2,
  Calendar
} from 'lucide-react';

interface ProgressAnalyticsViewProps {
  progress: ProgressStats;
  subjects: Subject[];
}

export const ProgressAnalyticsView: React.FC<ProgressAnalyticsViewProps> = ({
  progress,
  subjects
}) => {
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
  const maxHours = Math.max(...(progress.weeklyStudyHours || [4, 4, 4, 4, 4, 4, 4]), 5);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0a1228] to-cyan-950/40 border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>PERFORMANCE ANALYTICS ENGINE</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Study Progress & Metrics</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Track weekly study hours, subject mastery, and active streaks.
          </p>
        </div>

        <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-950/60 border border-blue-500/30 text-amber-400 font-mono text-xs font-bold">
          <Flame className="w-4 h-4 fill-amber-400 animate-pulse" />
          <span>{progress.currentStreakDays} DAY STREAK</span>
        </div>
      </div>

      {/* 4 Core Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        <Card3D glowColor="blue">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Overall Progress</span>
          <p className="text-3xl font-extrabold text-white font-mono mt-2">{progress.todayProgressPercent}%</p>
          <p className="text-[11px] text-slate-400 mt-1">Completion rate across all subjects</p>
        </Card3D>

        <Card3D glowColor="cyan">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weekly Study Time</span>
          <p className="text-3xl font-extrabold text-white font-mono mt-2">12h 45m</p>
          <p className="text-[11px] text-slate-400 mt-1">+2.5 hrs vs last week</p>
        </Card3D>

        <Card3D glowColor="purple">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Completed Sessions</span>
          <p className="text-3xl font-extrabold text-white font-mono mt-2">{progress.totalSessionsCompleted}</p>
          <p className="text-[11px] text-slate-400 mt-1">Focus blocks completed</p>
        </Card3D>

        <Card3D glowColor="sky">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Current Streak</span>
          <p className="text-3xl font-extrabold text-white font-mono mt-2">{progress.currentStreakDays} Days</p>
          <p className="text-[11px] text-amber-400 mt-1">Consistency multiplier active</p>
        </Card3D>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Chart 1: Weekly Study Hours Bar Chart */}
        <Card3D glowColor="blue" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <BarChart2 className="w-4 h-4 text-cyan-400" />
              <span>Weekly Study Hours (Mon–Sun)</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 font-mono">Hours / Day</span>
          </div>

          <div className="h-56 flex items-end justify-between gap-3 pt-6 pb-2 px-2 border-b border-blue-900/30">
            {(progress.weeklyStudyHours || [3.5, 4.2, 3.8, 3.4, 4.0, 2.5, 0.0]).map((hrs, i) => {
              const heightPercent = Math.min(100, Math.max(10, (hrs / maxHours) * 100));
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 group">
                  <span className="text-[10px] text-cyan-300 font-mono opacity-0 group-hover:opacity-100 transition-opacity">
                    {hrs}h
                  </span>
                  <div className="w-full bg-slate-900 rounded-t-lg overflow-hidden flex items-end h-40">
                    <div
                      className="w-full bg-gradient-to-t from-blue-600 via-cyan-500 to-blue-400 rounded-t-lg group-hover:brightness-125 transition-all duration-500"
                      style={{ height: `${heightPercent}%` }}
                    />
                  </div>
                  <span className="text-xs font-mono text-slate-400 font-semibold">{days[i]}</span>
                </div>
              );
            })}
          </div>
        </Card3D>

        {/* Chart 2: Subject Mastery Breakdown */}
        <Card3D glowColor="cyan" className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <PieChart className="w-4 h-4 text-cyan-400" />
              <span>Subject Knowledge & Progress</span>
            </h3>
            <span className="text-[10px] px-2 py-0.5 rounded bg-blue-500/20 text-cyan-300 font-mono">Mastery %</span>
          </div>

          <div className="space-y-4 pt-2">
            {subjects.map((subj) => (
              <div key={subj.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-mono">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: subj.color }} />
                    <span className="font-semibold text-slate-200">{subj.name}</span>
                  </div>
                  <span className="text-cyan-400 font-bold">{subj.knowledgeLevel}%</span>
                </div>
                <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${subj.knowledgeLevel}%`, backgroundColor: subj.color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card3D>
      </div>
    </div>
  );
};
