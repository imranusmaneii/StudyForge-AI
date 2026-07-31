import React, { useState, useEffect, useRef } from 'react';
import { Hero3DCanvas } from '../3d/Hero3DCanvas';
import { Card3D } from '../3d/Card3D';
import confetti from 'canvas-confetti';
import { Play, Pause, RotateCcw, Volume2, VolumeX, Sparkles, CheckCircle2 } from 'lucide-react';
import { AmbientSoundscape } from './AmbientSoundscape';
import { unlockAudio, playCompletionChime } from '../../lib/audioManager';

interface FocusTimerViewProps {
  onLogStudyMinutes: (minutes: number) => void;
}

export const FocusTimerView: React.FC<FocusTimerViewProps> = ({ onLogStudyMinutes }) => {
  const [selectedMinutes, setSelectedMinutes] = useState<number>(25);
  const [timeLeft, setTimeLeft] = useState<number>(25 * 60);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [isCompletedModalOpen, setIsCompletedModalOpen] = useState<boolean>(false);

  const initialTimeRef = useRef<number>(25 * 60);

  useEffect(() => {
    let timer: any;
    if (isRunning && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      playCompletionChime(soundEnabled);
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#3b82f6', '#06b6d4', '#38bdf8']
      });
      const minutesCompleted = Math.round(initialTimeRef.current / 60);
      onLogStudyMinutes(minutesCompleted);
      setIsCompletedModalOpen(true);
    }

    return () => clearInterval(timer);
  }, [isRunning, timeLeft]);

  const handleSelectPreset = (mins: number) => {
    setIsRunning(false);
    setSelectedMinutes(mins);
    setTimeLeft(mins * 60);
    initialTimeRef.current = mins * 60;
  };

  const handleStartPause = async () => {
    if (!isRunning) {
      await unlockAudio();
    }
    setIsRunning(!isRunning);
  };

  const handleReset = () => {
    setIsRunning(false);
    setTimeLeft(selectedMinutes * 60);
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60).toString().padStart(2, '0');
    const s = (secs % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const totalSecs = selectedMinutes * 60;
  const progressPercent = Math.round(((totalSecs - timeLeft) / totalSecs) * 100);

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0a1228] to-cyan-950/40 border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>DEEP FOCUS ENVIRONMENT</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Focus Timer</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Pomodoro focus blocks with glowing ambient 3D visuals and audio feedback.
          </p>
        </div>

        <button
          onClick={() => setSoundEnabled(!soundEnabled)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-950/60 border border-blue-500/30 text-xs text-slate-300 hover:text-white"
        >
          {soundEnabled ? <Volume2 className="w-4 h-4 text-cyan-400" /> : <VolumeX className="w-4 h-4 text-slate-500" />}
          <span>{soundEnabled ? 'Audio On' : 'Audio Muted'}</span>
        </button>
      </div>

      {/* Main Timer Display Block */}
      <Card3D glowColor="blue" className="w-full max-w-2xl mx-auto overflow-hidden p-8 text-center bg-[#040813]">
        <div className="relative flex flex-col items-center justify-center space-y-6">
          {/* Ambient 3D Canvas Background */}
          <div className="absolute inset-0 opacity-50 pointer-events-none">
            <Hero3DCanvas variant="timer" interactive={isRunning} />
          </div>

          <div className="relative z-10 space-y-6 w-full">
            {/* Duration Presets & Custom Input Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <div className="inline-flex items-center gap-1.5 p-1.5 rounded-2xl bg-black/60 border border-blue-900/40">
                {[15, 25, 45, 60, 90].map((mins) => (
                  <button
                    key={mins}
                    onClick={() => handleSelectPreset(mins)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-mono font-bold transition-all ${
                      selectedMinutes === mins
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                        : 'text-slate-400 hover:text-white'
                    }`}
                  >
                    {mins}m
                  </button>
                ))}
              </div>

              {/* Custom Minutes Input */}
              <div className="flex items-center gap-2 px-3 py-1.5 rounded-2xl bg-black/60 border border-blue-900/40">
                <span className="text-[11px] text-slate-400 font-mono font-bold">Custom:</span>
                <input
                  type="number"
                  min="1"
                  max="300"
                  value={selectedMinutes}
                  onChange={(e) => {
                    const val = Math.max(1, Math.min(300, parseInt(e.target.value) || 1));
                    handleSelectPreset(val);
                  }}
                  disabled={isRunning}
                  className="w-14 px-2 py-0.5 rounded-lg bg-blue-950/80 border border-blue-500/30 text-white text-xs font-mono font-bold text-center focus:outline-none focus:border-cyan-400 disabled:opacity-50"
                />
                <span className="text-[11px] text-cyan-400 font-mono font-bold">min</span>
              </div>
            </div>

            {/* Glowing Digital Counter */}
            <div className="relative py-4">
              <span className="text-6xl sm:text-8xl font-black text-white font-mono tracking-tighter drop-shadow-[0_0_35px_rgba(59,130,246,0.7)]">
                {formatTime(timeLeft)}
              </span>
              <p className="text-xs text-cyan-400 font-mono tracking-widest mt-2 uppercase font-bold">
                {isRunning ? 'FOCUS BLOCK IN PROGRESS...' : 'READY TO START'}
              </p>
            </div>

            {/* Controls Row */}
            <div className="flex items-center justify-center gap-4">
              <button
                onClick={handleReset}
                className="p-3.5 rounded-2xl bg-blue-950/40 border border-blue-500/30 text-slate-400 hover:text-white hover:bg-blue-900/40 transition-all"
                title="Reset Timer"
              >
                <RotateCcw className="w-5 h-5" />
              </button>

              <button
                onClick={handleStartPause}
                className={`flex items-center gap-3 px-8 py-4 rounded-2xl text-white font-bold text-base transition-all duration-200 shadow-lg ${
                  isRunning
                    ? 'bg-amber-600 hover:bg-amber-500 shadow-[0_0_25px_rgba(245,158,11,0.5)]'
                    : 'bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:scale-[1.02]'
                }`}
              >
                {isRunning ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white" />}
                <span>{isRunning ? 'Pause Block' : 'Start Focus'}</span>
              </button>
            </div>
          </div>
        </div>
      </Card3D>

      {/* Ambient Sound Generator (40Hz Gamma Waves, Brown Noise, Rain & Thunderstorm, Waves) */}
      <AmbientSoundscape isTimerRunning={isRunning} />

      {/* Completion Celebration Modal */}
      {isCompletedModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md">
          <div className="relative w-full max-w-md bg-[#050914] border border-cyan-500/40 rounded-3xl p-8 text-center space-y-5 shadow-[0_0_50px_rgba(6,182,212,0.3)]">
            <div className="w-16 h-16 mx-auto rounded-full bg-cyan-500/20 border border-cyan-400 flex items-center justify-center text-cyan-400">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <h3 className="text-2xl font-bold text-white">Focus Session Complete!</h3>
            <p className="text-sm text-slate-300">
              Great work. You logged <strong className="text-cyan-400">{selectedMinutes} minutes</strong> of deep focus. Take a short break before your next block.
            </p>

            <button
              onClick={() => setIsCompletedModalOpen(false)}
              className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-md"
            >
              Continue Study Plan
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
