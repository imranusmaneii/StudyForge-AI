import React, { useState, useEffect } from 'react';
import {
  ActiveTab,
  Subject,
  StudyPlan,
  ProgressStats,
  ChatMessage,
  LearningGoal,
  User,
  AuthModalMode
} from './types';
import {
  loadCurrentUser,
  saveCurrentUser,
  loadSubjects,
  saveSubjects,
  loadStudyPlan,
  saveStudyPlan,
  loadProgress,
  saveProgress,
  loadChatMessages,
  saveChatMessages,
  resetToDemoData,
  EMPTY_SUBJECTS,
  EMPTY_STUDY_PLAN,
  EMPTY_PROGRESS
} from './lib/storage';

import { Navigation } from './components/Navigation';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { Dashboard } from './components/Dashboard';
import { PlanView } from './components/Planner/PlanView';
import { PlannerFormModal } from './components/Planner/PlannerFormModal';
import { GenerationLoadingModal } from './components/Planner/GenerationLoadingModal';
import { AdaptivePlanModal } from './components/Planner/AdaptivePlanModal';
import { SubjectsView } from './components/Subjects/SubjectsView';
import { TodaysTasksView } from './components/Tasks/TodaysTasksView';
import { ProgressAnalyticsView } from './components/Progress/ProgressAnalyticsView';
import { FocusTimerView } from './components/Timer/FocusTimerView';
import { AIAssistantView } from './components/Assistant/AIAssistantView';
import { SettingsModal } from './components/Settings/SettingsModal';
import { AuthModal } from './components/Auth/AuthModal';

