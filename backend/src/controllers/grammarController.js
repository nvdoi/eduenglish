import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini AI (sử dụng free API key)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || 'AIzaSyCuE7Yvnpsz1Q7wtKk1GP03BnrGrijDuXk');

const checkGrammar = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp văn bản cần kiểm tra'
      });
    }

    if (text.length > 5000) {
      return res.status(400).json({
        success: false,
        message: 'Văn bản không được vượt quá 5000 ký tự'
      });
    }

    // Tạo prompt cho AI
    const prompt = `
You are an advanced English grammar checker. Analyze the following text and provide a detailed grammar check result.

Text to analyze: "${text}"

Please respond with a JSON object in the following format:
{
  "originalText": "${text}",
  "correctedText": "corrected version of the text",
  "score": number between 0-100 representing grammar quality,
  "errors": [
    {
      "id": "unique_id",
      "text": "incorrect text",
      "suggestion": "corrected text",
      "type": "grammar|spelling|punctuation|style",
      "position": {
        "start": start_index,
        "end": end_index
      },
      "explanation": "detailed explanation of the error"
    }
  ]
}

Rules:
1. Be thorough but accurate
2. Only flag actual errors, not stylistic preferences unless clearly wrong
3. Provide clear explanations for each error
4. Calculate score based on error severity and frequency
5. Ensure position indices are accurate
6. Return valid JSON only, no additional text

Analyze the text now:
`;

    // Gọi Gemini AI
    const model = genAI.getGenerativeModel({ model: "gemini-pro" });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let aiResponse = response.text();

    // Clean up response để đảm bảo là JSON hợp lệ
    aiResponse = aiResponse.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
    
    try {
      const grammarResult = JSON.parse(aiResponse);
      
      // Validate response structure
      if (!grammarResult.originalText || !grammarResult.correctedText || 
          typeof grammarResult.score !== 'number' || !Array.isArray(grammarResult.errors)) {
        throw new Error('Invalid AI response structure');
      }

      // Ensure score is within valid range
      grammarResult.score = Math.max(0, Math.min(100, grammarResult.score));

      // Add unique IDs to errors if missing
      grammarResult.errors = grammarResult.errors.map((error, index) => ({
        ...error,
        id: error.id || `error_${index + 1}_${Date.now()}`
      }));

      // Lưu lịch sử kiểm tra (nếu user đã đăng nhập)
      if (req.user) {
        // TODO: Implement history saving to database
        console.log(`Grammar check by user ${req.user.id}: ${grammarResult.score}/100`);
      }

      res.json({
        success: true,
        data: grammarResult
      });

    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      console.error('AI Response:', aiResponse);
      
      // Fallback response nếu AI response không hợp lệ
      const fallbackResult = {
        originalText: text,
        correctedText: text,
        score: 85,
        errors: []
      };

      res.json({
        success: true,
        data: fallbackResult,
        message: 'Sử dụng kết quả dự phòng do lỗi phân tích AI'
      });
    }

  } catch (error) {
    console.error('Grammar check error:', error);
    
    if (error.message.includes('API key')) {
      return res.status(500).json({
        success: false,
        message: 'Lỗi cấu hình AI service. Vui lòng thử lại sau.'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi kiểm tra ngữ pháp. Vui lòng thử lại.'
    });
  }
};

const getGrammarHistory = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Vui lòng đăng nhập để xem lịch sử'
      });
    }

    // TODO: Implement database query for user's grammar check history
    // For now, return mock data
    const mockHistory = [
      {
        id: '1',
        text: 'This are a sample text with grammar error.',
        score: 75,
        errorsCount: 2,
        createdAt: new Date(Date.now() - 86400000).toISOString(), // 1 day ago
      },
      {
        id: '2',
        text: 'I have went to the store yesterday.',
        score: 60,
        errorsCount: 1,
        createdAt: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
      }
    ];

    res.json({
      success: true,
      data: mockHistory
    });

  } catch (error) {
    console.error('Get grammar history error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi lấy lịch sử kiểm tra'
    });
  }
};

