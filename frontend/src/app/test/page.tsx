"use client";

import { useState } from "react";

export default function TestPage() {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<number[]>([]);
  const [showResult, setShowResult] = useState(false);
  const [testStarted, setTestStarted] = useState(false);

  const questions = [
    {
      question: "I _____ to school every day.",
      options: ["go", "goes", "going", "went"],
      correct: 0,
      level: "A1",
      explanation: "Sử dụng thì hiện tại đơn với chủ ngữ 'I'"
    },
    {
      question: "She _____ a book right now.",
      options: ["read", "reads", "is reading", "was reading"],
      correct: 2,
      level: "A2",
      explanation: "'Right now' chỉ hành động đang diễn ra - thì hiện tại tiếp diễn"
    },
    {
      question: "If I _____ rich, I would travel the world.",
      options: ["am", "was", "were", "will be"],
      correct: 2,
      level: "B1",
      explanation: "Câu điều kiện loại 2: If + were + would"
    },
    {
      question: "The project _____ by the team last month.",
      options: ["completed", "was completed", "has completed", "completes"],
      correct: 1,
      level: "B2",
      explanation: "Câu bị động ở thì quá khứ đơn"
    },
    {
      question: "_____ the weather been like recently?",
      options: ["How", "What", "What has", "How has"],
      correct: 3,
      level: "B2",
      explanation: "Câu hỏi với thì hiện tại hoàn thành"
    },
    {
      question: "I wish I _____ more time to study yesterday.",
      options: ["have had", "had had", "would have", "had"],
      correct: 1,
      level: "C1",
      explanation: "Wish + past perfect để diễn tả điều ước về quá khứ"
    },
    {
      question: "The proposal _____ thorough consideration before approval.",
      options: ["requires", "requiring", "is required", "required"],
      correct: 0,
      level: "C1",
      explanation: "Động từ chính của câu, thì hiện tại đơn"
    },
    {
      question: "_____ the circumstances, we decided to postpone the meeting.",
      options: ["Given", "Giving", "To give", "Having given"],
      correct: 0,
      level: "C2",
      explanation: "'Given' = 'Considering' - cấu trúc phân từ"
    },
    {
      question: "Choose the most appropriate word: The company's profits have _____ significantly this year.",
      options: ["raised", "risen", "arose", "arisen"],
      correct: 1,
      level: "B2",
      explanation: "'Rise' (tăng lên) là động từ bất quy tắc: rise-rose-risen"
    },
    {
      question: "Complete the sentence: _____ you help me with this problem?",
      options: ["Can", "Could", "Would", "Should"],
      correct: 1,
      level: "A2",
      explanation: "'Could' lịch sự hơn 'Can' khi yêu cầu giúp đỡ"
    }
  ];

  const handleAnswer = (answerIndex: number) => {
    const newAnswers = [...answers, answerIndex];
    setAnswers(newAnswers);

    if (currentQuestion < questions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
    } else {
      setShowResult(true);
    }
  };

  const calculateLevel = () => {
    let correctAnswers = 0;
    answers.forEach((answer, index) => {
      if (answer === questions[index].correct) {
        correctAnswers++;
      }
    });

    const percentage = (correctAnswers / questions.length) * 100;
    
    if (percentage >= 85) return { level: "C2", course: "Nâng cao", description: "Thành thạo tiếng Anh như người bản xứ", color: "from-purple-500 to-pink-500" };
    if (percentage >= 70) return { level: "C1", course: "Nâng cao", description: "Sử dụng tiếng Anh hiệu quả và linh hoạt", color: "from-purple-500 to-pink-500" };
    if (percentage >= 55) return { level: "B2", course: "Trung cấp", description: "Giao tiếp tự tin trong môi trường chuyên nghiệp", color: "from-blue-500 to-cyan-500" };
    if (percentage >= 40) return { level: "B1", course: "Trung cấp", description: "Xử lý được các tình huống thường gặp", color: "from-blue-500 to-cyan-500" };
    if (percentage >= 25) return { level: "A2", course: "Cơ bản", description: "Hiểu và sử dụng các cụm từ quen thuộc", color: "from-green-400 to-emerald-500" };
    return { level: "A1", course: "Cơ bản", description: "Mới bắt đầu học tiếng Anh", color: "from-green-400 to-emerald-500" };
  };

  const resetTest = () => {
    setCurrentQuestion(0);
    setAnswers([]);
    setShowResult(false);
    setTestStarted(false);
  };

  if (!testStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-2xl w-full shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-6">📝</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Test trình độ tiếng Anh
            </h1>
            <p className="text-xl text-gray-600 mb-8 leading-relaxed">
              Bài test gồm {questions.length} câu hỏi, thời gian khoảng 5-7 phút. Chúng tôi sẽ đánh giá trình độ của bạn từ A1 đến C2 và gợi ý khóa học miễn phí phù hợp.
            </p>
            
            <div className="bg-gray-50 rounded-2xl p-6 mb-8">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quy tắc làm bài:</h3>
              <ul className="text-left space-y-2 text-gray-700">
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Chọn đáp án đúng nhất cho mỗi câu hỏi
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Không được quay lại câu hỏi trước
                </li>
                <li className="flex items-start">
                  <span className="text-green-500 mr-2">✓</span>
                  Làm bài một cách trung thực để có kết quả chính xác
                </li>
              </ul>
            </div>

            <button
              onClick={() => setTestStarted(true)}
              className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-8 py-4 rounded-xl text-lg font-bold hover:scale-105 transition-all duration-300 shadow-xl"
            >
              🚀 Bắt đầu làm bài
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (showResult) {
    const result = calculateLevel();
    const correctAnswers = answers.filter((answer, index) => answer === questions[index].correct).length;
    
    return (
      <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center p-4">
        <div className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl">
          <div className="text-center">
            <div className="text-6xl mb-6">🎉</div>
            <h1 className="text-4xl font-bold text-gray-900 mb-6">
              Kết quả test của bạn
            </h1>
            
            <div className="bg-gradient-to-r from-violet-100 to-blue-100 rounded-2xl p-8 mb-8 border-2 border-violet-200">
              <div className="text-6xl font-bold text-violet-600 mb-2">{result.level}</div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">{result.description}</h2>
              <p className="text-gray-600 mb-4">
                Bạn trả lời đúng {correctAnswers}/{questions.length} câu hỏi ({Math.round((correctAnswers / questions.length) * 100)}%)
              </p>
              <div className="w-full bg-gray-200 rounded-full h-4 mb-4">
                <div 
                  className="bg-gradient-to-r from-violet-500 to-blue-500 h-4 rounded-full transition-all duration-1000 flex items-center justify-center"
                  style={{ width: `${(correctAnswers / questions.length) * 100}%` }}
                >
                  <span className="text-white text-xs font-bold">
                    {Math.round((correctAnswers / questions.length) * 100)}%
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-yellow-50 border-2 border-yellow-200 rounded-2xl p-6 mb-8">
              <h3 className="text-xl font-bold text-gray-900 mb-4">
                🎯 Khoá học được đề xuất cho bạn:
              </h3>
              <div className="text-2xl font-bold text-violet-600 mb-2">
                Khoá học {result.course}
              </div>
              <p className="text-gray-700 mb-4">
                Phù hợp với trình độ {result.level} của bạn
              </p>
              <button 
                onClick={() => window.location.href = '/courses'}
                className="bg-gradient-to-r from-violet-600 to-blue-600 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                Bắt đầu học ngay
              </button>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button
                onClick={resetTest}
                className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all duration-300"
              >
                🔄 Làm lại bài test
              </button>
              <button
                onClick={() => window.location.href = '/courses'}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-6 py-3 rounded-xl font-semibold hover:scale-105 transition-all duration-300"
              >
                📚 Xem tất cả khoá học
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-600 via-purple-600 to-blue-600 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl p-8 max-w-3xl w-full shadow-2xl">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm font-semibold text-gray-600">
              Câu hỏi {currentQuestion + 1}/{questions.length}
            </span>
            <span className="text-sm font-semibold text-violet-600">
              {questions[currentQuestion].level}
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div 
              className="bg-gradient-to-r from-violet-500 to-blue-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${((currentQuestion + 1) / questions.length) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Question */}
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">
            {questions[currentQuestion].question}
          </h2>
          
          <div className="grid grid-cols-1 gap-4">
            {questions[currentQuestion].options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswer(index)}
                className="bg-gray-50 hover:bg-violet-50 border-2 border-gray-200 hover:border-violet-300 rounded-xl p-4 text-left font-medium transition-all duration-300 hover:scale-105"
              >
                <span className="text-violet-600 font-bold mr-3">
                  {String.fromCharCode(65 + index)}.
                </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Help Text */}
        <div className="text-center text-gray-500 text-sm">
          💡 Chọn đáp án đúng nhất theo bạn
        </div>
      </div>
    </div>
  );
}
