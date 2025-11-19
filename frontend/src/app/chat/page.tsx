'use client';

import React, { useState, useRef, useEffect } from 'react';
import { getRagChatBotResponse, getRandomWelcomeMessage, getRagApiStatus } from './chatBotResponses.js';
import Link from 'next/link';

interface Message {
  id: number;
  type: 'user' | 'bot';
  content: string;
  timestamp: string;
  suggestions?: string[];
  source?: string;
  score?: number;
  ragResponse?: any;
}

interface ChatBotResponse {
  text: string;
  suggestions?: string[];
  source: string;
  score?: number;
  ragResponse?: boolean;
  retrievedDocs?: any[];
}

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  const [inputMessage, setInputMessage] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [processingMessage, setProcessingMessage] = useState<number | null>(null);
  const [showScrollButton, setShowScrollButton] = useState(false);
  const [ragStatus, setRagStatus] = useState<{
    healthy: boolean;
    checking: boolean;
    error?: string;
  }>({ healthy: false, checking: true });
  
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Initialize welcome message after component mounts to avoid hydration mismatch
  useEffect(() => {
    if (!isInitialized) {
      const welcomeMessage: Message = {
        id: 1,
        type: 'bot',
        content: getRandomWelcomeMessage(),
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        source: 'welcome'
      };
      setMessages([welcomeMessage]);
      setIsInitialized(true);
    }
  }, [isInitialized]);

  const quickSuggestions = [
    { icon: '📚', text: 'Ngữ pháp cơ bản' },
    { icon: '🔤', text: 'Từ vựng thông dụng' },
    { icon: '🗣️', text: 'Phát âm tiếng Anh' },
    { icon: '🎯', text: 'Luyện thi IELTS' },
    { icon: '✍️', text: 'Viết luận tiếng Anh' },
    { icon: '👂', text: 'Luyện nghe hiểu' }
  ];

  const scrollToBottom = () => {
    const messagesContainer = messagesEndRef.current?.parentElement?.parentElement;
    if (messagesContainer) {
      messagesContainer.scrollTop = messagesContainer.scrollHeight;
    }
  };

  useEffect(() => {
    // Only auto-scroll for new messages, not on initial load
    if (messages.length === 0) return;
    
    const messagesContainer = messagesEndRef.current?.parentElement?.parentElement;
    if (messagesContainer) {
      const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
      const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
      
      // Show scroll button when user is not at bottom and has multiple messages
      setShowScrollButton(!isNearBottom && messages.length > 1);
      
      // Only auto-scroll if user is near bottom or it's the welcome message
      if (isNearBottom || messages.length === 1) {
        setTimeout(() => {
          messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }, 100);
      }
    }
  }, [messages]);

  // Add scroll event listener with throttling
  useEffect(() => {
    const messagesContainer = messagesEndRef.current?.parentElement?.parentElement;
    if (!messagesContainer || messages.length === 0) return;

    let ticking = false;
    const handleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const { scrollTop, scrollHeight, clientHeight } = messagesContainer;
          const isNearBottom = scrollHeight - scrollTop - clientHeight < 50;
          setShowScrollButton(!isNearBottom && messages.length > 1);
          ticking = false;
        });
        ticking = true;
      }
    };

    messagesContainer.addEventListener('scroll', handleScroll, { passive: true });
    return () => messagesContainer.removeEventListener('scroll', handleScroll);
  }, [messages.length]);

  // Check RAG API status on component mount
  useEffect(() => {
    const checkRagStatus = async () => {
      try {
        const status = await getRagApiStatus();
        setRagStatus({ ...status, checking: false });
      } catch (error: any) {
        setRagStatus({ healthy: false, checking: false, error: error.message });
      }
    };
    
    checkRagStatus();
  }, []);

  const handleSendMessage = async (message = inputMessage) => {
    if (!message.trim()) return;

    const messageId = Date.now();
    const userMessage: Message = {
      id: messageId,
      type: 'user',
      content: message,
      timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage]);
    setInputMessage('');
    setIsTyping(true);
    setProcessingMessage(messageId);

    try {
      // Add small delay for better UX
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const response = await getRagChatBotResponse(message) as ChatBotResponse;
      const botResponse: Message = {
        id: Date.now() + 1,
        type: 'bot',
        content: response.text,
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestions: response.suggestions || [],
        source: response.source,
        score: response.score,
        ragResponse: response.ragResponse
      };
      
      setMessages(prev => [...prev, botResponse]);
      
    } catch (error) {
      console.error('Error getting bot response:', error);
      const errorResponse: Message = {
        id: Date.now() + 1,
        type: 'bot',
        content: 'Xin lỗi, tôi gặp sự cố khi xử lý câu hỏi của bạn. Vui lòng thử lại! 😅',
        timestamp: new Date().toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' }),
        suggestions: ['Thử lại', 'Hỏi câu khác'],
        source: 'error'
      };
      setMessages(prev => [...prev, errorResponse]);
    } finally {
      setIsTyping(false);
      setProcessingMessage(null);
    }
  };

  const getStatusIndicator = () => {
    if (ragStatus.checking) {
      return { text: 'Đang kiểm tra...', color: 'text-gray-400', icon: '🔄' };
    }
    if (ragStatus.healthy) {
      return { text: 'RAG AI Sẵn sàng', color: 'text-green-400', icon: '🤖' };
    }
    return { text: 'Chế độ cơ bản', color: 'text-yellow-400', icon: '⚠️' };
  };

  const handleSuggestionClick = (suggestion: { text: string }) => {
    handleSendMessage(suggestion.text);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  const status = getStatusIndicator();

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 via-blue-50 to-cyan-50">
      {/* Header - Match main website */}
      <div className="bg-white shadow-sm border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Link 
                href="/"
                className="flex items-center space-x-2 text-violet-600 hover:text-violet-700 transition-colors"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
                <span className="font-medium">Quay lại</span>
              </Link>
              <div className="h-6 w-px bg-gray-300"></div>
              <div className="flex items-center space-x-3">

                <span className="text-lg font-semibold text-gray-700">AI Chat Assistant</span>
              </div>
            </div>
            <div className="flex items-center space-x-3">
              <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${
                ragStatus.healthy ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
              }`}>
                <span className="text-sm">{status.icon}</span>
                <span className="text-sm font-medium">{status.text}</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Chat Container */}
      <div className="max-w-4xl mx-auto py-6">
        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 h-[calc(100vh-8rem)] flex flex-col overflow-hidden">
        {/* Loading state */}
        {!isInitialized && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mx-auto mb-2"></div>
              <p className="text-gray-500 text-sm">Đang khởi tạo chat...</p>
            </div>
          </div>
        )}

        {/* Quick Suggestions - Only show when initialized and no messages */}
        {isInitialized && messages.length <= 1 && (
          <div className="p-6 flex-shrink-0 border-b border-gray-100">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Bạn muốn học gì hôm nay?</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {quickSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  className="flex items-center space-x-3 p-4 bg-gradient-to-r from-violet-50 to-blue-50 rounded-xl border border-violet-200 
                           hover:border-violet-300 hover:from-violet-100 hover:to-blue-100 transition-all duration-200
                           text-left group hover:shadow-md"
                >
                  <span className="text-2xl">{suggestion.icon}</span>
                  <span className="text-sm font-medium text-gray-700 group-hover:text-violet-700">
                    {suggestion.text}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Messages Area - Only show when initialized */}
        {isInitialized && (
          <div className="flex-1 overflow-y-auto px-6 py-4 scroll-smooth overscroll-contain" style={{ scrollbarWidth: 'thin' }}>
            <div className="space-y-4">
            {messages.map((message) => (
              <div key={message.id} className={`flex ${message.type === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-lg ${
                  message.type === 'user' 
                    ? 'bg-gradient-to-r from-violet-500 to-blue-500 text-white rounded-l-2xl rounded-tr-2xl rounded-br-md shadow-lg' 
                    : 'bg-white text-gray-800 rounded-r-2xl rounded-tl-2xl rounded-bl-md border border-gray-200 shadow-sm'
                } px-4 py-3`}>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
                  
                  {/* Message metadata */}
                  <div className={`flex items-center justify-between mt-2 text-xs ${
                    message.type === 'user' ? 'text-blue-100' : 'text-gray-500'
                  }`}>
                    <span>{message.timestamp}</span>
                    <div className="flex items-center space-x-2">
                      {/* {message.score && (
                        <span className="bg-green-100 text-green-700 px-2 py-1 rounded-full text-xs font-medium">
                          Score: {message.score}%
                        </span>
                      )} */}
                      {message.source && message.source !== 'welcome' && (
                        <span className="capitalize bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-xs">
                          {message.source === 'rag' ? '🤖 RAG AI' : 
                           message.source === 'fallback_greeting' ? '👋 Greeting' :
                           message.source === 'fallback_grammar' ? '📖 Grammar' :
                           message.source === 'fallback_vocabulary' ? '📚 Vocabulary' :
                           message.source === 'fallback_pronunciation' ? '🗣️ Pronunciation' :
                           message.source === 'fallback_exam' ? '🎯 Exam Prep' :
                           message.source}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Bot suggestions */}
                  {message.type === 'bot' && message.suggestions && message.suggestions.length > 0 && (
                    <div className="mt-3 space-y-1">
                      {message.suggestions.map((suggestion, index) => (
                        <button
                          key={index}
                          onClick={() => handleSendMessage(suggestion)}
                          className="block w-full text-left px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 
                                   text-gray-700 rounded-lg transition-colors"
                        >
                          {suggestion}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {isTyping && (
              <div className="flex justify-start">
                <div className="bg-white text-gray-800 rounded-r-2xl rounded-tl-2xl rounded-bl-md 
                              shadow-sm border border-gray-200 px-4 py-3">
                  <div className="flex items-center space-x-1">
                    <div className="flex space-x-1">
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce"></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                    </div>
                    <span className="text-xs text-gray-500 ml-2">AI đang suy nghĩ...</span>
                  </div>
                </div>
              </div>
            )}
            
              <div ref={messagesEndRef} />
            </div>
          </div>
        )}

        {/* Scroll to bottom button */}
        {showScrollButton && (
          <div className="absolute bottom-20 right-6">
            <button
              onClick={scrollToBottom}
              className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 
                       text-white p-3 rounded-full shadow-lg transition-all duration-200 hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
              </svg>
            </button>
          </div>
        )}

        {/* Input Area */}
        <div className="border-t border-gray-100 bg-gray-50 p-4 flex-shrink-0">
          <div className="flex items-end space-x-3">
            <div className="flex-1">
              <textarea
                value={inputMessage}
                onChange={(e) => {
                  setInputMessage(e.target.value);
                  // Auto-resize textarea
                  const target = e.target as HTMLTextAreaElement;
                  target.style.height = 'auto';
                  target.style.height = Math.min(target.scrollHeight, 120) + 'px';
                }}
                onKeyPress={handleKeyPress}
                placeholder="Nhập câu hỏi về tiếng Anh..."
                className="w-full px-4 py-3 border border-gray-300 rounded-xl resize-none 
                         focus:ring-2 focus:ring-violet-500 focus:border-violet-500
                         placeholder-gray-500 text-sm overflow-hidden bg-white shadow-sm"
                rows={1}
                style={{ minHeight: '44px', maxHeight: '120px' }}
              />
            </div>
            <button
              onClick={() => handleSendMessage()}
              disabled={!inputMessage.trim() || isTyping}
              className="bg-gradient-to-r from-violet-500 to-blue-500 hover:from-violet-600 hover:to-blue-600 
                       disabled:from-gray-300 disabled:to-gray-300 disabled:cursor-not-allowed
                       text-white rounded-xl p-3 transition-all duration-200
                       flex items-center justify-center shadow-lg hover:shadow-xl hover:scale-105"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                      d="M12 5l7 7-7 7M5 12h14" />
              </svg>
            </button>
          </div>
        </div>
        </div>
      </div>
    </div>
  );
}