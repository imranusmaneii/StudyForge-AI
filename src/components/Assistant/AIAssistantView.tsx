import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Subject, StudyPlan, ProgressStats } from '../../types';
import { ChatVisualAid } from './ChatVisualAid';
import { ChatInteractivePlanBuilder } from './ChatInteractivePlanBuilder';
import { Send, User, Loader2, BookOpen } from 'lucide-react';
import alexAvatar from '../../assets/images/alex_avatar_1785976615133.jpg';

interface AIAssistantViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  subjects: Subject[];
  studyPlan: StudyPlan;
  progress: ProgressStats;
  onSavePlan?: (newPlan: StudyPlan, updatedSubjects: Subject[]) => void;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  messages,
  onSendMessage,
  subjects,
  studyPlan,
  onSavePlan,
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isSending]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isSending) return;

    const userText = input.trim();
    setInput('');
    setIsSending(true);
    await onSendMessage(userText);
    setIsSending(false);
  };

  return (
    <div className="w-full max-w-7xl mx-auto flex flex-col h-[calc(100vh-100px)] min-h-[720px] p-2 sm:p-4 lg:p-6">
      {/* Expanded Chat Box Card Container */}
      <div className="flex-1 flex flex-col rounded-2xl border border-white/10 bg-[#060912] shadow-2xl overflow-hidden">
        {/* Top Header */}
        <div className="bg-[#080D18] border-b border-white/10 p-4 sm:p-5 flex items-center justify-between gap-4 shrink-0 shadow-md">
          <div className="flex items-center gap-3.5 min-w-0">
            <div className="relative w-11 h-11 rounded-full border-2 border-[#0070F3] shadow-[0_0_15px_rgba(0,112,243,0.5)] overflow-hidden shrink-0">
              <img
                src={alexAvatar}
                alt="Alex"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            </div>
            <div className="min-w-0">
              <h2 className="text-base sm:text-lg font-extrabold text-white tracking-tight leading-none flex items-center gap-2">
                <span>Alex</span>
                <span className="text-gray-400 text-xs sm:text-sm font-normal hidden sm:inline">— AI Study Companion & Tutor</span>
                <span className="inline-flex items-center gap-1.5 text-[11px] px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  Online
                </span>
              </h2>
              <p className="text-xs text-gray-400 truncate mt-1">
                Ask anything: concept diagrams, video lectures, step-by-step problem breakdowns, and revision notes.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0070F3]/10 border border-[#0070F3]/20 text-[#0070F3] text-xs font-mono font-semibold">
              <BookOpen className="w-3.5 h-3.5" />
              <span>{subjects.length} Subjects Active</span>
            </span>
          </div>
        </div>

        {/* Messages Log (Expanded & Roomy) */}
        <div className="bg-[#03060C] flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 space-y-4 scrollbar-thin">
          {messages.map((msg) => {
            const isUser = msg.sender === 'user';
            return (
              <div
                key={msg.id}
                className={`flex items-start gap-3 sm:gap-4 ${isUser ? 'flex-row-reverse' : ''}`}
              >
                <div className={`w-9 h-9 rounded-full overflow-hidden flex items-center justify-center shrink-0 mt-0.5 border ${
                  isUser ? 'bg-[#0070F3] text-white border-[#0070F3] shadow-[0_0_12px_rgba(0,112,243,0.4)]' : 'border-[#0070F3]/50 bg-[#0E1320]'
                }`}>
                  {isUser ? (
                    <User className="w-4 h-4" />
                  ) : (
                    <img
                      src={alexAvatar}
                      alt="Alex"
                      className="w-full h-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  )}
                </div>

                <div className={`max-w-[92%] sm:max-w-[85%] md:max-w-[80%] p-4 sm:p-5 rounded-2xl text-sm leading-relaxed break-words overflow-hidden ${
                  isUser
                    ? 'bg-[#0070F3] text-white rounded-tr-xs font-medium shadow-md ml-auto'
                    : 'bg-[#0B101D] border border-blue-900/30 text-gray-200 rounded-tl-xs space-y-2.5 shadow-sm'
                }`}>
                  {isUser ? (
                    <div className="whitespace-pre-wrap text-sm sm:text-base">{msg.text}</div>
                  ) : (
                    <div className="space-y-2.5">
                      <ReactMarkdown
                        components={{
                          h1: ({ children }) => <h3 className="text-base sm:text-lg font-bold text-white mt-1 mb-1 border-b border-white/10 pb-1">{children}</h3>,
                          h2: ({ children }) => <h4 className="text-sm sm:text-base font-bold text-cyan-300 mt-1 mb-0.5">{children}</h4>,
                          h3: ({ children }) => <h5 className="text-sm font-bold text-[#0070F3] mt-1 mb-0.5">{children}</h5>,
                          p: ({ children }) => <p className="text-gray-300 text-sm mb-1.5 leading-relaxed">{children}</p>,
                          ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 text-gray-300 text-sm">{children}</ul>,
                          ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 text-gray-300 text-sm">{children}</ol>,
                          strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                          code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-blue-950/60 text-cyan-300 font-mono text-xs border border-blue-500/20">{children}</code>,
                          pre: ({ children }) => <pre className="p-3 rounded-xl bg-[#05080E] border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto my-2">{children}</pre>,
                          a: ({ href, children }) => (
                            <a
                              href={href}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 my-1 rounded-xl bg-red-600/20 hover:bg-red-600/30 text-red-400 hover:text-red-300 border border-red-500/30 text-xs font-semibold transition-all shadow-sm"
                            >
                              <span>{children}</span>
                            </a>
                          )
                        }}
                      >
                        {msg.text}
                      </ReactMarkdown>

                      {/* Render Interactive Study Plan Builder */}
                      {msg.interactivePlanBuilder && (
                        <ChatInteractivePlanBuilder
                          initialSubjects={subjects}
                          initialPlan={studyPlan}
                          onSavePlan={(newPlan, updatedSubjs) => {
                            if (onSavePlan) {
                              onSavePlan(newPlan, updatedSubjs);
                            }
                          }}
                        />
                      )}

                      {/* Render Visual Aid Payload */}
                      {msg.visualAid && (
                        <ChatVisualAid visualAid={msg.visualAid} />
                      )}
                    </div>
                  )}

                  <span className="block text-[10px] text-gray-500 mt-1.5 text-right font-mono opacity-80">
                    {msg.timestamp}
                  </span>
                </div>
              </div>
            );
          })}

          {isSending && (
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full overflow-hidden border border-[#0070F3]/50 shrink-0">
                <img
                  src={alexAvatar}
                  alt="Alex"
                  className="w-full h-full object-cover"
                  referrerPolicy="no-referrer"
                />
              </div>
              <div className="px-4 py-3 rounded-2xl bg-[#0B101D] border border-blue-900/30 text-xs sm:text-sm text-cyan-400 flex items-center gap-2.5 font-medium shadow-md">
                <Loader2 className="w-4 h-4 animate-spin text-[#0070F3]" />
                <span>Alex is analyzing your question & crafting detailed concept materials...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Form at Bottom */}
        <form onSubmit={handleSubmit} className="bg-[#080D18] border-t border-white/10 p-3 sm:p-4 flex items-center gap-3 shrink-0 shadow-lg">
          <input
            type="text"
            placeholder="Ask Alex a question, request a concept diagram, formula breakdown, or study advice..."
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isSending}
            className="flex-1 min-w-0 px-4 py-3 sm:py-3.5 rounded-xl bg-[#03060C] border border-white/10 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0070F3] transition-all"
          />
          <button
            type="submit"
            disabled={!input.trim() || isSending}
            className="px-4 sm:px-6 h-12 rounded-xl bg-[#0070F3] hover:bg-[#0070F3]/90 active:scale-95 text-white font-bold shadow-[0_0_15px_rgba(0,112,243,0.4)] transition-all disabled:opacity-40 shrink-0 flex items-center justify-center gap-2 text-sm"
          >
            <Send className="w-4 h-4" />
            <span className="hidden sm:inline">Send</span>
          </button>
        </form>
      </div>
    </div>
  );
};
