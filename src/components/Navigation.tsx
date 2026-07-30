import React from 'react';
import { ActiveTab, User, AuthModalMode } from '../types';
import {
  Sparkles,
  LayoutDashboard,
  CalendarRange,
  BookOpen,
  CheckCircle2,
  TrendingUp,
  Timer,
  Bot,
  Settings,
  Flame,
  Globe,
  LogIn,
  LogOut,
  User as UserIcon
} from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  streakDays: number;
  onOpenSettings: () => void;
  currentUser: User | null;
  onOpenAuth: (mode?: AuthModalMode) => void;
  onLogout: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  streakDays,
  onOpenSettings,
  currentUser,
  onOpenAuth,
  onLogout
}) => {
  const navItems: { id: ActiveTab; label: string; icon: React.ReactNode; badge?: string }[] = [
    { id: 'landing', label: 'Overview', icon: <Globe className="w-4 h-4" /> },
    { id: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
    { id: 'planner', label: 'Study Planner', icon: <CalendarRange className="w-4 h-4" />, badge: 'AI' },
    { id: 'subjects', label: 'Subjects', icon: <BookOpen className="w-4 h-4" /> },
    { id: 'tasks', label: "Today's Tasks", icon: <CheckCircle2 className="w-4 h-4" /> },
    { id: 'progress', label: 'Progress', icon: <TrendingUp className="w-4 h-4" /> },
    { id: 'timer', label: 'Focus Timer', icon: <Timer className="w-4 h-4" /> },
    { id: 'assistant', label: 'AI Assistant', icon: <Bot className="w-4 h-4" />, badge: 'Gemini' },
  ];

  return (
    <>
      {/* Desktop & Tablet Sidebar */}
      <aside id="main-sidebar" className="hidden md:flex flex-col w-64 h-screen sticky top-0 bg-[#05080D] border-r border-white/5 text-slate-300 z-30 select-none">
        {/* Brand Logo & Tagline */}
        <div className="p-5 border-b border-white/5">
          <div
            onClick={() => setActiveTab('landing')}
            className="flex items-center gap-3 cursor-pointer group"
          >
            <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#0070F3] to-[#00A3FF] p-[1px] shadow-[0_0_15px_rgba(0,112,243,0.4)] group-hover:shadow-[0_0_20px_rgba(0,163,255,0.6)] transition-all">
              <div className="w-full h-full bg-[#05080D] rounded-[7px] flex items-center justify-center font-bold text-white text-base">
                S
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-bold text-lg tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">STUDYFORGE</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0070F3]/10 text-[#0070F3] font-semibold border border-[#0070F3]/20">AI</span>
              </div>
              <p className="text-[11px] text-gray-400 tracking-tight">Smart schedule & focus engine.</p>
            </div>
          </div>
        </div>

        {/* Streak Counter Chip */}
        <div className="px-4 py-3">
          <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#080B12] border border-white/5 text-xs">
            <div className="flex items-center gap-2">
              <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-pulse" />
              <span className="text-gray-300 font-medium">Study Streak</span>
            </div>
            <span className="font-bold text-[#0070F3] font-mono text-sm">{streakDays} Days</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-3 py-2 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                id={`nav-item-${item.id}`}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all duration-200 group ${
                  isActive
                    ? 'bg-[#0070F3]/10 text-[#0070F3] border border-[#0070F3]/20 shadow-[0_0_15px_rgba(0,112,243,0.15)]'
                    : 'text-gray-400 hover:text-white hover:bg-white/5 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className={`transition-colors ${isActive ? 'text-[#0070F3]' : 'text-gray-500 group-hover:text-gray-300'}`}>
                    {item.icon}
                  </span>
                  <span className="tracking-wide">{item.label}</span>
                </div>
                {item.badge && (
                  <span className="px-1.5 py-0.5 text-[10px] rounded font-mono font-semibold bg-[#0070F3]/20 text-[#0070F3] border border-[#0070F3]/30">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Bottom Profile & Settings */}
        <div className="p-3 border-t border-white/5 space-y-2">
          <button
            id="nav-settings-btn"
            onClick={onOpenSettings}
            className="w-full flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium text-gray-400 hover:text-white hover:bg-white/5 transition-all"
          >
            <Settings className="w-4 h-4 text-gray-500" />
            <span>Settings & Preferences</span>
          </button>

          {currentUser ? (
            <div className="p-2.5 rounded-xl bg-[#080B12] border border-white/5 space-y-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-[#0070F3] flex items-center justify-center font-bold text-xs text-white shadow-inner shrink-0">
                  {currentUser.name.charAt(0)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-semibold text-gray-200 truncate">{currentUser.name}</p>
                  <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                </div>
              </div>

              <div className="flex items-center gap-1.5 pt-1 border-t border-white/5">
                <button
                  onClick={() => onOpenAuth('login')}
                  className="flex-1 py-1 px-2 rounded-lg bg-white/5 text-[11px] font-medium text-gray-300 hover:bg-white/10 transition-all text-center"
                >
                  Switch
                </button>
                <button
                  onClick={onLogout}
                  className="py-1 px-2 rounded-lg bg-red-500/10 text-[11px] font-medium text-red-400 hover:bg-red-500/20 transition-all flex items-center gap-1"
                >
                  <LogOut className="w-3 h-3" />
                  <span>Out</span>
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuth('signup')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0070F3] hover:bg-[#0070F3]/90 text-white font-semibold text-xs shadow-[0_0_15px_rgba(0,112,243,0.3)] transition-all"
            >
              <LogIn className="w-3.5 h-3.5" />
              <span>Sign In / Create Account</span>
            </button>
          )}
        </div>
      </aside>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 inset-x-0 bg-[#030507]/95 backdrop-blur-xl border-t border-blue-900/30 z-40 px-1.5 py-1 flex items-center justify-between">
        {[
          { id: 'dashboard' as ActiveTab, label: 'Dash', icon: <LayoutDashboard className="w-4 h-4" /> },
          { id: 'planner' as ActiveTab, label: 'Planner', icon: <CalendarRange className="w-4 h-4" /> },
          { id: 'tasks' as ActiveTab, label: 'Tasks', icon: <CheckCircle2 className="w-4 h-4" /> },
          { id: 'timer' as ActiveTab, label: 'Timer', icon: <Timer className="w-4 h-4" /> },
          { id: 'assistant' as ActiveTab, label: 'AI Copilot', icon: <Bot className="w-4 h-4 text-cyan-400" /> },
        ].map((item) => {
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex-1 flex flex-col items-center justify-center py-1.5 rounded-lg text-[10px] transition-all ${
                isActive ? 'text-cyan-400 bg-blue-500/15 font-bold shadow-[0_0_10px_rgba(0,112,243,0.2)]' : 'text-slate-400 font-medium'
              }`}
            >
              {item.icon}
              <span className="mt-0.5 tracking-tight">{item.label}</span>
            </button>
          );
        })}
      </div>
    </>
  );
};
