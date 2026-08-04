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
  User as UserIcon,
  Lock,
  X,
  ChevronRight
} from 'lucide-react';

interface NavigationProps {
  activeTab: ActiveTab;
  setActiveTab: (tab: ActiveTab) => void;
  streakDays: number;
  onOpenSettings: () => void;
  currentUser: User | null;
  onOpenAuth: (mode?: AuthModalMode) => void;
  onLogout: () => void;
  isHamburgerOpen?: boolean;
  onCloseHamburger?: () => void;
}

export const Navigation: React.FC<NavigationProps> = ({
  activeTab,
  setActiveTab,
  streakDays,
  onOpenSettings,
  currentUser,
  onOpenAuth,
  onLogout,
  isHamburgerOpen = false,
  onCloseHamburger
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

  const handleSelectTab = (tab: ActiveTab) => {
    setActiveTab(tab);
    if (onCloseHamburger) onCloseHamburger();
  };

  return (
    <>
      {/* Universal Hamburger Navigation Drawer (Available on ALL screen sizes) */}
      {isHamburgerOpen && (
        <div className="fixed inset-0 z-50 flex">
          {/* Backdrop Blur Overlay */}
          <div
            onClick={onCloseHamburger}
            className="fixed inset-0 bg-black/80 backdrop-blur-md animate-in fade-in duration-200"
          />

          {/* Drawer Sidebar */}
          <div className="relative z-10 w-80 max-w-[85vw] h-full bg-[#05080D] border-r border-white/10 flex flex-col justify-between p-5 shadow-[0_0_50px_rgba(0,112,243,0.3)] animate-in slide-in-from-left duration-300">
            {/* Header & Brand */}
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div
                  onClick={() => handleSelectTab('landing')}
                  className="flex items-center gap-3 cursor-pointer group"
                >
                  <div className="relative w-9 h-9 rounded-lg bg-gradient-to-br from-[#0070F3] to-[#00A3FF] p-[1px] shadow-[0_0_15px_rgba(0,112,243,0.4)] group-hover:shadow-[0_0_20px_rgba(0,163,255,0.6)] transition-all shrink-0">
                    <div className="w-full h-full bg-[#05080D] rounded-[7px] flex items-center justify-center font-extrabold text-white text-base">
                      S
                    </div>
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-extrabold text-base tracking-tight text-white">STUDYFORGE</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#0070F3]/10 text-[#0070F3] font-mono font-bold border border-[#0070F3]/20">AI</span>
                    </div>
                    <p className="text-[10px] text-gray-400">Smart schedule & focus engine.</p>
                  </div>
                </div>

                <button
                  onClick={onCloseHamburger}
                  className="p-1.5 rounded-xl bg-white/5 text-gray-400 hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Study Streak Chip */}
              <div className="flex items-center justify-between px-3.5 py-2 rounded-xl bg-[#080B12] border border-white/10 text-xs">
                <div className="flex items-center gap-2">
                  <Flame className="w-4 h-4 text-amber-400 fill-amber-400/30 animate-pulse" />
                  <span className="text-gray-300 font-medium">Study Streak</span>
                </div>
                <span className="font-bold text-[#0070F3] font-mono text-xs">{streakDays} Days</span>
              </div>

              {/* Navigation Items */}
              <nav className="space-y-1 overflow-y-auto max-h-[55vh] pr-1">
                {navItems.map((item) => {
                  const isActive = activeTab === item.id;
                  const isProtected = !currentUser && item.id !== 'landing';

                  return (
                    <button
                      key={item.id}
                      onClick={() => handleSelectTab(item.id)}
                      className={`w-full flex items-center justify-between px-3.5 py-3 rounded-xl text-xs font-semibold transition-all group ${
                        isActive
                          ? 'bg-[#0070F3]/15 text-[#0070F3] border border-[#0070F3]/30 shadow-[0_0_15px_rgba(0,112,243,0.2)]'
                          : 'text-gray-300 hover:text-white hover:bg-white/5 border border-transparent'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <span className={isActive ? 'text-[#0070F3]' : 'text-gray-400 group-hover:text-gray-200'}>
                          {item.icon}
                        </span>
                        <span>{item.label}</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        {isProtected ? (
                          <Lock className="w-3.5 h-3.5 text-amber-400" />
                        ) : (
                          item.badge && (
                            <span className="px-1.5 py-0.5 text-[9px] rounded font-mono font-bold bg-[#0070F3]/20 text-[#0070F3] border border-[#0070F3]/30">
                              {item.badge}
                            </span>
                          )
                        )}
                        <ChevronRight className={`w-3.5 h-3.5 text-gray-500 group-hover:text-gray-300 transition-transform ${isActive ? 'translate-x-0.5 text-[#0070F3]' : ''}`} />
                      </div>
                    </button>
                  );
                })}
              </nav>
            </div>

            {/* Bottom Controls */}
            <div className="space-y-2 pt-4 border-t border-white/10">
              <button
                onClick={() => {
                  onOpenSettings();
                  if (onCloseHamburger) onCloseHamburger();
                }}
                className="w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium text-gray-300 hover:text-white hover:bg-white/5 transition-all"
              >
                <Settings className="w-4 h-4 text-gray-400" />
                <span>Settings & Preferences</span>
              </button>

              {currentUser ? (
                <div className="p-3 rounded-xl bg-[#080B12] border border-white/10 space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0070F3] text-white flex items-center justify-center font-bold text-xs shrink-0 shadow-inner">
                      {currentUser.name.charAt(0)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-gray-200 truncate">{currentUser.name}</p>
                      <p className="text-[10px] text-gray-400 truncate">{currentUser.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-white/10">
                    <button
                      onClick={() => {
                        onOpenAuth('login');
                        if (onCloseHamburger) onCloseHamburger();
                      }}
                      className="flex-1 py-1.5 px-2 rounded-lg bg-white/5 hover:bg-white/10 text-xs font-medium text-gray-300 transition-all text-center"
                    >
                      Switch
                    </button>
                    <button
                      onClick={() => {
                        onLogout();
                        if (onCloseHamburger) onCloseHamburger();
                      }}
                      className="py-1.5 px-3 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-xs font-semibold text-red-400 transition-all flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              ) : (
                <button
                  onClick={() => {
                    onOpenAuth('signup');
                    if (onCloseHamburger) onCloseHamburger();
                  }}
                  className="w-full flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl bg-[#0070F3] hover:bg-[#0070F3]/90 text-white font-semibold text-xs shadow-[0_0_15px_rgba(0,112,243,0.3)] transition-all"
                >
                  <LogIn className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Mobile & Desktop Bottom Quick Nav (Optional lightweight toolbar) or clean full-width content */}
    </>
  );
};
