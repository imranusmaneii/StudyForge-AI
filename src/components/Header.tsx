import React from 'react';
import { ActiveTab, User, AuthModalMode } from '../types';
import { Sparkles, Bot, Timer, Calendar, User as UserIcon, LogOut, LogIn, Menu, X } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateModal: () => void;
  currentUser: User | null;
  onOpenAuth: (mode?: AuthModalMode) => void;
  onLogout: () => void;
  isHamburgerOpen: boolean;
  onToggleHamburger: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  currentUser,
  onOpenAuth,
  onLogout,
  isHamburgerOpen,
  onToggleHamburger
}) => {
  const titles: Record<ActiveTab, { main: string; sub: string }> = {
    landing: { main: 'StudyForge AI', sub: 'Build your smartest study plan.' },
    dashboard: { main: 'Student Dashboard', sub: 'Here is what your study day looks like.' },
    planner: { main: 'AI Study Planner', sub: 'Generate & adapt your intelligent multi-day schedule.' },
    subjects: { main: 'Subject Matrix', sub: 'Manage knowledge levels, topics, and exam deadlines.' },
    tasks: { main: "Today's Study Schedule", sub: 'Track your scheduled sessions and mark tasks completed.' },
    progress: { main: 'Analytics & Performance', sub: 'Visualize study hours, streaks, and subject mastery.' },
    timer: { main: 'Focus Timer', sub: 'Pomodoro focus blocks with ambient audio & visual feedback.' },
    assistant: { main: 'Alex — Your Personal AI Assistant', sub: 'Ask contextual study questions, formulas, diagrams & study advice.' },
  };

  const current = titles[activeTab] || titles.dashboard;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric'
  });

  return (
    <header className="sticky top-0 z-30 bg-[#030507]/95 backdrop-blur-xl border-b border-white/5 px-3 sm:px-6 py-2.5 flex items-center justify-between gap-2.5">
      {/* Left: Hamburger trigger + Logo + Title */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Hamburger Menu Trigger Button (Visible on ALL screens) */}
        <button
          onClick={onToggleHamburger}
          aria-label="Toggle Navigation Menu"
          className="p-2 rounded-xl bg-[#080B12] border border-white/10 text-gray-200 hover:text-white hover:bg-white/10 active:scale-95 transition-all shrink-0 flex items-center justify-center"
        >
          {isHamburgerOpen ? <X className="w-5 h-5 text-[#0070F3]" /> : <Menu className="w-5 h-5 text-gray-200" />}
        </button>

        {/* Brand Logo alongside STUDYFORGE AI (Visible on ALL screens) */}
        <div
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-2 cursor-pointer group shrink-0"
        >
          <div className="relative w-8 h-8 rounded-lg bg-gradient-to-br from-[#0070F3] to-[#00A3FF] p-[1px] shadow-[0_0_12px_rgba(0,112,243,0.4)] group-hover:shadow-[0_0_18px_rgba(0,163,255,0.6)] transition-all shrink-0">
            <div className="w-full h-full bg-[#05080D] rounded-[7px] flex items-center justify-center font-extrabold text-white text-sm">
              S
            </div>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="font-extrabold text-sm sm:text-base tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-gray-100 to-gray-400">
              STUDYFORGE
            </span>
            <span className="text-[10px] px-1.5 py-0.2 rounded bg-[#0070F3]/10 text-[#0070F3] font-mono font-bold border border-[#0070F3]/20">
              AI
            </span>
          </div>
        </div>

        {/* View title divider & name (desktop/tablet only to keep mobile header clean) */}
        <div className="hidden md:flex items-center gap-2 border-l border-white/10 pl-3 min-w-0 flex-1">
          <h1 className="text-sm font-bold text-white tracking-tight truncate">
            {current.main}
          </h1>
        </div>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 shrink-0">
        <div className="hidden xl:flex items-center gap-2 px-2.5 py-1 rounded-lg bg-[#080B12] border border-white/5 text-[11px] text-gray-400 font-mono">
          <Calendar className="w-3 h-3 text-[#0070F3]" />
          <span>{todayFormatted}</span>
        </div>

        <button
          id="header-quick-planner-btn"
          onClick={onOpenCreateModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-gradient-to-r from-[#0070F3] to-[#00A3FF] hover:brightness-110 text-white text-xs font-semibold shadow-[0_0_15px_rgba(0,112,243,0.35)] active:scale-[0.98] transition-all shrink-0"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New AI Plan</span>
          <span className="sm:hidden">Plan</span>
        </button>

        {/* User Account / Auth Chip */}
        {currentUser ? (
          <div className="flex items-center gap-1 pl-1 border-l border-white/10">
            <div className="flex items-center gap-1.5 px-2 py-1 rounded-xl bg-[#080B12] border border-white/10">
              <div className="w-5 h-5 rounded-full bg-[#0070F3] text-white flex items-center justify-center text-[10px] font-bold shrink-0">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-gray-200 hidden lg:inline truncate max-w-[90px]">
                {currentUser.name}
              </span>
            </div>
          </div>
        ) : (
          <div className="flex items-center gap-1 pl-1 border-l border-white/10">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-2.5 py-1.5 rounded-xl bg-[#080B12] border border-white/10 text-gray-200 text-xs font-semibold hover:bg-white/5 transition-all flex items-center gap-1 shrink-0"
            >
              <LogIn className="w-3.5 h-3.5 text-[#0070F3]" />
              <span className="hidden sm:inline">Log In</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
