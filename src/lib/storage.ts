import { Subject, StudyPlan, ProgressStats, ChatMessage, User } from '../types';
import { INITIAL_SUBJECTS, INITIAL_STUDY_PLAN, INITIAL_PROGRESS, INITIAL_CHAT_MESSAGES } from '../data/demoData';

const USER_SESSION_KEY = 'studyforge_current_user_v1';

export const EMPTY_SUBJECTS: Subject[] = [];

export const EMPTY_STUDY_PLAN: StudyPlan = {
  id: 'plan-empty',
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  goal: 'high_grades',
  sessionLengthMinutes: 45,
  availableHoursPerDay: 4,
  studyDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
  days: [],
  aiReasoning: 'Create your first subject or run the AI Planner to generate your multi-day study schedule.'
};

export const EMPTY_PROGRESS: ProgressStats = {
  todayProgressPercent: 0,
  todayStudyMinutes: 0,
  todayCompletedTasks: 0,
  todayTotalTasks: 0,
  totalStudyHours: 0,
  totalSessionsCompleted: 0,
  currentStreakDays: 0,
  weeklyStudyHours: [0, 0, 0, 0, 0, 0, 0],
  subjectProgress: []
};

export function loadCurrentUser(): User | null {
  try {
    const raw = localStorage.getItem(USER_SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse current user session:', e);
  }
  return null;
}

export function saveCurrentUser(user: User | null): void {
  try {
    if (user) {
      localStorage.setItem(USER_SESSION_KEY, JSON.stringify(user));
    } else {
      localStorage.removeItem(USER_SESSION_KEY);
    }
  } catch (e) {
    console.error('Failed to save current user session:', e);
  }
}

function getKey(base: string, userId?: string): string {
  return userId ? `studyforge_${base}_${userId}` : `studyforge_${base}_guest`;
}

export function loadSubjects(userId?: string): Subject[] {
  try {
    const raw = localStorage.getItem(getKey('subjects', userId));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved subjects:', e);
  }
  return EMPTY_SUBJECTS;
}

export function saveSubjects(subjects: Subject[], userId?: string): void {
  try {
    localStorage.setItem(getKey('subjects', userId), JSON.stringify(subjects));
  } catch (e) {
    console.error('Failed to save subjects:', e);
  }
}

export function loadStudyPlan(userId?: string): StudyPlan {
  try {
    const raw = localStorage.getItem(getKey('plan', userId));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved study plan:', e);
  }
  return EMPTY_STUDY_PLAN;
}

export function saveStudyPlan(plan: StudyPlan, userId?: string): void {
  try {
    localStorage.setItem(getKey('plan', userId), JSON.stringify(plan));
  } catch (e) {
    console.error('Failed to save study plan:', e);
  }
}

export function loadProgress(userId?: string): ProgressStats {
  try {
    const raw = localStorage.getItem(getKey('progress', userId));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved progress:', e);
  }
  return EMPTY_PROGRESS;
}

export function saveProgress(progress: ProgressStats, userId?: string): void {
  try {
    localStorage.setItem(getKey('progress', userId), JSON.stringify(progress));
  } catch (e) {
    console.error('Failed to save progress:', e);
  }
}

export function loadChatMessages(userId?: string): ChatMessage[] {
  try {
    const raw = localStorage.getItem(getKey('chat', userId));
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.warn('Failed to parse saved chat messages:', e);
  }
  return userId ? [
    {
      id: `welcome-${userId}`,
      sender: 'assistant',
      text: "Hello! I am StudyForge AI, your universal academic tutor. Ask me anything about Law, Biology, Maths, Physics, CS, or request charts and data sets!",
      timestamp: 'Just now'
    }
  ] : INITIAL_CHAT_MESSAGES;
}

export function saveChatMessages(messages: ChatMessage[], userId?: string): void {
  try {
    localStorage.setItem(getKey('chat', userId), JSON.stringify(messages));
  } catch (e) {
    console.error('Failed to save chat messages:', e);
  }
}

export function resetToDemoData(userId?: string): { subjects: Subject[]; plan: StudyPlan; progress: ProgressStats; chat: ChatMessage[] } {
  saveSubjects(INITIAL_SUBJECTS, userId);
  saveStudyPlan(INITIAL_STUDY_PLAN, userId);
  saveProgress(INITIAL_PROGRESS, userId);
  saveChatMessages(INITIAL_CHAT_MESSAGES, userId);
  return {
    subjects: INITIAL_SUBJECTS,
    plan: INITIAL_STUDY_PLAN,
    progress: INITIAL_PROGRESS,
    chat: INITIAL_CHAT_MESSAGES
  };
}
