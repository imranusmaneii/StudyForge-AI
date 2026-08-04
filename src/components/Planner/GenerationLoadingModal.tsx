import React, { useEffect, useState } from 'react';
import { Sparkles, CheckCircle2, Loader2, Bot } from 'lucide-react';
import { Hero3DCanvas } from '../3d/Hero3DCanvas';

interface GenerationLoadingModalProps {
  isOpen: boolean;
  isReady?: boolean;
  onComplete?: () => void;
}

export const GenerationLoadingModal: React.FC<GenerationLoadingModalProps> = ({
  isOpen,
  isReady = true,
  onComplete
}) => {
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  const steps = [
    { title: 'Analyzing your schedule...', subtitle: 'Calculating exam dates, difficulties, and target goal constraints.' },
    { title: 'Prioritizing subjects...', subtitle: 'Weighting urgent deadlines and knowledge level gaps.' },
    { title: 'Balancing study sessions...', subtitle: 'Distributing cognitive workload & inserting mindfulness breaks.' },
    { title: 'Building your personalized plan...', subtitle: 'Formatting multi-day time blocks and task descriptions.' },
    { title: 'Your plan is ready.', subtitle: 'Finalizing your intelligent StudyForge AI schedule!' }
  ];

  useEffect(() => {
    if (!isOpen) {
      setCurrentStepIndex(0);
      return;
    }

    const interval = setInterval(() => {
      setCurrentStepIndex((prev) => {
        if (prev < 3) {
          return prev + 1;
        } else if (prev === 3 && isReady) {
          return 4;
        } else if (prev === 4) {
          clearInterval(interval);
          if (onComplete) {
            onComplete();
          }
          return prev;
        }
        return prev;
      });
    }, 600);

    return () => clearInterval(interval);
  }, [isOpen, isReady, onComplete]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl">
      <div className="relative w-full max-w-lg bg-[#040813] border border-blue-500/40 rounded-3xl shadow-[0_0_60px_rgba(59,130,246,0.3)] p-8 text-center space-y-6 overflow-hidden">
        {/* Background 3D canvas snippet */}
        <div className="absolute inset-0 opacity-40 pointer-events-none">
          <Hero3DCanvas variant="ambient" interactive={false} />
        </div>

        <div className="relative z-10 space-y-6">
          <div className="w-16 h-16 mx-auto rounded-2xl bg-gradient-to-tr from-blue-600 via-cyan-500 to-blue-400 p-[1px] shadow-[0_0_30px_rgba(59,130,246,0.6)] animate-pulse">
            <div className="w-full h-full bg-[#040813] rounded-[15px] flex items-center justify-center text-cyan-400">
              <Bot className="w-8 h-8 animate-bounce" />
            </div>
          </div>

          <div>
            <span className="text-xs px-3 py-1 rounded-full bg-blue-500/20 text-cyan-400 font-mono border border-blue-500/30">
              GEMINI 3.6 FLASH REASONING
            </span>
            <h3 className="text-xl font-bold text-white mt-3 min-h-[30px]">
              {steps[currentStepIndex].title}
            </h3>
            <p className="text-xs text-slate-400 mt-1 min-h-[36px]">
              {steps[currentStepIndex].subtitle}
            </p>
          </div>

          {/* Step Progress Checklist */}
          <div className="space-y-2.5 text-left bg-black/50 p-4 rounded-xl border border-blue-900/30">
            {steps.map((step, idx) => {
              const isDone = idx < currentStepIndex;
              const isCurrent = idx === currentStepIndex;
              return (
                <div key={idx} className="flex items-center gap-3 text-xs">
                  {isDone ? (
                    <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0" />
                  ) : isCurrent ? (
                    <Loader2 className="w-4 h-4 text-blue-400 animate-spin shrink-0" />
                  ) : (
                    <div className="w-4 h-4 rounded-full border border-slate-700 shrink-0" />
                  )}
                  <span className={isDone ? 'text-slate-300 line-through' : isCurrent ? 'text-cyan-300 font-bold' : 'text-slate-600'}>
                    {step.title}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Progress bar */}
          <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all duration-500"
              style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
};
