import React, { useState } from 'react';
import { Subject, DifficultyLevel, PriorityLevel } from '../../types';
import { Card3D } from '../3d/Card3D';
import {
  BookOpen,
  Plus,
  Calendar,
  CheckCircle2,
  AlertCircle,
  BarChart3,
  Edit2,
  Trash2,
  X,
  Sparkles
} from 'lucide-react';

interface SubjectsViewProps {
  subjects: Subject[];
  onAddSubject: (subject: Subject) => void;
  onUpdateSubject: (subject: Subject) => void;
  onDeleteSubject: (id: string) => void;
}

export const SubjectsView: React.FC<SubjectsViewProps> = ({
  subjects,
  onAddSubject,
  onUpdateSubject,
  onDeleteSubject
}) => {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [selectedSubject, setSelectedSubject] = useState<Subject | null>(null);

  // New Subject Form State
  const [name, setName] = useState('');
  const [difficulty, setDifficulty] = useState<DifficultyLevel>('medium');
  const [examDate, setExamDate] = useState('2026-08-15');
  const [knowledge, setKnowledge] = useState<number>(60);
  const [color, setColor] = useState('#3b82f6');
  const [topicInput, setTopicInput] = useState('');

  const colors = ['#3b82f6', '#06b6d4', '#8b5cf6', '#38bdf8', '#ec4899', '#f59e0b', '#10b981'];

  const handleCreateSubject = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const initialTopics = topicInput
      .split('\n')
      .map(t => t.trim())
      .filter(Boolean)
      .map((tName, i) => ({ id: `tp-${Date.now()}-${i}`, name: tName, completed: false }));

    const newSubj: Subject = {
      id: `subj-${Date.now()}`,
      name: name.trim(),
      color,
      difficulty,
      knowledgeLevel: knowledge,
      examDate,
      priority: difficulty === 'extreme' || difficulty === 'hard' ? 'urgent' : 'high',
      completedTopicsCount: 0,
      totalTopicsCount: initialTopics.length || 5,
      topics: initialTopics.length > 0 ? initialTopics : [
        { id: `tp-${Date.now()}-1`, name: 'Core Foundations', completed: false },
        { id: `tp-${Date.now()}-2`, name: 'Advanced Concepts', completed: false }
      ]
    };

    onAddSubject(newSubj);
    setName('');
    setTopicInput('');
    setIsAddModalOpen(false);
  };

  const handleToggleTopic = (subj: Subject, topicId: string) => {
    const updatedTopics = subj.topics.map(t => t.id === topicId ? { ...t, completed: !t.completed } : t);
    const completedCount = updatedTopics.filter(t => t.completed).length;
    const knowledgeLevel = Math.round((completedCount / (updatedTopics.length || 1)) * 100);

    const updatedSubj = {
      ...subj,
      topics: updatedTopics,
      completedTopicsCount: completedCount,
      totalTopicsCount: updatedTopics.length,
      knowledgeLevel: Math.max(knowledgeLevel, 15)
    };

    onUpdateSubject(updatedSubj);
    if (selectedSubject?.id === subj.id) {
      setSelectedSubject(updatedSubj);
    }
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-blue-950/40 via-[#0a1228] to-cyan-950/40 border border-blue-500/20">
        <div>
          <div className="flex items-center gap-2 text-cyan-400 text-xs font-mono mb-1">
            <BookOpen className="w-3.5 h-3.5" />
            <span>ACADEMIC KNOWLEDGE MATRIX</span>
          </div>
          <h2 className="text-2xl font-extrabold text-white">Subjects Dashboard</h2>
          <p className="text-xs text-slate-300 mt-0.5">
            Monitor topic completion, knowledge levels, and countdown to exam dates.
          </p>
        </div>

        <button
          onClick={() => setIsAddModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-[0_0_20px_rgba(59,130,246,0.4)] hover:scale-[1.02] transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>Add Subject</span>
        </button>
      </div>

      {/* Grid of Subject Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {subjects.map((subj) => {
          const daysLeft = Math.ceil((new Date(subj.examDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          const diffBadge = {
            easy: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30',
            medium: 'bg-blue-500/20 text-cyan-300 border-blue-500/30',
            hard: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
            extreme: 'bg-rose-500/20 text-rose-300 border-rose-500/30'
          }[subj.difficulty] || 'bg-blue-500/20 text-cyan-300 border-blue-500/30';

          return (
            <Card3D key={subj.id} glowColor="blue">
              <div className="space-y-4">
                {/* Header Info */}
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <span className="w-4 h-4 rounded-full shrink-0 shadow-sm" style={{ backgroundColor: subj.color }} />
                    <div>
                      <h3 className="text-lg font-bold text-white">{subj.name}</h3>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase font-bold border ${diffBadge}`}>
                          {subj.difficulty}
                        </span>
                        <span className="text-xs text-slate-400 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-cyan-400" />
                          {subj.examDate} ({daysLeft} days left)
                        </span>
                      </div>
                    </div>
                  </div>

                  {subjects.length > 1 && (
                    <button
                      onClick={() => onDeleteSubject(subj.id)}
                      className="text-slate-600 hover:text-rose-400 p-1 transition-colors"
                      title="Delete subject"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>

                {/* Progress Bar & Stat */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Mastery Progress</span>
                    <span className="text-cyan-400 font-bold">{subj.knowledgeLevel}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-700"
                      style={{ width: `${subj.knowledgeLevel}%`, backgroundColor: subj.color }}
                    />
                  </div>
                </div>

                {/* Topic breakdown stats */}
                <div className="flex items-center justify-between pt-2 border-t border-blue-900/20 text-xs">
                  <span className="text-slate-400">
                    Topics Completed: <strong className="text-white font-mono">{subj.completedTopicsCount || subj.topics?.filter(t => t.completed).length || 0} / {subj.totalTopicsCount || subj.topics?.length || 0}</strong>
                  </span>
                  <button
                    onClick={() => setSelectedSubject(subj)}
                    className="text-cyan-400 hover:text-cyan-300 font-bold underline text-xs"
                  >
                    View Topics & Notes
                  </button>
                </div>
              </div>
            </Card3D>
          );
        })}
      </div>

      {/* Topics Detail Drawer / Modal */}
      {selectedSubject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-xl bg-[#050914] border border-blue-500/30 rounded-2xl p-6 space-y-5 max-h-[85vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-blue-900/30 pb-3">
              <div className="flex items-center gap-2.5">
                <span className="w-3 h-3 rounded-full" style={{ backgroundColor: selectedSubject.color }} />
                <h3 className="text-lg font-bold text-white">{selectedSubject.name} — Topic Checklist</h3>
              </div>
              <button onClick={() => setSelectedSubject(null)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5">
              {selectedSubject.topics?.map((topic) => (
                <div
                  key={topic.id}
                  onClick={() => handleToggleTopic(selectedSubject, topic.id)}
                  className={`p-3 rounded-xl border cursor-pointer transition-all ${
                    topic.completed
                      ? 'bg-blue-950/20 border-blue-500/20 opacity-75'
                      : 'bg-[#070d1e] border-blue-900/40 hover:border-cyan-400/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-4 h-4 rounded border flex items-center justify-center ${
                      topic.completed ? 'bg-cyan-500 border-cyan-400 text-black' : 'border-slate-600'
                    }`}>
                      {topic.completed && <CheckCircle2 className="w-3.5 h-3.5 fill-current" />}
                    </div>
                    <span className={`text-xs font-semibold ${topic.completed ? 'line-through text-slate-400' : 'text-slate-200'}`}>
                      {topic.name}
                    </span>
                  </div>
                  {topic.notes && (
                    <p className="text-[11px] text-slate-400 mt-1.5 ml-7 italic bg-black/40 p-1.5 rounded border border-blue-900/20">
                      Note: {topic.notes}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Add Subject Modal */}
      {isAddModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="relative w-full max-w-lg bg-[#050914] border border-blue-500/30 rounded-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-blue-900/30 pb-3">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-cyan-400" />
                <span>Add New Subject</span>
              </h3>
              <button onClick={() => setIsAddModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSubject} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Subject Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Artificial Intelligence"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070d1e] border border-blue-900/40 text-xs text-white focus:outline-none focus:border-cyan-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Difficulty</label>
                  <select
                    value={difficulty}
                    onChange={(e: any) => setDifficulty(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070d1e] border border-blue-900/40 text-xs text-white focus:outline-none focus:border-cyan-400"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                    <option value="extreme">Extreme</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Exam Date</label>
                  <input
                    type="date"
                    value={examDate}
                    onChange={(e) => setExamDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-[#070d1e] border border-blue-900/40 text-xs text-white focus:outline-none focus:border-cyan-400 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Color Theme</label>
                <div className="flex items-center gap-2">
                  {colors.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setColor(c)}
                      className={`w-6 h-6 rounded-full border-2 transition-all ${
                        color === c ? 'border-white scale-110' : 'border-transparent'
                      }`}
                      style={{ backgroundColor: c }}
                    />
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Topics List (One per line)</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Neural Networks&#10;Backpropagation&#10;Transformers"
                  value={topicInput}
                  onChange={(e) => setTopicInput(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#070d1e] border border-blue-900/40 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 rounded-xl bg-gradient-to-r from-blue-600 to-cyan-500 text-white font-bold text-xs shadow-md hover:scale-[1.01] transition-all"
              >
                Save Subject Matrix
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
