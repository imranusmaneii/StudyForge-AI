import React, { useState } from 'react';
import { Subject, LearningGoal } from '../../types';
import { Sparkles, X, Plus, Trash2, Calendar, Clock, Target, Check } from 'lucide-react';

interface PlannerFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  subjects: Subject[];
  onGeneratePlan: (formData: {
    subjects: Subject[];
    availableHoursPerDay: number;
    studyDays: string[];
    goal: LearningGoal;
    sessionLengthMinutes: number;
  }) => void;
}

export const PlannerFormModal: React.FC<PlannerFormModalProps> = ({
  isOpen,
  onClose,
  subjects: initialSubjects,
  onGeneratePlan
}) => {
  const [subjects, setSubjects] = useState<Subject[]>(initialSubjects);
  const [availableHours, setAvailableHours] = useState<number>(4);
  const [sessionLength, setSessionLength] = useState<number>(45);
  const [goal, setGoal] = useState<LearningGoal>('high_grades');
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]);

  // New quick subject input state
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjExam, setNewSubjExam] = useState('2026-08-15');
  const [newSubjDiff, setNewSubjDiff] = useState<'easy' | 'medium' | 'hard' | 'extreme'>('medium');

  if (!isOpen) return null;

  const daysOfWeek = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

  const goalsList: { id: LearningGoal; label: string; desc: string }[] = [
    { id: 'high_grades', label: 'Get High Grades', desc: 'Dense practice & comprehensive topic coverage' },
    { id: 'pass_exam', label: 'Pass the Exam', desc: 'Focus strictly on high-yield exam core topics' },
    { id: 'master_subject', label: 'Master the Subject', desc: 'In-depth theory, practice, & projects' },
    { id: 'upcoming_exam', label: 'Prepare for Urgent Exam', desc: 'High frequency review of closest deadlines' },
    { id: 'catch_up', label: 'Catch Up on Missed Work', desc: 'Structured recovery pace for overdue topics' },
  ];

  const handleToggleDay = (day: string) => {
    if (selectedDays.includes(day)) {
      if (selectedDays.length > 1) {
        setSelectedDays(selectedDays.filter(d => d !== day));
      }
    } else {
      setSelectedDays([...selectedDays, day]);
    }
  };

  const handleAddSubject = () => {
    if (!newSubjName.trim()) return;
    const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#38bdf8', '#ec4899', '#f59e0b'];
    const newSubj: Subject = {
      id: `subj-user-${Date.now()}`,
      name: newSubjName.trim(),
      color: colors[subjects.length % colors.length],
      difficulty: newSubjDiff,
      knowledgeLevel: 50,
      examDate: newSubjExam,
      priority: 'high',
      completedTopicsCount: 5,
      totalTopicsCount: 15,
      topics: [
        { id: `tp-${Date.now()}-1`, name: `${newSubjName.trim()} Fundamentals`, completed: false }
      ]
    };
    setSubjects([...subjects, newSubj]);
    setNewSubjName('');
  };

  const handleRemoveSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(s => s.id !== id));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onGeneratePlan({
      subjects,
      availableHoursPerDay: availableHours,
      studyDays: selectedDays,
      goal,
      sessionLengthMinutes: sessionLength
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <div className="relative w-full max-w-3xl bg-[#050914] border border-blue-500/30 rounded-2xl shadow-[0_0_50px_rgba(59,130,246,0.25)] p-6 sm:p-8 space-y-6 max-h-[90vh] overflow-y-auto">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-blue-900/30 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-cyan-400 p-[1px]">
              <div className="w-full h-full bg-[#050914] rounded-[11px] flex items-center justify-center text-cyan-400">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">AI Study Plan Generator</h2>
              <p className="text-xs text-slate-400">Enter your study parameters to generate a personalized schedule.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Section 1: Subjects List */}
          <div className="space-y-3">
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
              1. Active Subjects & Exam Dates ({subjects.length})
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {subjects.map((subj) => (
                <div key={subj.id} className="p-3 rounded-xl bg-[#080e22] border border-blue-900/40 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: subj.color }} />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-white truncate">{subj.name}</p>
                      <p className="text-[10px] text-slate-400">
                        Exam: <span className="text-cyan-400 font-mono">{subj.examDate}</span> | {subj.difficulty}
                      </p>
                    </div>
                  </div>
                  {subjects.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSubject(subj.id)}
                      className="text-slate-500 hover:text-rose-400 p-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            {/* Quick Add Subject */}
            <div className="p-3 rounded-xl bg-[#040712] border border-blue-900/30 flex flex-col sm:flex-row items-center gap-2">
              <input
                type="text"
                placeholder="Add Subject (e.g., Organic Chemistry)"
                value={newSubjName}
                onChange={(e) => setNewSubjName(e.target.value)}
                className="w-full sm:flex-1 px-3 py-1.5 rounded-lg bg-[#070d1e] border border-blue-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
              />
              <input
                type="date"
                value={newSubjExam}
                onChange={(e) => setNewSubjExam(e.target.value)}
                className="w-full sm:w-auto px-2 py-1.5 rounded-lg bg-[#070d1e] border border-blue-900/40 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
              />
              <select
                value={newSubjDiff}
                onChange={(e: any) => setNewSubjDiff(e.target.value)}
                className="w-full sm:w-auto px-2 py-1.5 rounded-lg bg-[#070d1e] border border-blue-900/40 text-xs text-white focus:outline-none focus:border-cyan-400"
              >
                <option value="easy">Easy</option>
                <option value="medium">Medium</option>
                <option value="hard">Hard</option>
                <option value="extreme">Extreme</option>
              </select>
              <button
                type="button"
                onClick={handleAddSubject}
                className="w-full sm:w-auto px-3 py-1.5 rounded-lg bg-blue-600 text-white text-xs font-semibold flex items-center justify-center gap-1 hover:bg-blue-500"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Add</span>
              </button>
            </div>
          </div>

          {/* Section 2: Time & Sessions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-cyan-400" />
                <span>Available Study Time: <span className="text-cyan-400 font-mono">{availableHours} hrs/day</span></span>
              </label>
              <input
                type="range"
                min={1}
                max={10}
                step={0.5}
                value={availableHours}
                onChange={(e) => setAvailableHours(parseFloat(e.target.value))}
                className="w-full accent-cyan-400 bg-slate-800 rounded-lg cursor-pointer h-2"
              />
              <div className="flex justify-between text-[10px] text-slate-500 mt-1 font-mono">
                <span>1 hr</span>
                <span>5 hrs</span>
                <span>10 hrs</span>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2">
                Preferred Session Length
              </label>
              <div className="grid grid-cols-4 gap-2">
                {[25, 45, 60, 90].map((len) => (
                  <button
                    key={len}
                    type="button"
                    onClick={() => setSessionLength(len)}
                    className={`py-2 rounded-lg text-xs font-mono font-semibold transition-all ${
                      sessionLength === len
                        ? 'bg-gradient-to-r from-blue-600 to-cyan-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.4)]'
                        : 'bg-[#080e22] text-slate-400 hover:text-white border border-blue-900/30'
                    }`}
                  >
                    {len}m
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Section 3: Study Days */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyan-400" />
              <span>Study Days Selection</span>
            </label>
            <div className="flex flex-wrap gap-2">
              {daysOfWeek.map((day) => {
                const isSelected = selectedDays.includes(day);
                return (
                  <button
                    key={day}
                    type="button"
                    onClick={() => handleToggleDay(day)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isSelected
                        ? 'bg-blue-600/30 text-cyan-300 border border-blue-400/50'
                        : 'bg-[#060a17] text-slate-500 border border-slate-800 hover:text-slate-300'
                    }`}
                  >
                    {day}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Section 4: Learning Goal */}
          <div>
            <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Target className="w-3.5 h-3.5 text-cyan-400" />
              <span>Primary Learning Goal</span>
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {goalsList.map((g) => {
                const isSelected = goal === g.id;
                return (
                  <div
                    key={g.id}
                    onClick={() => setGoal(g.id)}
                    className={`p-3 rounded-xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-blue-950/80 to-cyan-950/40 border-cyan-400/60 shadow-[0_0_20px_rgba(6,182,212,0.2)]'
                        : 'bg-[#060a17] border-blue-900/30 hover:border-blue-700/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-300'}`}>{g.label}</span>
                      {isSelected && <Check className="w-4 h-4 text-cyan-400" />}
                    </div>
                    <p className="text-[10px] text-slate-400 mt-0.5">{g.desc}</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Submit Action Button */}
          <div className="pt-2">
            <button
              type="submit"
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(56,189,248,0.7)] transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Intelligent Study Plan</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
