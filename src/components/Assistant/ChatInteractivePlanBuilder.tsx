import React, { useState } from 'react';
import { Subject, StudyPlan, DifficultyLevel, LearningGoal, PriorityLevel } from '../../types';
import { generateStudyPlan } from '../../lib/aiPlanner';
import { Sparkles, Plus, Check, Calendar, Clock, BookOpen, CheckCircle2, ArrowRight, Zap, Target } from 'lucide-react';

interface ChatInteractivePlanBuilderProps {
  initialSubjects: Subject[];
  initialPlan: StudyPlan;
  onSavePlan: (newPlan: StudyPlan, updatedSubjects: Subject[]) => void;
}

export const ChatInteractivePlanBuilder: React.FC<ChatInteractivePlanBuilderProps> = ({
  initialSubjects,
  initialPlan,
  onSavePlan,
}) => {
  const [subjectsList, setSubjectsList] = useState<Subject[]>(
    initialSubjects.length > 0
      ? initialSubjects
      : [
          {
            id: 'subj-math-default',
            name: 'Mathematics',
            color: '#0070F3',
            difficulty: 'hard',
            knowledgeLevel: 65,
            examDate: '2026-08-20',
            priority: 'high',
            completedTopicsCount: 8,
            totalTopicsCount: 15,
            topics: [
              { id: 't1', name: 'Differential Calculus', completed: true },
              { id: 't2', name: 'Integral Calculus', completed: false },
              { id: 't3', name: 'Linear Algebra', completed: false },
            ],
          },
          {
            id: 'subj-cs-default',
            name: 'Computer Science',
            color: '#00A3FF',
            difficulty: 'medium',
            knowledgeLevel: 80,
            examDate: '2026-08-25',
            priority: 'high',
            completedTopicsCount: 12,
            totalTopicsCount: 16,
            topics: [
              { id: 't4', name: 'Data Structures', completed: true },
              { id: 't5', name: 'Algorithms', completed: true },
              { id: 't6', name: 'System Design', completed: false },
            ],
          },
        ]
  );

  const [selectedSubjectIds, setSelectedSubjectIds] = useState<string[]>(
    subjectsList.map((s) => s.id)
  );

  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjDifficulty, setNewSubjDifficulty] = useState<DifficultyLevel>('medium');
  const [newSubjExamDate, setNewSubjExamDate] = useState('2026-08-28');

  const [availableHours, setAvailableHours] = useState<number>(
    initialPlan?.availableHoursPerDay || 3
  );
  const [sessionLength, setSessionLength] = useState<number>(
    initialPlan?.sessionLengthMinutes || 45
  );
  const [learningGoal, setLearningGoal] = useState<LearningGoal>(
    initialPlan?.goal || 'high_grades'
  );

  const [isGenerated, setIsGenerated] = useState(false);
  const [isBuilding, setIsBuilding] = useState(false);

  const handleToggleSubject = (id: string) => {
    if (selectedSubjectIds.includes(id)) {
      if (selectedSubjectIds.length > 1) {
        setSelectedSubjectIds(selectedSubjectIds.filter((sId) => sId !== id));
      }
    } else {
      setSelectedSubjectIds([...selectedSubjectIds, id]);
    }
  };

  const handleAddSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubjName.trim()) return;

    const colors = ['#0070F3', '#00A3FF', '#8B5CF6', '#EC4899', '#10B981', '#F59E0B'];
    const randomColor = colors[subjectsList.length % colors.length];

    const newSubject: Subject = {
      id: `subj-custom-${Date.now()}`,
      name: newSubjName.trim(),
      color: randomColor,
      difficulty: newSubjDifficulty,
      knowledgeLevel: 50,
      examDate: newSubjExamDate || '2026-08-30',
      priority: newSubjDifficulty === 'hard' || newSubjDifficulty === 'extreme' ? 'high' : 'medium',
      completedTopicsCount: 2,
      totalTopicsCount: 10,
      topics: [
        { id: `t-${Date.now()}-1`, name: 'Core Foundations', completed: true },
        { id: `t-${Date.now()}-2`, name: 'Advanced Applications', completed: false },
      ],
    };

    const updated = [...subjectsList, newSubject];
    setSubjectsList(updated);
    setSelectedSubjectIds([...selectedSubjectIds, newSubject.id]);
    setNewSubjName('');
  };

  const handleBuildPlan = () => {
    setIsBuilding(true);
    setTimeout(() => {
      const activeSubjs = subjectsList.filter((s) => selectedSubjectIds.includes(s.id));

      const newPlan = generateStudyPlan(activeSubjs, {
        availableHoursPerDay: availableHours,
        sessionLengthMinutes: sessionLength,
        goal: learningGoal,
      });

      onSavePlan(newPlan, activeSubjs);
      setIsBuilding(false);
      setIsGenerated(true);
    }, 600);
  };

  return (
    <div className="mt-3 my-2 p-3.5 sm:p-5 rounded-2xl bg-[#080B12] border border-[#0070F3]/40 shadow-[0_0_25px_rgba(0,112,243,0.15)] text-white space-y-4 max-w-full overflow-hidden">
      {/* Header Banner */}
      <div className="flex items-center justify-between border-b border-white/10 pb-3 gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0070F3]/20 border border-[#0070F3]/40 flex items-center justify-center text-[#0070F3]">
            <Sparkles className="w-4 h-4 text-cyan-300" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-extrabold text-white tracking-tight">
              Interactive Study Plan Builder
            </h4>
            <p className="text-[11px] text-gray-400">
              Configure your subjects and parameters to sync directly to your Dashboard.
            </p>
          </div>
        </div>
        <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono font-semibold shrink-0">
          Step-by-Step
        </span>
      </div>

      {!isGenerated ? (
        <div className="space-y-4 text-xs sm:text-sm">
          {/* STEP 1: Select & Add Subjects */}
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-gray-200 flex items-center gap-1.5 text-xs">
                <BookOpen className="w-3.5 h-3.5 text-[#0070F3]" />
                <span>Step 1: Select Subjects for your Plan</span>
              </label>
              <span className="text-[10px] text-gray-400">
                {selectedSubjectIds.length} of {subjectsList.length} selected
              </span>
            </div>

            {/* Subject Chips Grid */}
            <div className="flex flex-wrap gap-2">
              {subjectsList.map((subj) => {
                const isSelected = selectedSubjectIds.includes(subj.id);
                return (
                  <button
                    key={subj.id}
                    type="button"
                    onClick={() => handleToggleSubject(subj.id)}
                    className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-semibold transition-all ${
                      isSelected
                        ? 'bg-[#0070F3]/20 border-[#0070F3] text-white shadow-[0_0_12px_rgba(0,112,243,0.3)]'
                        : 'bg-[#030509] border-white/10 text-gray-400 hover:text-gray-200 hover:border-white/20'
                    }`}
                  >
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: subj.color }}
                    />
                    <span>{subj.name}</span>
                    {isSelected && <Check className="w-3.5 h-3.5 text-cyan-300 ml-0.5" />}
                  </button>
                );
              })}
            </div>

            {/* Inline Add Subject Form */}
            <form
              onSubmit={handleAddSubject}
              className="p-2.5 rounded-xl bg-[#030509] border border-white/10 flex flex-wrap sm:flex-nowrap items-center gap-2"
            >
              <input
                type="text"
                value={newSubjName}
                onChange={(e) => setNewSubjName(e.target.value)}
                placeholder="Add new subject (e.g. Physics, Biology)..."
                className="flex-1 bg-transparent border-none text-xs text-white placeholder-gray-500 focus:outline-none min-w-[140px]"
              />
              <select
                value={newSubjDifficulty}
                onChange={(e) => setNewSubjDifficulty(e.target.value as DifficultyLevel)}
                className="bg-[#0D121F] border border-white/10 text-[11px] text-gray-200 rounded-lg px-2 py-1 focus:outline-none"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
              <button
                type="submit"
                disabled={!newSubjName.trim()}
                className="px-3 py-1.5 rounded-lg bg-[#0070F3] hover:bg-[#0070F3]/90 text-white font-bold text-xs flex items-center gap-1 transition-all disabled:opacity-40 shrink-0"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </form>
          </div>

          {/* STEP 2: Target Hours & Goal Parameters */}
          <div className="space-y-3 pt-2 border-t border-white/10">
            <label className="font-bold text-gray-200 flex items-center gap-1.5 text-xs">
              <Clock className="w-3.5 h-3.5 text-cyan-400" />
              <span>Step 2: Schedule Intensity & Daily Available Hours</span>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {/* Daily Hours Selector */}
              <div className="p-2.5 rounded-xl bg-[#030509] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 block">Daily Study Time:</span>
                <div className="flex items-center justify-between">
                  <span className="text-sm font-extrabold text-[#0070F3] font-mono">
                    {availableHours} Hours / Day
                  </span>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setAvailableHours(Math.max(1, availableHours - 1))}
                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center"
                    >
                      -
                    </button>
                    <button
                      type="button"
                      onClick={() => setAvailableHours(Math.min(8, availableHours + 1))}
                      className="w-6 h-6 rounded bg-white/5 hover:bg-white/10 text-white font-bold text-xs flex items-center justify-center"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              {/* Session Length */}
              <div className="p-2.5 rounded-xl bg-[#030509] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 block">Session Block Length:</span>
                <select
                  value={sessionLength}
                  onChange={(e) => setSessionLength(Number(e.target.value))}
                  className="w-full bg-[#0D121F] border border-white/10 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value={30}>30 Minutes (Sprint)</option>
                  <option value={45}>45 Minutes (Recommended)</option>
                  <option value={60}>60 Minutes (Deep Focus)</option>
                </select>
              </div>

              {/* Primary Goal */}
              <div className="p-2.5 rounded-xl bg-[#030509] border border-white/10 space-y-1">
                <span className="text-[10px] font-mono text-gray-400 block">Academic Target Goal:</span>
                <select
                  value={learningGoal}
                  onChange={(e) => setLearningGoal(e.target.value as LearningGoal)}
                  className="w-full bg-[#0D121F] border border-white/10 text-xs text-white rounded-lg px-2 py-1.5 focus:outline-none"
                >
                  <option value="high_grades">Ace Upcoming Exams</option>
                  <option value="master_subject">Master All Subjects</option>
                  <option value="pass_exam">Balanced Passing Strategy</option>
                  <option value="catch_up">Intensive Catch Up</option>
                </select>
              </div>
            </div>
          </div>

          {/* STEP 3: Action Button */}
          <button
            type="button"
            onClick={handleBuildPlan}
            disabled={isBuilding || selectedSubjectIds.length === 0}
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#0070F3] via-blue-600 to-cyan-500 hover:from-blue-600 hover:to-cyan-400 text-white font-bold text-xs sm:text-sm shadow-[0_0_20px_rgba(0,112,243,0.4)] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {isBuilding ? (
              <>
                <Zap className="w-4 h-4 animate-spin text-cyan-300" />
                <span>Synthesizing Live Study Plan...</span>
              </>
            ) : (
              <>
                <Zap className="w-4 h-4 text-cyan-300" />
                <span>Generate & Sync Live Plan to Dashboard</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      ) : (
        /* SUCCESS Banner */
        <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-200 space-y-3">
          <div className="flex items-center gap-2.5">
            <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
            <div>
              <h5 className="text-sm font-extrabold text-white">Study Plan Successfully Built & Synced!</h5>
              <p className="text-xs text-emerald-300/90 mt-0.5">
                Alex configured your multi-day schedule with {selectedSubjectIds.length} active subjects and {availableHours} daily study hours.
              </p>
            </div>
          </div>

          <div className="p-3 rounded-lg bg-[#030509]/80 border border-emerald-500/20 text-xs text-gray-300 space-y-1.5">
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-emerald-400 font-bold">● Active Subjects:</span>
              <span className="text-white">
                {subjectsList
                  .filter((s) => selectedSubjectIds.includes(s.id))
                  .map((s) => s.name)
                  .join(', ')}
              </span>
            </div>
            <div className="flex items-center justify-between font-mono text-[11px]">
              <span className="text-emerald-400 font-bold">● Daily Allocation:</span>
              <span className="text-white">{availableHours} hrs/day ({sessionLength} min blocks)</span>
            </div>
          </div>

          <p className="text-xs text-gray-300 flex items-center gap-1.5">
            <span>✨ Whenever you leave this chat tab, you can view your full interactive schedule on the</span>
            <strong className="text-cyan-300 underline">Dashboard</strong>
            <span>or</span>
            <strong className="text-cyan-300 underline">Study Plan</strong>
            <span>tabs!</span>
          </p>

          <button
            type="button"
            onClick={() => setIsGenerated(false)}
            className="text-xs text-emerald-400 hover:text-emerald-300 underline font-semibold pt-1"
          >
            Adjust or Re-configure Plan
          </button>
        </div>
      )}
    </div>
  );
};
