import React from 'react';
import { X, RotateCcw, ShieldCheck, Cpu, Moon } from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onResetDemoData: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  onResetDemoData
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
      <div className="relative w-full max-w-lg bg-[#050914] border border-blue-500/30 rounded-2xl p-6 sm:p-8 space-y-6 shadow-[0_0_50px_rgba(59,130,246,0.2)]">
        <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
          <h2 className="text-xl font-bold text-white">Settings & Preferences</h2>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-[#080e22] border border-blue-900/30 space-y-2">
            <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono font-bold">
              <Cpu className="w-4 h-4" />
              <span>AI Engine Configuration</span>
            </div>
            <p className="text-xs text-slate-300">
              Model: <strong className="text-white font-mono">Gemini 3.6 Flash</strong> (Server-side proxy active)
            </p>
          </div>

          <div className="p-4 rounded-xl bg-[#080e22] border border-blue-900/30 space-y-2">
            <div className="flex items-center gap-2 text-purple-400 text-xs font-mono font-bold">
              <Moon className="w-4 h-4" />
              <span>Visual Theme</span>
            </div>
            <p className="text-xs text-slate-300">
              Theme: <strong className="text-white">3D Dark Luxury (70-80% Black + Electric Blue Glow)</strong>
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => {
                if (confirm('Reset all schedule data and restore initial demo state?')) {
                  onResetDemoData();
                  onClose();
                }
              }}
              className="w-full py-3 rounded-xl bg-rose-950/60 hover:bg-rose-900/60 border border-rose-500/40 text-rose-300 font-bold text-xs flex items-center justify-center gap-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Reset to Demo Student Data</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
