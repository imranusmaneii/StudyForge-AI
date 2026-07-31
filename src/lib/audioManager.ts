// Web Audio API helper with full mobile (iOS Safari & Android Chrome) autoplay unlock & context management

let sharedAudioCtx: AudioContext | null = null;
let isUnlocked = false;

/**
 * Returns a active, resumed AudioContext.
 * Automatically handles webkit prefixing and mobile suspended state resumption.
 */
export async function getAudioContext(): Promise<AudioContext> {
  const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
  if (!sharedAudioCtx || sharedAudioCtx.state === 'closed') {
    sharedAudioCtx = new AudioCtx();
  }

  if (sharedAudioCtx.state === 'suspended') {
    try {
      await sharedAudioCtx.resume();
    } catch (e) {
      console.warn('Could not resume AudioContext:', e);
    }
  }

  return sharedAudioCtx;
}

/**
 * Unlocks mobile iOS/Android Web Audio API hardware output by playing a 1-frame silent buffer inside a user interaction callback.
 */
export async function unlockAudio(): Promise<boolean> {
  try {
    const ctx = await getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    // Play 1-sample silent buffer to force mobile hardware audio session initialization
    const buffer = ctx.createBuffer(1, 1, 22050);
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    source.connect(ctx.destination);
    source.start(0);

    isUnlocked = ctx.state === 'running';
    return isUnlocked;
  } catch (e) {
    console.warn('Audio unlock warning:', e);
    return false;
  }
}

// Auto-register one-time touch listener on mobile devices to silently unlock audio on first interaction
if (typeof window !== 'undefined') {
  const handleFirstInteraction = () => {
    unlockAudio();
    window.removeEventListener('touchstart', handleFirstInteraction, true);
    window.removeEventListener('touchend', handleFirstInteraction, true);
    window.removeEventListener('click', handleFirstInteraction, true);
  };

  window.addEventListener('touchstart', handleFirstInteraction, { capture: true, once: true });
  window.addEventListener('touchend', handleFirstInteraction, { capture: true, once: true });
  window.addEventListener('click', handleFirstInteraction, { capture: true, once: true });
}

/**
 * Plays a pleasant 4-note completion chime using Web Audio API synthesis.
 * Safe for background timer completion on mobile devices.
 */
export async function playCompletionChime(soundEnabled = true): Promise<void> {
  if (!soundEnabled) return;

  try {
    const ctx = await getAudioContext();
    if (ctx.state === 'suspended') {
      await ctx.resume();
    }

    const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6 notes
    const now = ctx.currentTime;

    notes.forEach((freq, idx) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now + idx * 0.15);
      
      gain.gain.setValueAtTime(0.3, now + idx * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, now + idx * 0.15 + 0.8);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now + idx * 0.15);
      osc.stop(now + idx * 0.15 + 0.85);
    });
  } catch (e) {
    console.warn('Completion chime prevented or failed:', e);
  }
}
