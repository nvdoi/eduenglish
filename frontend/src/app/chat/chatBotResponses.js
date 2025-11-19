// RAG-powered chat bot responses for English Learning Website
import axios from 'axios';

// Configuration
const RAG_API_BASE_URL = 'http://localhost:8000';
const FALLBACK_ENABLED = true;

// Create axios instance with default config
const ragApi = axios.create({
  baseURL: RAG_API_BASE_URL,
  timeout: 30000, // 30 seconds timeout
  headers: {
    'Content-Type': 'application/json',
  },
});

// Fallback responses for when RAG API is unavailable
const fallbackResponses = {
  greeting: [
    'Xin chào! Tôi là English AI Assistant. Tôi có thể giúp bạn học tiếng Anh về ngữ pháp, từ vựng, phát âm và các kỹ năng khác. Hôm nay bạn muốn học gì? 📚',
    'Chào bạn! Tôi sẵn sàng hỗ trợ bạn học tiếng Anh. Bạn có thắc mắc gì về grammar, vocabulary hay pronunciation không? 🎓',
    'Hello! Tôi là trợ lý AI chuyên về tiếng Anh. Hãy hỏi tôi bất kỳ câu hỏi nào về học tiếng Anh nhé! 🌟'
  ],
  error: [
    'Xin lỗi, tôi đang gặp sự cố kỹ thuật. Vui lòng thử lại sau ít phút nhé! 😅',
    'Hệ thống đang bảo trì. Tôi sẽ quay lại hỗ trợ bạn sớm thôi! 🔧',
    'Đang có lỗi xảy ra. Bạn có thể thử hỏi lại không? 🤔'
  ],
  default: [
    'Tôi hiểu bạn muốn học về chủ đề này! Hãy cho tôi biết cụ thể hơn về ngữ pháp, từ vựng hay kỹ năng nào bạn muốn cải thiện nhé. 😊',
    'Bạn có thể hỏi rõ hơn về vấn đề tiếng Anh nào không? Tôi sẽ giải thích chi tiết cho bạn! 📖',
    'Hãy cho tôi biết thêm chi tiết để tôi có thể hỗ trợ bạn học tiếng Anh hiệu quả hơn! 🎯'
  ]
};

// Check if RAG API is available
const checkRagApiHealth = async () => {
  try {
    const response = await ragApi.get('/health', { timeout: 5000 });
    return response.status === 200;
  } catch (error) {
    console.warn('RAG API health check failed:', error.message);
    return false;
  }
};

// Get random response from array
const getRandomResponse = (responses) => {
  return responses[Math.floor(Math.random() * responses.length)];
};

// Detect greeting messages
const isGreeting = (message) => {
  const greetingKeywords = ['xin chào', 'hello', 'hi', 'chào', 'hey'];
  const lowerMessage = message.toLowerCase();
  return greetingKeywords.some(keyword => lowerMessage.includes(keyword));
};

// Generate fallback response based on message content
const generateFallbackResponse = (userMessage) => {
  const lowerMessage = userMessage.toLowerCase();
  
  if (isGreeting(lowerMessage)) {
    return {
      text: getRandomResponse(fallbackResponses.greeting),
      suggestions: ['Ngữ pháp cơ bản', 'Từ vựng thông dụng', 'Phát âm tiếng Anh', 'Luyện thi IELTS'],
      source: 'fallback_greeting'
    };
  }

  // English learning specific responses
  if (lowerMessage.includes('grammar') || lowerMessage.includes('ngữ pháp')) {
    return {
      text: 'Ngữ pháp tiếng Anh rất quan trọng! Tôi có thể giúp bạn về các thì, cấu trúc câu, hoặc các quy tắc cụ thể. Bạn muốn học về chủ đề nào? 📖',
      suggestions: ['Các thì trong tiếng Anh', 'Cấu trúc câu', 'Modal verbs'],
      source: 'fallback_grammar'
    };
  }

  if (lowerMessage.includes('vocabulary') || lowerMessage.includes('từ vựng')) {
    return {
      text: 'Từ vựng là nền tảng của việc học tiếng Anh! Tôi có thể giúp bạn học từ mới, phân biệt từ đồng nghĩa, hoặc cách ghi nhớ hiệu quả. Bạn cần hỗ trợ gì? 📚',
      suggestions: ['Từ vựng theo chủ đề', 'Phân biệt từ đồng nghĩa', 'Cách ghi nhớ từ vựng'],
      source: 'fallback_vocabulary'
    };
  }

  if (lowerMessage.includes('pronunciation') || lowerMessage.includes('phát âm')) {
    return {
      text: 'Phát âm chuẩn giúp bạn giao tiếp tự tin hơn! Tôi có thể hướng dẫn về IPA, trọng âm từ, hoặc các âm khó. Bạn muốn luyện phần nào? 🗣️',
      suggestions: ['Bảng phiên âm IPA', 'Trọng âm từ', 'Âm khó phát âm'],
      source: 'fallback_pronunciation'
    };
  }

  if (lowerMessage.includes('ielts') || lowerMessage.includes('toeic')) {
    return {
      text: 'Luyện thi IELTS/TOEIC cần chiến lược rõ ràng! Tôi có thể giúp bạn về cấu trúc đề thi, mẹo làm bài, và luyện tập từng kỹ năng. Bạn cần hỗ trợ phần nào? 🎯',
      suggestions: ['Cấu trúc đề IELTS', 'Mẹo làm bài Reading', 'Luyện Speaking'],
      source: 'fallback_exam'
    };
  }
  
  return {
    text: getRandomResponse(fallbackResponses.default),
    suggestions: ['Ngữ pháp', 'Từ vựng', 'Phát âm', 'Kỹ năng giao tiếp'],
    source: 'fallback_default'
  };
};

