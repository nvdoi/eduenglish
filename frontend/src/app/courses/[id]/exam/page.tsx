"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { toast } from "react-hot-toast";
import { API_BASE_URL } from "../../../../config/api";

interface Question {
  id: number;
  question: string;
  type: string;
  options: string[];
  difficulty?: string;
  points?: number;
}

interface Answer {
  questionIndex: number;
  selectedAnswer: string;
}

interface ExamResult {
  questionIndex: number;
  selectedAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  explanation?: string;
}

export default function CourseExamPage() {
  const params = useParams();
  const router = useRouter();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [examResults, setExamResults] = useState<ExamResult[]>([]);
  const [showResults, setShowResults] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [examStarted, setExamStarted] = useState(false);

  // Mock user ID
  const userId = "507f1f77bcf86cd799439011";

  useEffect(() => {
    if (params.id) {
      fetchExamQuestions();
    }
  }, [params.id]);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (examStarted && timeLeft > 0 && !showResults) {
      timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmitExam();
    }
    return () => clearTimeout(timer);
  }, [timeLeft, examStarted, showResults]);

  const fetchExamQuestions = async () => {
    try {
      setIsLoading(true);
      const baseUrl = await API_BASE_URL;
      const response = await fetch(`${baseUrl}/api/results/exam/${params.id}/questions?count=10`);
      const data = await response.json();
      
      if (data.success) {
        setQuestions(data.questions);
      } else {
        toast.error('Không thể tải câu hỏi kiểm tra');
      }
    } catch (error) {
      console.error('Error fetching exam questions:', error);
      toast.error('Lỗi khi tải câu hỏi');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleNextQuestion = () => {
    // Save current answer
    const newAnswers = [...answers];
    const existingIndex = newAnswers.findIndex(a => a.questionIndex === currentQuestion);
    
    if (existingIndex >= 0) {
      newAnswers[existingIndex].selectedAnswer = selectedAnswer;
    } else {
      newAnswers.push({
        questionIndex: currentQuestion,
        selectedAnswer: selectedAnswer
      });
    }
    
    setAnswers(newAnswers);
    
    // Move to next question
    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      // Load existing answer if any
      const existingAnswer = newAnswers.find(a => a.questionIndex === currentQuestion + 1);
      setSelectedAnswer(existingAnswer?.selectedAnswer || '');
    }
  };

  const handlePreviousQuestion = () => {
    if (currentQuestion > 0) {
      // Save current answer
      const newAnswers = [...answers];
      const existingIndex = newAnswers.findIndex(a => a.questionIndex === currentQuestion);
      
      if (existingIndex >= 0) {
        newAnswers[existingIndex].selectedAnswer = selectedAnswer;
      } else if (selectedAnswer) {
        newAnswers.push({
          questionIndex: currentQuestion,
          selectedAnswer: selectedAnswer
        });
      }
      
      setAnswers(newAnswers);
      setCurrentQuestion(currentQuestion - 1);
      
      // Load previous answer
      const prevAnswer = newAnswers.find(a => a.questionIndex === currentQuestion - 1);
      setSelectedAnswer(prevAnswer?.selectedAnswer || '');
    }
  };

  const handleSubmitExam = async () => {
    // Save current answer before submitting
    const finalAnswers = [...answers];
    if (selectedAnswer) {
      const existingIndex = finalAnswers.findIndex(a => a.questionIndex === currentQuestion);
      if (existingIndex >= 0) {
        finalAnswers[existingIndex].selectedAnswer = selectedAnswer;
      } else {
        finalAnswers.push({
          questionIndex: currentQuestion,
          selectedAnswer: selectedAnswer
        });
      }
    }

    setIsSubmitting(true);
    
    try {
      const baseUrl = await API_BASE_URL;
      // Check answers
      const checkResponse = await fetch(`${baseUrl}/api/results/exam/${params.id}/check`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ answers: finalAnswers })
      });
      
      const checkData = await checkResponse.json();
      
      if (checkData.success) {
        setExamResults(checkData.results);
        
        // Submit exam result
        const examData = {
          examId: `exam_${Date.now()}`,
          score: checkData.score.correct,
          totalQuestions: checkData.score.total,
          correctAnswers: checkData.score.correct,
          percentage: checkData.score.percentage,
          questions: checkData.results.map((r: ExamResult) => ({
            questionId: r.questionIndex.toString(),
            selectedAnswer: r.selectedAnswer,
            correctAnswer: r.correctAnswer,
            isCorrect: r.isCorrect
          }))
        };
        
        await fetch(`${baseUrl}/api/results/exam/${userId}/${params.id}`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(examData)
        });
        
        setShowResults(true);
      }
    } catch (error) {
      console.error('Error submitting exam:', error);
      toast.error('Lỗi khi nộp bài kiểm tra');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getScoreColor = (percentage: number) => {
    if (percentage >= 80) return 'text-green-600';
    if (percentage >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreMessage = (percentage: number) => {
    if (percentage >= 80) return '🎉 Xuất sắc! Bạn đã vượt qua bài kiểm tra!';
    if (percentage >= 60) return '👍 Khá tốt! Hãy ôn tập thêm để cải thiện.';
    return '💪 Cần cố gắng thêm! Hãy học lại và thử lại.';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải câu hỏi kiểm tra...</p>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không có câu hỏi</h2>
          <p className="text-gray-600 mb-6">Khóa học này chưa có bài tập để tạo bài kiểm tra.</p>
          <button
            onClick={() => router.back()}
            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  if (showResults) {
    const correctCount = examResults.filter(r => r.isCorrect).length;
    const percentage = Math.round((correctCount / examResults.length) * 100);
    
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-4xl mx-auto px-4">
          {/* Results Header */}
          <div className="bg-white rounded-2xl shadow-lg p-8 mb-6 text-center">
            <h1 className="text-3xl font-bold text-gray-900 mb-4">Kết quả bài kiểm tra</h1>
            
            <div className={`text-6xl font-bold mb-4 ${getScoreColor(percentage)}`}>
              {percentage}%
            </div>
            
            <p className="text-xl text-gray-600 mb-4">
              {correctCount}/{examResults.length} câu đúng
            </p>
            
            <p className="text-lg mb-6">{getScoreMessage(percentage)}</p>
            
            <div className="flex justify-center space-x-4">
              <button
                onClick={() => router.push(`/courses/${params.id}`)}
                className="bg-violet-600 text-white px-6 py-3 rounded-lg hover:bg-violet-700 transition-colors"
              >
                Quay về khóa học
              </button>
              {percentage < 80 && (
                <button
                  onClick={() => window.location.reload()}
                  className="bg-gray-600 text-white px-6 py-3 rounded-lg hover:bg-gray-700 transition-colors"
                >
                  Làm lại
                </button>
              )}
            </div>
          </div>

          {/* Detailed Results */}
          <div className="space-y-4">
            {examResults.map((result, index) => (
              <div key={index} className="bg-white rounded-lg shadow-sm p-6">
                <div className="flex items-start justify-between mb-4">
                  <h3 className="font-semibold text-gray-900">
                    Câu {index + 1}: {questions[result.questionIndex]?.question}
                  </h3>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                    result.isCorrect ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {result.isCorrect ? '✓ Đúng' : '✗ Sai'}
                  </span>
                </div>
                
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium text-gray-700">Bạn chọn: </span>
                    <span className={result.isCorrect ? 'text-green-600' : 'text-red-600'}>
                      {result.selectedAnswer}
                    </span>
                  </div>
                  {!result.isCorrect && (
                    <div>
                      <span className="font-medium text-gray-700">Đáp án đúng: </span>
                      <span className="text-green-600">{result.correctAnswer}</span>
                    </div>
                  )}
                  {result.explanation && (
                    <div className="mt-2 p-3 bg-blue-50 rounded-lg">
                      <span className="font-medium text-blue-800">Giải thích: </span>
                      <span className="text-blue-700">{result.explanation}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (!examStarted) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-2xl mx-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            Bài kiểm tra khóa học
          </h1>
          
          <div className="space-y-4 mb-8">
            <div className="flex justify-between">
              <span className="text-gray-600">Số câu hỏi:</span>
              <span className="font-medium">{questions.length} câu</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời gian:</span>
              <span className="font-medium">10 phút</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Điểm đạt:</span>
              <span className="font-medium">80% (8/10 câu đúng)</span>
            </div>
          </div>
          
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <h3 className="font-semibold text-yellow-800 mb-2">⚠️ Lưu ý quan trọng:</h3>
            <ul className="text-yellow-700 text-sm space-y-1">
              <li>• Bạn có 10 phút để hoàn thành bài kiểm tra</li>
              <li>• Không thể quay lại sau khi nộp bài</li>
              <li>• Cần đạt 80% để hoàn thành khóa học</li>
              <li>• Có thể làm lại nếu không đạt yêu cầu</li>
            </ul>
          </div>
          
          <div className="text-center">
            <button
              onClick={() => setExamStarted(true)}
              className="bg-violet-600 text-white px-8 py-3 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-colors"
            >
              🚀 Bắt đầu kiểm tra
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQ = questions[currentQuestion];
  const progress = ((currentQuestion + 1) / questions.length) * 100;

  // Safety check
  if (!currentQ || !currentQ.options) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Lỗi câu hỏi</h2>
          <p className="text-gray-600 mb-6">Câu hỏi không hợp lệ hoặc thiếu dữ liệu.</p>
          <button
            onClick={() => router.back()}
            className="bg-violet-600 text-white px-6 py-2 rounded-lg hover:bg-violet-700 transition-colors"
          >
            Quay lại
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-xl font-bold text-gray-900">
                Câu {currentQuestion + 1}/{questions.length}
              </h1>
              <div className="w-64 bg-gray-200 rounded-full h-2 mt-2">
                <div 
                  className="bg-violet-600 rounded-full h-2 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
            </div>
            
            <div className={`text-lg font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-gray-900'}`}>
              ⏰ {formatTime(timeLeft)}
            </div>
          </div>
        </div>
      </div>

      {/* Question */}
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="bg-white rounded-2xl shadow-lg p-8">
          <div className="mb-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-gray-900">
                {currentQ.question}
              </h2>
              {currentQ.difficulty && (
                <span className="text-sm text-gray-500">
                  {'⭐'.repeat(currentQ.difficulty === 'easy' ? 1 : currentQ.difficulty === 'medium' ? 2 : 3)}
                </span>
              )}
            </div>
          </div>

          {/* Options */}
          <div className="space-y-3 mb-8">
            {currentQ.options && currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedAnswer === option
                    ? 'border-violet-500 bg-violet-50 text-violet-800'
                    : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                }`}
              >
                <span className="font-medium mr-3">
                  {String.fromCharCode(65 + index)})
                </span>
                {option}
              </button>
            ))}
          </div>

          {/* Navigation */}
          <div className="flex justify-between">
            <button
              onClick={handlePreviousQuestion}
              disabled={currentQuestion === 0}
              className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ← Câu trước
            </button>

            <div className="flex space-x-3">
              {currentQuestion === questions.length - 1 ? (
                <button
                  onClick={handleSubmitExam}
                  disabled={isSubmitting || !selectedAnswer}
                  className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? 'Đang nộp bài...' : '✓ Nộp bài'}
                </button>
              ) : (
                <button
                  onClick={handleNextQuestion}
                  disabled={!selectedAnswer}
                  className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Câu tiếp →
                </button>
              )}
            </div>
          </div>

          {/* Question Navigation */}
          <div className="mt-8 pt-6 border-t border-gray-200">
            <h3 className="text-sm font-medium text-gray-700 mb-3">Điều hướng câu hỏi:</h3>
            <div className="flex flex-wrap gap-2">
              {questions.map((_, index) => {
                const hasAnswer = answers.some(a => a.questionIndex === index) || 
                                (index === currentQuestion && selectedAnswer);
                return (
                  <button
                    key={index}
                    onClick={() => {
                      // Save current answer before switching
                      if (selectedAnswer) {
                        const newAnswers = [...answers];
                        const existingIndex = newAnswers.findIndex(a => a.questionIndex === currentQuestion);
                        if (existingIndex >= 0) {
                          newAnswers[existingIndex].selectedAnswer = selectedAnswer;
                        } else {
                          newAnswers.push({
                            questionIndex: currentQuestion,
                            selectedAnswer: selectedAnswer
                          });
                        }
                        setAnswers(newAnswers);
                      }
                      
                      setCurrentQuestion(index);
                      const existingAnswer = answers.find(a => a.questionIndex === index);
                      setSelectedAnswer(existingAnswer?.selectedAnswer || '');
                    }}
                    className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                      index === currentQuestion
                        ? 'bg-violet-600 text-white'
                        : hasAnswer
                        ? 'bg-green-100 text-green-800 border border-green-300'
                        : 'bg-gray-100 text-gray-600 border border-gray-300'
                    }`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
