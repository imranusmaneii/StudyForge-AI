/**
 * Normalizes any time representation (e.g. "9_00", "09_00", "9:00", "0900", "9-00", "9.00", "9:00 AM", "2:00 PM")
 * into standard 24-hour "HH:mm" format.
 */
export function normalizeTo24h(timeStr?: string): string {
  if (!timeStr) return '09:00';
  let cleaned = timeStr.trim();

  // If AM/PM present, track it
  const isPM = /pm/i.test(cleaned);
  const isAM = /am/i.test(cleaned);

  // Replace common delimiters (_, -, .) with :
  cleaned = cleaned.replace(/[_.-]/g, ':').replace(/[^\d:]/g, '');

  const parts = cleaned.split(':');
  let h = parseInt(parts[0], 10);
  let m = parts.length > 1 ? parseInt(parts[1], 10) : 0;

  if (isNaN(h)) {
    // Check if numeric string like "0900" or "900"
    const digitsOnly = cleaned.replace(/\D/g, '');
    if (digitsOnly.length === 3) {
      h = parseInt(digitsOnly.slice(0, 1), 10);
      m = parseInt(digitsOnly.slice(1), 10);
    } else if (digitsOnly.length === 4) {
      h = parseInt(digitsOnly.slice(0, 2), 10);
      m = parseInt(digitsOnly.slice(2), 10);
    } else {
      h = 9;
      m = 0;
    }
  }

  if (isNaN(m)) m = 0;

  if (isPM && h < 12) h += 12;
  if (isAM && h === 12) h = 0;

  h = ((h % 24) + 24) % 24;
  m = ((m % 60) + 60) % 60;

  return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}`;
}

export function formatTime12h(timeStr?: string): string {
  if (!timeStr) return '';

  // Clean any delimiters like "9_00 AM" -> "9:00 AM"
  if (/am|pm/i.test(timeStr)) {
    return timeStr.replace(/[_.-]/g, ':').replace(/\s+/g, ' ').trim();
  }

  const normalized = normalizeTo24h(timeStr);
  const [hStr, mStr] = normalized.split(':');
  let h = parseInt(hStr, 10);
  const m = parseInt(mStr, 10) || 0;

  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;

  return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
}

export function calculateEndTime(startTimeStr: string, durationMins: number): string {
  if (!startTimeStr) return '';
  const normalized = normalizeTo24h(startTimeStr);
  const [hStr, mStr] = normalized.split(':');
  const h = parseInt(hStr, 10) || 9;
  const m = parseInt(mStr, 10) || 0;

  const totalMins = (h * 60 + m + durationMins) % (24 * 60);
  const endH = Math.floor(totalMins / 60);
  const endM = totalMins % 60;

  return `${endH.toString().padStart(2, '0')}:${endM.toString().padStart(2, '0')}`;
}

export function formatTimeRange(startTime?: string, endTime?: string, durationMins?: number): string {
  if (!startTime) return `${durationMins || 45}m`;
  const formattedStart = formatTime12h(startTime);
  if (endTime) {
    const formattedEnd = formatTime12h(endTime);
    return `${formattedStart} – ${formattedEnd}`;
  }
  const calculatedEnd = calculateEndTime(startTime, durationMins || 45);
  return `${formattedStart} – ${formatTime12h(calculatedEnd)}`;
}

export interface SessionWithTime {
  id: string;
  startTime?: string;
  endTime?: string;
  durationMinutes: number;
  [key: string]: any;
}

export function resequenceDaySessions<T extends SessionWithTime>(
  sessions: T[],
  fixedStartTime?: string
): T[] {
  if (!sessions || sessions.length === 0) return [];

  const rawFirst = fixedStartTime || sessions[0]?.startTime || '09:00';
  const normalizedFirst = normalizeTo24h(rawFirst);
  const [h, m] = normalizedFirst.split(':').map((n) => parseInt(n, 10) || 0);
  let currentMin = (h % 24) * 60 + (m % 60);

  return sessions.map((session) => {
    const duration = session.durationMinutes || 45;
    const startH = (Math.floor(currentMin / 60) % 24).toString().padStart(2, '0');
    const startM = (currentMin % 60).toString().padStart(2, '0');

    currentMin = (currentMin + duration) % (24 * 60);

    const endH = (Math.floor(currentMin / 60) % 24).toString().padStart(2, '0');
    const endM = (currentMin % 60).toString().padStart(2, '0');

    return {
      ...session,
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${endM}`,
      durationMinutes: duration
    };
  });
}

export function updateSessionTimeAndResequence<T extends SessionWithTime>(
  sessions: T[],
  targetSessionId: string,
  newStartTime: string,
  newDurationMins?: number
): T[] {
  const targetIndex = sessions.findIndex((s) => s.id === targetSessionId);
  if (targetIndex === -1) return sessions;

  const targetSession = sessions[targetIndex];
  const updatedDuration = newDurationMins !== undefined ? newDurationMins : targetSession.durationMinutes;

  const normalizedTarget = normalizeTo24h(newStartTime);
  const [th, tm] = normalizedTarget.split(':').map((n) => parseInt(n, 10) || 0);
  const targetStartMins = (th % 24) * 60 + (tm % 60);

  const result: T[] = [];

  // Keep prior sessions unchanged
  for (let i = 0; i < targetIndex; i++) {
    result.push({ ...sessions[i] });
  }

  // Continuously sequence target session and all subsequent sessions
  let currentMin = targetStartMins;
  for (let i = targetIndex; i < sessions.length; i++) {
    const s = sessions[i];
    const dur = i === targetIndex ? updatedDuration : (s.durationMinutes || 45);

    const startH = (Math.floor(currentMin / 60) % 24).toString().padStart(2, '0');
    const startM = (currentMin % 60).toString().padStart(2, '0');

    currentMin = (currentMin + dur) % (24 * 60);

    const endH = (Math.floor(currentMin / 60) % 24).toString().padStart(2, '0');
    const endM = (currentMin % 60).toString().padStart(2, '0');

    result.push({
      ...s,
      startTime: `${startH}:${startM}`,
      endTime: `${endH}:${endM}`,
      durationMinutes: dur
    });
  }

  return result;
}