export default function App() {
  const [activeTab, setActiveTab] = useState<ActiveTab>('dashboard');

  // Active Authenticated User State
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadCurrentUser());

  // Core Persistent State (Keyed by active user ID)
  const [subjects, setSubjects] = useState<Subject[]>(() => loadSubjects(currentUser?.id));
  const [studyPlan, setStudyPlan] = useState<StudyPlan>(() => loadStudyPlan(currentUser?.id));
  const [progress, setProgress] = useState<ProgressStats>(() => loadProgress(currentUser?.id));
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => loadChatMessages(currentUser?.id));

  // Modals & Auth State
  const [isPlannerFormOpen, setIsPlannerFormOpen] = useState(false);
  const [isGeneratingLoading, setIsGeneratingLoading] = useState(false);
  const [isAdjustModalOpen, setIsAdjustModalOpen] = useState(false);
  const [isAdjusting, setIsAdjusting] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<AuthModalMode>('signup');

  // Temporary container for newly generated plan during step animation
  const [pendingPlan, setPendingPlan] = useState<StudyPlan | null>(null);

  // Sync state when user changes
  useEffect(() => {
    saveCurrentUser(currentUser);
    setSubjects(loadSubjects(currentUser?.id));
    setStudyPlan(loadStudyPlan(currentUser?.id));
    setProgress(loadProgress(currentUser?.id));
    setChatMessages(loadChatMessages(currentUser?.id));
  }, [currentUser?.id]);

  // Save changes to per-user local storage
  useEffect(() => {
    saveSubjects(subjects, currentUser?.id);
  }, [subjects, currentUser?.id]);

  useEffect(() => {
    saveStudyPlan(studyPlan, currentUser?.id);
  }, [studyPlan, currentUser?.id]);

  useEffect(() => {
    saveProgress(progress, currentUser?.id);
  }, [progress, currentUser?.id]);

  useEffect(() => {
    saveChatMessages(chatMessages, currentUser?.id);
  }, [chatMessages, currentUser?.id]);

  // Auth Action Handlers
  const handleOpenAuth = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = (user: User) => {
    setCurrentUser(user);
    setIsAuthModalOpen(false);
  };

  const handleSignupSuccess = (user: User) => {
    // New signup starts clean from 0
    setCurrentUser(user);
    setSubjects(EMPTY_SUBJECTS);
    setStudyPlan(EMPTY_STUDY_PLAN);
    setProgress(EMPTY_PROGRESS);
    setIsAuthModalOpen(false);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    saveCurrentUser(null);
  };

  // Handler 1: Toggle task / session complete
  const handleToggleSessionComplete = (dayIdx: number, sessionId: string) => {
    if (!studyPlan || !studyPlan.days) return;

    const updatedDays = studyPlan.days.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;

      const updatedSessions = day.sessions.map((sess) => {
        if (sess.id === sessionId) {
          return { ...sess, completed: !sess.completed };
        }
        return sess;
      });

      return { ...day, sessions: updatedSessions };
    });

    const newPlan = { ...studyPlan, days: updatedDays };
    setStudyPlan(newPlan);

    // Update progress statistics
    if (dayIdx === 0) {
      const todaySessions = updatedDays[0]?.sessions || [];
      const completedCount = todaySessions.filter(s => s.completed).length;
      const totalCount = todaySessions.length;
      const percent = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

      const totalDoneMins = todaySessions.reduce((acc, s) => acc + (s.completed ? s.durationMinutes : 0), 0);

      setProgress((prev) => ({
        ...prev,
        todayProgressPercent: percent,
        todayCompletedTasks: completedCount,
        todayTotalTasks: totalCount,
        todayStudyMinutes: totalDoneMins,
        totalSessionsCompleted: prev.totalSessionsCompleted + (completedCount > prev.todayCompletedTasks ? 1 : 0)
      }));
    }
  };

  // Handler 2: Generate Study Plan (calls API)
  const handleGeneratePlanSubmit = async (formData: {
    subjects: Subject[];
    availableHoursPerDay: number;
    studyDays: string[];
    goal: LearningGoal;
    sessionLengthMinutes: number;
  }) => {
    setIsPlannerFormOpen(false);
    setIsGeneratingLoading(true);

    try {
      const response = await fetch('/api/gemini/generate-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      const data = await response.json();

      if (data.plan) {
        setPendingPlan(data.plan);
      }
    } catch (err) {
      console.error('Plan generation failed:', err);
    }
  };

  // Complete step loading state and display plan
  const handleLoadingComplete = () => {
    setIsGeneratingLoading(false);
    if (pendingPlan) {
      setStudyPlan(pendingPlan);
      setPendingPlan(null);
    }
    setActiveTab('planner');
  };

  // Handler 3: Adjust Plan (calls API)
  const handleAdjustPlanSubmit = async (adjustmentType: string, notes: string) => {
    setIsAdjusting(true);
    try {
      const response = await fetch('/api/gemini/adjust-plan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          plan: studyPlan,
          adjustmentType,
          userNotes: notes,
          subjects
        })
      });
      const data = await response.json();

      if (data.plan) {
        setStudyPlan(data.plan);
      }
    } catch (err) {
      console.error('Adjust plan failed:', err);
    } finally {
      setIsAdjusting(false);
      setIsAdjustModalOpen(false);
      setActiveTab('planner');
    }
  };

  // Handler 4: Add Subject
  const handleAddSubject = (newSubj: Subject) => {
    const updated = [...subjects, newSubj];
    setSubjects(updated);
  };

  // Handler 5: Update Subject
  const handleUpdateSubject = (updatedSubj: Subject) => {
    const updated = subjects.map(s => s.id === updatedSubj.id ? updatedSubj : s);
    setSubjects(updated);
  };

  // Handler 6: Delete Subject
  const handleDeleteSubject = (id: string) => {
    setSubjects(subjects.filter(s => s.id !== id));
  };

  // Handler 7: Log Focus Timer Minutes
  const handleLogStudyMinutes = (mins: number) => {
    setProgress((prev) => ({
      ...prev,
      totalStudyHours: Math.round((prev.totalStudyHours + mins / 60) * 10) / 10,
      totalSessionsCompleted: prev.totalSessionsCompleted + 1
    }));
  };

  // Handler 8: Send AI Chat Message
  const handleSendMessage = async (text: string) => {
    const userMsg: ChatMessage = {
      id: `msg-user-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setChatMessages((prev) => [...prev, userMsg]);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          subjects,
          currentPlan: studyPlan,
          progressStats: progress
        })
      });
      const data = await response.json();

      const aiMsg: ChatMessage = {
        id: `msg-ai-${Date.now()}`,
        sender: 'assistant',
        text: data.text || 'I am ready to help you optimize your study schedule!',
        visualAid: data.visualAid,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error('Chat error:', err);
    }
  };

  // Handler 9: Reset Demo Data
  const handleResetDemoData = () => {
    const reset = resetToDemoData(currentUser?.id);
    setSubjects(reset.subjects);
    setStudyPlan(reset.plan);
    setProgress(reset.progress);
    setChatMessages(reset.chat);
  };

  return (
    <div className="relative min-h-screen bg-[#030507] text-gray-100 flex flex-col md:flex-row font-sans selection:bg-[#0070F3] selection:text-white overflow-x-hidden">
      {/* Background ambient lighting per Elegant Dark theme */}
      <div className="fixed top-[-200px] right-[-200px] w-[600px] h-[600px] bg-[#0070F3] opacity-10 blur-[120px] rounded-full pointer-events-none z-0" />
      <div className="fixed bottom-[-100px] left-[100px] w-[400px] h-[400px] bg-[#0A1A2F] opacity-20 blur-[100px] rounded-full pointer-events-none z-0" />

      {/* Left Navigation Sidebar */}
      <Navigation
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        streakDays={progress.currentStreakDays}
        onOpenSettings={() => setIsSettingsOpen(true)}
        currentUser={currentUser}
        onOpenAuth={handleOpenAuth}
        onLogout={handleLogout}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 min-w-0 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCreateModal={() => setIsPlannerFormOpen(true)}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
        />

        <main className="flex-1 p-3 sm:p-8 max-w-7xl w-full mx-auto pb-24 sm:pb-8">
          {activeTab === 'landing' && (
            <LandingPage
              onStartPlanner={() => setIsPlannerFormOpen(true)}
              onExploreDemo={() => setActiveTab('dashboard')}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'dashboard' && (
            <Dashboard
              progress={progress}
              studyPlan={studyPlan}
              subjects={subjects}
              setActiveTab={setActiveTab}
              onToggleSessionComplete={handleToggleSessionComplete}
              onOpenCreateModal={() => setIsPlannerFormOpen(true)}
              onOpenAdjustModal={() => setIsAdjustModalOpen(true)}
            />
          )}

          {activeTab === 'planner' && (
            <PlanView
              studyPlan={studyPlan}
              onToggleSessionComplete={handleToggleSessionComplete}
              onOpenCreateModal={() => setIsPlannerFormOpen(true)}
              onOpenAdjustModal={() => setIsAdjustModalOpen(true)}
              setActiveTab={setActiveTab}
            />
          )}

          {activeTab === 'subjects' && (
            <SubjectsView
              subjects={subjects}
              onAddSubject={handleAddSubject}
              onUpdateSubject={handleUpdateSubject}
              onDeleteSubject={handleDeleteSubject}
            />
          )}

          {activeTab === 'tasks' && (
            <TodaysTasksView
              studyPlan={studyPlan}
              onToggleSessionComplete={handleToggleSessionComplete}
              setActiveTab={setActiveTab}
              onOpenCreateModal={() => setIsPlannerFormOpen(true)}
            />
          )}

          {activeTab === 'progress' && (
            <ProgressAnalyticsView
              progress={progress}
              subjects={subjects}
            />
          )}

          {activeTab === 'timer' && (
            <FocusTimerView
              onLogStudyMinutes={handleLogStudyMinutes}
            />
          )}

          {activeTab === 'assistant' && (
            <AIAssistantView
              messages={chatMessages}
              onSendMessage={handleSendMessage}
              subjects={subjects}
              studyPlan={studyPlan}
              progress={progress}
            />
          )}
        </main>
      </div>

      {/* Modals */}
      <PlannerFormModal
        isOpen={isPlannerFormOpen}
        onClose={() => setIsPlannerFormOpen(false)}
        subjects={subjects}
        onGeneratePlan={handleGeneratePlanSubmit}
      />

      <GenerationLoadingModal
        isOpen={isGeneratingLoading}
        onComplete={handleLoadingComplete}
      />

      <AdaptivePlanModal
        isOpen={isAdjustModalOpen}
        onClose={() => setIsAdjustModalOpen(false)}
        onAdjustPlan={handleAdjustPlanSubmit}
        isAdjusting={isAdjusting}
      />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        onResetDemoData={handleResetDemoData}
      />

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
        onLogin={(user, isNewAccount) => {
          if (isNewAccount) {
            handleSignupSuccess(user);
          } else {
            handleLoginSuccess(user);
          }
        }}
      />
    </div>
  );
}
