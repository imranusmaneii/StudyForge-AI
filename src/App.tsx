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
import { updateSessionTimeAndResequence, resequenceDaySessions } from './lib/timeUtils';
import {
  auth,
  onAuthStateChanged,
  logoutFirebase,
  getUserStudyData,
  saveUserStudyData,
  mapFirebaseUser
} from './lib/firebase';

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
import { ToastContainer, ToastMessage } from './components/Toast';

export default function App() {
  // Default initial active tab: 'landing' (Overview) if logged out, or 'dashboard' if logged in
  const [currentUser, setCurrentUser] = useState<User | null>(() => loadCurrentUser());
  const [activeTab, setActiveTabState] = useState<ActiveTab>(() => currentUser ? 'dashboard' : 'landing');

  // Smart tab switcher enforcing login for all tabs except 'landing' (Overview)
  const setActiveTab = (tab: ActiveTab) => {
    if (!currentUser && tab !== 'landing') {
      handleOpenAuth('login');
      return;
    }
    setActiveTabState(tab);
  };

  const handleOpenCreateModal = () => {
    if (!currentUser) {
      handleOpenAuth('login');
      return;
    }
    setIsPlannerFormOpen(true);
  };

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
  const [isHamburgerOpen, setIsHamburgerOpen] = useState(false);

  // Temporary container for newly generated plan during step animation
  const [pendingPlan, setPendingPlan] = useState<StudyPlan | null>(null);

  // Toast System
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const addToast = (text: string, type: 'success' | 'info' | 'warning' = 'success') => {
    const newToast: ToastMessage = { id: `toast-${Date.now()}-${Math.random()}`, text, type };
    setToasts((prev) => [...prev.slice(-3), newToast]);
  };

  const handleDismissToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Firebase Auth State Listener
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (fbUser) => {
      if (fbUser) {
        const user = mapFirebaseUser(fbUser);
        setCurrentUser(user);
        saveCurrentUser(user);

        // Fetch user data from Firestore
        const remoteData = await getUserStudyData(user.id);
        if (remoteData) {
          if (remoteData.subjects) setSubjects(remoteData.subjects);
          if (remoteData.studyPlan) setStudyPlan(remoteData.studyPlan);
          if (remoteData.progress) setProgress(remoteData.progress);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sync state when user changes
  useEffect(() => {
    saveCurrentUser(currentUser);
    setSubjects(loadSubjects(currentUser?.id));
    setStudyPlan(loadStudyPlan(currentUser?.id));
    setProgress(loadProgress(currentUser?.id));
    setChatMessages(loadChatMessages(currentUser?.id));
  }, [currentUser?.id]);

  // Save changes to per-user local storage and Firestore
  useEffect(() => {
    saveSubjects(subjects, currentUser?.id);
    if (currentUser?.id) {
      saveUserStudyData(currentUser.id, { subjects });
    }
  }, [subjects, currentUser?.id]);

  useEffect(() => {
    saveStudyPlan(studyPlan, currentUser?.id);
    if (currentUser?.id) {
      saveUserStudyData(currentUser.id, { studyPlan });
    }
  }, [studyPlan, currentUser?.id]);

  useEffect(() => {
    saveProgress(progress, currentUser?.id);
    if (currentUser?.id) {
      saveUserStudyData(currentUser.id, { progress });
    }
  }, [progress, currentUser?.id]);

  useEffect(() => {
    saveChatMessages(chatMessages, currentUser?.id);
  }, [chatMessages, currentUser?.id]);

  // Auth Action Handlers
  const handleOpenAuth = (mode: AuthModalMode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  const handleLoginSuccess = async (user: User) => {
    setCurrentUser(user);
    setActiveTabState('dashboard');
    setIsAuthModalOpen(false);
    addToast(`Welcome back, ${user.name}!`, 'success');

    // Fetch user cloud data
    const remoteData = await getUserStudyData(user.id);
    if (remoteData) {
      setSubjects(remoteData.subjects || EMPTY_SUBJECTS);
      setStudyPlan(remoteData.studyPlan || EMPTY_STUDY_PLAN);
      setProgress(remoteData.progress || EMPTY_PROGRESS);
    }
  };

  const handleSignupSuccess = (user: User) => {
    // New signup starts clean from 0
    setCurrentUser(user);
    setSubjects(EMPTY_SUBJECTS);
    setStudyPlan(EMPTY_STUDY_PLAN);
    setProgress(EMPTY_PROGRESS);
    setActiveTabState('dashboard');
    setIsAuthModalOpen(false);
    addToast(`Welcome to StudyForge AI, ${user.name}!`, 'success');
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn('Firebase logout error:', e);
    }
    setCurrentUser(null);
    saveCurrentUser(null);
    setSubjects(EMPTY_SUBJECTS);
    setStudyPlan(EMPTY_STUDY_PLAN);
    setProgress(EMPTY_PROGRESS);
    setActiveTabState('landing');
    addToast('Signed out successfully.', 'info');
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

  // Handler 1.5: Update Session Time directly & re-sequence subsequent sessions
  const handleUpdateSessionTime = (dayIdx: number, sessionId: string, newStartTime: string, newDurationMins?: number) => {
    if (!studyPlan || !studyPlan.days) return;

    const updatedDays = studyPlan.days.map((day, dIdx) => {
      if (dIdx !== dayIdx) return day;
      const resequencedSessions = updateSessionTimeAndResequence(
        day.sessions,
        sessionId,
        newStartTime,
        newDurationMins
      );
      return { ...day, sessions: resequencedSessions };
    });

    setStudyPlan({ ...studyPlan, days: updatedDays });
  };

  // Handler 2: Generate Study Plan (calls API)
  const handleGeneratePlanSubmit = async (formData: {
    subjects: Subject[];
    availableHoursPerDay: number;
    studyDays: string[];
    goal: LearningGoal;
    sessionLengthMinutes: number;
    preferredStartTime?: string;
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

      if (data && data.plan) {
        setStudyPlan(data.plan);
      } else {
        const startHStr = formData.preferredStartTime || '09:00';
        const fallbackPlan: StudyPlan = {
          id: `plan-fb-${Date.now()}`,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          goal: formData.goal || 'high_grades',
          sessionLengthMinutes: formData.sessionLengthMinutes || 45,
          availableHoursPerDay: formData.availableHoursPerDay || 4,
          studyDays: formData.studyDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
          days: [
            {
              dayName: 'Today (Day 1)',
              dateString: new Date().toISOString().split('T')[0],
              totalMinutes: (formData.subjects || []).length * (formData.sessionLengthMinutes || 45),
              sessions: resequenceDaySessions((formData.subjects || []).map((sub, idx) => ({
                id: `s-fb-${idx}`,
                dayIndex: 0,
                subjectId: sub.id,
                subjectName: sub.name,
                subjectColor: sub.color || '#3b82f6',
                topic: `Core concepts & practice in ${sub.name}`,
                durationMinutes: formData.sessionLengthMinutes || 45,
                priority: sub.priority || 'medium',
                type: 'learning',
                completed: false,
                notes: 'Focus on primary formulas and problem solving.'
              })), startHStr)
            }
          ],
          aiReasoning: 'Generated intelligent study plan optimized for your selected subjects and time constraints.'
        };
        setStudyPlan(fallbackPlan);
      }
    } catch (err) {
      console.error('Plan generation failed:', err);
      const startHStr = formData.preferredStartTime || '09:00';
      const fallbackPlan: StudyPlan = {
        id: `plan-fb-err-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        goal: formData.goal || 'high_grades',
        sessionLengthMinutes: formData.sessionLengthMinutes || 45,
        availableHoursPerDay: formData.availableHoursPerDay || 4,
        studyDays: formData.studyDays || ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'],
        days: [
          {
            dayName: 'Today (Day 1)',
            dateString: new Date().toISOString().split('T')[0],
            totalMinutes: (formData.subjects || []).length * (formData.sessionLengthMinutes || 45),
            sessions: resequenceDaySessions((formData.subjects || []).map((sub, idx) => ({
              id: `s-fb-${idx}`,
              dayIndex: 0,
              subjectId: sub.id,
              subjectName: sub.name,
              subjectColor: sub.color || '#3b82f6',
              topic: `Core concepts & practice in ${sub.name}`,
              durationMinutes: formData.sessionLengthMinutes || 45,
              priority: sub.priority || 'medium',
              type: 'learning',
              completed: false,
              notes: 'Focus on primary formulas and problem solving.'
            })), startHStr)
          }
        ],
        aiReasoning: 'Generated offline fallback study plan based on your selected subjects.'
      };
      setStudyPlan(fallbackPlan);
    } finally {
      setIsGeneratingLoading(false);
      setActiveTab('planner');
    }
  };

  // Complete step loading state and display plan
  const handleLoadingComplete = () => {
    setIsGeneratingLoading(false);
    setActiveTab('planner');
    addToast('Your AI Study Plan has been created and loaded!', 'success');
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
        addToast('Study plan adjusted successfully!', 'success');
      }
    } catch (err) {
      console.error('Adjust plan failed:', err);
      addToast('Could not adjust plan. Try again.', 'warning');
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
    addToast(`Added subject "${newSubj.name}"!`, 'success');
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
    <div className="relative min-h-screen bg-[#030507] text-gray-100 flex flex-col font-sans selection:bg-[#0070F3] selection:text-white overflow-x-hidden">
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
        isHamburgerOpen={isHamburgerOpen}
        onCloseHamburger={() => setIsHamburgerOpen(false)}
      />

      {/* Main Content Area */}
      <div className="relative z-10 flex-1 min-w-0 flex flex-col min-h-screen">
        <Header
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          onOpenCreateModal={handleOpenCreateModal}
          currentUser={currentUser}
          onOpenAuth={handleOpenAuth}
          onLogout={handleLogout}
          isHamburgerOpen={isHamburgerOpen}
          onToggleHamburger={() => setIsHamburgerOpen((prev) => !prev)}
        />

        <main className="flex-1 p-3 sm:p-8 max-w-7xl w-full mx-auto pb-24 sm:pb-8">
          {activeTab === 'landing' && (
            <LandingPage
              onStartPlanner={handleOpenCreateModal}
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
              currentUser={currentUser}
            />
          )}

          {activeTab === 'planner' && (
            <PlanView
              studyPlan={studyPlan}
              onToggleSessionComplete={handleToggleSessionComplete}
              onOpenCreateModal={() => setIsPlannerFormOpen(true)}
              onOpenAdjustModal={() => setIsAdjustModalOpen(true)}
              setActiveTab={setActiveTab}
              onUpdateSessionTime={handleUpdateSessionTime}
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

      {/* Floating User Feedback Toast System */}
      <ToastContainer toasts={toasts} onDismiss={handleDismissToast} />
    </div>
  );
}
