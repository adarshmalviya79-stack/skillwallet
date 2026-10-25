import React, { useState, useRef, useEffect } from 'react';
import {
  MessageSquareText,
  Send,
  Sparkles,
  Bot,
  User,
  HardHat,
  RotateCcw,
  Info,
  Lightbulb
} from 'lucide-react';
import { apiClient } from '../api/client';

const SUGGESTED_PROMPTS = [
  "How long before stripping formwork for standard suspended concrete slabs?",
  "What are OSHA requirements for trenching deeper than 5 feet?",
  "Maximum acceptable moisture content in drywall before primer and paint?",
  "Generate a 5-minute morning tailgate safety briefing for framing crew.",
  "What is the difference between Grade 60 and Grade 75 rebar?"
];

export default function SiteAssistant() {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Hello! I am your AI Construction Site & Engineering Assistant. Ask me anything regarding ACI concrete specifications, OSHA safety protocols, project sequencing, or material standards."
    }
  ]);
  const [input, setInput] = useState('');
  const [projectContext, setProjectContext] = useState('');
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState(SUGGESTED_PROMPTS);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const handleSend = async (userText = null) => {
    const textToSend = userText || input;
    if (!textToSend.trim() || loading) return;

    const newMessages = [...messages, { role: 'user', content: textToSend }];
    setMessages(newMessages);
    if (!userText) setInput('');
    setLoading(true);

    try {
      const res = await apiClient.chatWithAssistant(
        textToSend,
        newMessages.slice(-6),
        projectContext.trim() || null
      );

      if (res.success && res.data) {
        setMessages(prev => [
          ...prev,
          { role: 'assistant', content: res.data.reply }
        ]);
        if (res.data.suggestions && res.data.suggestions.length > 0) {
          setSuggestions(res.data.suggestions);
        }
      } else {
        throw new Error(res.error || 'Failed to get assistant response');
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: `⚠️ Error contacting site intelligence service: ${err.message}. Please check your connection or GEMINI_API_KEY.`
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleResetChat = () => {
    setMessages([
      {
        role: 'assistant',
        content: "Chat reset. How can I help with your current site operations or engineering specifications today?"
      }
    ]);
    setSuggestions(SUGGESTED_PROMPTS);
  };

  return (
    <div className="space-y-4 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-slate-200 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <div className="rounded-xl bg-blue-100 p-2 text-blue-700">
              <MessageSquareText className="h-5 w-5" />
            </div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">
              Daily Site & Engineering Assistant
            </h2>
          </div>
          <p className="mt-1 text-xs text-slate-500">
            AI-powered construction guidance on building codes, concrete curing, OSHA standards, and daily logs.
          </p>
        </div>

        <button
          onClick={handleResetChat}
          className="inline-flex items-center gap-1.5 rounded-xl border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 self-start sm:self-auto"
        >
          <RotateCcw className="h-3.5 w-3.5" />
          <span>Clear Chat</span>
        </button>
      </div>

      {/* Context Accordion / Input */}
      <div className="rounded-2xl border border-slate-200 bg-white p-3 shadow-xs">
        <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center gap-1">
          <HardHat className="h-3.5 w-3.5 text-blue-600" />
          <span>Active Site / Project Context (Optional)</span>
        </label>
        <input
          type="text"
          value={projectContext}
          onChange={(e) => setProjectContext(e.target.value)}
          placeholder="e.g. Skyline Highrise Level 8, Post-tension slab pour, C30 concrete, 40°F weather..."
          className="w-full rounded-xl border border-slate-200 px-3 py-1.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none"
        />
      </div>

      {/* Chat Display Box */}
      <div className="flex flex-col h-[520px] rounded-2xl border border-slate-200 bg-white shadow-xs overflow-hidden">
        {/* Messages Scroll Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4 bg-slate-50/50">
          {messages.map((msg, index) => {
            const isUser = msg.role === 'user';
            return (
              <div
                key={index}
                className={`flex gap-3 ${isUser ? 'justify-end' : 'justify-start'}`}
              >
                {!isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white shadow-xs">
                    <Bot className="h-4 w-4" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-4 text-xs leading-relaxed shadow-xs ${
                    isUser
                      ? 'bg-blue-600 text-white rounded-br-none'
                      : 'bg-white border border-slate-200 text-slate-800 rounded-bl-none'
                  }`}
                >
                  <div className="whitespace-pre-wrap">{msg.content}</div>
                </div>

                {isUser && (
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-slate-800 text-white shadow-xs">
                    <User className="h-4 w-4" />
                  </div>
                )}
              </div>
            );
          })}

          {loading && (
            <div className="flex gap-3 justify-start">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl bg-blue-600 text-white">
                <Bot className="h-4 w-4" />
              </div>
              <div className="rounded-2xl rounded-bl-none border border-slate-200 bg-white p-3.5 shadow-xs">
                <div className="flex items-center gap-1.5 text-xs text-slate-500">
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.3s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500 [animation-delay:-0.15s]" />
                  <div className="h-2 w-2 animate-bounce rounded-full bg-blue-500" />
                  <span className="ml-2 font-medium">Assistant thinking...</span>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Suggestion Chips */}
        <div className="border-t border-slate-100 bg-white p-3 overflow-x-auto">
          <div className="flex items-center gap-2 text-xs">
            <span className="flex items-center gap-1 font-bold text-slate-500 shrink-0 text-[11px]">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              Suggested:
            </span>
            <div className="flex items-center gap-1.5 flex-nowrap">
              {suggestions.slice(0, 3).map((prompt, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[11px] font-medium text-slate-700 hover:border-blue-400 hover:bg-blue-50 transition-colors whitespace-nowrap"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Input Bar */}
        <div className="border-t border-slate-200 bg-white p-3 sm:p-4">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a technical question about materials, codes, concrete, or site safety..."
              className="flex-1 rounded-xl border border-slate-300 px-4 py-2.5 text-xs text-slate-900 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className={`flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold text-white shadow-sm transition-all ${
                loading || !input.trim()
                  ? 'bg-slate-300 cursor-not-allowed text-slate-500'
                  : 'bg-blue-600 hover:bg-blue-500'
              }`}
            >
              <Send className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">Send</span>
            </button>
          </form>
          <p className="mt-1.5 text-center text-[10px] text-slate-400">
            For decision support only. Confirm engineering calculations and local code compliance with the engineer of record.
          </p>
        </div>
      </div>
    </div>
  );
}
