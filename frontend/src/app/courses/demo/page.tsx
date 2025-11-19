"use client";

// Demo page để test giao diện Course Detail
import { useState } from "react";
import "../[id]/course-detail.css";

// Audio Button Component (same as in main component)
interface AudioButtonProps {
  text: string;
  className?: string;
}

function AudioButton({ text, className = "" }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);

  // Function to get the best English (US) voice
  const getBestEnglishVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    
    // Priority order for English voices - more specific matching
    const voicePriorities = [
      // Highest quality US English voices
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name.toLowerCase().includes('google') && voice.name.toLowerCase().includes('us'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name.toLowerCase().includes('microsoft') && voice.name.toLowerCase().includes('david'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name.toLowerCase().includes('microsoft') && voice.name.toLowerCase().includes('zira'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name.toLowerCase().includes('apple') && voice.name.toLowerCase().includes('samantha'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name.toLowerCase().includes('google'),
      
      // Any US English voices
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name.toLowerCase().includes('microsoft'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name.toLowerCase().includes('apple'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name.toLowerCase().includes('chrome'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && !voice.name.toLowerCase().includes('vietnam') && !voice.name.toLowerCase().includes('viet'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US',
      
      // Other high-quality English variants
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-GB' && voice.name.toLowerCase().includes('google'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-AU' && voice.name.toLowerCase().includes('google'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-CA' && voice.name.toLowerCase().includes('google'),
      
      // Any Google English voice
      (voice: SpeechSynthesisVoice) => voice.lang.startsWith('en-') && voice.name.toLowerCase().includes('google'),
      
      // Fallback to any English voice (excluding Vietnamese-influenced ones)
      (voice: SpeechSynthesisVoice) => voice.lang.startsWith('en-') && !voice.name.toLowerCase().includes('vietnam') && !voice.name.toLowerCase().includes('viet'),
      (voice: SpeechSynthesisVoice) => voice.lang.startsWith('en')
    ];

    // Try each priority level
    for (const priorityCheck of voicePriorities) {
      const voice = voices.find(priorityCheck);
      if (voice) {
        console.log('🔊 Selected voice:', voice.name, voice.lang, voice.localService ? '(Local)' : '(Remote)');
        return voice;
      }
    }

    console.warn('⚠️ No suitable English voice found, using default');
    return null;
  };

  const speak = async () => {
    if (isPlaying) return;

    setHasError(false);
    setIsLoading(true);

    try {
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported');
      }

      window.speechSynthesis.cancel();

      // Wait a bit for voices to load if needed
      let voices = window.speechSynthesis.getVoices();
      if (voices.length === 0) {
        // Wait for voices to load
        await new Promise<void>((resolve) => {
          const checkVoices = () => {
            voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              resolve();
            } else {
              setTimeout(checkVoices, 100);
            }
          };
          
          // Also listen for voiceschanged event
          window.speechSynthesis.onvoiceschanged = () => {
            voices = window.speechSynthesis.getVoices();
            if (voices.length > 0) {
              resolve();
            }
          };
          
          checkVoices();
          
          // Timeout after 3 seconds
          setTimeout(() => resolve(), 3000);
        });
      }

      const utterance = new SpeechSynthesisUtterance(text);
      
      // Configure voice settings for clear English pronunciation
      utterance.rate = 0.75; // Slightly slower for better clarity
      utterance.pitch = 1.0;
      utterance.volume = 1.0;
      utterance.lang = 'en-US'; // Force English US

      // Get the best English voice
      const englishVoice = getBestEnglishVoice();
      if (englishVoice) {
        utterance.voice = englishVoice;
        utterance.lang = englishVoice.lang; // Use the voice's specific language
      }

      utterance.onstart = () => {
        setIsLoading(false);
        setIsPlaying(true);
      };

      utterance.onend = () => {
        setIsPlaying(false);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setIsPlaying(false);
        setIsLoading(false);
        setHasError(true);
        setTimeout(() => setHasError(false), 2000);
      };

      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('Audio error:', error);
      setIsLoading(false);
      setHasError(true);
      setTimeout(() => setHasError(false), 2000);
    }
  };

  const getButtonClass = () => {
    let baseClass = `audio-button ${className}`;
    if (isPlaying) baseClass += ' playing';
    if (isLoading) baseClass += ' loading';
    if (hasError) baseClass += ' error';
    return baseClass;
  };

  const getTitle = () => {
    if (isPlaying) return 'Đang phát âm...';
    if (isLoading) return 'Đang tải...';
    if (hasError) return 'Lỗi phát âm, nhấn để thử lại';
    return `Phát âm: "${text}"`;
  };

  return (
    <button
      className={getButtonClass()}
      onClick={speak}
      disabled={isLoading}
      title={getTitle()}
      aria-label={`Phát âm từ ${text}`}
    >
      <span className="speaker-icon"></span>
    </button>
  );
}

const demoData = {
  _id: "demo-course-1",
  name: "English Fundamentals",
  description: "Khóa học tiếng Anh cơ bản cho người mới bắt đầu",
  level: "Beginner" as const,
  image: "https://images.unsplash.com/photo-1434030216411-0b793f4b4173?w=400&h=300&fit=crop",
  duration: 20,
  vocabularies: [
    {
      word: "Hello",
      meaning: "Xin chào",
      example: "Hello, how are you today?",
      pronunciation: "/həˈloʊ/",
      partOfSpeech: "Interjection"
    },
    {
      word: "Beautiful",
      meaning: "Đẹp, xinh đẹp",
      example: "She has a beautiful smile.",
      pronunciation: "/ˈbjuːtɪfəl/",
      partOfSpeech: "Adjective"
    },
    {
      word: "Study",
      meaning: "Học, nghiên cứu",
      example: "I study English every day.",
      pronunciation: "/ˈstʌdi/",
      partOfSpeech: "Verb"
    }
  ],
  grammars: [
    {
      topic: "Present Simple Tense",
      explanation: "Thì hiện tại đơn được sử dụng để diễn tả thói quen, sự thật hiển nhiên, hoặc hành động lặp đi lặp lại.",
      example: "I eat breakfast every morning.",
      rules: [
        "Với chủ ngữ số ít (he, she, it): thêm 's' hoặc 'es' vào động từ",
        "Với chủ ngữ số nhiều (I, you, we, they): giữ nguyên động từ gốc",
        "Câu phủ định: don't/doesn't + động từ nguyên mẫu",
        "Câu hỏi: Do/Does + chủ ngữ + động từ nguyên mẫu?"
      ],
      commonMistakes: [
        "Quên thêm 's' cho ngôi thứ 3 số ít: 'He eat' → 'He eats'",
        "Dùng sai trợ động từ: 'He don't like' → 'He doesn't like'"
      ]
    },
    {
      topic: "Articles (A, An, The)",
      explanation: "Mạo từ được sử dụng trước danh từ để xác định tính chất cụ thể hay chung chung của danh từ đó.",
      example: "I saw a cat. The cat was sleeping.",
      rules: [
        "A: dùng trước danh từ số ít bắt đầu bằng phụ âm",
        "An: dùng trước danh từ số ít bắt đầu bằng nguyên âm",
        "The: dùng khi danh từ đã được xác định cụ thể"
      ],
      commonMistakes: [
        "Dùng 'a' trước nguyên âm: 'a apple' → 'an apple'",
        "Quên dùng mạo từ: 'I have car' → 'I have a car'"
      ]
    }
  ],
  exercises: [
    {
      question: "Choose the correct form of the verb: 'She _____ to school every day.'",
      type: "multiple-choice",
      options: ["go", "goes", "going", "went"],
      correctAnswer: "goes",
      explanation: "Với chủ ngữ 'she' (ngôi thứ 3 số ít), động từ phải thêm 's': go → goes",
      difficulty: "easy",
      points: 10
    },
    {
      question: "Fill in the blank with the correct article: 'I saw _____ elephant at the zoo.'",
      type: "multiple-choice",
      options: ["a", "an", "the", "no article"],
      correctAnswer: "an",
      explanation: "Dùng 'an' trước từ 'elephant' vì bắt đầu bằng nguyên âm 'e'",
      difficulty: "easy",
      points: 10
    },
    {
      question: "Which sentence is correct?",
      type: "multiple-choice",
      options: [
        "He don't like coffee",
        "He doesn't like coffee", 
        "He not like coffee",
        "He doesn't likes coffee"
      ],
      correctAnswer: "He doesn't like coffee",
      explanation: "Với ngôi thứ 3 số ít, dùng 'doesn't' + động từ nguyên mẫu",
      difficulty: "medium",
      points: 15
    }
  ]
};

export default function CourseDemoPage() {
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar' | 'exercises' | 'progress'>('vocabulary');

  const tabs = [
    { id: 'vocabulary', label: 'Từ vựng', icon: '📚', count: demoData.vocabularies.length },
    { id: 'grammar', label: 'Ngữ pháp', icon: '📖', count: demoData.grammars.length },
    { id: 'exercises', label: 'Bài tập', icon: '📝', count: demoData.exercises.length },
    { id: 'progress', label: 'Tiến độ', icon: '📊', count: 0 }
  ];

  const getLevelColor = (level: string) => {
    switch (level.toLowerCase()) {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 course-detail">
      {/* Demo Banner */}
      <div className="bg-gradient-to-r from-violet-600 to-blue-600 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-lg font-semibold">🎨 DEMO: Course Detail UI/UX Design</h1>
            <p className="text-sm opacity-90">Giao diện chi tiết khóa học với dữ liệu mẫu</p>
          </div>
        </div>
      </div>

      {/* Course Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
            <img 
              src={demoData.image} 
              alt={demoData.name}
              className="w-32 h-32 rounded-2xl object-cover shadow-lg mb-6 lg:mb-0"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{demoData.name}</h1>
              <p className="text-gray-600 mb-4">{demoData.description}</p>
              <div className="flex flex-wrap items-center gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(demoData.level)}`}>
                  Cơ bản
                </span>
                <span className="text-sm text-gray-500">⏱️ {demoData.duration} giờ</span>
                <span className="text-sm text-gray-500">
                  📚 {demoData.vocabularies.length + demoData.grammars.length + demoData.exercises.length} nội dung
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto tab-navigation">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 tab-indicator ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-600 active'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                <span className="text-lg">{tab.icon}</span>
                <span>{tab.label}</span>
                {tab.count > 0 && (
                  <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full">
                    {tab.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeTab === 'vocabulary' && (
          <DemoVocabularySection vocabularies={demoData.vocabularies} />
        )}
        {activeTab === 'grammar' && (
          <DemoGrammarSection grammars={demoData.grammars} />
        )}
        {activeTab === 'exercises' && (
          <DemoExercisesSection exercises={demoData.exercises} />
        )}
        {activeTab === 'progress' && (
          <DemoProgressSection course={demoData} />
        )}
      </div>
    </div>
  );
}

// Demo Vocabulary Section
function DemoVocabularySection({ vocabularies }: { vocabularies: any[] }) {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPOS, setFilterPOS] = useState('all');
  const [studyMode, setStudyMode] = useState(false);
  const [currentCardIndex, setCurrentCardIndex] = useState(0);
  const [flippedCards, setFlippedCards] = useState<Set<number>>(new Set());
  const [knownWords, setKnownWords] = useState<Set<number>>(new Set());
  const [studyStats, setStudyStats] = useState({
    studied: 0,
    known: 0,
    remaining: 0
  });

  const filteredVocabs = vocabularies.filter(vocab => {
    const matchesSearch = vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesPOS = filterPOS === 'all' || vocab.partOfSpeech?.toLowerCase() === filterPOS.toLowerCase();
    return matchesSearch && matchesPOS;
  });

  const handleCardFlip = (index: number) => {
    const newFlipped = new Set(flippedCards);
    if (newFlipped.has(index)) {
      newFlipped.delete(index);
    } else {
      newFlipped.add(index);
    }
    setFlippedCards(newFlipped);
  };

  const handleKnowWord = () => {
    const newKnown = new Set(knownWords);
    newKnown.add(currentCardIndex);
    setKnownWords(newKnown);
    
    setStudyStats(prev => ({
      ...prev,
      known: newKnown.size,
      studied: prev.studied + 1,
      remaining: filteredVocabs.length - prev.studied - 1
    }));
    
    nextCard();
  };

  const handleDontKnowWord = () => {
    setStudyStats(prev => ({
      ...prev,
      studied: prev.studied + 1,
      remaining: filteredVocabs.length - prev.studied - 1
    }));
    
    nextCard();
  };

  const nextCard = () => {
    if (currentCardIndex < filteredVocabs.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      const newFlipped = new Set(flippedCards);
      newFlipped.delete(currentCardIndex + 1);
      setFlippedCards(newFlipped);
    }
  };

  const prevCard = () => {
    if (currentCardIndex > 0) {
      setCurrentCardIndex(currentCardIndex - 1);
    }
  };

  const shuffleCards = () => {
    setCurrentCardIndex(0);
    setFlippedCards(new Set());
    setKnownWords(new Set());
    setStudyStats({
      studied: 0,
      known: 0,
      remaining: filteredVocabs.length
    });
  };

  if (studyMode) {
    return (
      <div className="study-mode">
        {/* Study Stats */}
        <div className="study-stats">
          <div className="study-stat">
            <div className="study-stat-value text-blue-600">{studyStats.studied}</div>
            <div className="study-stat-label">Đã học</div>
          </div>
          <div className="study-stat">
            <div className="study-stat-value text-green-600">{studyStats.known}</div>
            <div className="study-stat-label">Đã biết</div>
          </div>
          <div className="study-stat">
            <div className="study-stat-value text-orange-600">{studyStats.remaining}</div>
            <div className="study-stat-label">Còn lại</div>
          </div>
        </div>

        {/* Mode Toggle */}
        <div className="text-center">
          <button 
            onClick={() => setStudyMode(false)}
            className="flashcard-mode-toggle"
          >
            📚 Chế độ xem tất cả
          </button>
        </div>

        {filteredVocabs.length > 0 && currentCardIndex < filteredVocabs.length ? (
          <div>
            {/* Flashcard */}
            <div className="flashcard-container">
              <div 
                className={`flashcard ${flippedCards.has(currentCardIndex) ? 'flipped' : ''}`}
                onClick={(e) => {
                  if (!(e.target as Element).closest('.flashcard-audio')) {
                    handleCardFlip(currentCardIndex);
                  }
                }}
              >
                {/* Front of card */}
                <div className="flashcard-front">
                  <div className="flashcard-audio">
                    <AudioButton 
                      text={filteredVocabs[currentCardIndex].word}
                      className=""
                    />
                  </div>
                  <div className="flashcard-word">
                    {filteredVocabs[currentCardIndex].word}
                  </div>
                  {filteredVocabs[currentCardIndex].pronunciation && (
                    <div className="flashcard-pronunciation">
                      {filteredVocabs[currentCardIndex].pronunciation}
                    </div>
                  )}
                  {filteredVocabs[currentCardIndex].partOfSpeech && (
                    <div className="flashcard-pos">
                      {filteredVocabs[currentCardIndex].partOfSpeech}
                    </div>
                  )}
                  <div className="mt-4 text-sm text-gray-500">
                    👆 Nhấn để xem nghĩa | 🔊 Nghe phát âm
                  </div>
                </div>

                {/* Back of card */}
                <div className="flashcard-back">
                  <div className="flashcard-audio">
                    <AudioButton 
                      text={filteredVocabs[currentCardIndex].example}
                      className=""
                    />
                  </div>
                  <div className="flashcard-meaning">
                    {filteredVocabs[currentCardIndex].meaning}
                  </div>
                  <div className="flashcard-example">
                    "{filteredVocabs[currentCardIndex].example}"
                  </div>
                  <div className="mt-4 text-sm text-white opacity-75">
                    🔊 Nghe ví dụ câu
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="flashcard-controls">
              <button 
                onClick={prevCard}
                disabled={currentCardIndex === 0}
                className="flashcard-nav-btn"
                title="Từ trước"
              >
                ←
              </button>
              
              <div className="flashcard-progress">
                {currentCardIndex + 1} / {filteredVocabs.length}
              </div>
              
              <button 
                onClick={nextCard}
                disabled={currentCardIndex === filteredVocabs.length - 1}
                className="flashcard-nav-btn"
                title="Từ tiếp theo"
              >
                →
              </button>
            </div>

            {/* Action Buttons */}
            {flippedCards.has(currentCardIndex) && (
              <div className="flashcard-actions">
                <button 
                  onClick={handleDontKnowWord}
                  className="action-btn dont-know"
                >
                  😕 Chưa biết
                </button>
                <button 
                  onClick={() => nextCard()}
                  className="action-btn skip"
                >
                  ⏭️ Bỏ qua
                </button>
                <button 
                  onClick={handleKnowWord}
                  className="action-btn know"
                >
                  😊 Đã biết
                </button>
              </div>
            )}

            {/* Additional Controls */}
            <div className="text-center mt-6">
              <button 
                onClick={shuffleCards}
                className="text-violet-600 hover:text-violet-700 transition-colors text-sm"
              >
                🔄 Bắt đầu lại
              </button>
            </div>
          </div>
        ) : (
          <div className="text-center py-12">
            <h3 className="text-xl font-bold text-gray-900 mb-4">🎉 Hoàn thành!</h3>
            <p className="text-gray-600 mb-6">
              Bạn đã học xong {filteredVocabs.length} từ vựng. 
              Tỷ lệ đúng: {Math.round((studyStats.known / filteredVocabs.length) * 100)}%
            </p>
            <button 
              onClick={shuffleCards}
              className="flashcard-mode-toggle"
            >
              🔄 Học lại
            </button>
          </div>
        )}
      </div>
    );
  }

  return (
    <div>
      {/* Search and Filters */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="md:col-span-2">
            <input
              type="text"
              placeholder="Tìm kiếm từ vựng..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
            />
          </div>
          <select
            value={filterPOS}
            onChange={(e) => setFilterPOS(e.target.value)}
            className="px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
          >
            <option value="all">Tất cả loại từ</option>
            <option value="noun">Danh từ</option>
            <option value="verb">Động từ</option>
            <option value="adjective">Tính từ</option>
            <option value="adverb">Trạng từ</option>
            <option value="interjection">Thán từ</option>
          </select>
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="text-center mb-6">
        <button 
          onClick={() => {
            setStudyMode(true);
            setStudyStats({
              studied: 0,
              known: 0,
              remaining: filteredVocabs.length
            });
          }}
          className="flashcard-mode-toggle"
        >
          🎯 Chế độ học Flashcard
        </button>
      </div>

      {/* Vocabulary Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 vocab-grid">
        {filteredVocabs.map((vocab, index) => (
          <div key={index} className="flashcard-container">
            <div 
              className={`flashcard ${flippedCards.has(index) ? 'flipped' : ''}`}
              onClick={(e) => {
                if (!(e.target as Element).closest('.flashcard-audio')) {
                  handleCardFlip(index);
                }
              }}
            >
              {/* Front of card */}
              <div className="flashcard-front">
                <div className="flashcard-audio">
                  <AudioButton 
                    text={vocab.word}
                    className=""
                  />
                </div>
                <div className="flashcard-word">{vocab.word}</div>
                {vocab.pronunciation && (
                  <div className="flashcard-pronunciation">{vocab.pronunciation}</div>
                )}
                {vocab.partOfSpeech && (
                  <div className="flashcard-pos">{vocab.partOfSpeech}</div>
                )}
                <div className="mt-4 text-sm text-gray-500">
                  👆 Nhấn để xem nghĩa | 🔊 Nghe phát âm
                </div>
              </div>

              {/* Back of card */}
              <div className="flashcard-back">
                <div className="flashcard-audio">
                  <AudioButton 
                    text={vocab.example}
                    className=""
                  />
                </div>
                <div className="flashcard-meaning">{vocab.meaning}</div>
                <div className="flashcard-example">"{vocab.example}"</div>
                <div className="mt-4 text-sm text-white opacity-75">
                  🔊 Nghe ví dụ câu
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// Demo Grammar Section
function DemoGrammarSection({ grammars }: { grammars: any[] }) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set([0])); // Expand first item by default

  const toggleExpand = (index: number) => {
    const newExpanded = new Set(expandedItems);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedItems(newExpanded);
  };

  return (
    <div className="space-y-6">
      {grammars.map((grammar, index) => (
        <div key={index} className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div 
            className="p-6 cursor-pointer hover:bg-gray-50 transition-colors duration-200"
            onClick={() => toggleExpand(index)}
          >
            <div className="flex items-center justify-between">
              <h3 className="text-xl font-bold text-gray-900">{grammar.topic}</h3>
              <button className="text-violet-600 hover:text-violet-700 transition-colors">
                {expandedItems.has(index) ? '🔼' : '🔽'}
              </button>
            </div>
          </div>
          
          <div className={`grammar-content ${expandedItems.has(index) ? 'expanded' : ''}`}>
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">📝 Giải thích:</h4>
                  <p className="text-gray-600">{grammar.explanation}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">📖 Ví dụ:</h4>
                  <p className="text-gray-700 italic bg-gray-50 p-3 rounded-lg">"{grammar.example}"</p>
                </div>
                
                {grammar.rules && grammar.rules.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">📋 Quy tắc:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {grammar.rules.map((rule: string, ruleIndex: number) => (
                        <li key={ruleIndex} className="text-gray-600">{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {grammar.commonMistakes && grammar.commonMistakes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">⚠️ Lỗi thường gặp:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {grammar.commonMistakes.map((mistake: string, mistakeIndex: number) => (
                        <li key={mistakeIndex} className="text-red-600">{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Demo Exercises Section
function DemoExercisesSection({ exercises }: { exercises: any[] }) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
  };

  const handleSubmit = () => {
    setShowResult(true);
    if (selectedAnswer === exercises[currentExercise].correctAnswer) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      setSelectedAnswer('');
      setShowResult(false);
    }
  };

  const exercise = exercises[currentExercise];

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 exercise-container">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500">
            Câu hỏi {currentExercise + 1}/{exercises.length}
          </span>
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">
              {'⭐'.repeat(exercise.difficulty === 'easy' ? 1 : exercise.difficulty === 'medium' ? 2 : 3)}
            </span>
            <span className="text-sm text-gray-500">{exercise.difficulty}</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="progress-bar mb-6">
          <div 
            className="progress-fill" 
            style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{exercise.question}</h3>
          
          {/* Options */}
          <div className="space-y-3">
            {exercise.options.map((option: string, index: number) => (
              <button
                key={index}
                onClick={() => !showResult && handleAnswerSelect(option)}
                disabled={showResult}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 exercise-option ${
                  showResult
                    ? option === exercise.correctAnswer
                      ? 'border-green-500 bg-green-50 text-green-800'
                      : option === selectedAnswer && option !== exercise.correctAnswer
                      ? 'border-red-500 bg-red-50 text-red-800'
                      : 'border-gray-200 bg-gray-50 text-gray-500'
                    : selectedAnswer === option
                    ? 'border-violet-500 bg-violet-50 text-violet-800'
                    : 'border-gray-200 hover:border-violet-300 hover:bg-violet-50'
                }`}
              >
                <span className="font-medium">{String.fromCharCode(65 + index)}) </span>
                {option}
              </button>
            ))}
          </div>
        </div>

        {/* Result */}
        {showResult && exercise.explanation && (
          <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-xl">
            <h4 className="font-medium text-blue-800 mb-2">💡 Giải thích:</h4>
            <p className="text-blue-700">{exercise.explanation}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex justify-between items-center">
          <div className="text-sm text-gray-500">
            Điểm: {score}/{exercises.length} ({Math.round((score / exercises.length) * 100)}%)
          </div>
          <div className="space-x-4">
            {!showResult ? (
              <button
                onClick={handleSubmit}
                disabled={!selectedAnswer}
                className="bg-violet-600 hover:bg-violet-700 disabled:bg-gray-300 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                Kiểm tra
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                {currentExercise < exercises.length - 1 ? 'Câu tiếp theo' : 'Hoàn thành'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// Demo Progress Section
function DemoProgressSection({ course }: { course: any }) {
  const totalContent = course.vocabularies.length + course.grammars.length + course.exercises.length;
  
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-3xl font-bold text-violet-600 mb-2">
            {course.vocabularies.length}
          </div>
          <div className="text-sm text-gray-600">Từ vựng</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-3xl font-bold text-blue-600 mb-2">
            {course.grammars.length}
          </div>
          <div className="text-sm text-gray-600">Ngữ pháp</div>
        </div>
        
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 text-center">
          <div className="text-3xl font-bold text-green-600 mb-2">
            {course.exercises.length}
          </div>
          <div className="text-sm text-gray-600">Bài tập</div>
        </div>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">Tổng quan khóa học</h3>
        <div className="space-y-4">
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Tổng nội dung:</span>
            <span className="font-medium">{totalContent} mục</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Thời lượng ước tính:</span>
            <span className="font-medium">{course.duration} giờ</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-gray-600">Cấp độ:</span>
            <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
              Cơ bản
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
