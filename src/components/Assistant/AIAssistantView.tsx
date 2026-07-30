import React, { useState, useRef, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import { ChatMessage, Subject, StudyPlan, ProgressStats } from '../../types';
import { ChatVisualAid } from './ChatVisualAid';
import { Bot, Send, User, Loader2, BarChart2, Scale, Dna, Binary, GitFork, Sparkles, RefreshCw } from 'lucide-react';

interface AIAssistantViewProps {
  messages: ChatMessage[];
  onSendMessage: (text: string) => Promise<void>;
  subjects: Subject[];
  studyPlan: StudyPlan;
  progress: ProgressStats;
}

export const AIAssistantView: React.FC<AIAssistantViewProps> = ({
  messages,
  onSendMessage,
  subjects,
}) => {
  const [input, setInput] = useState('');
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    { label: '📐 Formula Sheet', icon: <Binary className="w-3.5 h-3.5 text-emerald-400" />, prompt: 'Generate a high-yield Mathematics & Physics formula sheet for my exams.' },
    { label: '🔄 Concept Diagram', icon: <GitFork className="w-3.5 h-3.5 text-purple-400" />, prompt: 'Can you generate a concept diagram for the memory consolidation study cycle?' },
    { label: '📊 Respiration Chart', icon: <Dna className="w-3.5 h-3.5 text-[#00A3FF]" />, prompt: 'Can you show me a chart comparing ATP yield in Cellular Respiration?' },
    { label: '⚖️ Law Table', icon: <Scale className="w-3.5 h-3.5 text-amber-400" />, prompt: 'Show me a table of key Constitutional & Contract law doctrines.' },
    { label: '📈 Topic Mastery', icon: <BarChart2 className="w-3.5 h-3.5 text-[#0070F3]" />, prompt: 'Can you generate a graph of my estimated topic mastery distribution?' }
  ];

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

  const handleChipClick = async (chipPrompt: string) => {
    if (isSending) return;
    setIsSending(true);
    await onSendMessage(chipPrompt);
    setIsSending(false);
  };

  return (
    <div className="w-full max-w-4xl mx-auto flex flex-col h-[calc(100vh-160px)] sm:h-[620px]">
      {/* Top Bar / Header */}
      <div className="bg-[#080B12] border border-white/10 rounded-t-2xl p-3 sm:p-4 flex items-center justify-between gap-3 shrink-0 shadow-md">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#0070F3] to-cyan-500 text-white flex items-center justify-center shrink-0 shadow-[0_0_12px_rgba(0,112,243,0.4)]">
            <Bot className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold text-white tracking-tight leading-none flex items-center gap-1.5">
              <span>AI Academic Assistant</span>
              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Live
              </span>
            </h2>
            <p className="text-[11px] text-gray-400 truncate mt-0.5">
              Ask questions or request formula sheets, diagrams, charts & tables.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <span className="hidden sm:inline-flex px-2.5 py-1 rounded-lg bg-[#0070F3]/10 border border-[#0070F3]/20 text-[#0070F3] text-xs font-mono font-semibold">
            {subjects.length} Subjects Active
          </span>
        </div>
      </div>

      {/* Quick Prompt Suggestion Bar */}
      <div className="bg-[#050810] border-x border-b border-white/10 px-2.5 py-2 flex items-center gap-1.5 overflow-x-auto scrollbar-none shrink-0 snap-x">
        <span className="text-[10px] text-gray-400 font-mono font-bold uppercase tracking-wider shrink-0 mr-1 flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-[#0070F3]" />
          Quick Prompts:
        </span>
        {suggestionChips.map((chip, idx) => (
          <button
            key={idx}
            onClick={() => handleChipClick(chip.prompt)}
            disabled={isSending}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[#0E1320] hover:bg-[#151D30] border border-white/10 text-[11px] text-gray-200 hover:text-white hover:border-[#0070F3]/40 transition-all shrink-0 disabled:opacity-50 snap-start"
          >
            {chip.icon}
            <span className="font-medium whitespace-nowrap">{chip.label}</span>
          </button>
        ))}
      </div>

      {/* Main Messages Log */}
      <div className="bg-[#030509] border-x border-white/10 flex-1 overflow-y-auto p-3 sm:p-4 space-y-3.5 scrollbar-thin">
        {messages.map((msg) => {
          const isUser = msg.sender === 'user';
          return (
            <div
              key={msg.id}
              className={`flex items-start gap-2 sm:gap-3 ${isUser ? 'flex-row-reverse' : ''}`}
            >
              <div className={`w-7 h-7 sm:w-8 sm:h-8 rounded-xl flex items-center justify-center shrink-0 mt-0.5 ${
                isUser ? 'bg-[#0070F3] text-white shadow-[0_0_12px_rgba(0,112,243,0.4)]' : 'bg-[#0E1320] border border-white/10 text-[#0070F3]'
              }`}>
                {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
              </div>

              <div className={`max-w-[85%] sm:max-w-[78%] p-3 sm:p-4 rounded-2xl text-xs sm:text-sm leading-relaxed break-words overflow-hidden ${
                isUser
                  ? 'bg-[#0070F3] text-white rounded-tr-xs font-medium shadow-md ml-auto'
                  : 'bg-[#0A0E1A] border border-blue-900/30 text-gray-200 rounded-tl-xs space-y-2 shadow-sm'
              }`}>
                {isUser ? (
                  <div className="whitespace-pre-wrap">{msg.text}</div>
                ) : (
                  <div className="space-y-2">
                    <ReactMarkdown
                      components={{
                        h1: ({ children }) => <h3 className="text-sm sm:text-base font-bold text-white mt-1 mb-1 border-b border-white/10 pb-1">{children}</h3>,
                        h2: ({ children }) => <h4 className="text-xs sm:text-sm font-bold text-cyan-300 mt-1 mb-0.5">{children}</h4>,
                        h3: ({ children }) => <h5 className="text-xs sm:text-sm font-bold text-[#0070F3] mt-1 mb-0.5">{children}</h5>,
                        p: ({ children }) => <p className="text-gray-300 text-xs sm:text-sm mb-1.5 leading-relaxed">{children}</p>,
                        ul: ({ children }) => <ul className="list-disc pl-4 space-y-1 text-gray-300 text-xs sm:text-sm">{children}</ul>,
                        ol: ({ children }) => <ol className="list-decimal pl-4 space-y-1 text-gray-300 text-xs sm:text-sm">{children}</ol>,
                        strong: ({ children }) => <strong className="text-white font-semibold">{children}</strong>,
                        code: ({ children }) => <code className="px-1.5 py-0.5 rounded bg-blue-950/60 text-cyan-300 font-mono text-[11px] border border-blue-500/20">{children}</code>,
                        pre: ({ children }) => <pre className="p-2.5 rounded-xl bg-[#05080E] border border-white/10 font-mono text-xs text-cyan-300 overflow-x-auto my-1.5">{children}</pre>
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>

                    {/* Render Visual Aid Payload */}
                    {msg.visualAid && (
                      <ChatVisualAid visualAid={msg.visualAid} />
                    )}
                  </div>
                )}

                <span className="block text-[9px] sm:text-[10px] text-gray-500 mt-1 text-right font-mono opacity-80">
                  {msg.timestamp}
                </span>
              </div>
            </div>
          );
        })}

        {isSending && (
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-[#0E1320] border border-white/10 text-[#0070F3] flex items-center justify-center shrink-0">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div className="px-3.5 py-2.5 rounded-2xl bg-[#0A0E1A] border border-blue-900/30 text-xs text-cyan-400 flex items-center gap-2 font-medium">
              <Loader2 className="w-3.5 h-3.5 animate-spin text-[#0070F3]" />
              <span>Analyzing academic concepts & constructing response...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Bottom Sticky Input Form */}
      <form onSubmit={handleSubmit} className="bg-[#080B12] border-x border-b border-white/10 rounded-b-2xl p-2.5 sm:p-3 flex items-center gap-2 shrink-0 shadow-lg">
        <input
          type="text"
          placeholder="Ask a question or request a formula sheet, diagram, chart..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isSending}
          className="flex-1 min-w-0 px-3.5 py-2.5 sm:py-3 rounded-xl bg-[#030509] border border-white/10 text-xs sm:text-sm text-white placeholder-gray-500 focus:outline-none focus:border-[#0070F3] transition-all"
        />
        <button
          type="submit"
          disabled={!input.trim() || isSending}
          className="w-10 h-10 rounded-xl bg-[#0070F3] hover:bg-[#0070F3]/90 active:scale-95 text-white font-bold shadow-[0_0_15px_rgba(0,112,243,0.4)] transition-all disabled:opacity-40 shrink-0 flex items-center justify-center"
        >
          <Send className="w-4 h-4" />
        </button>
      </form>
    </div>
  );
};
