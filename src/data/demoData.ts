import { Subject, StudyPlan, ProgressStats, ChatMessage } from '../types';

export const INITIAL_SUBJECTS: Subject[] = [
  {
    id: 'subj-math',
    name: 'Mathematics',
    color: '#3b82f6', // Bright Blue
    difficulty: 'hard',
    knowledgeLevel: 65,
    examDate: '2026-08-11', // 12 days away
    priority: 'urgent',
    completedTopicsCount: 18,
    totalTopicsCount: 24,
    topics: [
      { id: 't-m1', name: 'Linear Algebra & Matrices', completed: true },
      { id: 't-m2', name: 'Eigenvalues & Eigenvectors', completed: true },
      { id: 't-m3', name: 'Multivariable Calculus', completed: true },
      { id: 't-m4', name: 'Partial Derivatives', completed: true },
      { id: 't-m5', name: 'Differential Equations', completed: false, notes: 'Need focus on second-order homogenous equations' },
      { id: 't-m6', name: 'Fourier Series & Transforms', completed: false, notes: 'Review complex form of Fourier series' },
    ]
  },
  {
    id: 'subj-prog',
    name: 'Programming',
    color: '#06b6d4', // Cyan
    difficulty: 'medium',
    knowledgeLevel: 85,
    examDate: '2026-08-18', // 19 days away
    priority: 'high',
    completedTopicsCount: 21,
    totalTopicsCount: 25,
    topics: [
      { id: 't-p1', name: 'Arrays & Dynamic Strings', completed: true },
      { id: 't-p2', name: 'Trees & Graph Traversal (DFS/BFS)', completed: true },
      { id: 't-p3', name: 'Dynamic Programming & Memoization', completed: false, notes: 'Practice 0/1 Knapsack problem variations' },
      { id: 't-p4', name: 'System Architecture & Concurrency', completed: false },
    ]
  },
  {
    id: 'subj-phys',
    name: 'Physics',
    color: '#8b5cf6', // Violet
    difficulty: 'hard',
    knowledgeLevel: 58,
    examDate: '2026-08-14', // 15 days away
    priority: 'high',
    completedTopicsCount: 12,
    totalTopicsCount: 20,
    topics: [
      { id: 't-ph1', name: 'Classical Mechanics & Dynamics', completed: true },
      { id: 't-ph2', name: 'Electromagnetism & Gauss Law', completed: true },
      { id: 't-ph3', name: 'Quantum Harmonic Oscillators', completed: false, notes: 'Derive wavefunctions for energy levels' },
      { id: 't-ph4', name: 'Thermodynamics & Entropy', completed: false },
    ]
  },
  {
    id: 'subj-ml',
    name: 'Machine Learning',
    color: '#38bdf8', // Sky Blue
    difficulty: 'extreme',
    knowledgeLevel: 70,
    examDate: '2026-08-22', // 23 days away
    priority: 'medium',
    completedTopicsCount: 14,
    totalTopicsCount: 20,
    topics: [
      { id: 't-ml1', name: 'Gradient Descent & Backpropagation', completed: true },
      { id: 't-ml2', name: 'Convolutional Neural Nets (CNNs)', completed: true },
      { id: 't-ml3', name: 'Transformer Architectures & Self-Attention', completed: false, notes: 'Study Query-Key-Value projection matrices' },
      { id: 't-ml4', name: 'Reinforcement Learning (Q-Learning)', completed: false },
    ]
  }
];

