import React, { useState } from 'react';
import { ActiveTab } from '../types';
import { Sparkles, BookOpen, Timer, Bot, X, HelpCircle, ChevronRight } from 'lucide-react';
import { SpotlightCard } from './SpotlightCard';

interface QuickStartGuideProps {
  setActiveTab: (tab: ActiveTab) => void;
  onOpenCreateModal: () => void;
}

export const QuickStartGuide: React.FC<QuickStartGuideProps> = ({
  setActiveTab,
  onOpenCreateModal
}) => {
  const [isDismissed, setIsDismissed] = useState(false);

  if (isDismissed) {
    return (
      <button
        onClick={() => setIsDismissed(false)}
        className="flex items-center gap-2 text-xs text-[#0070F3] hover:underline font-medium py-1 px-2 rounded-lg bg-[#0070F3]/5 border border-[#0070F3]/20 transition-all"
      >
        <HelpCircle className="w-3.5 h-3.5" />
        <span>Show Quick Start Guide</span>
      </button>
    );
  }

  const steps = [
    {
      num: '1',
      title: 'Setup Subjects',
      desc: 'Add your active courses and exam target dates.',
      icon: <BookOpen className="w-4 h-4 text-cyan-400" />,
      actionLabel: 'Manage Subjects',
      onClick: () => setActiveTab('subjects'),
      color: 'border-cyan-500/30 bg-cyan-950/20',
      spotlightColor: 'rgba(6, 182, 212, 0.3)'
    },
    {
      num: '2',
      title: 'Generate AI Plan',
      desc: 'AI builds your day-by-day optimized study sequence.',
      icon: <Sparkles className="w-4 h-4 text-[#0070F3]" />,
      actionLabel: 'Build New Schedule',
      onClick: onOpenCreateModal,
      color: 'border-[#0070F3]/30 bg-[#0070F3]/10',
      spotlightColor: 'rgba(0, 112, 243, 0.35)'
    },
    {
      num: '3',
      title: 'Execute Focus Sessions',
      desc: 'Use the Focus Timer with ambient sounds & track daily tasks.',
      icon: <Timer className="w-4 h-4 text-purple-400" />,
      actionLabel: 'Start Focus',
      onClick: () => setActiveTab('timer'),
      color: 'border-purple-500/30 bg-purple-950/20',
      spotlightColor: 'rgba(168, 85, 247, 0.3)'
    },
    {
      num: '4',
      title: 'Ask Gemini Assistant',
      desc: 'Get instant explanations, formula breakdowns, and review quizzes.',
      icon: <Bot className="w-4 h-4 text-emerald-400" />,
      actionLabel: 'Open AI Assistant',
      onClick: () => setActiveTab('assistant'),
      color: 'border-emerald-500/30 bg-emerald-950/20',
      spotlightColor: 'rgba(16, 185, 129, 0.3)'
    }
  ];

  return (
    <div className="p-5 rounded-2xl bg-[#080B12] border border-white/10 space-y-4 relative overflow-hidden shadow-lg">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-[#0070F3]/20 border border-[#0070F3]/40 flex items-center justify-center text-[#0070F3]">
            <HelpCircle className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              Quick Start Guide
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#0070F3]/10 text-[#0070F3] font-mono border border-[#0070F3]/20">
                4 Steps
              </span>
            </h3>
            <p className="text-xs text-gray-400">Everything you need to master your study workflow effortlessly.</p>
          </div>
        </div>

        <button
          onClick={() => setIsDismissed(true)}
          className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/5 transition-all text-xs flex items-center gap-1"
          title="Dismiss Guide"
        >
          <X className="w-4 h-4" />
          <span className="hidden sm:inline">Dismiss</span>
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {steps.map((step) => (
          <SpotlightCard
            key={step.num}
            spotlightColor={step.spotlightColor}
            className={`p-3.5 rounded-xl border ${step.color} group hover:scale-[1.01] transition-all`}
          >
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <div className="p-2 rounded-lg bg-black/40 border border-white/5">
                  {step.icon}
                </div>
                <span className="text-[10px] font-mono font-bold text-gray-400 bg-black/40 px-2 py-0.5 rounded-md">
                  STEP {step.num}
                </span>
              </div>
              <h4 className="text-xs font-bold text-white group-hover:text-[#0070F3] transition-colors">{step.title}</h4>
              <p className="text-[11px] text-gray-300 leading-snug">{step.desc}</p>
            </div>

            <button
              onClick={step.onClick}
              className="w-full mt-2 py-1.5 px-3 rounded-lg bg-white/5 hover:bg-[#0070F3] hover:text-white text-[11px] font-medium text-gray-200 border border-white/10 hover:border-transparent flex items-center justify-between transition-all"
            >
              <span>{step.actionLabel}</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </SpotlightCard>
        ))}
      </div>
    </div>
  );
};
