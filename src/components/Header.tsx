import React from 'react';
import { ActiveTab, User, AuthModalMode } from '../types';
import { Sparkles, Bot, Timer, Calendar, User as UserIcon, LogOut, LogIn } from 'lucide-react';

interface HeaderProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateModal: () => void;
  currentUser: User | null;
  onOpenAuth: (mode?: AuthModalMode) => void;
  onLogout: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  activeTab,
  setActiveTab,
  onOpenCreateModal,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const titles: Record<ActiveTab, { main: string; sub: string }> = {
    landing: { main: 'StudyForge AI', sub: 'Build your smartest study plan.' },
    dashboard: { main: 'Student Dashboard', sub: 'Here is what your study day looks like.' },
    planner: { main: 'AI Study Planner', sub: 'Generate & adapt your intelligent multi-day schedule.' },
    subjects: { main: 'Subject Matrix', sub: 'Manage knowledge levels, topics, and exam deadlines.' },
    tasks: { main: "Today's Study Schedule", sub: 'Track your scheduled sessions and mark tasks completed.' },
    progress: { main: 'Analytics & Performance', sub: 'Visualize study hours, streaks, and subject mastery.' },
    timer: { main: 'Focus Timer', sub: 'Pomodoro focus blocks with ambient audio & visual feedback.' },
    assistant: { main: 'AI Academic Assistant', sub: 'Ask contextual study questions powered by Gemini AI.' },
  };

  const current = titles[activeTab] || titles.dashboard;

  const todayFormatted = new Date().toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
    year: 'numeric'
  });

  return (
    <header className="sticky top-0 z-20 bg-[#030507]/80 backdrop-blur-md border-b border-white/5 px-4 sm:px-8 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
      <div>
        <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight flex items-center gap-2">
          {current.main}
          {activeTab === 'planner' && (
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-mono border border-[#0070F3]/20">
              AI Powered
            </span>
          )}
        </h1>
        <p className="text-xs text-gray-400 mt-0.5">{current.sub}</p>
      </div>

      <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
        <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#080B12] border border-white/5 text-xs text-gray-400 font-mono">
          <Calendar className="w-3.5 h-3.5 text-[#0070F3]" />
          <span>{todayFormatted}</span>
        </div>

        <button
          id="header-quick-planner-btn"
          onClick={onOpenCreateModal}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0070F3] hover:bg-[#0070F3]/90 text-white text-xs font-semibold shadow-[0_0_20px_rgba(0,112,243,0.3)] hover:shadow-[0_0_25px_rgba(0,112,243,0.5)] active:scale-[0.98] transition-all"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>New AI Plan</span>
        </button>

        <button
          id="header-quick-timer-btn"
          onClick={() => setActiveTab('timer')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080B12] border border-white/10 text-gray-300 text-xs font-medium hover:bg-white/5 hover:text-white transition-all"
        >
          <Timer className="w-3.5 h-3.5 text-[#0070F3]" />
          <span className="hidden sm:inline">Focus</span>
        </button>

        <button
          id="header-quick-ai-btn"
          onClick={() => setActiveTab('assistant')}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-[#080B12] border border-white/10 text-gray-300 text-xs font-medium hover:bg-white/5 hover:text-white transition-all"
        >
          <Bot className="w-3.5 h-3.5 text-[#0070F3]" />
          <span className="hidden sm:inline">Ask AI</span>
        </button>

        {/* User Account / Auth Chip */}
        {currentUser ? (
          <div className="flex items-center gap-2 pl-2 border-l border-white/10">
            <div className="flex items-center gap-2 px-2.5 py-1 rounded-xl bg-[#080B12] border border-white/10">
              <div className="w-6 h-6 rounded-full bg-[#0070F3] text-white flex items-center justify-center text-xs font-bold">
                {currentUser.name.charAt(0)}
              </div>
              <span className="text-xs font-semibold text-gray-200 hidden md:inline truncate max-w-[100px]">
                {currentUser.name}
              </span>
            </div>
            <button
              onClick={onLogout}
              title="Sign Out"
              className="p-2 rounded-xl text-gray-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent hover:border-red-500/20"
            >
              <LogOut className="w-3.5 h-3.5" />
            </button>
          </div>
        ) : (
          <div className="flex items-center gap-1 pl-2 border-l border-white/10">
            <button
              onClick={() => onOpenAuth('login')}
              className="px-3 py-2 rounded-xl bg-[#080B12] border border-white/10 text-gray-200 text-xs font-semibold hover:bg-white/5 transition-all flex items-center gap-1.5"
            >
              <LogIn className="w-3.5 h-3.5 text-[#0070F3]" />
              <span>Log In</span>
            </button>
            <button
              onClick={() => onOpenAuth('signup')}
              className="px-3 py-2 rounded-xl bg-[#0070F3]/20 border border-[#0070F3]/30 text-[#0070F3] text-xs font-semibold hover:bg-[#0070F3]/30 transition-all hidden sm:flex items-center gap-1"
            >
              <span>Sign Up</span>
            </button>
          </div>
        )}
      </div>
    </header>
  );
};
