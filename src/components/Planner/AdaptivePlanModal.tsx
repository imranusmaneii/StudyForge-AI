import React, { useState } from 'react';
import { Sliders, X, Sparkles, Check, AlertTriangle, RefreshCw } from 'lucide-react';

interface AdaptivePlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdjustPlan: (adjustmentType: string, notes: string) => void;
  isAdjusting: boolean;
}

export const AdaptivePlanModal: React.FC<AdaptivePlanModalProps> = ({
  isOpen,
  onClose,
  onAdjustPlan,
  isAdjusting
}) => {
  const [selectedReason, setSelectedReason] = useState<string>("I missed today's session");
  const [notes, setNotes] = useState('');

  if (!isOpen) return null;

  const reasons = [
    { id: "I missed today's session", label: "I missed today's session", desc: "Intelligently redistribute incomplete sessions to upcoming days" },
    { id: "I have less time today", label: "I have less time today", desc: "Shorten today's duration and push non-urgent topics forward" },
    { id: "I finished early", label: "I finished early", desc: "Pull upcoming priority sessions forward or schedule revision" },
    { id: "My exam date changed", label: "My exam date changed", desc: "Re-rank subject urgency based on updated exam deadlines" },
    { id: "This topic is harder than expected", label: "This topic is harder than expected", desc: "Add extra practice blocks for challenging topics" },
    { id: "I want more revision", label: "I want more revision", desc: "Increase practice problem sets before the exam" }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onAdjustPlan(selectedReason, notes);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-xl bg-[#050914] border border-cyan-500/30 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.25)] p-6 sm:p-8 space-y-6">
        <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 to-blue-600 p-[1px]">
              <div className="w-full h-full bg-[#050914] rounded-[11px] flex items-center justify-center text-cyan-400">
                <Sliders className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Adjust My Study Plan</h2>
              <p className="text-xs text-slate-400">Select what changed and StudyForge AI will re-balance your schedule.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              Select Schedule Change Trigger
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {reasons.map((r) => {
                const isSelected = selectedReason === r.id;
                return (
                  <div
                    key={r.id}
                    onClick={() => setSelectedReason(r.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-950/80 to-cyan-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'bg-[#060a17] border-blue-900/30 hover:border-blue-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{r.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5 leading-tight">{r.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
              Additional Notes (Optional)
            </label>
            <input
              type="text"
              placeholder="e.g. Only have 1.5 hours free today due to project work"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-[#070d1e] border border-blue-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
            />
          </div>

          <button
            type="submit"
            disabled={isAdjusting}
            className="w-full py-3.5 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 text-white font-bold text-sm shadow-[0_0_30px_rgba(6,182,212,0.4)] hover:shadow-[0_0_40px_rgba(56,189,248,0.6)] transition-all flex items-center justify-center gap-2 disabled:opacity-60"
          >
            {isAdjusting ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Re-balancing Schedule with Gemini...</span>
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                <span>Redistribute Remaining Tasks Intelligently</span>
              </>
            )}
          </button>
        </form>
      </div>
    </div>
  );
};