export const INITIAL_STUDY_PLAN: StudyPlan = {
  id: 'demo-plan-1',
  createdAt: '2026-07-30T08:00:00Z',
  updatedAt: '2026-07-30T08:00:00Z',
  goal: 'high_grades',
  sessionLengthMinutes: 45,
  availableHoursPerDay: 4,
  studyDays: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
  days: [
    {
      dayName: 'Today (Thursday)',
      dateString: '2026-07-30',
      totalMinutes: 205,
      sessions: [
        {
          id: 'sess-1',
          subjectId: 'subj-math',
          subjectName: 'Mathematics',
          subjectColor: '#3b82f6',
          topic: 'Differential Equations (Homogeneous)',
          durationMinutes: 45,
          startTime: '09:00',
          endTime: '09:45',
          priority: 'urgent',
          type: 'learning',
          completed: true,
          dayIndex: 0
        },
        {
          id: 'sess-break-1',
          subjectId: 'break',
          subjectName: 'Mindfulness Break',
          subjectColor: '#64748b',
          topic: 'Hydrate & Rest Eyes',
          durationMinutes: 15,
          startTime: '09:45',
          endTime: '10:00',
          priority: 'low',
          type: 'break',
          completed: true,
          dayIndex: 0
        },
        {
          id: 'sess-2',
          subjectId: 'subj-prog',
          subjectName: 'Programming',
          subjectColor: '#06b6d4',
          topic: 'Dynamic Programming (Knapsack)',
          durationMinutes: 45,
          startTime: '10:00',
          endTime: '10:45',
          priority: 'high',
          type: 'practice',
          completed: true,
          dayIndex: 0
        },
        {
          id: 'sess-3',
          subjectId: 'subj-phys',
          subjectName: 'Physics',
          subjectColor: '#8b5cf6',
          topic: 'Quantum Harmonic Oscillators',
          durationMinutes: 45,
          startTime: '10:45',
          endTime: '11:30',
          priority: 'high',
          type: 'learning',
          completed: true,
          dayIndex: 0
        },
        {
          id: 'sess-4',
          subjectId: 'subj-ml',
          subjectName: 'Machine Learning',
          subjectColor: '#38bdf8',
          topic: 'Transformer Self-Attention',
          durationMinutes: 45,
          startTime: '11:30',
          endTime: '12:15',
          priority: 'medium',
          type: 'revision',
          completed: false,
          dayIndex: 0
        },
        {
          id: 'sess-5',
          subjectId: 'subj-math',
          subjectName: 'Mathematics',
          subjectColor: '#3b82f6',
          topic: 'Fourier Series Complex Notation',
          durationMinutes: 45,
          startTime: '12:15',
          endTime: '13:00',
          priority: 'urgent',
          type: 'practice',
          completed: false,
          dayIndex: 0
        }
      ]
    },
    {
      dayName: 'Tomorrow (Friday)',
      dateString: '2026-07-31',
      totalMinutes: 180,
      sessions: [
        {
          id: 'sess-f1',
          subjectId: 'subj-math',
          subjectName: 'Mathematics',
          subjectColor: '#3b82f6',
          topic: 'Exam Mock Problem Set 1',
          durationMinutes: 60,
          startTime: '09:00',
          endTime: '10:00',
          priority: 'urgent',
          type: 'practice',
          completed: false,
          dayIndex: 1
        },
        {
          id: 'sess-f2',
          subjectId: 'subj-phys',
          subjectName: 'Physics',
          subjectColor: '#8b5cf6',
          topic: 'Electromagnetism Revision',
          durationMinutes: 45,
          startTime: '10:15',
          endTime: '11:00',
          priority: 'high',
          type: 'revision',
          completed: false,
          dayIndex: 1
        },
        {
          id: 'sess-f3',
          subjectId: 'subj-prog',
          subjectName: 'Programming',
          subjectColor: '#06b6d4',
          topic: 'Graph Algorithms Review',
          durationMinutes: 45,
          startTime: '13:00',
          endTime: '13:45',
          priority: 'medium',
          type: 'review',
          completed: false,
          dayIndex: 1
        },
        {
          id: 'sess-f4',
          subjectId: 'subj-ml',
          subjectName: 'Machine Learning',
          subjectColor: '#38bdf8',
          topic: 'Q-Learning & Bellman Equation',
          durationMinutes: 45,
          startTime: '14:00',
          endTime: '14:45',
          priority: 'medium',
          type: 'learning',
          completed: false,
          dayIndex: 1
        }
      ]
    },
    {
      dayName: 'Saturday',
      dateString: '2026-08-01',
      totalMinutes: 135,
      sessions: [
        {
          id: 'sess-sat1',
          subjectId: 'subj-math',
          subjectName: 'Mathematics',
          subjectColor: '#3b82f6',
          topic: 'Partial Derivatives & Multivariable Exam Prep',
          durationMinutes: 45,
          startTime: '10:00',
          endTime: '10:45',
          priority: 'urgent',
          type: 'practice',
          completed: false,
          dayIndex: 2
        },
        {
          id: 'sess-sat2',
          subjectId: 'subj-phys',
          subjectName: 'Physics',
          subjectColor: '#8b5cf6',
          topic: 'Thermodynamics Problem Sets',
          durationMinutes: 45,
          startTime: '11:00',
          endTime: '11:45',
          priority: 'high',
          type: 'practice',
          completed: false,
          dayIndex: 2
        },
        {
          id: 'sess-sat3',
          subjectId: 'subj-prog',
          subjectName: 'Programming',
          subjectColor: '#06b6d4',
          topic: 'System Concurrency Concepts',
          durationMinutes: 45,
          startTime: '14:00',
          endTime: '14:45',
          priority: 'medium',
          type: 'learning',
          completed: false,
          dayIndex: 2
        }
      ]
    }
  ],
  aiReasoning: 'Prioritized Mathematics (urgent exam in 12 days) and Physics with high density early in the day. Balanced with Programming practice and Machine Learning revision sessions to maintain optimal memory retention.'
};

export const INITIAL_PROGRESS: ProgressStats = {
  todayProgressPercent: 72,
  todayStudyMinutes: 205,
  todayCompletedTasks: 4,
  todayTotalTasks: 6,
  totalStudyHours: 42.5,
  totalSessionsCompleted: 34,
  currentStreakDays: 6,
  weeklyStudyHours: [3.5, 4.2, 3.8, 3.4, 4.0, 2.5, 0.0],
  subjectProgress: [
    { subjectName: 'Mathematics', percent: 78, color: '#3b82f6' },
    { subjectName: 'Programming', percent: 84, color: '#06b6d4' },
    { subjectName: 'Physics', percent: 60, color: '#8b5cf6' },
    { subjectName: 'Machine Learning', percent: 70, color: '#38bdf8' }
  ]
};

export const INITIAL_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    sender: 'assistant',
    text: 'Hello! I am **StudyForge AI**, your intelligent academic copilot. I have loaded your current subjects (*Mathematics*, *Physics*, *Programming*, and *Machine Learning*).\n\nHow can I help you optimize your study workflow today?',
    timestamp: '09:00 AM'
  }
];
