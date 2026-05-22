"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sparkles, X, Send, Bot, User, Check, MessageSquare, Copy } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { chatWithAICopilot } from "@/app/actions/ai";
import { useTranslation } from "@/hooks/useTranslation";

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="p-1.5 rounded-lg bg-zinc-900/80 hover:bg-zinc-800 border border-zinc-800/40 text-zinc-500 hover:text-white transition-colors cursor-pointer self-start shadow-sm"
      title="Copy to clipboard"
    >
      {copied ? <Check size={10} className="text-green-400 animate-pulse" /> : <Copy size={10} />}
    </button>
  );
}

interface AICopilotProps {
  context: {
    recipientName?: string;
    relationship?: string;
    customMessage?: string;
  };
  onApplyText?: (fieldName: "memories" | "intro" | "wishes" | "quote", value: string) => void;
}

export default function AICopilot({ context, onApplyText }: AICopilotProps) {
  const { t, currentLang } = useTranslation();
  const [isOpen, setIsOpen] = useState(false);
  const [model, setModel] = useState<"gemini" | "chatgpt">("gemini");
  const [messages, setMessages] = useState<Array<{ sender: "user" | "copilot"; text: string }>>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages((prev) => {
      if (prev.length === 0 || (prev.length === 1 && prev[0].sender === "copilot")) {
        return [
          {
            sender: "copilot",
            text: t("copilotWelcome") || `Hello! I am your Memora Storytelling Assistant. Tell me about the birthday recipient, or ask me for writing suggestions! I can write emotional messages, caption lists, or help you brainstorm custom memories.`,
          },
        ];
      }
      return prev;
    });
  }, [currentLang, t]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, loading]);

  const handleSend = async (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    if (!textToSend) setInput("");
    setMessages((prev) => [...prev, { sender: "user", text: query }]);
    setLoading(true);

    try {
      const response = await chatWithAICopilot(
        query,
        {
          recipientName: context.recipientName,
          relationship: context.relationship,
          customMessage: context.customMessage,
        },
        model,
        currentLang
      );
      setMessages((prev) => [...prev, { sender: "copilot", text: response }]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        { sender: "copilot", text: "Pardon me, I encountered a connection issue. Please try again." },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleSuggestion = (promptText: string) => {
    handleSend(promptText);
  };

  // Helper to extract texts for quick-applying
  const parseQuotesAndParagraphs = (text: string) => {
    // Basic regex or text check to find if copy-pastable bullet points exist
    const lines = text.split("\n").filter(l => l.trim().length > 0);
    return lines.map((line, idx) => {
      // Clean prefix bullets like "1. ", "- ", etc.
      const cleaned = line.replace(/^\d+[\.\)]\s*/, "").replace(/^-\s*/, "").replace(/^"/, "").replace(/"$/, "");
      return { original: line, cleaned, key: idx };
    });
  };

  return (
    <div className="fixed bottom-6 right-6 z-50 font-sans">
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            key="copilot-trigger"
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.8, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="flex items-center gap-2 px-5 py-3 rounded-full bg-gradient-to-r from-purple-600 via-indigo-600 to-blue-600 text-white font-medium text-xs shadow-[0_4px_20px_rgba(147,51,234,0.4)] hover:shadow-[0_4px_25px_rgba(147,51,234,0.65)] hover:scale-105 transition-all duration-300 cursor-pointer"
            aria-label="AI Writing Copilot"
          >
            <Sparkles size={14} className="animate-pulse" />
            Memora Copilot
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-pink-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-pink-500"></span>
            </span>
          </motion.button>
        )}

        {isOpen && (
          <motion.div
            key="copilot-panel"
            initial={{ y: 50, scale: 0.95, opacity: 0 }}
            animate={{ y: 0, scale: 1, opacity: 1 }}
            exit={{ y: 50, scale: 0.95, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="w-[90vw] max-w-[360px] h-[480px] rounded-3xl bg-zinc-950/90 border border-zinc-850 shadow-[0_20px_50px_rgba(0,0,0,0.6)] backdrop-blur-xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-zinc-900/60 border-b border-zinc-850 p-4 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-full bg-purple-600/10 border border-purple-500/20 flex items-center justify-center text-purple-400">
                  <Bot size={16} />
                </div>
                <div>
                  <h3 className="font-semibold text-xs text-white leading-tight">{t("copilotTitle") || "Memora AI Copilot"}</h3>
                  <span className="text-[9px] text-zinc-500 font-mono">{t("copilotSubtitle") || "Creative Writing Assistant"}</span>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-zinc-500 hover:text-white transition-colors cursor-pointer"
              >
                <X size={16} />
              </button>
            </div>

            {/* Model Capsule Switcher */}
            <div className="bg-zinc-900/20 px-4 py-2 border-b border-zinc-850 flex items-center justify-between gap-2">
              <span className="text-[10px] text-zinc-400 font-medium">Model:</span>
              <div className="flex bg-zinc-950 p-0.5 rounded-lg border border-zinc-900">
                <button
                  onClick={() => setModel("gemini")}
                  className={`px-3 py-1 text-[9px] font-medium rounded-md transition-all cursor-pointer ${
                    model === "gemini"
                      ? "bg-purple-600/15 text-purple-400 border border-purple-500/20 font-semibold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  Gemini 2.5
                </button>
                <button
                  onClick={() => setModel("chatgpt")}
                  className={`px-3 py-1 text-[9px] font-medium rounded-md transition-all cursor-pointer ${
                    model === "chatgpt"
                      ? "bg-indigo-650/15 text-indigo-400 border border-indigo-500/20 font-semibold"
                      : "text-zinc-500 hover:text-zinc-300"
                  }`}
                >
                  GPT-4o mini
                </button>
              </div>
            </div>

            {/* Messages Thread */}
            <div
              ref={scrollRef}
              className="flex-grow p-4 overflow-y-auto space-y-4 scrollbar-thin scrollbar-thumb-zinc-800 scrollbar-track-transparent"
            >
              {messages.map((msg, index) => (
                <div
                  key={index}
                  className={`flex gap-2.5 ${msg.sender === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] ${
                      msg.sender === "user"
                        ? "bg-zinc-850 text-zinc-300"
                        : "bg-purple-650/10 border border-purple-500/20 text-purple-400"
                    }`}
                  >
                    {msg.sender === "user" ? <User size={12} /> : <Bot size={12} />}
                  </div>

                  <div className="max-w-[78%] flex flex-col gap-1.5">
                    <div className="relative group">
                      <div
                        className={`p-3 pr-8 rounded-2xl text-[11px] leading-relaxed shadow-sm whitespace-pre-line ${
                          msg.sender === "user"
                            ? "bg-zinc-900 text-white rounded-tr-none"
                            : "bg-zinc-950 border border-zinc-900 text-zinc-300 rounded-tl-none"
                        }`}
                      >
                        {msg.text}
                      </div>

                      {/* Copy Overlay Button */}
                      <div className="absolute right-1.5 top-1.5 opacity-60 group-hover:opacity-100 transition-opacity">
                        <CopyButton text={msg.text} />
                      </div>
                    </div>

                    {/* Quick-apply helper if response lists suggestions and handler exists */}
                    {msg.sender === "copilot" && onApplyText && (
                      <div className="flex flex-wrap gap-1">
                        {parseQuotesAndParagraphs(msg.text).map(
                          (item) =>
                            item.cleaned.length > 8 &&
                            (item.original.startsWith("- ") ||
                              /^\d+[\.\)]/.test(item.original)) && (
                              <button
                                key={item.key}
                                onClick={() => {
                                  // Determine correct field to apply to
                                  const textVal = item.cleaned;
                                  if (textVal.length < 35) {
                                    onApplyText("quote", textVal);
                                  } else {
                                    onApplyText("wishes", textVal);
                                  }
                                }}
                                className="flex items-center gap-1 py-1 px-2 bg-zinc-900 hover:bg-purple-950/20 hover:text-purple-400 border border-zinc-850 rounded-lg text-[9px] text-zinc-400 tracking-tight transition-all cursor-pointer"
                              >
                                <Check size={8} /> {t("applyThis") || "Apply this"}
                              </button>
                            )
                        )}
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex gap-2.5">
                  <div className="w-6 h-6 rounded-full bg-purple-650/10 border border-purple-500/20 flex items-center justify-center text-purple-400 shrink-0">
                    <Bot size={12} />
                  </div>
                  <div className="bg-zinc-950 border border-zinc-900 p-3 rounded-2xl rounded-tl-none max-w-[78%] flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestions Chips */}
            <div className="px-4 py-2 border-t border-zinc-900 bg-zinc-900/10 flex gap-2 overflow-x-auto whitespace-nowrap scrollbar-none scroll-smooth">
              <button
                onClick={() =>
                  handleSuggestion(`Suggest custom memories for my relationship '${context.relationship || "partner"}'`)
                }
                className="py-1 px-3 bg-zinc-950 border border-zinc-900 hover:border-purple-500/40 text-[10px] text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer inline-block"
              >
                {t("suggestMemories") || "💡 Suggest memories"}
              </button>
              <button
                onClick={() =>
                  handleSuggestion(`Suggest 3 short photo captions for a '${context.relationship || "friend"}'`)
                }
                className="py-1 px-3 bg-zinc-950 border border-zinc-900 hover:border-purple-500/40 text-[10px] text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer inline-block"
              >
                {t("photoCaptions") || "📸 Photo captions"}
              </button>
              <button
                onClick={() =>
                  handleSuggestion(`Write a heartfelt, touching intro line for a birthday card for ${context.recipientName || "Alex"}`)
                }
                className="py-1 px-3 bg-zinc-950 border border-zinc-900 hover:border-purple-500/40 text-[10px] text-zinc-400 hover:text-white rounded-full transition-all cursor-pointer inline-block"
              >
                {t("writeIntro") || "✍️ Write an Intro"}
              </button>
            </div>

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-zinc-950 border-t border-zinc-850 flex items-center gap-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder={t("copilotInputPlaceholder") || "Ask Copilot what to write..."}
                className="flex-grow bg-zinc-900/60 border border-zinc-850 rounded-xl px-3.5 py-2 text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-purple-500"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="p-2 bg-purple-600 hover:bg-purple-500 disabled:bg-zinc-800 disabled:text-zinc-650 rounded-xl text-white transition-colors cursor-pointer"
              >
                <Send size={12} />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
