import { useState, useRef, useEffect } from "react";
import { useApp } from "../../context/AppContext";
import {
  Sparkles,
  Send,
  X,
  Minimize2,
  Maximize2,
  Bot,
  RotateCcw,
  Copy,
  Check,
  Zap,
  User,
  ChevronRight
} from "lucide-react";

// Formats message content with markdown-like parsing (bold, italic, bullets, numbered lists, inline code)
const FormattedMessage = ({ content }) => {
  if (!content) return null;

  const lines = content.split("\n");

  return (
    <div className="space-y-1.5 text-sm leading-relaxed font-sans">
      {lines.map((line, lineIdx) => {
        let text = line.trim();
        const isBullet = text.startsWith("- ") || text.startsWith("* ") || text.startsWith("• ");
        const isNumbered = /^\d+\.\s/.test(text);

        if (isBullet) {
          text = text.replace(/^[\-\*•]\s+/, "");
        } else if (isNumbered) {
          text = text.replace(/^\d+\.\s+/, "");
        }

        // Tokenize formatting: bold (**), italic (*), code (`)
        const tokens = [];
        // Regex matches: `code`, **bold**, *italic*
        const tokenRegex = /(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g;
        let lastIndex = 0;
        let match;

        while ((match = tokenRegex.exec(text)) !== null) {
          if (match.index > lastIndex) {
            tokens.push(text.slice(lastIndex, match.index));
          }
          const matched = match[0];
          if (matched.startsWith("`") && matched.endsWith("`")) {
            tokens.push(
              <code
                key={`${lineIdx}-${match.index}`}
                className="px-1.5 py-0.5 rounded bg-black/40 text-teal-200 font-mono text-xs border border-white/10"
              >
                {matched.slice(1, -1)}
              </code>
            );
          } else if (matched.startsWith("**") && matched.endsWith("**")) {
            tokens.push(
              <strong
                key={`${lineIdx}-${match.index}`}
                className="font-bold text-[#38B2AC]"
              >
                {matched.slice(2, -2)}
              </strong>
            );
          } else if (matched.startsWith("*") && matched.endsWith("*")) {
            tokens.push(
              <em
                key={`${lineIdx}-${match.index}`}
                className="italic text-teal-100/90 font-medium"
              >
                {matched.slice(1, -1)}
              </em>
            );
          }
          lastIndex = match.index + matched.length;
        }

        if (lastIndex < text.length) {
          tokens.push(text.slice(lastIndex));
        }

        if (isBullet) {
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-0.5">
              <span className="w-1.5 h-1.5 rounded-full bg-[#38B2AC] mt-2 shrink-0 shadow-xs shadow-[#38B2AC]" />
              <div className="flex-1 text-[#E2E8F0]">
                {tokens.length > 0 ? tokens : text}
              </div>
            </div>
          );
        }

        if (isNumbered) {
          const numMatch = line.trim().match(/^(\d+)\./);
          const num = numMatch ? numMatch[1] : "1";
          return (
            <div key={lineIdx} className="flex items-start gap-2.5 my-1 pl-0.5">
              <span className="text-[11px] font-mono font-bold text-[#38B2AC] mt-0.5 shrink-0 bg-[#38B2AC]/10 px-1.5 py-0.5 rounded border border-[#38B2AC]/30">
                {num}
              </span>
              <div className="flex-1 text-[#E2E8F0]">
                {tokens.length > 0 ? tokens : text}
              </div>
            </div>
          );
        }

        if (!text) {
          return <div key={lineIdx} className="h-1.5" />;
        }

        return (
          <div key={lineIdx} className="text-[#E2E8F0]">
            {tokens.length > 0 ? tokens : line}
          </div>
        );
      })}
    </div>
  );
};

