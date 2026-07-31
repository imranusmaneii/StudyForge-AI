import React, { useState, useEffect, useRef } from 'react';
import { getAudioContext, unlockAudio } from '../../lib/audioManager';
import {
  Volume2,
  Sparkles,
  Play,
  Pause,
  Brain,
  CloudRain,
  Waves,
  Zap,
  Flame,
  Wind,
  Bell,
  Radio,
  Sparkle,
  Disc
} from 'lucide-react';

export type AmbientSoundType =
  | 'none'
  | 'gamma'
  | 'brown'
  | 'pink'
  | 'rain'
  | 'space'
  | 'fire'
  | 'waves'
  | 'wind'
  | 'bell'
  | 'lofi';

interface AmbientSoundscapeProps {
  isTimerRunning?: boolean;
}

export const AmbientSoundscape: React.FC<AmbientSoundscapeProps> = ({ isTimerRunning = false }) => {
  const [activeSound, setActiveSound] = useState<AmbientSoundType>('none');
  const [volume, setVolume] = useState<number>(0.5);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  const audioCtxRef = useRef<AudioContext | null>(null);
  const activeNodesRef = useRef<any[]>([]);

  // Cleanup audio nodes on unmount or mode change
  const stopAllAudio = () => {
    try {
      activeNodesRef.current.forEach((node) => {
        if (node.stop) node.stop();
        if (node.disconnect) node.disconnect();
      });
      activeNodesRef.current = [];
      if (audioCtxRef.current && audioCtxRef.current.state !== 'closed') {
        audioCtxRef.current.close();
        audioCtxRef.current = null;
      }
    } catch (e) {
      console.warn('Error stopping audio nodes:', e);
    }
  };

  useEffect(() => {
    return () => {
      stopAllAudio();
    };
  }, []);

  // Update volume live
  useEffect(() => {
    if (activeNodesRef.current.length > 0) {
      activeNodesRef.current.forEach((n) => {
        if (n.gainNode && audioCtxRef.current) {
          n.gainNode.gain.setValueAtTime(volume * (n.relativeVol || 1), audioCtxRef.current.currentTime);
        }
      });
    }
  }, [volume]);

  const startSound = async (soundType: AmbientSoundType) => {
    stopAllAudio();

    if (soundType === 'none') {
      setIsPlaying(false);
      setActiveSound('none');
      return;
    }

    try {
      await unlockAudio();
      const ctx = await getAudioContext();
      audioCtxRef.current = ctx;

      const masterGain = ctx.createGain();
      masterGain.gain.setValueAtTime(volume, ctx.currentTime);
      masterGain.connect(ctx.destination);

      const sampleRate = ctx.sampleRate;
      const bufferSize = 2 * sampleRate;

      // Helper for Pink Noise
      const createPinkNoiseBuffer = () => {
        const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
        const out = buffer.getChannelData(0);
        let b0 = 0, b1 = 0, b2 = 0, b3 = 0, b4 = 0, b5 = 0, b6 = 0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          b0 = 0.99886 * b0 + white * 0.0555179;
          b1 = 0.99332 * b1 + white * 0.0750759;
          b2 = 0.96900 * b2 + white * 0.1538520;
          b3 = 0.86650 * b3 + white * 0.3104856;
          b4 = 0.55000 * b4 + white * 0.5329522;
          b5 = -0.7616 * b5 - white * 0.0168980;
          out[i] = b0 + b1 + b2 + b3 + b4 + b5 + b6 + white * 0.5362;
          out[i] *= 0.11;
          b6 = white * 0.115926;
        }
        return buffer;
      };

      if (soundType === 'gamma') {
        // 1. 40Hz Gamma Binaural Beats (200Hz L, 240Hz R)
        const merger = ctx.createChannelMerger(2);

        const oscL = ctx.createOscillator();
        const gainL = ctx.createGain();
        oscL.type = 'sine';
        oscL.frequency.setValueAtTime(200, ctx.currentTime);
        gainL.gain.setValueAtTime(0.25, ctx.currentTime);
        oscL.connect(gainL);
        gainL.connect(merger, 0, 0);

        const oscR = ctx.createOscillator();
        const gainR = ctx.createGain();
        oscR.type = 'sine';
        oscR.frequency.setValueAtTime(240, ctx.currentTime);
        gainR.gain.setValueAtTime(0.25, ctx.currentTime);
        oscR.connect(gainR);
        gainR.connect(merger, 0, 1);

        merger.connect(masterGain);
        oscL.start();
        oscR.start();

        activeNodesRef.current.push({
          stop: () => { oscL.stop(); oscR.stop(); },
          gainNode: masterGain,
          relativeVol: 1
        });
      } else if (soundType === 'brown') {
        // 2. Deep Brown Noise
        const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
        const out = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          out[i] = (lastOut + 0.02 * white) / 1.02;
          lastOut = out[i];
          out[i] *= 3.5;
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(320, ctx.currentTime);

        source.connect(filter);
        filter.connect(masterGain);
        source.start();

        activeNodesRef.current.push({ stop: () => source.stop(), gainNode: masterGain, relativeVol: 1 });
      } else if (soundType === 'pink') {
        // 3. Soft Pink Noise
        const source = ctx.createBufferSource();
        source.buffer = createPinkNoiseBuffer();
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, ctx.currentTime);

        source.connect(filter);
        filter.connect(masterGain);
        source.start();

        activeNodesRef.current.push({ stop: () => source.stop(), gainNode: masterGain, relativeVol: 1 });
      } else if (soundType === 'rain') {
        // 4. Gentle Window Rain (Lowpass pink noise + soft window drops, non-irritating)
        const rainSource = ctx.createBufferSource();
        rainSource.buffer = createPinkNoiseBuffer();
        rainSource.loop = true;

        const rainFilter = ctx.createBiquadFilter();
        rainFilter.type = 'lowpass';
        rainFilter.frequency.setValueAtTime(450, ctx.currentTime); // Soft lowpass cutoff

        const rainGain = ctx.createGain();
        rainGain.gain.setValueAtTime(0.4, ctx.currentTime);

        rainSource.connect(rainFilter);
        rainFilter.connect(rainGain);
        rainGain.connect(masterGain);
        rainSource.start();

        // Soft sub-bass warmth
        const warmFilter = ctx.createBiquadFilter();
        warmFilter.type = 'lowpass';
        warmFilter.frequency.setValueAtTime(180, ctx.currentTime);
        const warmGain = ctx.createGain();
        warmGain.gain.setValueAtTime(0.2, ctx.currentTime);

        rainSource.connect(warmFilter);
        warmFilter.connect(warmGain);
        warmGain.connect(masterGain);

        activeNodesRef.current.push({ stop: () => rainSource.stop(), gainNode: masterGain, relativeVol: 1 });
      } else if (soundType === 'space') {
        // 5. Cosmic Deep Space Drone (Warm sub drone with harmonic oscillation)
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(54, ctx.currentTime);
        gain1.gain.setValueAtTime(0.35, ctx.currentTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(108, ctx.currentTime);
        gain2.gain.setValueAtTime(0.15, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.08, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.08, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(gain1.gain);

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(masterGain);
        gain2.connect(masterGain);

        osc1.start();
        osc2.start();
        lfo.start();

        activeNodesRef.current.push({ stop: () => { osc1.stop(); osc2.stop(); lfo.stop(); }, gainNode: masterGain, relativeVol: 1 });
      } else if (soundType === 'fire') {
        // 6. Cozy Fireplace Crackle (Low rumble + random impulse micro-crackles)
        const buffer = ctx.createBuffer(1, bufferSize, sampleRate);
        const out = buffer.getChannelData(0);
        let lastOut = 0.0;
        for (let i = 0; i < bufferSize; i++) {
          const white = Math.random() * 2 - 1;
          out[i] = (lastOut + 0.015 * white) / 1.015;
          lastOut = out[i];

          if (Math.random() < 0.0005) {
            out[i] += (Math.random() > 0.5 ? 1 : -1) * (0.3 + Math.random() * 0.4);
          }
        }

        const source = ctx.createBufferSource();
        source.buffer = buffer;
        source.loop = true;

        const filter = ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(500, ctx.currentTime);

        source.connect(filter);
        filter.connect(masterGain);
        source.start();

        activeNodesRef.current.push({ stop: () => source.stop(), gainNode: masterGain, relativeVol: 1 });
      } else if (soundType === 'waves') {
        // 7. Ocean Swells & Waves
        const waveSource = ctx.createBufferSource();
        waveSource.buffer = createPinkNoiseBuffer();
        waveSource.loop = true;

        const waveFilter = ctx.createBiquadFilter();
        waveFilter.type = 'lowpass';
        waveFilter.frequency.setValueAtTime(400, ctx.currentTime);

        const waveGain = ctx.createGain();
        waveGain.gain.setValueAtTime(0.2, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.1, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(0.18, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(waveGain.gain);

        waveSource.connect(waveFilter);
        waveFilter.connect(waveGain);
        waveGain.connect(masterGain);

        waveSource.start();
        lfo.start();

        activeNodesRef.current.push({ stop: () => { waveSource.stop(); lfo.stop(); }, gainNode: masterGain, relativeVol: 1 });
      } else if (soundType === 'wind') {
        // 8. Soft Meadow Breeze
        const windSource = ctx.createBufferSource();
        windSource.buffer = createPinkNoiseBuffer();
        windSource.loop = true;

        const windFilter = ctx.createBiquadFilter();
        windFilter.type = 'bandpass';
        windFilter.frequency.setValueAtTime(300, ctx.currentTime);
        windFilter.Q.setValueAtTime(0.8, ctx.currentTime);

        const lfo = ctx.createOscillator();
        lfo.type = 'sine';
        lfo.frequency.setValueAtTime(0.15, ctx.currentTime);
        const lfoGain = ctx.createGain();
        lfoGain.gain.setValueAtTime(150, ctx.currentTime);

        lfo.connect(lfoGain);
        lfoGain.connect(windFilter.frequency);

        windSource.connect(windFilter);
        windFilter.connect(masterGain);

        windSource.start();
        lfo.start();

        activeNodesRef.current.push({ stop: () => { windSource.stop(); lfo.stop(); }, gainNode: masterGain, relativeVol: 1 });
      } else if (soundType === 'bell') {
        // 9. 432Hz Zen Singing Bowl
        const osc1 = ctx.createOscillator();
        const osc2 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        const gain2 = ctx.createGain();

        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(432, ctx.currentTime);
        gain1.gain.setValueAtTime(0.15, ctx.currentTime);

        osc2.type = 'sine';
        osc2.frequency.setValueAtTime(864, ctx.currentTime);
        gain2.gain.setValueAtTime(0.05, ctx.currentTime);

        osc1.connect(gain1);
        osc2.connect(gain2);
        gain1.connect(masterGain);
        gain2.connect(masterGain);

        osc1.start();
        osc2.start();

        activeNodesRef.current.push({ stop: () => { osc1.stop(); osc2.stop(); }, gainNode: masterGain, relativeVol: 1 });
      } else if (soundType === 'lofi') {
        // 10. Lo-Fi Tape Warmth
        const lofiSource = ctx.createBufferSource();
        lofiSource.buffer = createPinkNoiseBuffer();
        lofiSource.loop = true;

        const lofiFilter = ctx.createBiquadFilter();
        lofiFilter.type = 'lowpass';
        lofiFilter.frequency.setValueAtTime(650, ctx.currentTime);

        const subOsc = ctx.createOscillator();
        subOsc.type = 'sine';
        subOsc.frequency.setValueAtTime(60, ctx.currentTime);
        const subGain = ctx.createGain();
        subGain.gain.setValueAtTime(0.12, ctx.currentTime);

        subOsc.connect(subGain);
        subGain.connect(masterGain);

        lofiSource.connect(lofiFilter);
        lofiFilter.connect(masterGain);

        lofiSource.start();
        subOsc.start();

        activeNodesRef.current.push({ stop: () => { lofiSource.stop(); subOsc.stop(); }, gainNode: masterGain, relativeVol: 1 });
      }

      setActiveSound(soundType);
      setIsPlaying(true);
    } catch (e) {
      console.error('Failed to initialize Web Audio API ambient sound:', e);
    }
  };

  const soundProfiles: {
    id: AmbientSoundType;
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    color: string;
  }[] = [
    {
      id: 'gamma',
      title: '40Hz Gamma Focus',
      subtitle: 'Binaural beats for high focus & cognitive processing',
      icon: <Brain className="w-4 h-4 text-cyan-400" />,
      color: 'from-cyan-500/20 to-blue-500/20 border-cyan-500/40 text-cyan-300'
    },
    {
      id: 'brown',
      title: 'Deep Brown Noise',
      subtitle: 'Warm acoustic low rumble for blocking out chatter',
      icon: <Zap className="w-4 h-4 text-amber-400" />,
      color: 'from-amber-500/20 to-orange-500/20 border-amber-500/40 text-amber-300'
    },
    {
      id: 'pink',
      title: 'Soft Pink Noise',
      subtitle: 'Balanced linear spectrum for deep study flow',
      icon: <Radio className="w-4 h-4 text-pink-400" />,
      color: 'from-pink-500/20 to-rose-500/20 border-pink-500/40 text-pink-300'
    },
    {
      id: 'rain',
      title: 'Gentle Window Rain',
      subtitle: 'Soft, peaceful rainfall tapping on window pane',
      icon: <CloudRain className="w-4 h-4 text-blue-400" />,
      color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/40 text-blue-300'
    },
    {
      id: 'space',
      title: 'Cosmic Deep Space',
      subtitle: 'Ethereal sub-bass sine drone for quiet atmosphere',
      icon: <Sparkle className="w-4 h-4 text-purple-400" />,
      color: 'from-purple-500/20 to-violet-500/20 border-purple-500/40 text-purple-300'
    },
    {
      id: 'fire',
      title: 'Cozy Fireplace',
      subtitle: 'Warm hearth acoustics with micro crackling sparks',
      icon: <Flame className="w-4 h-4 text-orange-400" />,
      color: 'from-orange-500/20 to-red-500/20 border-orange-500/40 text-orange-300'
    },
    {
      id: 'waves',
      title: 'Ocean Swells',
      subtitle: 'Rhythmic relaxation waves for calm stress-free study',
      icon: <Waves className="w-4 h-4 text-teal-400" />,
      color: 'from-teal-500/20 to-emerald-500/20 border-teal-500/40 text-teal-300'
    },
    {
      id: 'wind',
      title: 'Meadow Breeze',
      subtitle: 'Gentle fluctuating wind resonance across fields',
      icon: <Wind className="w-4 h-4 text-sky-400" />,
      color: 'from-sky-500/20 to-cyan-500/20 border-sky-500/40 text-sky-300'
    },
    {
      id: 'bell',
      title: '432Hz Zen Bowl',
      subtitle: 'Resonant harmonic acoustic drone for meditation',
      icon: <Bell className="w-4 h-4 text-emerald-400" />,
      color: 'from-emerald-500/20 to-teal-500/20 border-emerald-500/40 text-emerald-300'
    },
    {
      id: 'lofi',
      title: 'Lo-Fi Tape Warmth',
      subtitle: 'Analog tape warmth with gentle sub-bass hum',
      icon: <Disc className="w-4 h-4 text-indigo-400" />,
      color: 'from-indigo-500/20 to-purple-500/20 border-indigo-500/40 text-indigo-300'
    }
  ];

  return (
    <div className="p-5 sm:p-6 rounded-2xl bg-[#080B12] border border-white/10 space-y-4">
      {/* Soundscape Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-white/5 pb-3">
        <div>
          <div className="flex items-center gap-2 text-[#0070F3] text-xs font-mono font-bold">
            <Sparkles className="w-3.5 h-3.5" />
            <span>NEURO-ACOUSTIC SOUNDSCAPE SUITE (10 SOUNDS)</span>
          </div>
          <h3 className="text-base font-bold text-white mt-0.5">Peaceful Study Ambiance</h3>
          <p className="text-xs text-gray-400">
            Real-time Web Audio soundscapes crafted specifically to block out noise and enhance focus.
          </p>
        </div>

        {/* Master Mute / Master Volume slider */}
        {isPlaying && (
          <div className="flex items-center gap-3 bg-[#0F1420] px-3.5 py-1.5 rounded-xl border border-white/10 shrink-0">
            <Volume2 className="w-4 h-4 text-[#0070F3]" />
            <input
              type="range"
              min="0"
              max="1"
              step="0.05"
              value={volume}
              onChange={(e) => setVolume(parseFloat(e.target.value))}
              className="w-24 accent-[#0070F3] cursor-pointer"
            />
            <button
              onClick={() => startSound('none')}
              className="text-xs text-red-400 hover:text-red-300 font-mono underline ml-1"
            >
              Stop Sound
            </button>
          </div>
        )}
      </div>

      {/* Sound Selection Grid (10 Options) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3">
        {soundProfiles.map((sound) => {
          const isActive = activeSound === sound.id;
          return (
            <button
              key={sound.id}
              onClick={() => startSound(isActive ? 'none' : sound.id)}
              className={`p-3.5 rounded-xl text-left border transition-all flex flex-col justify-between relative overflow-hidden group min-h-[110px] ${
                isActive
                  ? `bg-gradient-to-r ${sound.color} shadow-[0_0_20px_rgba(0,112,243,0.25)] border-l-4`
                  : 'bg-[#0F1420]/70 border-white/5 hover:border-white/20 hover:bg-[#0F1420]'
              }`}
            >
              <div className="flex items-center justify-between w-full mb-2">
                <div
                  className={`p-2 rounded-lg ${
                    isActive ? 'bg-black/40 text-white' : 'bg-white/5 text-gray-400 group-hover:text-white'
                  }`}
                >
                  {sound.icon}
                </div>
                {isActive ? (
                  <Pause className="w-4 h-4 text-white" />
                ) : (
                  <Play className="w-4 h-4 text-gray-400 group-hover:text-white" />
                )}
              </div>

              <div>
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-white truncate">{sound.title}</h4>
                  {isActive && <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse shrink-0" />}
                </div>
                <p className="text-[10px] text-gray-400 mt-0.5 leading-tight line-clamp-2">
                  {sound.subtitle}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};

