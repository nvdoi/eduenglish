"use client";

import { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";

interface GrammarError {
  id: string;
  text: string;
  suggestion: string;
  type: 'grammar' | 'spelling' | 'punctuation' | 'style';
  position: {
    start: number;
    end: number;
  };
  explanation: string;
}

interface GrammarResult {
  originalText: string;
  correctedText: string;
  errors: GrammarError[];
  score: number;
}

export default function GrammarCheckerPage() {
  const [inputText, setInputText] = useState("");
  const [result, setResult] = useState<GrammarResult | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [aiResponse, setAiResponse] = useState("");
  const [showAiResponse, setShowAiResponse] = useState(false);

  const handleGrammarCheck = async () => {
    if (!inputText.trim()) {
      setError("Vui lòng nhập văn bản cần kiểm tra");
      return;
    }

    setIsLoading(true);
    setError("");
    setResult(null);
    setAiResponse("");

    try {
      // Tạo prompt cho AI để kiểm tra ngữ pháp
      const grammarPrompt = `Hãy kiểm tra ngữ pháp cho đoạn văn bản tiếng Anh sau và trả về kết quả theo định dạng JSON chính xác:

Văn bản: "${inputText}"

Yêu cầu trả về JSON với cấu trúc:
{
  "originalText": "văn bản gốc",
  "correctedText": "văn bản đã sửa",
  "errors": [
    {
      "id": "error_1",
      "text": "từ/cụm từ bị lỗi",
      "suggestion": "gợi ý sửa",
      "type": "grammar|spelling|punctuation|style",
      "position": {"start": số_vị_trí_bắt_đầu, "end": số_vị_trí_kết_thúc},
      "explanation": "giải thích lỗi bằng tiếng Việt"
    }
  ],
  "score": điểm_từ_0_đến_100
}

Chỉ trả về JSON, không có text khác.`;

      const response = await fetch('http://localhost:8000/ask', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ question: grammarPrompt })
      });

      const data = await response.json();

      if (response.ok) {
        // Lưu AI response để hiển thị
        setAiResponse(data.llm_answers);
        
        try {
          // Thử parse JSON từ response của AI
          let jsonMatch = data.llm_answers.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            const grammarResult = JSON.parse(jsonMatch[0]);
            
            // Validate và format lại data
            const formattedResult: GrammarResult = {
              originalText: grammarResult.originalText || inputText,
              correctedText: grammarResult.correctedText || inputText,
              errors: (grammarResult.errors || []).map((error: any, index: number) => ({
                id: error.id || `error_${index + 1}`,
                text: error.text || "",
                suggestion: error.suggestion || "",
                type: error.type || "grammar",
                position: error.position || { start: 0, end: 0 },
                explanation: error.explanation || "Lỗi ngữ pháp"
              })),
              score: grammarResult.score || 85
            };
            
            setResult(formattedResult);
          } else {
            // Fallback: phân tích AI response để tạo kết quả
            const aiText = data.llm_answers.toLowerCase();
            let score = 85;
            let correctedText = inputText;
            let errors: GrammarError[] = [];
            
            // Tìm kiếm các từ khóa về lỗi
            if (aiText.includes('lỗi') || aiText.includes('sai') || aiText.includes('error')) {
              score = 70;
              // Tạo lỗi giả định dựa trên AI response
              errors.push({
                id: 'ai_detected_1',
                text: 'Phát hiện lỗi từ AI',
                suggestion: 'Xem phân tích AI bên dưới',
                type: 'grammar',
                position: { start: 0, end: Math.min(inputText.length, 10) },
                explanation: 'AI đã phát hiện lỗi trong văn bản'
              });
            }
            
            const basicResult: GrammarResult = {
              originalText: inputText,
              correctedText: correctedText,
              errors: errors,
              score: score
            };
            setResult(basicResult);
          }
        } catch (parseError) {
          console.error('JSON parse error:', parseError);
          // Tạo kết quả fallback với phân tích cơ bản
          const fallbackResult: GrammarResult = {
            originalText: inputText,
            correctedText: inputText,
            errors: [{
              id: 'ai_analysis_1',
              text: 'Phân tích AI',
              suggestion: 'Xem chi tiết phân tích bên dưới',
              type: 'style',
              position: { start: 0, end: Math.min(inputText.length, 20) },
              explanation: 'AI đã phân tích văn bản và đưa ra nhận xét'
            }],
            score: 80
          };
          setResult(fallbackResult);
        }
      } else {
        setError('Không thể kết nối đến AI Grammar Checker. Vui lòng thử lại.');
      }
    } catch (error) {
      console.error('Grammar check error:', error);
      setError('Không thể kết nối đến server AI. Vui lòng kiểm tra kết nối và thử lại.');
    } finally {
      setIsLoading(false);
    }
  };

  const getErrorTypeColor = (type: string) => {
    switch (type) {
      case 'grammar': return 'bg-red-100 text-red-800 border-red-200';
      case 'spelling': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'punctuation': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'style': return 'bg-purple-100 text-purple-800 border-purple-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getErrorTypeIcon = (type: string) => {
    switch (type) {
      case 'grammar':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
        );
      case 'spelling':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
          </svg>
        );
      case 'punctuation':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
          </svg>
        );
      case 'style':
        return (
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        );
      default:
        return null;
    }
  };

  const highlightText = (text: string, errors: GrammarError[]) => {
    if (!errors || !errors.length) return text;

    let highlightedText = text;
    let offset = 0;

    // Sort errors by position to avoid conflicts
    const sortedErrors = [...errors].sort((a, b) => a.position.start - b.position.start);

    sortedErrors.forEach((error, index) => {
      const start = error.position.start + offset;
      const end = error.position.end + offset;
      const errorText = highlightedText.substring(start, end);
      
      const highlightedSpan = `<span class="bg-red-200 border-b-2 border-red-400 cursor-pointer hover:bg-red-300 transition-colors" data-error-id="${error.id}" title="${error.explanation}">${errorText}</span>`;
      
      highlightedText = highlightedText.substring(0, start) + highlightedSpan + highlightedText.substring(end);
      offset += highlightedSpan.length - errorText.length;
    });

    return highlightedText;
  };

  // Build corrected text by applying suggestions and highlight them in green
  const highlightCorrectedText = (original: string, errors: GrammarError[]) => {
    if (!errors || errors.length === 0) return original;

    const escapeHtml = (s: string) =>
      s
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#39;");

    const sorted = [...errors].sort((a, b) => a.position.start - b.position.start);
    let output = '';
    let last = 0;

    sorted.forEach(err => {
      const { start, end } = err.position;
      // Append unchanged part before error
      output += escapeHtml(original.slice(last, start));
      // Append suggestion highlighted in green (fallback to original error text)
      const suggestion = (err.suggestion && err.suggestion.length > 0) ? err.suggestion : original.slice(start, end);
      const greenSpan = `<span class=\"bg-green-100 text-green-800 px-0.5 rounded-sm\" title=\"${escapeHtml(err.explanation)}\">${escapeHtml(suggestion)}</span>`;
      output += greenSpan;
      last = end;
    });

    // Append the remaining tail
    output += escapeHtml(original.slice(last));
    return output;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-cyan-50">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-2xl mb-4">
            <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Sửa ngữ pháp AI
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            AI phân tích và sửa lỗi ngữ pháp trong thời gian thực. Giải thích chi tiết từng lỗi để bạn hiểu và không lặp lại.
          </p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Input Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Văn bản cần kiểm tra</h2>
              <div className="flex items-center space-x-2 text-sm text-gray-500">
                <span>{inputText.length}</span>
                <span>/</span>
                <span>5000 ký tự</span>
              </div>
            </div>
            
            <textarea
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              placeholder="Nhập hoặc dán văn bản tiếng Anh cần kiểm tra ngữ pháp..."
              className="w-full h-64 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none transition-all duration-300"
              maxLength={5000}
            />

            {/* Quick Examples */}
            <div className="mt-4">
              <p className="text-sm text-gray-600 mb-2">Ví dụ nhanh:</p>
              <div className="flex flex-wrap gap-2">
                {[
                  "I are going to school tomorrow.",
                  "She don't like coffee very much.",
                  "There is many people in the room.",
                  "I have went to the store yesterday."
                ].map((example, index) => (
                  <button
                    key={index}
                    onClick={() => setInputText(example)}
                    className="px-3 py-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
                  >
                    Ví dụ {index + 1}
                  </button>
                ))}
              </div>
            </div>

            {error && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4 mb-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <svg className="h-5 w-5 text-red-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                    </svg>
                    <p className="text-red-700 text-sm font-medium">{error}</p>
                  </div>
                  {error.includes("đăng nhập") && (
                    <a 
                      href="/login"
                      className="text-red-600 hover:text-red-700 text-sm font-medium underline"
                    >
                      Đăng nhập ngay
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex items-center justify-between">
              {/* <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                  <span>Độ chính xác 98%</span>
                </div>
                <div className="flex items-center space-x-2 text-sm text-gray-600">
                  <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                  <span>Hỗ trợ nhiều thể loại</span>
                </div>
              </div> */}
              
              <div className="flex space-x-3">
                <button
                  onClick={handleGrammarCheck}
                  disabled={isLoading || !inputText.trim()}
                  className="flex-1 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 
                             disabled:from-gray-300 disabled:to-gray-400 disabled:cursor-not-allowed
                             text-white font-semibold py-3 px-6 rounded-xl transition-all duration-300 
                             transform hover:scale-105 disabled:hover:scale-100"
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Đang phân tích với AI...
                    </div>
                  ) : (
                    'Kiểm tra với AI'
                  )}
                </button>
                
                {(result || error) && (
                  <button
                    onClick={() => {
                      setResult(null);
                      setError("");
                      setAiResponse("");
                      setShowAiResponse(false);
                      setInputText("");
                    }}
                    className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-medium rounded-xl transition-colors"
                    title="Làm mới"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Results Section */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Kết quả kiểm tra</h2>
            
            {!result ? (
              <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                <svg className="w-16 h-16 mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <p className="text-center">
                  Nhập văn bản và nhấn "Kiểm tra ngữ pháp" để xem kết quả
                </p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Score */}
                <div className="bg-gradient-to-r from-green-50 to-emerald-50 border border-green-200 rounded-xl p-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-semibold text-green-800">Điểm ngữ pháp</h3>
                      <p className="text-sm text-green-600">Chất lượng văn bản của bạn</p>
                    </div>
                    <div className="text-right">
                      <div className="text-3xl font-bold text-green-700">{result.score}/100</div>
                      <div className="text-sm text-green-600">
                        {result.score >= 90 ? 'Xuất sắc' : 
                         result.score >= 80 ? 'Tốt' :
                         result.score >= 70 ? 'Khá' : 'Cần cải thiện'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Corrected Text */}
                <div>
                  <h3 className="font-semibold text-gray-900 mb-3">Văn bản đã sửa</h3>
                  <div className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                    <div 
                      className="text-gray-800 leading-relaxed whitespace-pre-wrap"
                      dangerouslySetInnerHTML={{
                        __html: highlightCorrectedText(result.originalText, result.errors || [])
                      }}
                    />
                  </div>
                </div>

                {/* Errors List */}
                {result.errors && result.errors.length > 0 && (
                  <div>
                    <h3 className="font-semibold text-gray-900 mb-3">
                      Lỗi được phát hiện ({result.errors.length})
                    </h3>
                    <div className="space-y-3 max-h-64 overflow-y-auto">
                      {result.errors.map((error) => (
                        <div key={error.id} className="bg-gray-50 border border-gray-200 rounded-xl p-4">
                          <div className="flex items-start space-x-3">
                            <div className={`flex items-center justify-center w-8 h-8 rounded-full ${getErrorTypeColor(error.type)}`}>
                              {getErrorTypeIcon(error.type)}
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center space-x-2 mb-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getErrorTypeColor(error.type)}`}>
                                  {error.type === 'grammar' ? 'Ngữ pháp' :
                                   error.type === 'spelling' ? 'Chính tả' :
                                   error.type === 'punctuation' ? 'Dấu câu' : 'Phong cách'}
                                </span>
                              </div>
                              <div className="mb-2">
                                <span className="text-red-600 font-medium line-through">{error.text}</span>
                                <span className="mx-2">→</span>
                                <span className="text-green-600 font-medium">{error.suggestion}</span>
                              </div>
                              <p className="text-sm text-gray-600">{error.explanation}</p>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {(!result.errors || result.errors.length === 0) && (
                  <div className="text-center py-8">
                    <div className="inline-flex items-center justify-center w-16 h-16 bg-green-100 rounded-full mb-4">
                      <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-green-800 mb-2">Hoàn hảo!</h3>
                    <p className="text-green-600">Không phát hiện lỗi ngữ pháp nào trong văn bản của bạn.</p>
                  </div>
                )}

                {/* AI Response Section */}
                {/* {aiResponse && (
                  <div className="mt-6">
                    <div className="flex items-center justify-between mb-3">
                      <h3 className="font-semibold text-gray-900 flex items-center">
                        <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                        </svg>
                        Nhận xét từ AI
                      </h3>
                      <button
                        onClick={() => setShowAiResponse(!showAiResponse)}
                        className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
                      >
                        {showAiResponse ? 'Ẩn' : 'Hiện'} chi tiết
                        <svg 
                          className={`w-4 h-4 ml-1 transition-transform ${showAiResponse ? 'rotate-180' : ''}`} 
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                    </div>
                    {showAiResponse && (
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-4">
                        <div className="text-gray-700 text-sm leading-relaxed">
                        {(() => {
                          // Loại bỏ JSON và chỉ hiển thị phần text có ý nghĩa
                          let cleanText = aiResponse;
                          
                          // Loại bỏ JSON block
                          cleanText = cleanText.replace(/\{[\s\S]*?\}/g, '');
                          
                          // Loại bỏ các ký tự đặc biệt
                          cleanText = cleanText.replace(/```json|```/g, '');
                          cleanText = cleanText.replace(/^\s*[\r\n]/gm, '');
                          
                          // Nếu không còn gì hoặc quá ngắn, hiển thị message mặc định
                          if (!cleanText.trim() || cleanText.trim().length < 20) {
                            return (
                              <div className="flex items-start space-x-3">
                                <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                  </svg>
                                </div>
                                <div>
                                  <p className="font-medium text-blue-800 mb-1">Phân tích hoàn tất</p>
                                  <p className="text-blue-700">
                                    AI đã kiểm tra văn bản của bạn và đưa ra kết quả phân tích ở phần trên. 
                                    {result?.errors && result.errors.length > 0 
                                      ? ` Tìm thấy ${result.errors.length} lỗi cần sửa.`
                                      : ' Văn bản của bạn có vẻ ổn!'
                                    }
                                  </p>
                                </div>
                              </div>
                            );
                          }
                          
                          // Hiển thị text đã làm sạch
                          return (
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                <svg className="w-4 h-4 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                                </svg>
                              </div>
                              <div>
                                <p className="font-medium text-blue-800 mb-2">Nhận xét từ AI:</p>
                                <div className="text-blue-700 leading-relaxed">
                                  {cleanText.trim().split('\n').map((line, index) => (
                                    line.trim() && (
                                      <p key={index} className="mb-1">
                                        {line.trim()}
                                      </p>
                                    )
                                  ))}
                                </div>
                              </div>
                            </div>
                          );
                        })()}
                        </div>
                      </div>
                    )}
                  </div>
                )} */}
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-red-100 rounded-xl mb-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Phát hiện lỗi ngữ pháp</h3>
            <p className="text-gray-600 text-sm">Tìm và sửa các lỗi ngữ pháp phức tạp với độ chính xác cao</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-orange-100 rounded-xl mb-4">
              <svg className="w-6 h-6 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Kiểm tra chính tả</h3>
            <p className="text-gray-600 text-sm">Phát hiện và đề xuất sửa các lỗi chính tả trong văn bản</p>
          </div>

          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
            <div className="inline-flex items-center justify-center w-12 h-12 bg-purple-100 rounded-xl mb-4">
              <svg className="w-6 h-6 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Cải thiện phong cách</h3>
            <p className="text-gray-600 text-sm">Đề xuất cách viết hay hơn và phù hợp với ngữ cảnh</p>
          </div>
        </div>
      </div>
    </div>
  );
}
