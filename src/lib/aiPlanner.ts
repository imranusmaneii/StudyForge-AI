import { Subject, StudyPlan, LearningGoal, DailyPlan, StudySession } from '../types';
import { resequenceDaySessions } from './timeUtils';

export function generateStudyPlan(
  subjects: Subject[],
  config: {
    availableHoursPerDay: number;
    sessionLengthMinutes: number;
    goal: LearningGoal;
    studyDays?: string[];
  }
): StudyPlan {
  const daysOfWeek = config.studyDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];
  const sessionMins = config.sessionLengthMinutes || 45;
  const targetDailyMins = (config.availableHoursPerDay || 3) * 60;
  const sessionsPerDay = Math.max(1, Math.floor(targetDailyMins / sessionMins));

  const days: DailyPlan[] = daysOfWeek.map((dayName, dayIndex) => {
    const daySessions: StudySession[] = [];
    const dateObj = new Date();
    dateObj.setDate(dateObj.getDate() + dayIndex);
    const dateString = dateObj.toISOString().split('T')[0];

    for (let i = 0; i < sessionsPerDay; i++) {
      const subjectIndex = (dayIndex + i) % (subjects.length || 1);
      const subject: Subject = subjects[subjectIndex] || {
        id: 'subj-default',
        name: 'Core Study',
        color: '#0070F3',
        difficulty: 'medium',
        knowledgeLevel: 50,
        examDate: '2026-08-30',
        priority: 'high',
        completedTopicsCount: 0,
        totalTopicsCount: 0,
        topics: [],
      };

      const topics = subject.topics || [];
      const uncompletedTopic = topics.find((t) => !t.completed);
      const topicName = uncompletedTopic
        ? uncompletedTopic.name
        : `Key Exam Practice & Review in ${subject.name}`;

      daySessions.push({
        id: `sess-${dayIndex}-${i}-${Date.now()}`,
        dayIndex,
        dateString,
        subjectId: subject.id,
        subjectName: subject.name,
        subjectColor: subject.color || '#0070F3',
        topic: topicName,
        durationMinutes: sessionMins,
        priority: subject.priority || 'medium',
        type: i % 2 === 0 ? 'learning' : 'practice',
        completed: false,
        notes: `Focus on high-yield exam concepts for ${subject.name}.`,
      });
    }

    const resequenced = resequenceDaySessions(daySessions, '09:00');

    return {
      dayName: dayIndex === 0 ? 'Today' : dayIndex === 1 ? 'Tomorrow' : dayName,
      dateString,
      totalMinutes: daySessions.length * sessionMins,
      sessions: resequenced,
    };
  });

  return {
    id: `plan-gen-${Date.now()}`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    goal: config.goal,
    sessionLengthMinutes: sessionMins,
    availableHoursPerDay: config.availableHoursPerDay,
    studyDays: daysOfWeek,
    days,
    aiReasoning: `Custom plan optimized by Alex for ${subjects.length} subjects across ${config.availableHoursPerDay} daily available hours.`,
  };
}