// Demo function với dữ liệu mẫu (không cần AI)
const checkGrammarDemo = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || text.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Vui lòng cung cấp văn bản cần kiểm tra'
      });
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1500));

    // Mock response với dữ liệu mẫu
    const mockErrors = [];
    let score = 95;

    // Advanced grammar error detection patterns
    const errorPatterns = [
      // Subject-verb agreement errors
      {
        pattern: /\b(this|that)\s+are\b/gi,
        replacement: (match) => match.replace(/are/i, 'is'),
        type: 'grammar',
        explanation: 'Subject-verb disagreement. Singular subjects like "this/that" require "is" not "are".',
        severity: 15
      },
      {
        pattern: /\b(these|those)\s+is\b/gi,
        replacement: (match) => match.replace(/is/i, 'are'),
        type: 'grammar',
        explanation: 'Subject-verb disagreement. Plural subjects like "these/those" require "are" not "is".',
        severity: 15
      },
      
      // Past participle errors
      {
        pattern: /\bhave\s+went\b/gi,
        replacement: 'have gone',
        type: 'grammar',
        explanation: 'Incorrect past participle. Use "have gone" instead of "have went".',
        severity: 20
      },
      {
        pattern: /\bhave\s+came\b/gi,
        replacement: 'have come',
        type: 'grammar',
        explanation: 'Incorrect past participle. Use "have come" instead of "have came".',
        severity: 20
      },
      {
        pattern: /\bhave\s+did\b/gi,
        replacement: 'have done',
        type: 'grammar',
        explanation: 'Incorrect past participle. Use "have done" instead of "have did".',
        severity: 20
      },
      
      // Irregular verb errors
      {
        pattern: /\bI\s+seen\b/gi,
        replacement: 'I saw',
        type: 'grammar',
        explanation: 'Incorrect verb form. Use "I saw" (past tense) or "I have seen" (present perfect).',
        severity: 18
      },
      {
        pattern: /\bI\s+done\b/gi,
        replacement: 'I did',
        type: 'grammar',
        explanation: 'Incorrect verb form. Use "I did" (past tense) or "I have done" (present perfect).',
        severity: 18
      },
      
      // Double negatives
      {
        pattern: /\bdon't\s+have\s+no\b/gi,
        replacement: "don't have any",
        type: 'grammar',
        explanation: 'Double negative. Use "don\'t have any" instead of "don\'t have no".',
        severity: 15
      },
      {
        pattern: /\bcan't\s+get\s+no\b/gi,
        replacement: "can't get any",
        type: 'grammar',
        explanation: 'Double negative. Use "can\'t get any" instead of "can\'t get no".',
        severity: 15
      },
      
      // Pronoun errors
      {
        pattern: /\bme\s+and\s+\w+\s+(am|is|are|was|were|will|would|can|could|should)\b/gi,
        replacement: (match) => match.replace(/me\s+and/i, 'I and'),
        type: 'grammar',
        explanation: 'Incorrect pronoun case. Use "I" as a subject, not "me".',
        severity: 12
      },
      
      // Apostrophe errors
      {
        pattern: /\bits\s+(?=\w+ing|\w+ed|going|coming|being)/gi,
        replacement: "it's",
        type: 'grammar',
        explanation: 'Possible apostrophe error. Use "it\'s" (it is) instead of "its" (possessive) in this context.',
        severity: 10
      },
      
      // Common spelling errors
      {
        pattern: /\bthere\s+(house|car|book|phone|computer)\b/gi,
        replacement: (match) => match.replace(/there/i, 'their'),
        type: 'spelling',
        explanation: 'Possible word confusion. Use "their" (possessive) instead of "there" (location).',
        severity: 8
      },
      {
        pattern: /\byour\s+(going|coming|leaving|running)\b/gi,
        replacement: (match) => match.replace(/your/i, "you're"),
        type: 'spelling',
        explanation: 'Word confusion. Use "you\'re" (you are) instead of "your" (possessive).',
        severity: 8
      },
      
      // Preposition errors
      {
        pattern: /\bdifferent\s+than\b/gi,
        replacement: 'different from',
        type: 'grammar',
        explanation: 'Preposition error. Use "different from" instead of "different than".',
        severity: 5
      },
      {
        pattern: /\bshould\s+of\b/gi,
        replacement: 'should have',
        type: 'grammar',
        explanation: 'Common error. Use "should have" instead of "should of".',
        severity: 12
      },
      {
        pattern: /\bcould\s+of\b/gi,
        replacement: 'could have',
        type: 'grammar',
        explanation: 'Common error. Use "could have" instead of "could of".',
        severity: 12
      },
      {
        pattern: /\bwould\s+of\b/gi,
        replacement: 'would have',
        type: 'grammar',
        explanation: 'Common error. Use "would have" instead of "would of".',
        severity: 12
      }
    ];

    // Apply error detection patterns
    errorPatterns.forEach((pattern, index) => {
      const matches = [...text.matchAll(pattern.pattern)];
      matches.forEach((match, matchIndex) => {
        const errorText = match[0];
        const suggestion = typeof pattern.replacement === 'function' 
          ? pattern.replacement(errorText) 
          : pattern.replacement;
        
        mockErrors.push({
          id: `error_${index}_${matchIndex}`,
          text: errorText,
          suggestion: suggestion,
          type: pattern.type,
          position: {
            start: match.index,
            end: match.index + errorText.length
          },
          explanation: pattern.explanation
        });
        score -= pattern.severity;
      });
    });

    const result = {
      originalText: text,
      correctedText: mockErrors.reduce((corrected, error) => {
        return corrected.replace(error.text, error.suggestion);
      }, text),
      score: Math.max(0, score),
      errors: mockErrors
    };

    res.json({
      success: true,
      data: result
    });

  } catch (error) {
    console.error('Grammar check demo error:', error);
    res.status(500).json({
      success: false,
      message: 'Có lỗi xảy ra khi kiểm tra ngữ pháp'
    });
  }
};

export {
  checkGrammar,
  checkGrammarDemo,
  getGrammarHistory
};