const AIChatbot = () => {
  const {
    currentRole,
    currentUser,
    expos,
    booths,
    applications,
    sessions,
    bookmarks,
    showToast
  } = useApp();
  const [isOpen, setIsOpen] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [copiedId, setCopiedId] = useState(null);

  const getInitialMessage = () => {
    const userName = currentUser?.name || "Guest";
    const companyName = currentUser?.company_name || userName;
    let welcome = `Hello **${userName}**! 👋 I'm your **EventSphere AI Assistant**. How can I assist you with your expo operations today?`;
    if (currentRole === "organizer") {
      welcome = `Welcome, Organizer **${userName}**! 🎯 I'm synced with your **${expos?.length || 0} summits**, **${booths?.length || 0} hall booths**, and **${applications?.length || 0} exhibitor applications**. Ask me about booth occupancy rates, schedule conflicts, or attendee registrations.`;
    } else if (currentRole === "exhibitor") {
      welcome = `Welcome **${companyName}**! 🏢 I can help you select high-traffic booths, customize your digital catalog, or draft lead follow-up messages for visitors.`;
    } else if (currentRole === "attendee") {
      welcome = `Hi **${userName}**! 🎟️ Ready to explore the summit? Ask me for keynote recommendations, booth wayfinding coordinates, or how to claim your instant digital QR pass.`;
    }
    return {
      id: "init-1",
      role: "assistant",
      content: welcome,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };
  };

  const [messages, setMessages] = useState([getInitialMessage()]);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    if (messages.length <= 1) {
      setMessages([getInitialMessage()]);
    }
  }, [currentRole, currentUser]);

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [messages, isOpen, isLoading]);

  const getRoleBadgeLabel = () => {
    switch (currentRole) {
      case "organizer":
        return "Organizer Intelligence";
      case "exhibitor":
        return "Exhibitor Assistant";
      case "attendee":
        return "Attendee Guide";
      default:
        return "AI Assistant";
    }
  };

  const getSuggestedPrompts = () => {
    switch (currentRole) {
      case "organizer":
        return [
          "📊 Analyze current booth occupancy",
          "📢 Draft stage announcement for AI Keynote",
          "📋 List pending exhibitor applications",
          "📈 Tips to increase attendee registrations"
        ];
      case "exhibitor":
        return [
          "📍 Highest foot-traffic booth locations?",
          "💡 Perks of Island vs Corner booth?",
          "✉️ Draft a post-event lead follow-up email",
          "⚡ Check AV & electrical hookup options"
        ];
      case "attendee":
      default:
        return [
          "🌟 Top keynote sessions for AI & Robotics",
          "📍 Where is Quantum Dynamics located?",
          "🎫 How do I access my digital QR pass?",
          "📅 Summarize Day 1 agenda highlights"
        ];
    }
  };

  const handleSendMessage = async (customPrompt) => {
    const textToSend = customPrompt || input;
    if (!textToSend.trim() || isLoading) return;

    const userMsg = {
      id: `user-${Date.now()}`,
      role: "user",
      content: textToSend.trim(),
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInput("");
    setIsLoading(true);

    try {
      const contextData = {
        currentRole,
        user: {
          name: currentUser?.name || "Guest",
          email: currentUser?.email || "",
          role: currentUser?.role || currentRole || "public"
        },
        activeExpos: (expos || []).map((e) => ({
          id: e._id,
          title: e.title,
          category: e.category,
          dates: `${e.date} to ${e.end_date}`,
          venue: e.location
        })),
        boothsSummary: {
          total: booths?.length || 0,
          available: (booths || []).filter((b) => b.status === "available").length,
          booked: (booths || []).filter((b) => b.status === "booked").length,
          halls: ["Hall A (Main)", "Hall B (Tech & Robotics)", "Hall C (Startups)"]
        },
        sessionsCount: sessions?.length || 0,
        userBookmarksCount: currentUser?._id ? (bookmarks || []).filter((b) => b.user_id === currentUser._id).length : 0
      };

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: newHistory.map((m) => ({ role: m.role, content: m.content })),
          userRole: currentRole,
          contextData,
          model: "gemini-3.7-flash"
        })
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const assistantMsg = {
        id: `ai-${Date.now()}`,
        role: "assistant",
        content: data.reply || "I processed your request.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("Error fetching chat response:", err);
      const fallbackMsg = {
        id: `ai-err-${Date.now()}`,
        role: "assistant",
        content: `I'm here to assist with **EventSphere**! You can manage floor plans in the **Organizer Panel**, reserve prime booths in the **Exhibitor Portal**, or view your instant **Digital QR Passes** in the Attendee Hub.`,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
      };
      setMessages((prev) => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCopy = (id, text) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    if (showToast) showToast("Copied", "Response copied to clipboard", "info");
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleClearHistory = () => {
    setMessages([getInitialMessage()]);
    if (showToast) showToast("Chat Cleared", "Conversation reset to start", "info");
  };

  return (
    <>
      {/* Floating Chatbot Trigger Icon Only */}
      {!isOpen && (
        <div className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 group">
          <button
            id="ai-chatbot-open-trigger"
            onClick={() => setIsOpen(true)}
            aria-label="Open EventSphere AI Assistant"
            className="relative w-14 h-14 rounded-full bg-gradient-to-tr from-[#1488A6] to-[#38B2AC] text-white shadow-xl shadow-teal-950/40 hover:shadow-2xl hover:shadow-[#38B2AC]/40 border border-teal-200/30 flex items-center justify-center transition-all duration-300 transform hover:scale-105 active:scale-95 cursor-pointer"
          >
            {/* Bot Icon with Sparkle accent */}
            <div className="relative flex items-center justify-center">
              <Bot className="w-7 h-7 text-white transition-transform duration-300 group-hover:rotate-6" />
              <Sparkles className="w-3.5 h-3.5 text-teal-100 absolute -top-1.5 -right-2 animate-pulse" />
            </div>

            {/* Online Status Dot */}
            <span className="absolute top-1 right-1 flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-[#0F172A]" />
            </span>
          </button>

          {/* Clean Hover Tooltip */}
          <div className="absolute right-full mr-3 top-1/2 -translate-y-1/2 px-3 py-1.5 bg-[#1A202C] text-white text-xs font-semibold rounded-xl shadow-xl border border-white/10 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none hidden sm:flex items-center gap-1.5">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
            <span>EventSphere AI</span>
          </div>
        </div>
      )}

      {/* Interactive Chat Window */}
      {isOpen && (
        <div
          id="ai-chatbot-window"
          className={`fixed z-50 transition-all duration-300 flex flex-col bg-[#0F172A] border border-slate-700/70 rounded-2xl sm:rounded-3xl shadow-2xl shadow-black/60 overflow-hidden backdrop-blur-xl ${
            isExpanded
              ? "inset-2 sm:inset-8 max-w-5xl mx-auto"
              : "inset-x-2 bottom-3 top-14 sm:inset-auto sm:bottom-6 sm:right-6 sm:w-[420px] sm:h-[600px] max-h-[92vh] sm:max-h-[85vh]"
          }`}
        >
          {/* Header */}
          <div className="px-4 py-3.5 sm:px-5 sm:py-4 bg-[#1A202C] border-b border-white/10 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative w-10 h-10 rounded-xl bg-gradient-to-tr from-[#1488A6] to-[#38B2AC] p-0.5 shadow-md shadow-[#38B2AC]/20 shrink-0">
                <div className="w-full h-full bg-[#0F172A] rounded-[10px] flex items-center justify-center">
                  <Bot className="w-5 h-5 text-[#38B2AC]" />
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#1A202C]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="text-sm sm:text-base font-bold text-[#F8FAFC] font-heading tracking-tight">
                    EventSphere AI
                  </h3>
                  <span className="px-2 py-0.5 rounded-md text-[10px] font-mono font-bold teal-badge">
                    Active
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-xs text-[#CBD5E1]/80">
                  <span className="capitalize font-medium">{getRoleBadgeLabel()}</span>
                </div>
              </div>
            </div>

            {/* Header Action Buttons */}
            <div className="flex items-center gap-1">
              <button
                onClick={handleClearHistory}
                className="p-2 rounded-xl text-[#CBD5E1]/70 hover:text-white hover:bg-[#203748] transition-colors cursor-pointer"
                title="Reset conversation"
                aria-label="Reset conversation"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="hidden sm:flex p-2 rounded-xl text-[#CBD5E1]/70 hover:text-white hover:bg-[#203748] transition-colors cursor-pointer"
                title={isExpanded ? "Minimize window" : "Expand window"}
                aria-label={isExpanded ? "Minimize window" : "Expand window"}
              >
                {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
              </button>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 rounded-xl text-[#CBD5E1]/70 hover:text-white hover:bg-rose-500/20 hover:text-rose-300 transition-colors cursor-pointer"
                title="Close chat"
                aria-label="Close chat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Chat Messages Thread */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 bg-[#0F172A] no-scrollbar">
            {messages.map((msg) => {
              const isUser = msg.role === "user";
              return (
                <div
                  key={msg.id}
                  className={`flex gap-2.5 sm:gap-3 text-sm leading-relaxed ${
                    isUser ? "justify-end" : "justify-start"
                  }`}
                >
                  {/* AI Avatar */}
                  {!isUser && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#38B2AC]/15 border border-[#38B2AC]/30 flex items-center justify-center shrink-0 mt-1 shadow-xs">
                      <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#38B2AC]" />
                    </div>
                  )}

                  {/* Bubble Content */}
                  <div
                    className={`max-w-[85%] sm:max-w-[80%] rounded-2xl px-4 py-3 space-y-2 transition-all ${
                      isUser
                        ? "bg-gradient-to-r from-[#1488A6] to-[#0D9488] text-white rounded-tr-xs shadow-md"
                        : "bg-[#1A202C] border border-white/10 text-[#CBD5E1] rounded-tl-xs shadow-sm"
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap font-sans break-words text-sm font-medium">
                        {msg.content}
                      </div>
                    ) : (
                      <FormattedMessage content={msg.content} />
                    )}

                    {/* Metadata & Copy action */}
                    <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/10 text-[11px] text-[#CBD5E1]/60">
                      <span className="font-mono text-[10px]">{msg.timestamp}</span>
                      {!isUser && (
                        <button
                          onClick={() => handleCopy(msg.id, msg.content)}
                          className="hover:text-white flex items-center gap-1 transition-colors cursor-pointer text-[11px]"
                          title="Copy response"
                        >
                          {copiedId === msg.id ? (
                            <>
                              <Check className="w-3 h-3 text-emerald-400" />
                              <span className="text-emerald-400 font-medium">Copied</span>
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              <span>Copy</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>

                  {/* User Avatar */}
                  {isUser && (
                    <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#203748] border border-white/15 flex items-center justify-center shrink-0 mt-1 text-white font-bold text-xs">
                      {(currentUser?.name || "U").charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Thinking / Loading Animation */}
            {isLoading && (
              <div className="flex gap-2.5 sm:gap-3 justify-start text-sm items-center">
                <div className="w-7 h-7 sm:w-8 sm:h-8 rounded-xl bg-[#38B2AC]/15 border border-[#38B2AC]/30 flex items-center justify-center shrink-0">
                  <Bot className="w-4 h-4 text-[#38B2AC] animate-spin" />
                </div>
                <div className="bg-[#1A202C] border border-white/10 rounded-2xl rounded-tl-xs px-4 py-2.5 text-[#CBD5E1]/80 flex items-center gap-2 shadow-xs">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-bounce [animation-delay:-0.3s]" />
                    <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-bounce [animation-delay:-0.15s]" />
                    <span className="w-2 h-2 rounded-full bg-[#38B2AC] animate-bounce" />
                  </div>
                  <span className="text-xs font-mono text-[#CBD5E1]/60 ml-1.5">
                    EventSphere AI is analyzing...
                  </span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Suggestions Chips */}
          <div className="px-3.5 py-2.5 bg-[#1A202C]/90 border-t border-white/10">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar">
              <span className="text-[11px] font-mono font-bold text-[#38B2AC] uppercase shrink-0 flex items-center gap-1">
                <Zap className="w-3 h-3 text-[#38B2AC]" />
                Ask:
              </span>
              {getSuggestedPrompts().map((prompt, idx) => (
                <button
                  key={idx}
                  onClick={() => handleSendMessage(prompt)}
                  disabled={isLoading}
                  className="px-2.5 py-1.5 rounded-lg bg-[#203748] hover:bg-[#203748]/80 text-[#CBD5E1] hover:text-white text-xs font-medium whitespace-nowrap transition-all border border-white/5 hover:border-[#38B2AC]/40 shrink-0 cursor-pointer disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Input Box Form */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSendMessage();
            }}
            className="p-3 sm:p-3.5 bg-[#1A202C] border-t border-white/10 flex items-center gap-2"
          >
            <input
              ref={inputRef}
              id="ai-chatbot-input"
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder={`Ask EventSphere AI anything...`}
              disabled={isLoading}
              className="flex-1 bg-[#0F172A] border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white placeholder-[#CBD5E1]/40 focus:outline-none focus:border-[#38B2AC] focus:ring-1 focus:ring-[#38B2AC] font-sans transition-all"
            />
            <button
              id="ai-chatbot-submit-btn"
              type="submit"
              disabled={!input.trim() || isLoading}
              className="p-2.5 sm:p-3 bg-gradient-to-r from-[#1488A6] to-[#38B2AC] hover:brightness-110 text-white rounded-xl shadow-md transition-all shrink-0 cursor-pointer disabled:opacity-30 disabled:cursor-not-allowed"
              title="Send message"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      )}
    </>
  );
};

export { AIChatbot };
