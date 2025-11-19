"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import "./course-detail.css";
import { toast } from 'react-hot-toast';
import { API_BASE_URL } from "../../config/api";

// Audio Button Component
interface AudioButtonProps {
  text: string;
  className?: string;
}

function AudioButton({ text, className = "" }: AudioButtonProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<string>('');

  // Function to get the best English (US) voice
  const getBestEnglishVoice = () => {
    const voices = window.speechSynthesis.getVoices();
    
    // Priority order for English voices - more specific matching
    const voicePriorities = [
      // Highest quality US English voices
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name?.toLowerCase().includes('google') && voice.name?.toLowerCase().includes('us'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name?.toLowerCase().includes('microsoft') && voice.name?.toLowerCase().includes('david'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name?.toLowerCase().includes('microsoft') && voice.name?.toLowerCase().includes('zira'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name?.toLowerCase().includes('apple') && voice.name?.toLowerCase().includes('samantha'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name?.toLowerCase().includes('google'),
      
      // Any US English voices
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name?.toLowerCase().includes('microsoft'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name?.toLowerCase().includes('apple'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && voice.name?.toLowerCase().includes('chrome'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US' && !voice.name?.toLowerCase().includes('vietnam') && !voice.name?.toLowerCase().includes('viet'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-US',
      
      // Other high-quality English variants
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-GB' && voice.name?.toLowerCase().includes('google'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-AU' && voice.name?.toLowerCase().includes('google'),
      (voice: SpeechSynthesisVoice) => voice.lang === 'en-CA' && voice.name?.toLowerCase().includes('google'),
      
      // Any Google English voice
      (voice: SpeechSynthesisVoice) => voice.lang.startsWith('en-') && voice.name?.toLowerCase().includes('google'),
      
      // Fallback to any English voice (excluding Vietnamese-influenced ones)
      (voice: SpeechSynthesisVoice) => voice.lang.startsWith('en-') && !voice.name?.toLowerCase().includes('vietnam') && !voice.name?.toLowerCase().includes('viet'),
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

    // Reset states
    setHasError(false);
    setIsLoading(true);

    try {
      // Check if speech synthesis is supported
      if (!('speechSynthesis' in window)) {
        throw new Error('Speech synthesis not supported');
      }

      // Cancel any ongoing speech
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

      // Create utterance
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
        setSelectedVoice(`${englishVoice.name} (${englishVoice.lang})`);
      } else {
        setSelectedVoice('Default voice');
      }

      // Set up event listeners
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
        
        // Reset error state after 2 seconds
        setTimeout(() => setHasError(false), 2000);
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('Audio error:', error);
      setIsLoading(false);
      setHasError(true);
      
      // Reset error state after 2 seconds
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
      data-voice={selectedVoice}
    >
      <span className="speaker-icon"></span>
    </button>
  );
}


interface Vocabulary {
  word: string;
  meaning: string;
  example: string;
  pronunciation?: string;
  partOfSpeech?: string;
}

interface Grammar {
  topic: string;
  explanation: string;
  example: string;
  rules?: string[];
  commonMistakes?: string[];
}

interface Exercise {
  question: string;
  type: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
  points?: number;
}

interface Course {
  _id: string;
  name: string;
  description: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  image: string;
  duration: number;
  vocabularies: Vocabulary[];
  grammars: Grammar[];
  exercises: Exercise[];
}

export default function CoursePage() {
  const params = useParams();
  const { isLoggedIn, user } = useAuth();
  const [course, setCourse] = useState<Course | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'vocabulary' | 'grammar' | 'exercises' | 'progress' | 'final-exam'>('vocabulary');
  const [searchTerm, setSearchTerm] = useState('');
  const [overallProgress, setOverallProgress] = useState(0);
  useEffect(() => {
    if (params.id) {
      fetchCourse(params.id as string);
    }
  }, [params.id]);

  useEffect(() => {
    // Listen for tab switch events from exercises
    const handleSwitchToProgress = () => {
      setActiveTab('progress');
    };

    window.addEventListener('switchToProgress', handleSwitchToProgress);

    return () => {
      window.removeEventListener('switchToProgress', handleSwitchToProgress);
    };
  }, []);

  const fetchCourse = async (courseId: string) => {
    try {
      setIsLoading(true);
      const response = await fetch(`${API_BASE_URL}/api/courses/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setCourse(data.course || data);
      } else {
        toast.error('Không thể tải thông tin khóa học');
      }
    } catch (error) {
      console.error('Error fetching course:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getLevelColor = (level: string) => {
    switch (level?.toLowerCase() || '') {
      case 'beginner': return 'bg-green-100 text-green-800';
      case 'intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Base tabs that are always available
  const baseTabs = [
    { id: 'vocabulary', label: 'Từ vựng', icon: '📚', count: course?.vocabularies?.length || 0 },
    { id: 'grammar', label: 'Ngữ pháp', icon: '📖', count: course?.grammars?.length || 0 },
    { id: 'exercises', label: 'Bài tập', icon: '📝', count: course?.exercises?.length || 0 },
    { id: 'progress', label: 'Tiến độ', icon: '📊', count: 0 }
  ];

  // Add exam tab only if progress >= 80%
  const tabs = overallProgress >= 80 
    ? [...baseTabs, { id: 'final-exam', label: 'Kiểm tra', icon: '🎓', count: 0 }]
    : baseTabs;

  // Auto switch away from final-exam tab if progress < 80%
  useEffect(() => {
    if (activeTab === 'final-exam' && overallProgress < 80) {
      setActiveTab('progress');
    }
  }, [overallProgress, activeTab]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải khóa học...</p>
        </div>
      </div>
    );
  }

  // Require login to view course details
  if (!isLoggedIn || !user) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-2xl shadow-lg p-8 text-center">
          <div className="text-violet-600 text-6xl mb-6">🔐</div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Cần đăng nhập</h2>
          <p className="text-gray-600 mb-6">
            Bạn cần đăng nhập để xem chi tiết khóa học và theo dõi tiến độ học tập
          </p>
          <div className="space-y-3">
            <button
              onClick={() => window.location.href = '/login'}
              className="w-full bg-violet-600 text-white py-3 px-6 rounded-xl font-semibold hover:bg-violet-700 transition-colors"
            >
              Đăng nhập
            </button>
            <button
              onClick={() => window.location.href = '/register'}
              className="w-full bg-gray-100 text-gray-700 py-3 px-6 rounded-xl font-semibold hover:bg-gray-200 transition-colors"
            >
              Đăng ký tài khoản
            </button>
            <button
              onClick={() => window.location.href = '/courses'}
              className="w-full text-gray-500 py-2 px-6 rounded-xl font-medium hover:text-gray-700 transition-colors"
            >
              ← Quay lại danh sách khóa học
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Không tìm thấy khóa học</h2>
          <p className="text-gray-600">Khóa học bạn tìm kiếm không tồn tại hoặc đã bị xóa.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 course-detail">
      {/* Course Header */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex flex-col lg:flex-row lg:items-center lg:space-x-8">
            <img 
              src={course.image} 
              alt={course.name}
              className="w-32 h-32 rounded-2xl object-cover shadow-lg mb-6 lg:mb-0"
            />
            <div className="flex-1">
              <h1 className="text-3xl font-bold text-gray-900 mb-2">{course.name}</h1>
              <p className="text-gray-600 mb-4">{course.description}</p>
              <div className="flex flex-wrap items-center gap-4">
                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getLevelColor(course.level)}`}>
                  {course.level === 'Beginner' ? 'Cơ bản' : 
                   course.level === 'Intermediate' ? 'Trung cấp' : 'Nâng cao'}
                </span>
                <span className="text-sm text-gray-500">⏱️ {course.duration} giờ</span>
                <span className="text-sm text-gray-500">
                  📚 {(course.vocabularies?.length || 0) + (course.grammars?.length || 0) + (course.exercises?.length || 0)} nội dung
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex space-x-8 overflow-x-auto">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-4 px-2 border-b-2 font-medium text-sm whitespace-nowrap transition-colors duration-200 ${
                  activeTab === tab.id
                    ? 'border-violet-500 text-violet-600'
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
          <VocabularySection 
            vocabularies={course.vocabularies || []} 
            courseId={course._id}
            onProgressUpdate={(progress) => setOverallProgress(progress)}
          />
        )}
        {activeTab === 'grammar' && (
          <GrammarSection grammars={course.grammars || []} />
        )}
        {activeTab === 'exercises' && (
          <ExercisesSection 
            exercises={course.exercises || []} 
            courseId={course._id}
            onProgressUpdate={(progress) => setOverallProgress(progress)}
          />
        )}
        {activeTab === 'progress' && (
          <ProgressSection 
            course={course} 
            onStartExam={() => setActiveTab('final-exam')}
            onProgressUpdate={(progress) => setOverallProgress(progress)}
          />
        )}
        {activeTab === 'final-exam' && (
          <FinalExamSection 
            course={course}
            onBackToProgress={() => setActiveTab('progress')}
          />
        )}
      </div>
    </div>
  );
}

// Vocabulary Section Component
function VocabularySection({ vocabularies, courseId, onProgressUpdate }: { 
  vocabularies: Vocabulary[], 
  courseId: string,
  onProgressUpdate?: (progress: number) => void 
}) {
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
  const [favouriteVocabs, setFavouriteVocabs] = useState<Set<number>>(new Set());

  // Helper function to get Vietnamese label for part of speech
  const getPartOfSpeechLabel = (pos: string): string => {
    const posLabels: { [key: string]: string } = {
      'noun': 'Danh từ',
      'verb': 'Động từ', 
      'adjective': 'Tính từ',
      'adverb': 'Trạng từ',
      'preposition': 'Giới từ',
      'conjunction': 'Liên từ',
      'pronoun': 'Đại từ',
      'interjection': 'Thán từ'
    };
    return posLabels[pos?.toLowerCase() || ''] || pos;
  };

  // Get user ID from auth context
  const { isLoggedIn: isUserLoggedIn, user: currentUser } = useAuth();
  const userId = isUserLoggedIn && currentUser ? currentUser.id : null;

  useEffect(() => {
    if (userId) {
      // Fetch study stats from backend
      fetch(`${API_BASE_URL}/api/results/study/${userId}/${courseId}/vocabulary`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.result?.studyStats) {
            setStudyStats(data.result.studyStats);
          }
        })
        .catch(error => console.error('Error fetching study stats:', error));
      
      // Load favourite status for all vocabularies
      fetch(`${API_BASE_URL}/api/vocabularies?userId=${userId}&favourite=true`)
        .then(response => response.json())
        .then(data => {
          if (data.success && data.data) {
            const favouriteWords = new Set(data.data.map((v: any) => v.word?.toLowerCase() || ''));
            const newFavourites = new Set<number>();
            vocabularies.forEach((vocab, index) => {
              if (favouriteWords.has(vocab.word?.toLowerCase() || '')) {
                newFavourites.add(index);
              }
            });
            setFavouriteVocabs(newFavourites);
          }
        })
        .catch(error => console.error('Error loading favourites:', error));
    }
  }, [userId, courseId, vocabularies]);

  // Function to toggle favourite
  const toggleFavourite = async (vocab: Vocabulary, index: number, e: React.MouseEvent) => {
    e.stopPropagation(); // Prevent card flip
    
    if (!isUserLoggedIn) {
      toast.error('Vui lòng đăng nhập để lưu từ vựng yêu thích');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      
      // Check if THIS USER already has this vocabulary
      const searchResponse = await fetch(`${API_BASE_URL}/api/vocabularies?word=${encodeURIComponent(vocab.word)}&userId=${userId}`);
      const searchData = await searchResponse.json();
      
      // Find exact match for this user
      const existingVocab = searchData.success && searchData.data 
        ? searchData.data.find((v: any) => 
            (v.word?.toLowerCase() || '') === (vocab.word?.toLowerCase() || '') && 
            v.userId === userId
          )
        : null;
      
      if (existingVocab) {
        // User already has this vocabulary, toggle its favourite status
        const response = await fetch(`${API_BASE_URL}/api/vocabularies/${existingVocab._id}/favourite`, {
          method: 'PATCH',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        });
        
        const data = await response.json();
        if (data.success) {
          const newFavourites = new Set(favouriteVocabs);
          if (data.data.favourite) {
            newFavourites.add(index);
          } else {
            newFavourites.delete(index);
          }
          setFavouriteVocabs(newFavourites);
        }
      } else {
        // User doesn't have this vocabulary yet, create it as favourite
        const response = await fetch(`${API_BASE_URL}/api/vocabularies`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            word: vocab.word,
            meaning: vocab.meaning,
            example: vocab.example,
            pronunciation: vocab.pronunciation,
            partOfSpeech: vocab.partOfSpeech,
            favourite: true,
            userId
          })
        });
        
        const data = await response.json();
        if (data.success) {
          const newFavourites = new Set(favouriteVocabs);
          newFavourites.add(index);
          setFavouriteVocabs(newFavourites);
        }
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
    }
  };

  // Function to update progress in backend
  const updateProgressInBackend = async (studied: number, known: number, total: number) => {
    if (!userId) {
      // Skip progress update if not logged in, but allow viewing
      return;
    }
    
    try {
      const response = await fetch(`${API_BASE_URL}/api/results/progress/${userId}/${courseId}/vocabulary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studied, known, total })
      });
      
      const data = await response.json();
      
      // Notify parent component with updated progress
      if (onProgressUpdate && data.success && data.result?.progress?.overall?.percentage !== undefined) {
        onProgressUpdate(data.result.progress.overall.percentage);
      }
    } catch (error) {
      console.error('❌ Error updating vocabulary progress:', error);
    }
  };

  const filteredVocabs = vocabularies.filter(vocab => {
    const matchesSearch = (vocab.word?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
                         (vocab.meaning?.toLowerCase() || '').includes(searchTerm.toLowerCase());
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
    
    const newStudied = Math.min(currentCardIndex + 1, filteredVocabs.length);
    const remaining = Math.max(0, filteredVocabs.length - newStudied);
    
    const newStats = {
      studied: newStudied,
      known: newKnown.size,
      remaining: remaining
    };
    
    setStudyStats(newStats);
    
    // Update progress in backend
    updateProgressInBackend(newStats.studied, newStats.known, vocabularies.length);
    
    nextCard();
  };

  const handleDontKnowWord = () => {
    const newStudied = Math.min(currentCardIndex + 1, filteredVocabs.length);
    const remaining = Math.max(0, filteredVocabs.length - newStudied);
    
    const newStats = {
      studied: newStudied,
      known: knownWords.size,
      remaining: remaining
    };
    
    setStudyStats(newStats);
    
    // Update progress in backend
    updateProgressInBackend(newStats.studied, newStats.known, vocabularies.length);
    
    nextCard();
  };

  const nextCard = () => {
    if (currentCardIndex < filteredVocabs.length - 1) {
      setCurrentCardIndex(currentCardIndex + 1);
      // Reset flip state for new card
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
    const shuffledVocabs = [...vocabularies].sort(() => 0.5 - Math.random());
    // Note: vocabularies is a prop, we can't directly modify it
    // This would need to be handled by the parent component
    setCurrentCardIndex(0);
    setFlippedCards(new Set());
    setKnownWords(new Set());
    setStudyStats({
      studied: 0,
      known: 0,
      remaining: vocabularies.length
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
                  // Prevent flip when clicking audio button
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
                      {getPartOfSpeechLabel(filteredVocabs[currentCardIndex].partOfSpeech)}
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
            <option value="preposition">Giới từ</option>
            <option value="conjunction">Liên từ</option>
            <option value="pronoun">Đại từ</option>
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
                // Prevent flip when clicking audio button
                if (!(e.target as Element).closest('.flashcard-audio')) {
                  handleCardFlip(index);
                }
              }}
            >
              {/* Front of card */}
              <div className="flashcard-front">
                {/* Favourite Heart Icon - Top Left */}
                <button
                  onClick={(e) => toggleFavourite(vocab, index, e)}
                  className="absolute top-3 left-3 hover:scale-125 transition-all z-20"
                  title={favouriteVocabs.has(index) ? 'Bỏ yêu thích' : 'Yêu thích'}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '28px',
                    color: favouriteVocabs.has(index) ? '#dc2626' : '#d1d5db',
                    filter: favouriteVocabs.has(index) ? 'drop-shadow(0 0 2px rgba(220, 38, 38, 0.5))' : 'none'
                  }}
                >
                  {favouriteVocabs.has(index) ? '♥' : '♡'}
                </button>
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
                  <div className="flashcard-pos">{getPartOfSpeechLabel(vocab.partOfSpeech)}</div>
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

      {filteredVocabs.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Không tìm thấy từ vựng nào.</p>
        </div>
      )}
    </div>
  );
}

// Grammar Section Component  
function GrammarSection({ grammars }: { grammars: Grammar[] }) {
  const [expandedItems, setExpandedItems] = useState<Set<number>>(new Set());

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
          
          {expandedItems.has(index) && (
            <div className="px-6 pb-6 border-t border-gray-100">
              <div className="space-y-4 mt-4">
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">📝 Giải thích:</h4>
                  <p className="text-gray-600 whitespace-pre-line">{grammar.explanation}</p>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-700 mb-2">📖 Ví dụ:</h4>
                  <p className="text-gray-700 italic bg-gray-50 p-3 rounded-lg whitespace-pre-line">{grammar.example}</p>
                </div>
                
                {grammar.rules && grammar.rules.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">📋 Quy tắc:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {grammar.rules.map((rule, ruleIndex) => (
                        <li key={ruleIndex} className="text-gray-600">{rule}</li>
                      ))}
                    </ul>
                  </div>
                )}
                
                {grammar.commonMistakes && grammar.commonMistakes.length > 0 && (
                  <div>
                    <h4 className="font-medium text-gray-700 mb-2">⚠️ Lỗi thường gặp:</h4>
                    <ul className="list-disc list-inside space-y-1">
                      {grammar.commonMistakes.map((mistake, mistakeIndex) => (
                        <li key={mistakeIndex} className="text-red-600">{mistake}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ))}

      {grammars.length === 0 && (
        <div className="text-center py-12">
          <p className="text-gray-500">Chưa có nội dung ngữ pháp.</p>
        </div>
      )}
    </div>
  );
}

// Exercises Section Component
function ExercisesSection({ exercises, courseId, onProgressUpdate }: { 
  exercises: Exercise[], 
  courseId: string,
  onProgressUpdate?: (progress: number) => void 
}) {
  const [currentExercise, setCurrentExercise] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [showReview, setShowReview] = useState(false);
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [earnedScore, setEarnedScore] = useState(0);
  const router = useRouter();

  // Get user ID from auth context
  const { isLoggedIn: isUserLoggedIn, user: currentUser } = useAuth();
  const userId = isUserLoggedIn && currentUser ? currentUser.id : null;

  // Function to update exercise progress in backend
  const updateExerciseProgress = async (correctCount: number, total: number) => {
    if (!userId) {
      // Skip progress update if not logged in, but allow doing exercises
      return;
    }
    
    
    try {
      const response = await fetch(`http://localhost:5001/api/results/progress/${userId}/${courseId}/exercises`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ completed: correctCount, total })
      });
      
      const data = await response.json();
      
      // Notify parent component with updated progress
      if (onProgressUpdate && data.success && data.result?.progress?.overall?.percentage !== undefined) {
        onProgressUpdate(data.result.progress.overall.percentage);
      }
    } catch (error) {
      console.error('❌ Error updating exercise progress:', error);
    }
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    // Save answer
    setAnswers(prev => ({
      ...prev,
      [currentExercise]: answer
    }));
  };

  const handleNext = () => {
    if (currentExercise < exercises.length - 1) {
      setCurrentExercise(currentExercise + 1);
      // Load existing answer if any
      setSelectedAnswer(answers[currentExercise + 1] || '');
    }
  };

  const handlePrevious = () => {
    if (currentExercise > 0) {
      setCurrentExercise(currentExercise - 1);
      // Load existing answer
      setSelectedAnswer(answers[currentExercise - 1] || '');
    }
  };

  const handleSubmitQuiz = () => {
    // Calculate score and points
    let correct = 0;
    let earnedPoints = 0;
    let totalPoints = 0;
    
    exercises.forEach((exercise, index) => {
      const points = exercise.points || 1; // Default 1 point if not specified
      totalPoints += points;
      
      if (answers[index] === exercise.correctAnswer) {
        correct++;
        earnedPoints += points;
      }
    });
    
    setCorrectAnswers(correct);
    setTotalScore(totalPoints);
    setEarnedScore(earnedPoints);
    setShowResults(true);
  };

  const handleConfirmResults = () => {
    // Update progress with correct answers count
    updateExerciseProgress(correctAnswers, exercises.length);
    
    // Switch to review mode to show explanations for wrong answers
    setShowResults(false);
    setShowReview(true);
  };

  const handleFinishReview = () => {
    // Navigate to progress tab by triggering the parent component
    setTimeout(() => {
      // Trigger custom event to switch to progress tab
      window.dispatchEvent(new CustomEvent('switchToProgress'));
    }, 500);
  };

  if (exercises.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Chưa có bài tập.</p>
      </div>
    );
  }

  // Show results screen after quiz completion
  if (showResults) {
    const percentage = Math.round((correctAnswers / exercises.length) * 100);
    
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🎉 Hoàn thành bài tập!</h2>
          
          <div className="mb-8">
            <div className="text-6xl font-bold text-violet-600 mb-4">
              {correctAnswers}/{exercises.length}
            </div>
            <div className="text-2xl text-gray-600 mb-2">
              Điểm số: {percentage}%
            </div>
            <div className="text-xl text-blue-600 font-semibold mb-2">
              Tổng điểm: {earnedScore}/{totalScore} điểm
            </div>
            <div className="text-lg text-gray-500">
              {percentage >= 80 ? '🎯 Xuất sắc!' : percentage >= 60 ? '👍 Khá tốt!' : '💪 Cần cố gắng thêm!'}
            </div>
          </div>

          <div className="space-x-4">
            <button
              onClick={handleConfirmResults}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              ✅ Xác nhận và lưu tiến độ
            </button>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200"
            >
              🔄 Làm lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Show review mode with explanations for wrong answers
  if (showReview) {
    const wrongAnswers = exercises.filter((exercise, index) => 
      answers[index] !== exercise.correctAnswer
    );

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">📝 Xem lại các câu sai</h2>
          
          {wrongAnswers.length === 0 ? (
            <div className="text-center py-12">
              <h3 className="text-xl font-bold text-green-600 mb-4">🎉 Hoàn hảo!</h3>
              <p className="text-gray-600 mb-6">Bạn đã trả lời đúng tất cả các câu hỏi!</p>
              <button
                onClick={handleFinishReview}
                className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200"
              >
                ✅ Hoàn thành
              </button>
            </div>
          ) : (
            <div className="space-y-6">
              {wrongAnswers.map((exercise, reviewIndex) => {
                const originalIndex = exercises.findIndex(ex => ex === exercise);
                const userAnswer = answers[originalIndex];
                const points = exercise.points || 1;
                
                return (
                  <div key={reviewIndex} className="border border-red-200 rounded-xl p-6 bg-red-50">
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900">
                        Câu {originalIndex + 1} ({points} điểm)
                      </h3>
                      <span className="text-red-600 font-medium">❌ Sai</span>
                    </div>
                    
                    <div className="mb-4">
                      <p className="text-gray-800 font-medium mb-3">{exercise.question}</p>
                      
                      <div className="space-y-2">
                        {exercise.options.map((option, optionIndex) => {
                          const optionLabel = String.fromCharCode(65 + optionIndex); // A, B, C, D
                          return (
                            <div 
                              key={optionIndex}
                              className={`p-3 rounded-lg border ${
                                option === exercise.correctAnswer 
                                  ? 'bg-green-100 border-green-300 text-green-800' 
                                  : option === userAnswer
                                  ? 'bg-red-100 border-red-300 text-red-800'
                                  : 'bg-gray-50 border-gray-200'
                              }`}
                            >
                              <span className="font-medium">
                                {option === exercise.correctAnswer && '✅ '}
                                {option === userAnswer && option !== exercise.correctAnswer && '❌ '}
                                <span className="font-bold text-gray-700 mr-2">{optionLabel}.</span>
                                {option}
                              </span>
                              {option === exercise.correctAnswer && (
                                <span className="ml-2 text-sm text-green-600">(Đáp án đúng)</span>
                              )}
                              {option === userAnswer && option !== exercise.correctAnswer && (
                                <span className="ml-2 text-sm text-red-600">(Bạn đã chọn)</span>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                    
                    {exercise.explanation && (
                      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-semibold text-blue-800 mb-2">💡 Giải thích:</h4>
                        <p className="text-blue-700">{exercise.explanation}</p>
                      </div>
                    )}
                  </div>
                );
              })}
              
              <div className="text-center pt-6">
                <button
                  onClick={handleFinishReview}
                  className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-medium transition-colors duration-200"
                >
                  ✅ Hoàn thành xem lại
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  const exercise = exercises[currentExercise];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500">
            Câu hỏi {currentExercise + 1}/{exercises.length}
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-600 font-semibold">
              💎 {exercise.points || 1} điểm
            </span>
            <span className="text-sm text-gray-500">
              Đã trả lời: {answeredCount}/{exercises.length}
            </span>
            {exercise.difficulty && (
              <span className="text-sm text-gray-500">
                {'⭐'.repeat(exercise.difficulty === 'easy' ? 1 : exercise.difficulty === 'medium' ? 2 : 3)}
              </span>
            )}
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-violet-500 rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentExercise + 1) / exercises.length) * 100}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{exercise.question}</h3>
          
          {/* Options */}
          <div className="space-y-3">
            {(exercise.options || []).map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedAnswer === option
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

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <button
            onClick={handlePrevious}
            disabled={currentExercise === 0}
            className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Câu trước
          </button>

          <div className="flex space-x-3">
            {currentExercise === exercises.length - 1 ? (
              <button
                onClick={handleSubmitQuiz}
                disabled={answeredCount < exercises.length}
                className="px-8 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {answeredCount < exercises.length ? `Còn ${exercises.length - answeredCount} câu` : '✓ Nộp bài'}
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
              >
                Câu tiếp →
              </button>
            )}
          </div>
        </div>

        {/* Question Navigator */}
        <div className="mt-8 pt-6 border-t border-gray-200">
          <h4 className="text-sm font-medium text-gray-700 mb-3">Điều hướng câu hỏi:</h4>
          <div className="flex flex-wrap gap-2">
            {exercises.map((_, index) => (
              <button
                key={index}
                onClick={() => {
                  setCurrentExercise(index);
                  setSelectedAnswer(answers[index] || '');
                }}
                className={`w-10 h-10 rounded-lg text-sm font-medium transition-colors ${
                  index === currentExercise
                    ? 'bg-violet-600 text-white'
                    : answers[index]
                    ? 'bg-green-100 text-green-800 border border-green-300'
                    : 'bg-gray-100 text-gray-600 border border-gray-300'
                }`}
              >
                {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Progress Section Component
function ProgressSection({ course, onStartExam, onProgressUpdate }: { 
  course: Course, 
  onStartExam?: () => void,
  onProgressUpdate?: (progress: number) => void 
}) {
  const [progress, setProgress] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [examResults, setExamResults] = useState<any[]>([]);
  const router = useRouter();
  
  // Get user ID from auth context
  const { isLoggedIn: isUserLoggedIn, user: currentUser } = useAuth();
  const userId = isUserLoggedIn && currentUser ? currentUser.id : null;
  
  useEffect(() => {
    if (userId) {
      fetchProgress();
    }
  }, [course._id, userId]);

  useEffect(() => {
    // Listen for progress updates
    const handleProgressUpdate = () => {
      fetchProgress();
    };
    
    window.addEventListener('progressUpdate', handleProgressUpdate);
    
    return () => {
      window.removeEventListener('progressUpdate', handleProgressUpdate);
    };
  }, []);
  
  const fetchProgress = async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }
    
    try {
      setIsLoading(true);
      const response = await fetch(`http://localhost:5001/api/results/progress/${userId}/${course._id}`);
      const data = await response.json();
      
      
      if (data.success) {
        setProgress(data.result);
        setExamResults(data.result.examResults || []);
        
        // Update overall progress in parent component
        const overallProgress = data.result.progress?.overall?.percentage || 0;
        if (onProgressUpdate) {
          onProgressUpdate(overallProgress);
        }
      } else {
        console.error('❌ Failed to fetch progress:', data.message);
        setProgress(null);
        setExamResults([]);
      }
    } catch (error) {
      console.error('❌ Error fetching progress:', error);
      setProgress(null);
      setExamResults([]);
    } finally {
      setIsLoading(false);
    }
  };
  
  const updateVocabularyProgress = async (studied: number, known: number, total: number) => {
    if (!userId) {
      return;
    }
    
    try {
      const response = await fetch(`http://localhost:5001/api/results/progress/${userId}/${course._id}/vocabulary`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ studied, known, total })
      });
      
      const data = await response.json();
      if (data.success) {
        setProgress(data.result);
      }
    } catch (error) {
      console.error('Error updating vocabulary progress:', error);
    }
  };
  
  const handleTakeExam = () => {
    if (onStartExam) {
      onStartExam();
    }
  };


  
  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
        <span className="ml-2 text-gray-600">Đang tải tiến độ...</span>
      </div>
    );
  }
  

  const vocabTotal = course.vocabularies?.length || 0;
  const exerciseTotal = course.exercises?.length || 0;
  
  const vocabProgress = progress?.progress?.vocabulary || { studied: 0, known: 0, percentage: 0 };
  const exerciseProgress = progress?.progress?.exercises || { completed: 0, percentage: 0 };
  const overallProgress = progress?.progress?.overall?.percentage || 0;
  
  const isExamReady = overallProgress >= 80;
  const latestExam = examResults[examResults.length - 1];
  
  return (
    <div className="space-y-6">
      {/* Overall Progress */}
      <div className="bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl p-6 text-white">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold">Tiến độ tổng thể</h3>
          <div className="text-3xl font-bold">{overallProgress}%</div>
        </div>
        
        <div className="w-full bg-white/20 rounded-full h-3 mb-4">
          <div 
            className="bg-white rounded-full h-3 transition-all duration-500"
            style={{ width: `${overallProgress}%` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between text-sm">
          <span>Trạng thái: {
            overallProgress >= 100 ? '🎉 Hoàn thành' :
            overallProgress >= 80 ? '🎯 Sẵn sàng kiểm tra' :
            overallProgress > 0 ? '📚 Đang học' : '🚀 Chưa bắt đầu'
          }</span>
          {isExamReady && !latestExam && (
            <button
              onClick={handleTakeExam}
              className="bg-white text-violet-600 px-4 py-2 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
            >
              🎓 Làm bài kiểm tra
            </button>
          )}
        </div>
      </div>

      {/* Detailed Progress */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Vocabulary Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">📚 Từ vựng (60%)</h4>
            <span className="text-sm text-gray-500">{vocabProgress.percentage}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-violet-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${vocabProgress.percentage}%` }}
            ></div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Đã học:</span>
              <span className="font-medium">{vocabProgress.studied}/{vocabTotal}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Đã biết:</span>
              <span className="font-medium text-green-600">{vocabProgress.known}/{vocabTotal}</span>
            </div>
          </div>
        </div>

        {/* Exercise Progress */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-semibold text-gray-900">📝 Bài tập (40%)</h4>
            <span className="text-sm text-gray-500">{exerciseProgress.percentage}%</span>
          </div>
          
          <div className="w-full bg-gray-200 rounded-full h-2 mb-4">
            <div 
              className="bg-green-500 rounded-full h-2 transition-all duration-500"
              style={{ width: `${exerciseProgress.percentage}%` }}
            ></div>
          </div>
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Hoàn thành:</span>
              <span className="font-medium">{exerciseProgress.completed}/{exerciseTotal}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Exam Results */}
      {examResults.length > 0 && (
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-xl font-bold text-gray-900 mb-4">📊 Kết quả kiểm tra</h3>
          
          <div className="space-y-4">
            {examResults.map((exam, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                  <div className="font-medium">Lần {index + 1}</div>
                  <div className="text-sm text-gray-600">
                    {new Date(exam.completedAt).toLocaleDateString('vi-VN')}
                  </div>
                </div>
                <div className="text-right">
                  <div className={`text-lg font-bold ${
                    exam.percentage >= 80 ? 'text-green-600' : 
                    exam.percentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {exam.percentage}%
                  </div>
                  <div className="text-sm text-gray-600">
                    {exam.correctAnswers}/{exam.totalQuestions} đúng
                  </div>
                </div>
              </div>
            ))}
          </div>
          
          {latestExam && latestExam.percentage < 80 && isExamReady && (
            <div className="mt-4 text-center">
              <button
                onClick={handleTakeExam}
                className="bg-violet-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-violet-700 transition-colors"
              >
                🔄 Làm lại bài kiểm tra
              </button>
            </div>
          )}
        </div>
      )}

      {/* Course Info */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-4">ℹ️ Thông tin khóa học</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Tổng nội dung:</span>
              <span className="font-medium">{vocabTotal + exerciseTotal} mục</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Thời lượng ước tính:</span>
              <span className="font-medium">{course.duration} giờ</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between">
              <span className="text-gray-600">Cấp độ:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                course.level === 'Beginner' ? 'bg-green-100 text-green-800' :
                course.level === 'Intermediate' ? 'bg-yellow-100 text-yellow-800' : 'bg-red-100 text-red-800'
              }`}>
                {course.level === 'Beginner' ? 'Cơ bản' : 
                 course.level === 'Intermediate' ? 'Trung cấp' : 'Nâng cao'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Trạng thái:</span>
              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                progress?.status === 'completed' ? 'bg-green-100 text-green-800' :
                progress?.status === 'exam_ready' ? 'bg-blue-100 text-blue-800' :
                progress?.status === 'in_progress' ? 'bg-yellow-100 text-yellow-800' :
                'bg-gray-100 text-gray-800'
              }`}>
                {progress?.status === 'completed' ? 'Hoàn thành' :
                 progress?.status === 'exam_ready' ? 'Sẵn sàng kiểm tra' :
                 progress?.status === 'in_progress' ? 'Đang học' : 'Chưa bắt đầu'}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Final Exam Section Component
function FinalExamSection({ course, onBackToProgress }: { 
  course: Course, 
  onBackToProgress: () => void 
}) {
  const [examQuestions, setExamQuestions] = useState<Exercise[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState<string>('');
  const [answers, setAnswers] = useState<{[key: number]: string}>({});
  const [showResults, setShowResults] = useState(false);
  const [examStarted, setExamStarted] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600); // 10 minutes
  const [correctAnswers, setCorrectAnswers] = useState(0);
  const [totalScore, setTotalScore] = useState(0);
  const [earnedScore, setEarnedScore] = useState(0);

  // Get user ID from auth context
  const { isLoggedIn: isUserLoggedIn, user: currentUser } = useAuth();
  const userId = isUserLoggedIn && currentUser ? currentUser.id : null;

  // Generate random 10 questions from exercises
  useEffect(() => {
    if (course.exercises && course.exercises.length > 0) {
      const shuffled = [...course.exercises].sort(() => 0.5 - Math.random());
      const selected = shuffled.slice(0, Math.min(10, course.exercises.length));
      setExamQuestions(selected);
    }
  }, [course.exercises]);

  // Timer countdown
  useEffect(() => {
    if (examStarted && timeLeft > 0 && !showResults) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && !showResults) {
      handleSubmitExam();
    }
  }, [examStarted, timeLeft, showResults]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const handleStartExam = () => {
    setExamStarted(true);
    setCurrentQuestion(0);
    setAnswers({});
    setSelectedAnswer('');
    setTimeLeft(600);
  };

  const handleAnswerSelect = (answer: string) => {
    setSelectedAnswer(answer);
    setAnswers(prev => ({
      ...prev,
      [currentQuestion]: answer
    }));
  };

  const handleNext = () => {
    if (currentQuestion < examQuestions.length - 1) {
      setCurrentQuestion(currentQuestion + 1);
      setSelectedAnswer(answers[currentQuestion + 1] || '');
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
      setSelectedAnswer(answers[currentQuestion - 1] || '');
    }
  };

  const handleSubmitExam = () => {
    // Calculate results
    let correct = 0;
    let earnedPoints = 0;
    let totalPoints = 0;

    examQuestions.forEach((question, index) => {
      const points = question.points || 1;
      totalPoints += points;
      
      if (answers[index] === question.correctAnswer) {
        correct++;
        earnedPoints += points;
      }
    });

    setCorrectAnswers(correct);
    setTotalScore(totalPoints);
    setEarnedScore(earnedPoints);
    setShowResults(true);

    // Save exam result to backend
    saveExamResult(correct, examQuestions.length, earnedPoints, totalPoints);
  };

  const saveExamResult = async (correct: number, total: number, earned: number, totalPts: number) => {
    if (!userId) {
      return;
    }
    
    try {
      const percentage = Math.round((correct / total) * 100);
      const examData = {
        examId: `final-exam-${Date.now()}`,
        score: correct, // Gửi số câu đúng, không phải điểm tổng
        totalQuestions: total,
        correctAnswers: correct,
        percentage: percentage,
        questions: examQuestions.map((q, index) => ({
          questionId: `q-${index}`,
          selectedAnswer: answers[index] || '',
          correctAnswer: q.correctAnswer,
          isCorrect: answers[index] === q.correctAnswer
        }))
      };

      const response = await fetch(`http://localhost:5001/api/results/exam/${userId}/${course._id}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(examData)
      });

      if (response.ok) {
      }
    } catch (error) {
      console.error('❌ Error saving exam result:', error);
    }
  };

  if (examQuestions.length === 0) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">⚠️ Không có câu hỏi</h2>
          <p className="text-gray-600 mb-6">Khóa học này chưa có đủ bài tập để tạo bài kiểm tra.</p>
          <button
            onClick={onBackToProgress}
            className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-3 rounded-xl font-medium transition-colors"
          >
            ← Quay lại tiến độ
          </button>
        </div>
      </div>
    );
  }

  // Show results
  if (showResults) {
    const percentage = Math.round((correctAnswers / examQuestions.length) * 100);
    const passed = percentage >= 80;

    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">
            {passed ? '🎉 Chúc mừng!' : '📚 Cần cố gắng thêm!'}
          </h2>
          
          <div className="mb-8">
            <div className="text-6xl font-bold text-violet-600 mb-4">
              {correctAnswers}/{examQuestions.length}
            </div>
            <div className="text-2xl text-gray-600 mb-2">
              Điểm số: {percentage}%
            </div>
            <div className="text-xl text-blue-600 font-semibold mb-2">
              Tổng điểm: {earnedScore}/{totalScore} điểm
            </div>
            <div className={`text-lg font-medium ${passed ? 'text-green-600' : 'text-orange-600'}`}>
              {passed ? '✅ Đạt yêu cầu (≥80%)' : '❌ Chưa đạt yêu cầu (cần ≥80%)'}
            </div>
          </div>

          <div className="space-x-4">
            <button
              onClick={onBackToProgress}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              ✅ Hoàn thành
            </button>
            {!passed && (
              <button
                onClick={() => {
                  setShowResults(false);
                  setExamStarted(false);
                  setCurrentQuestion(0);
                  setAnswers({});
                  setSelectedAnswer('');
                }}
                className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
              >
                🔄 Làm lại
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // Exam introduction
  if (!examStarted) {
    return (
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">🎓 Bài kiểm tra khóa học</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 text-left">
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="font-semibold text-gray-700 mb-2">Số câu hỏi:</div>
              <div className="text-2xl font-bold text-violet-600">{examQuestions.length} câu</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="font-semibold text-gray-700 mb-2">Thời gian:</div>
              <div className="text-2xl font-bold text-violet-600">10 phút</div>
            </div>
            <div className="bg-gray-50 rounded-xl p-4">
              <div className="font-semibold text-gray-700 mb-2">Điểm đạt:</div>
              <div className="text-2xl font-bold text-violet-600">80% (8/{examQuestions.length} câu đúng)</div>
            </div>
          </div>

          <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 mb-8 text-left">
            <h3 className="font-bold text-yellow-800 mb-3">⚠️ Lưu ý quan trọng:</h3>
            <ul className="text-yellow-700 space-y-2">
              <li>• Bạn có 10 phút để hoàn thành toàn bộ bài kiểm tra</li>
              <li>• Không thể quay lại sau khi nộp bài</li>
              <li>• Cần đạt 80% để hoàn thành khóa học</li>
              <li>• Có thể làm lại nếu không đạt yêu cầu</li>
            </ul>
          </div>

          <div className="space-x-4">
            <button
              onClick={handleStartExam}
              className="bg-violet-600 hover:bg-violet-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              🚀 Bắt đầu kiểm tra
            </button>
            <button
              onClick={onBackToProgress}
              className="bg-gray-600 hover:bg-gray-700 text-white px-8 py-3 rounded-xl font-medium transition-colors"
            >
              ← Quay lại
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Exam interface
  const question = examQuestions[currentQuestion];
  const answeredCount = Object.keys(answers).length;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-gray-900">🎓 Bài kiểm tra khóa học</h2>
          <div className={`text-xl font-bold ${timeLeft <= 60 ? 'text-red-600' : 'text-violet-600'}`}>
            ⏰ {formatTime(timeLeft)}
          </div>
        </div>

        {/* Progress */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-sm text-gray-500">
            Câu hỏi {currentQuestion + 1}/{examQuestions.length}
          </span>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-blue-600 font-semibold">
              💎 {question.points || 1} điểm
            </span>
            <span className="text-sm text-gray-500">
              Đã trả lời: {answeredCount}/{examQuestions.length}
            </span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-200 rounded-full h-2 mb-6">
          <div 
            className="bg-violet-500 rounded-full h-2 transition-all duration-300"
            style={{ width: `${((currentQuestion + 1) / examQuestions.length) * 100}%` }}
          ></div>
        </div>

        {/* Question */}
        <div className="mb-8">
          <h3 className="text-xl font-bold text-gray-900 mb-4">{question.question}</h3>
          
          {/* Options */}
          <div className="space-y-3">
            {question.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(option)}
                className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                  selectedAnswer === option
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

        {/* Navigation */}
        <div className="flex items-center justify-between">
          <button
            onClick={handlePrevious}
            disabled={currentQuestion === 0}
            className="flex items-center px-6 py-3 bg-gray-100 text-gray-700 rounded-xl font-medium hover:bg-gray-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            ← Câu trước
          </button>

          <div className="flex space-x-4">
            {currentQuestion === examQuestions.length - 1 ? (
              <button
                onClick={handleSubmitExam}
                className="flex items-center px-8 py-3 bg-green-600 text-white rounded-xl font-medium hover:bg-green-700 transition-colors"
              >
                ✅ Nộp bài
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="flex items-center px-6 py-3 bg-violet-600 text-white rounded-xl font-medium hover:bg-violet-700 transition-colors"
              >
                Câu tiếp →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
