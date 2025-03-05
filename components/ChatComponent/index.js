"use client";
import { useState, useEffect, useRef } from "react";
import { MLCEngine } from "@mlc-ai/web-llm";
import ChatUI from "../../lib/ChatUI";

export default function ChatComponent() {
  const [messages, setMessages] = useState([]);
  const [runtimeStats, setRuntimeStats] = useState("");
  const [inputValue, setInputValue] = useState("");
  const [engine, setEngine] = useState(null);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initEngine = async () => {
      const newEngine = new MLCEngine();
      setEngine(newEngine);
    };
    initEngine();
  }, []);

  const chatUI = ChatUI({ engine: engine || new MLCEngine() });

  const messageUpdate = (kind, text, append) => {
    if (kind === "init") {
      text = "[System Initialize] " + text;
    }

    setMessages((prevMessages) => {
      if (append) {
        return [...prevMessages, { kind, text }];
      } else {
        const newMessages = [...prevMessages];
        if (newMessages.length > 0) {
          newMessages[newMessages.length - 1] = { kind, text };
        } else {
          newMessages.push({ kind, text });
        }
        return newMessages;
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!inputValue.trim() || chatUI.requestInProgress || !engine) return;

    await chatUI.onGenerate(inputValue, messageUpdate, setRuntimeStats);
    setInputValue("");
  };

  const handleReset = async () => {
    if (!engine) return;
    await chatUI.onReset(() => setMessages([]));
  };

  if (!engine) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading AI Engine...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-72 bg-gradient-to-b from-gray-900 to-gray-800 text-white p-6 flex flex-col shadow-lg">
        <div className="mb-8">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-500">
            WebLLM
          </h1>
        </div>
        <button
          onClick={handleReset}
          className="flex items-center gap-3 px-4 py-3 text-sm text-gray-300 hover:bg-gray-700 rounded-xl transition-all duration-200 hover:shadow-lg hover:scale-105"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
            <path
              fillRule="evenodd"
              d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
              clipRule="evenodd"
            />
          </svg>
          New Chat
        </button>
      </div>

      <div className="flex-1 flex flex-col">
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto p-6 space-y-6">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-10 w-10 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                </div>
                <h2 className="text-3xl font-semibold mb-3 bg-clip-text text-transparent bg-gradient-to-r from-blue-500 to-purple-500">
                  Welcome to AI Chat
                </h2>
                <p className="text-gray-600">Start a conversation by typing a message below.</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div
                  key={index}
                  className={`flex ${message.kind === "right" ? "justify-end" : "justify-start"} animate-fade-in`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl p-4 shadow-sm transition-all duration-200 hover:shadow-md ${
                      message.kind === "left"
                        ? "bg-white border border-gray-100"
                        : message.kind === "right"
                        ? "bg-gradient-to-br from-blue-500 to-blue-600 text-white"
                        : message.kind === "error"
                        ? "bg-red-50 text-red-800 border border-red-100"
                        : "bg-gray-50 border border-gray-100"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      {message.kind === "left" && (
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center text-white text-sm font-semibold shadow-md">
                          AI
                        </div>
                      )}
                      <div className="flex-1">
                        <p
                          className={`whitespace-pre-wrap leading-relaxed ${
                            message.kind === "right" ? "text-white" : "text-gray-800"
                          }`}
                        >
                          {message.text}
                        </p>
                        {message.kind === "left" && (
                          <div className="mt-2 text-xs text-gray-400">{new Date().toLocaleTimeString()}</div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        <div className="border-t bg-white/80 backdrop-blur-sm">
          <div className="max-w-4xl mx-auto p-6">
            {runtimeStats && (
              <div className="text-xs text-gray-500 mb-3 text-center bg-gray-50 py-2 rounded-lg">{runtimeStats}</div>
            )}
            <form onSubmit={handleSubmit} className="relative">
              <input
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                placeholder={chatUI.requestInProgress ? "AI is thinking..." : "Type your message..."}
                className="w-full p-4 pr-14 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 text-black focus:ring-blue-500 focus:border-transparent transition-all duration-200 shadow-sm hover:shadow-md"
                disabled={chatUI.requestInProgress}
              />
              <button
                type="submit"
                disabled={chatUI.requestInProgress || !inputValue.trim()}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 text-blue-500 hover:text-blue-600 disabled:text-gray-400 disabled:hover:text-gray-400 transition-colors duration-200"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"
                  />
                </svg>
              </button>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
