export type DifficultyLevel = 'easy' | 'medium' | 'hard' | 'extreme';
export type PriorityLevel = 'low' | 'medium' | 'high' | 'urgent';
export type SessionType = 'learning' | 'practice' | 'revision' | 'review' | 'break';
export type LearningGoal = 'pass_exam' | 'high_grades' | 'master_subject' | 'upcoming_exam' | 'catch_up';

export interface SubjectTopic {
  id: string;
  name: string;
  completed: boolean;
  notes?: string;
}

export interface Subject {
  id: string;
  name: string;
  color: string;
  iconName?: string;
  difficulty: DifficultyLevel;
  knowledgeLevel: number; // 0-100%
  examDate: string; // YYYY-MM-DD
  priority: PriorityLevel;
  completedTopicsCount: number;
  totalTopicsCount: number;
  topics: SubjectTopic[];
}

export interface StudySession {
  id: string;
  subjectId: string;
  subjectName: string;
  subjectColor: string;
  topic: string;
  durationMinutes: number; // e.g. 25, 45, 60, 90
  startTime?: string; // e.g. "09:00"
  endTime?: string; // e.g. "09:45"
  priority: PriorityLevel;
  type: SessionType;
  completed: boolean;
  notes?: string;
  dayIndex: number; // 0 for today, 1 for tomorrow, etc.
  dateString?: string;
}

export interface DailyPlan {
  dayName: string; // e.g., "Monday", "Day 1"
  dateString: string; // e.g., "2026-07-30"
  totalMinutes: number;
  sessions: StudySession[];
}

export interface StudyPlan {
  id: string;
  createdAt: string;
  updatedAt: string;
  goal: LearningGoal;
  sessionLengthMinutes: number;
  availableHoursPerDay: number;
  studyDays: string[]; // ['Monday', 'Tuesday', ...]
  days: DailyPlan[];
  aiReasoning?: string;
}

export interface ProgressStats {
  todayProgressPercent: number;
  todayStudyMinutes: number;
  todayCompletedTasks: number;
  todayTotalTasks: number;
  totalStudyHours: number;
  totalSessionsCompleted: number;
  currentStreakDays: number;
  weeklyStudyHours: number[]; // 7 elements [Mon..Sun]
  subjectProgress: { subjectName: string; percent: number; color: string }[];
}

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: 'email' | 'google';
  createdAt: string;
}

export type AuthModalMode = 'login' | 'signup' | 'google';

export interface VisualAidPayload {
  type: 'chart' | 'table' | 'diagram' | 'formula' | 'flashcard_set';
  title: string;
  chartType?: 'bar' | 'line' | 'pie' | 'area';
  data?: any[];
  headers?: string[];
  rows?: string[][];
  diagramNodes?: { id: string; label: string; desc?: string }[];
  formulas?: { label: string; formula: string; explanation?: string }[];
  summary?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  isStreaming?: boolean;
  visualAid?: VisualAidPayload;
}

export type ActiveTab = 'landing' | 'dashboard' | 'planner' | 'subjects' | 'tasks' | 'progress' | 'timer' | 'assistant';