// Main function to get RAG-powered chat response
export const getRagChatBotResponse = async (userMessage, conversationId = null) => {
  try {
    console.log('Processing RAG query:', userMessage);
    
    // Check if RAG API is available
    const isRagAvailable = await checkRagApiHealth();
    
    if (!isRagAvailable && FALLBACK_ENABLED) {
      console.warn('RAG API unavailable, using fallback responses');
      return generateFallbackResponse(userMessage);
    }
    
    if (!isRagAvailable) {
      throw new Error('RAG API is not available and fallback is disabled');
    }
    
    // Call RAG API
    const requestData = {
      question: userMessage.trim()
    };
    
    console.log('Calling RAG API with:', requestData);
    
    const response = await ragApi.post('/ask', requestData);
    const ragResponse = response.data;
    
    console.log('RAG API response:', {
      source: ragResponse.source,
      score: ragResponse.score,
      suggestionsCount: ragResponse.suggestions?.length || 0
    });
    
    // Format response for frontend
    return {
      text: ragResponse.llm_answers,
      suggestions: ragResponse.suggestions || [],
      source: ragResponse.source,
      score: ragResponse.score,
      retrievedDocs: ragResponse.similar_questions || [],
      ragResponse: true
    };
    
  } catch (error) {
    console.error('RAG API error:', error);
    
    // Handle specific error types
    if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      console.warn('Connection failed, using fallback');
      if (FALLBACK_ENABLED) {
        return generateFallbackResponse(userMessage);
      }
    }
    
    if (error.response?.status === 400) {
      return {
        text: 'Xin lỗi, câu hỏi của bạn không hợp lệ. Vui lòng thử lại với câu hỏi khác! 😅',
        suggestions: ['Thử câu hỏi khác', 'Ngữ pháp cơ bản', 'Từ vựng thông dụng'],
        source: 'error_validation'
      };
    }
    
    if (error.response?.status >= 500) {
      return {
        text: getRandomResponse(fallbackResponses.error),
        suggestions: ['Thử lại', 'Hỏi câu khác', 'Liên hệ hỗ trợ'],
        source: 'error_server'
      };
    }
    
    // Generic error fallback
    if (FALLBACK_ENABLED) {
      return generateFallbackResponse(userMessage);
    }
    
    throw error;
  }
};

// Legacy function for backward compatibility
export const getChatBotResponse = async (userMessage) => {
  return await getRagChatBotResponse(userMessage);
};

// Get random welcome message for English Learning
export const getRandomWelcomeMessage = () => {
  const welcomeMessages = [
    'Xin chào! Tôi là English AI Assistant. Tôi có thể giúp bạn học tiếng Anh từ cơ bản đến nâng cao. Hôm nay bạn muốn học gì? 📚',
    'Chào bạn! Tôi là trợ lý AI chuyên về tiếng Anh. Tôi có thể hỗ trợ bạn về ngữ pháp, từ vựng, phát âm và luyện thi. Bắt đầu học thôi! 🎓',
    'Hello! Tôi là English Learning Assistant với công nghệ AI tiên tiến. Hãy hỏi tôi bất cứ điều gì về tiếng Anh nhé! 🌟',
    'Chào mừng bạn đến với English AI! Tôi sẵn sàng giúp bạn cải thiện kỹ năng tiếng Anh. Bạn muốn bắt đầu từ đâu? 🚀'
  ];
  
  return welcomeMessages[Math.floor(Math.random() * welcomeMessages.length)];
};

// Utility functions for debugging
export const getRagApiStatus = async () => {
  try {
    const healthResponse = await ragApi.get('/health');
    
    return {
      healthy: healthResponse.status === 200,
      health: healthResponse.data,
      model_loaded: healthResponse.data?.model_loaded || false,
      data_loaded: healthResponse.data?.data_loaded || false,
      total_questions: healthResponse.data?.total_questions || 0,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    console.error('RAG API status check failed:', error);
    return {
      healthy: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};

// Export for testing
export const testRagConnection = async () => {
  try {
    const testMessage = "Hello, test connection";
    const response = await getRagChatBotResponse(testMessage);
    return {
      success: true,
      response: response,
      timestamp: new Date().toISOString()
    };
  } catch (error) {
    return {
      success: false,
      error: error.message,
      timestamp: new Date().toISOString()
    };
  }
};
