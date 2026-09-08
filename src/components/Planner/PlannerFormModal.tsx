import React, { useState, useEffect } from 'react';
import { Subject, LearningGoal, DifficultyLevel } from '../../types';
import { Sparkles, X, Plus, Trash2, Calendar, Clock, Target, Check, Pencil, AlertCircle } from 'lucide-react';
import { formatTime12h } from '../../lib/timeUtils';

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
    preferredStartTime?: string;
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
  const [preferredStartTime, setPreferredStartTime] = useState<string>('09:00');
  const [goal, setGoal] = useState<LearningGoal>('high_grades');
  const [selectedDays, setSelectedDays] = useState<string[]>([
    'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'
  ]);

  // Sync subjects when modal opens
  useEffect(() => {
    if (isOpen) {
      setSubjects(initialSubjects);
      setEditingSubjId(null);
    }
  }, [isOpen, initialSubjects]);

  // Editing Subject State
  const [editingSubjId, setEditingSubjId] = useState<string | null>(null);
  const [editName, setEditName] = useState<string>('');
  const [editExamDate, setEditExamDate] = useState<string>('2026-08-15');
  const [editDiff, setEditDiff] = useState<DifficultyLevel>('medium');
  const [editColor, setEditColor] = useState<string>('#3b82f6');

  // New quick subject input state
  const [newSubjName, setNewSubjName] = useState('');
  const [newSubjExam, setNewSubjExam] = useState('2026-08-15');
  const [newSubjDiff, setNewSubjDiff] = useState<DifficultyLevel>('medium');
  const [addError, setAddError] = useState<string | null>(null);

  const paletteColors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#38bdf8', '#ec4899', '#f59e0b', '#10b981'];

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
    if (!newSubjName.trim()) {
      setAddError('Please enter a subject name.');
      return;
    }
    setAddError(null);
    const newSubj: Subject = {
      id: `subj-user-${Date.now()}`,
      name: newSubjName.trim(),
      color: paletteColors[subjects.length % paletteColors.length],
      difficulty: newSubjDiff,
      knowledgeLevel: 50,
      examDate: newSubjExam,
      priority: newSubjDiff === 'extreme' || newSubjDiff === 'hard' ? 'urgent' : 'high',
      completedTopicsCount: 0,
      totalTopicsCount: 10,
      topics: [
        { id: `tp-${Date.now()}-1`, name: `${newSubjName.trim()} Fundamentals & Core Concepts`, completed: false },
        { id: `tp-${Date.now()}-2`, name: `${newSubjName.trim()} High-Yield Exam Review`, completed: false }
      ]
    };
    setSubjects([...subjects, newSubj]);
    setNewSubjName('');
  };

  const handleRemoveSubject = (id: string) => {
    setSubjects(prev => prev.filter(s => s.id !== id));
    if (editingSubjId === id) {
      setEditingSubjId(null);
    }
  };

  const startEditing = (subj: Subject) => {
    setEditingSubjId(subj.id);
    setEditName(subj.name);
    setEditExamDate(subj.examDate || '2026-08-15');
    setEditDiff(subj.difficulty || 'medium');
    setEditColor(subj.color || '#3b82f6');
  };

  const saveEditing = () => {
    if (!editName.trim()) return;
    setSubjects(prev => prev.map(s => {
      if (s.id === editingSubjId) {
        return {
          ...s,
          name: editName.trim(),
          examDate: editExamDate,
          difficulty: editDiff,
          color: editColor,
          priority: editDiff === 'extreme' || editDiff === 'hard' ? 'urgent' : 'high'
        };
      }
      return s;
    }));
    setEditingSubjId(null);
  };

  const cancelEditing = () => {
    setEditingSubjId(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (subjects.length === 0) return;
    onGeneratePlan({
      subjects,
      availableHoursPerDay: availableHours,
      studyDays: selectedDays,
      goal,
      sessionLengthMinutes: sessionLength,
      preferredStartTime
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
            <div className="flex items-center justify-between">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
                1. Active Subjects & Exam Dates ({subjects.length})
              </label>
              <span className="text-[11px] text-slate-400">
                You can edit or delete any subject below before generating
              </span>
            </div>

            {subjects.length === 0 ? (
              <div className="p-5 rounded-xl bg-blue-950/20 border border-dashed border-blue-500/40 text-center space-y-1.5">
                <div className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-amber-500/10 text-amber-400 mb-1">
                  <AlertCircle className="w-4 h-4" />
                </div>
                <p className="text-xs text-amber-300 font-semibold">No subjects in your study plan yet</p>
                <p className="text-[11px] text-slate-400 max-w-md mx-auto">
                  Add at least one subject below using the input bar to customize your timetable.
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {subjects.map((subj) => {
                  const isEditing = editingSubjId === subj.id;

                  if (isEditing) {
                    return (
                      <div
                        key={subj.id}
                        className="sm:col-span-2 p-4 rounded-xl bg-[#09112a] border-2 border-cyan-400/80 shadow-[0_0_20px_rgba(6,182,212,0.25)] space-y-3 animate-in fade-in duration-200"
                      >
                        <div className="flex items-center justify-between border-b border-blue-800/40 pb-2">
                          <div className="flex items-center gap-2 text-cyan-300 text-xs font-bold">
                            <Pencil className="w-3.5 h-3.5 text-cyan-400" />
                            <span>Edit Subject Details</span>
                          </div>
                          <button
                            type="button"
                            onClick={cancelEditing}
                            className="text-slate-400 hover:text-white p-1 rounded transition-colors"
                            title="Cancel editing"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Subject Name</label>
                            <input
                              type="text"
                              value={editName}
                              onChange={(e) => setEditName(e.target.value)}
                              placeholder="e.g. Organic Chemistry"
                              className="w-full px-3 py-1.5 rounded-lg bg-[#040712] border border-blue-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                              autoFocus
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Exam Date</label>
                            <input
                              type="date"
                              value={editExamDate}
                              onChange={(e) => setEditExamDate(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#040712] border border-blue-800 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] uppercase font-bold text-slate-400 mb-1">Difficulty</label>
                            <select
                              value={editDiff}
                              onChange={(e: any) => setEditDiff(e.target.value)}
                              className="w-full px-3 py-1.5 rounded-lg bg-[#040712] border border-blue-800 text-xs text-white focus:outline-none focus:border-cyan-400"
                            >
                              <option value="easy">Easy</option>
                              <option value="medium">Medium</option>
                              <option value="hard">Hard</option>
                              <option value="extreme">Extreme</option>
                            </select>
                          </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pt-2 border-t border-blue-900/30">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-bold uppercase text-slate-400">Color:</span>
                            <div className="flex items-center gap-1.5">
                              {paletteColors.map((c) => (
                                <button
                                  key={c}
                                  type="button"
                                  onClick={() => setEditColor(c)}
                                  className={`w-5 h-5 rounded-full transition-transform ${
                                    editColor === c ? 'ring-2 ring-white scale-110' : 'opacity-70 hover:opacity-100'
                                  }`}
                                  style={{ backgroundColor: c }}
                                />
                              ))}
                            </div>
                          </div>

                          <div className="flex items-center gap-2 self-end sm:self-auto">
                            <button
                              type="button"
                              onClick={cancelEditing}
                              className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold transition-colors"
                            >
                              Cancel
                            </button>
                            <button
                              type="button"
                              onClick={saveEditing}
                              disabled={!editName.trim()}
                              className="px-3.5 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 disabled:opacity-50 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Save Changes</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div
                      key={subj.id}
                      className="p-3.5 rounded-xl bg-[#080e22] border border-blue-900/50 hover:border-blue-700/60 transition-all flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0 flex-1">
                        <span
                          className="w-3.5 h-3.5 rounded-full shrink-0 shadow-sm"
                          style={{ backgroundColor: subj.color }}
                        />
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <p className="text-xs font-bold text-white truncate">{subj.name}</p>
                            <span className="text-[9px] uppercase font-mono font-bold px-1.5 py-0.5 rounded bg-blue-950/80 text-cyan-300 border border-blue-500/30 shrink-0">
                              {subj.difficulty}
                            </span>
                          </div>
                          <p className="text-[10px] text-slate-400 mt-0.5 flex items-center gap-1 font-mono">
                            <Calendar className="w-3 h-3 text-cyan-400 shrink-0" />
                            <span>Exam: <strong className="text-cyan-300">{subj.examDate}</strong></span>
                          </p>
                        </div>
                      </div>

                      {/* Action Buttons: Edit and Delete */}
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => startEditing(subj)}
                          className="px-2.5 py-1 rounded-lg bg-blue-950/90 hover:bg-blue-600/40 text-cyan-300 border border-blue-500/40 text-[11px] font-semibold flex items-center gap-1 transition-all"
                          title={`Edit ${subj.name}`}
                        >
                          <Pencil className="w-3 h-3" />
                          <span>Edit</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemoveSubject(subj.id)}
                          className="px-2.5 py-1 rounded-lg bg-rose-950/60 hover:bg-rose-900/80 text-rose-300 border border-rose-500/50 text-[11px] font-semibold flex items-center gap-1 transition-all"
                          title={`Delete ${subj.name}`}
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Quick Add Subject */}
            <div className="space-y-1.5">
              <div className="p-3 rounded-xl bg-[#040712] border border-blue-900/40 flex flex-col sm:flex-row items-center gap-2">
                <input
                  type="text"
                  placeholder="Add Subject (e.g., Organic Chemistry)"
                  value={newSubjName}
                  onChange={(e) => {
                    setNewSubjName(e.target.value);
                    if (addError) setAddError(null);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddSubject();
                    }
                  }}
                  className="w-full sm:flex-1 px-3 py-1.5 rounded-lg bg-[#070d1e] border border-blue-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <input
                    type="date"
                    value={newSubjExam}
                    onChange={(e) => setNewSubjExam(e.target.value)}
                    className="w-1/2 sm:w-auto px-2 py-1.5 rounded-lg bg-[#070d1e] border border-blue-900/40 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                  <select
                    value={newSubjDiff}
                    onChange={(e: any) => setNewSubjDiff(e.target.value)}
                    className="w-1/2 sm:w-auto px-2 py-1.5 rounded-lg bg-[#070d1e] border border-blue-900/40 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="extreme">Extreme</option>
                  </select>
                </div>
                <button
                  type="button"
                  onClick={handleAddSubject}
                  className="w-full sm:w-auto px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add Subject</span>
                </button>
              </div>
              {addError && (
                <p className="text-[11px] text-rose-400 font-medium px-1 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{addError}</span>
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Time & Sessions */}
          <div className="space-y-4 p-4 rounded-xl bg-[#060a17] border border-blue-900/30">
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

            {/* Daily Start Time Selector */}
            <div className="pt-2 border-t border-blue-900/20">
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Daily Study Schedule Start Time</span>
                <span className="text-cyan-400 font-mono text-xs font-semibold">{formatTime12h(preferredStartTime)}</span>
              </label>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <input
                  type="time"
                  value={preferredStartTime}
                  onChange={(e) => setPreferredStartTime(e.target.value)}
                  className="w-full sm:w-auto px-3 py-2 rounded-lg bg-[#070d1e] border border-blue-900/40 text-xs text-white font-mono focus:outline-none focus:border-cyan-400"
                />

                <div className="flex items-center gap-1.5 flex-wrap w-full sm:w-auto">
                  {[
                    { label: '8:00 AM', val: '08:00' },
                    { label: '9:00 AM', val: '09:00' },
                    { label: '10:00 AM', val: '10:00' },
                    { label: '1:00 PM', val: '13:00' },
                    { label: '5:00 PM', val: '17:00' },
                    { label: '8:00 PM', val: '20:00' },
                  ].map((preset) => (
                    <button
                      key={preset.val}
                      type="button"
                      onClick={() => setPreferredStartTime(preset.val)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all ${
                        preferredStartTime === preset.val
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-400/50 font-bold'
                          : 'bg-[#080e22] text-slate-400 hover:text-white border border-blue-900/20'
                      }`}
                    >
                      {preset.label}
                    </button>
                  ))}
                </div>
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
          <div className="pt-2 space-y-2">
            <button
              type="submit"
              disabled={subjects.length === 0}
              className="w-full py-3.5 rounded-xl bg-gradient-to-r from-blue-600 via-blue-500 to-cyan-500 text-white font-bold text-sm shadow-[0_0_30px_rgba(59,130,246,0.5)] hover:shadow-[0_0_40px_rgba(56,189,248,0.7)] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none transition-all flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Generate Intelligent Study Plan</span>
            </button>
            {subjects.length === 0 && (
              <p className="text-center text-xs text-rose-400 font-medium">
                Please add at least one subject in step 1 to generate your study plan.
              </p>
            )}
          </div>
        </form>
      </div>
    </div>
  );
};
