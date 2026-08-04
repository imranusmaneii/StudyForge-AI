export function formatTime12h(timeStr?: string): string {
  if (!timeStr) return '';
  if (/am|pm/i.test(timeStr)) return timeStr.trim();

  const parts = timeStr.split(':');
  if (parts.length < 2) return timeStr;

  let h = parseInt(parts[0], 10);
  const m = parseInt(parts[1], 10);
  if (isNaN(h) || isNaN(m)) return timeStr;

  h = ((h % 24) + 24) % 24;
  const ampm = h >= 12 ? 'PM' : 'AM';
  const h12 = h % 12 === 0 ? 12 : h % 12;
  const mStr = m.toString().padStart(2, '0');

  return `${h12}:${mStr} ${ampm}`;
}

export function calculateEndTime(startTimeStr: string, durationMins: number): string {
  if (!startTimeStr) return '';
  const parts = startTimeStr.split(':');
  let h = parseInt(parts[0], 10) || 9;
  let m = parseInt(parts[1], 10) || 0;

  if (/pm/i.test(startTimeStr) && h < 12) h += 12;
  if (/am/i.test(startTimeStr) && h === 12) h = 0;

  const totalMins = (h * 60 + m + durationMins) % (24 * 60);
  const endH = Math.floor(totalMins / 60);
  const endM = totalMins % 60;

  const endHStr = endH.toString().padStart(2, '0');
  const endMStr = endM.toString().padStart(2, '0');
  return `${endHStr}:${endMStr}`;
}

export function formatTimeRange(startTime?: string, endTime?: string, durationMins?: number): string {
  if (!startTime) return `${durationMins || 45}m`;
  const formattedStart = formatTime12h(startTime);
  if (endTime) {
    const formattedEnd = formatTime12h(endTime);
    return `${formattedStart} – ${formattedEnd}`;
  }
  return formattedStart;
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

  let currentMin = 9 * 60; // default 09:00 AM
  const firstTime = fixedStartTime || sessions[0]?.startTime;
  if (firstTime && firstTime.includes(':')) {
    const [h, m] = firstTime.split(':').map((n) => parseInt(n, 10) || 0);
    currentMin = (h % 24) * 60 + (m % 60);
  }

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

  let targetStartMins = 9 * 60;
  if (newStartTime.includes(':')) {
    const [h, m] = newStartTime.split(':').map((n) => parseInt(n, 10) || 0);
    targetStartMins = (h % 24) * 60 + (m % 60);
  }

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
