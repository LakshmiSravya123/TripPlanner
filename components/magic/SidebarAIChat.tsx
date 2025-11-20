"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { MessageSquare, Send, X, Mic, MicOff, Sparkles, Minimize2, Maximize2 } from "lucide-react";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface Message {
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface SidebarAIChatProps {
  tripData?: any;
  onRegenerateDay?: (day: number, newContent: string) => void;
  onRegenerateFull?: () => void;
}

export default function SidebarAIChat({
  tripData,
  onRegenerateDay,
  onRegenerateFull,
}: SidebarAIChatProps) {
  const [isOpen, setIsOpen] = useState(true);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const recognitionRef = useRef<any>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const initialMessage: Message = {
        role: "assistant",
        content: tripData
          ? `Hello! I'm your AI travel assistant for your trip to ${tripData.destination}. I can help you modify your itinerary, answer questions, or regenerate parts of your plan. What would you like to change?`
          : "Hello! I'm your AI travel assistant. How can I help you plan your perfect trip?",
        timestamp: new Date(),
      };
      setMessages([initialMessage]);
    }
  }, [isOpen, messages.length, tripData]);

  // Voice recognition setup
  useEffect(() => {
    if (typeof window !== "undefined" && "webkitSpeechRecognition" in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = "en-US";

      recognitionRef.current.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInput(transcript);
        setIsListening(false);
      };

      recognitionRef.current.onerror = () => {
        setIsListening(false);
        toast.error("Voice recognition error. Please try typing instead.");
      };

      recognitionRef.current.onend = () => {
        setIsListening(false);
      };
    }
    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop();
      }
    };
  }, []);

  const startListening = () => {
    if (recognitionRef.current && !isListening) {
      setIsListening(true);
      recognitionRef.current.start();
      toast.info("Listening... Speak now!");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current && isListening) {
      recognitionRef.current.stop();
      setIsListening(false);
    }
  };

  const handleSend = async () => {
    if (input.trim() === "" || isLoading) return;

    const userMessage: Message = {
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    const currentInput = input;
    setInput("");
    setIsLoading(true);

    try {
      // Check if user wants to regenerate a specific day
      const dayMatch = currentInput.match(/day\s*(\d+)/i);
      const regenerateMatch = currentInput.match(/regenerate|change|modify/i);

      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: [...messages, userMessage],
          tripData,
          context: {
            canRegenerateDay: !!dayMatch,
            dayNumber: dayMatch ? parseInt(dayMatch[1]) : null,
            regenerateFull: currentInput.toLowerCase().includes("full plan") || currentInput.toLowerCase().includes("regenerate everything"),
          },
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fetch AI response");
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error("Failed to get reader");

      let assistantResponse = "";
      const decoder = new TextDecoder();

      const assistantMessage: Message = {
        role: "assistant",
        content: "",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        assistantResponse += chunk;
        setMessages((prev) =>
          prev.map((msg, i) =>
            i === prev.length - 1 ? { ...msg, content: assistantResponse } : msg
          )
        );
      }

      // Trigger regeneration if AI suggests it
      if (dayMatch && onRegenerateDay) {
        const dayNum = parseInt(dayMatch[1]);
        setTimeout(() => {
          onRegenerateDay(dayNum, assistantResponse);
          toast.success(`Regenerating Day ${dayNum}...`, {
            description: "Your itinerary is being updated",
          });
        }, 1000);
      } else if (regenerateMatch && currentInput.toLowerCase().includes("full") && onRegenerateFull) {
        setTimeout(() => {
          onRegenerateFull();
          toast.success("Regenerating full plan...", {
            description: "This may take a moment",
          });
        }, 1000);
      }
    } catch (error: any) {
      console.error("Chat error:", error);
      toast.error("Failed to get response. Please try again.");
      const errorMessage: Message = {
        role: "assistant",
        content: "Sorry, I'm having trouble right now. Please try again in a moment! ✨",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  if (!isOpen) {
    return (
      <motion.button
        onClick={() => setIsOpen(true)}
        className="fixed right-0 top-1/2 -translate-y-1/2 z-50 w-12 h-24 bg-gradient-to-l from-purple-600 to-pink-600 rounded-l-2xl shadow-2xl flex items-center justify-center text-white hover:scale-105 transition-transform"
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        <MessageSquare className="w-6 h-6" />
      </motion.button>
    );
  }

  return (
    <motion.div
      initial={{ x: "100%" }}
      animate={{ x: isMinimized ? "calc(100% - 60px)" : 0 }}
      transition={{ type: "spring", stiffness: 300, damping: 30 }}
      className={`fixed right-0 top-0 h-full z-50 w-full md:w-[20%] min-w-[320px] max-w-[400px] bg-white shadow-2xl flex flex-col border-l-2 border-purple-200`}
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-gradient-to-r from-purple-50 to-indigo-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center">
            <Sparkles className="w-4 h-4 text-white animate-pulse" />
          </div>
          <h3 className="text-sm font-semibold text-gray-800">AI Assistant</h3>
        </div>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setIsMinimized(!isMinimized)}
            className="h-8 w-8"
          >
            {isMinimized ? <Maximize2 className="w-4 h-4" /> : <Minimize2 className="w-4 h-4" />}
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)} className="h-8 w-8">
            <X className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {!isMinimized && (
        <>
          {/* Messages */}
          <div className="flex-1 p-4 overflow-y-auto custom-scrollbar bg-gray-50">
            {messages.map((msg, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2, delay: index * 0.05 }}
                className={`mb-4 flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] p-3 rounded-xl shadow-sm ${
                    msg.role === "user"
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-white text-gray-800 rounded-bl-none border border-gray-200"
                  }`}
                >
                  <p className="text-sm leading-relaxed">{msg.content}</p>
                </div>
              </motion.div>
            ))}
            {isLoading && (
              <div className="flex justify-start mb-4">
                <div className="max-w-[85%] p-3 rounded-xl shadow-sm bg-white text-gray-800 rounded-bl-none border border-gray-200">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full animate-bounce" />
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.1s" }}
                    />
                    <div
                      className="w-2 h-2 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: "0.2s" }}
                    />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t border-gray-200 bg-white">
            <div className="flex items-end gap-2">
              <div className="flex-1 relative">
                <Textarea
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="Ask me anything... (e.g., 'Change Day 3 to beaches')"
                  className="resize-none border-gray-300 rounded-lg focus:border-purple-500 focus:ring-purple-500 text-sm"
                  rows={2}
                />
                {isListening && (
                  <div className="absolute top-2 right-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full animate-pulse" />
                  </div>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <Button
                  onClick={isListening ? stopListening : startListening}
                  variant="outline"
                  size="icon"
                  className={`h-9 w-9 ${isListening ? "bg-red-50 border-red-300" : ""}`}
                >
                  {isListening ? (
                    <MicOff className="w-4 h-4 text-red-600" />
                  ) : (
                    <Mic className="w-4 h-4" />
                  )}
                </Button>
                <Button
                  onClick={handleSend}
                  disabled={isLoading || input.trim() === ""}
                  className="h-9 w-9 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </div>
            </div>
            {tripData && (
              <div className="mt-2 flex gap-2">
                <Button
                  onClick={() => {
                    setInput("Regenerate full plan with better options");
                    handleSend();
                  }}
                  variant="outline"
                  size="sm"
                  className="text-xs h-7"
                >
                  Regenerate Full
                </Button>
              </div>
            )}
          </div>
        </>
      )}
    </motion.div>
  );
}

