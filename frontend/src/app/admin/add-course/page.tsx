"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "../../contexts/AuthContext";

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

export default function AddCoursePage() {
  const { user, isLoggedIn } = useAuth();
  const router = useRouter();
  
  // Get edit ID from URL
  const [editId, setEditId] = useState<string | null>(null);
  const [isEditMode, setIsEditMode] = useState(false);
  
  // Get URL params on client side
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const id = urlParams.get('edit');
      setEditId(id);
      setIsEditMode(!!id);
      console.log('🔍 URL params detected:', { editId: id, isEditMode: !!id });
    }
  }, []);

  // Course basic info
  const [courseName, setCourseName] = useState("");
  const [description, setDescription] = useState("");
  const [level, setLevel] = useState("Beginner");
  const [image, setImage] = useState("");
  const [duration, setDuration] = useState(0);
  const [isPublished, setIsPublished] = useState(false);

  // Dynamic arrays
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [grammars, setGrammars] = useState<Grammar[]>([]);
  const [exercises, setExercises] = useState<Exercise[]>([]);

  // UI states
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState({ type: "", text: "" });
  const [activeTab, setActiveTab] = useState<"vocab" | "grammar" | "exercise">("vocab");

  useEffect(() => {
    if (!isLoggedIn || user?.role !== "admin") {
      router.push("/");
    }
  }, [isLoggedIn, user, router]);

  // Load course data when in edit mode
  useEffect(() => {
    if (isEditMode && editId) {
      loadCourseData(editId);
    }
  }, [isEditMode, editId]);

  const loadCourseData = async (courseId: string) => {
    try {
      setLoading(true);
      
      const backendPorts = [5001, 5002, 5000];
      let courseData = null;
      
      for (const port of backendPorts) {
        try {
          const response = await fetch(`http://localhost:${port}/api/courses/${courseId}`);
          
          if (response.ok) {
            const data = await response.json();
            
            if (data.success && data.course) {
              courseData = data.course;
              break;
            } else if (data._id) {
              courseData = data;
              break;
            }
          }
        } catch (error) {
          continue;
        }
      }
      
      if (courseData) {
        
        // Populate form with existing data
        setCourseName(courseData.name || '');
        setDescription(courseData.description || '');
        setLevel(courseData.level || 'Beginner');
        setImage(courseData.image || '');
        setDuration(Number(courseData.duration) || 0);
        setIsPublished(Boolean(courseData.isPublished));
        
        // Populate arrays with clean data
        const cleanVocabs = (courseData.vocabularies || []).map((v: any) => ({
          word: v.word || '',
          meaning: v.meaning || '',
          example: v.example || '',
          pronunciation: v.pronunciation || '',
          partOfSpeech: v.partOfSpeech || ''
        }));
        
        const cleanGrammars = (courseData.grammars || []).map((g: any) => ({
          topic: g.topic || '',
          explanation: g.explanation || '',
          example: g.example || '',
          rules: g.rules || [],
          commonMistakes: g.commonMistakes || []
        }));
        
        const cleanExercises = (courseData.exercises || []).map((e: any) => ({
          question: e.question || '',
          type: e.type || 'quiz',
          options: e.options || ['', '', '', ''],
          correctAnswer: e.correctAnswer || '',
          explanation: e.explanation || '',
          difficulty: e.difficulty || 'medium',
          points: e.points || 10
        }));
        
        setVocabularies(cleanVocabs);
        setGrammars(cleanGrammars);
        setExercises(cleanExercises);
      } else {
        setMessage({ type: "error", text: "Không thể tải dữ liệu khóa học. Vui lòng kiểm tra ID khóa học." });
      }
    } catch (error) {
      setMessage({ type: "error", text: "Lỗi khi tải dữ liệu khóa học. Vui lòng kiểm tra ID khóa học." });
    } finally {
      setLoading(false);
    }
  };

  // Add new vocabulary
  const addVocabulary = () => {
    setVocabularies([
      ...vocabularies,
      { word: "", meaning: "", example: "", pronunciation: "", partOfSpeech: "" }
    ]);
  };

  // Remove vocabulary
  const removeVocabulary = (index: number) => {
    setVocabularies(vocabularies.filter((_, i) => i !== index));
  };

  // Update vocabulary
  const updateVocabulary = (index: number, field: keyof Vocabulary, value: string) => {
    const updated = [...vocabularies];
    updated[index] = { ...updated[index], [field]: value };
    setVocabularies(updated);
  };

  // Add new grammar
  const addGrammar = () => {
    setGrammars([
      ...grammars,
      { topic: "", explanation: "", example: "", rules: [], commonMistakes: [] }
    ]);
  };

  // Remove grammar
  const removeGrammar = (index: number) => {
    setGrammars(grammars.filter((_, i) => i !== index));
  };

  // Update grammar
  const updateGrammar = (index: number, field: keyof Grammar, value: string) => {
    const updated = [...grammars];
    updated[index] = { ...updated[index], [field]: value };
    setGrammars(updated);
  };

  // Add new exercise
  const addExercise = () => {
    setExercises([
      ...exercises,
      {
        question: "",
        type: "quiz",
        options: ["", "", "", ""],
        correctAnswer: "",
        explanation: "",
        difficulty: "medium",
        points: 10
      }
    ]);
  };

  // Remove exercise
  const removeExercise = (index: number) => {
    setExercises(exercises.filter((_, i) => i !== index));
  };

  // Update exercise
  const updateExercise = (index: number, field: keyof Exercise, value: any) => {
    const updated = [...exercises];
    updated[index] = { ...updated[index], [field]: value };
    setExercises(updated);
  };

  // Update exercise option
  const updateExerciseOption = (exerciseIndex: number, optionIndex: number, value: string) => {
    const updated = [...exercises];
    updated[exerciseIndex].options[optionIndex] = value;
    setExercises(updated);
  };

  // Submit form
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setMessage({ type: "", text: "" });

    try {
      // Validate
      if (!courseName || !level) {
        setMessage({ type: "error", text: "Vui lòng nhập tên khóa học và chọn cấp độ" });
        setLoading(false);
        return;
      }

      // Prepare data with more lenient filtering
      const filteredVocabularies = vocabularies.filter(v => 
        v.word && v.word.trim() && 
        v.meaning && v.meaning.trim()
      );
      const filteredGrammars = grammars.filter(g => 
        g.topic && g.topic.trim() && 
        g.explanation && g.explanation.trim()
      );
      const filteredExercises = exercises.filter(e => 
        e.question && e.question.trim() && 
        e.correctAnswer && e.correctAnswer.trim()
      );
      
      
      const courseData = {
        name: courseName,
        description: description || "Khóa học tiếng Anh",
        level,
        image: image || "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?w=800",
        duration: Number(duration) || 0,
        isPublished: Boolean(isPublished),
        vocabularies: filteredVocabularies,
        grammars: filteredGrammars,
        exercises: filteredExercises
      };
      
      const token = localStorage.getItem("token");
      if (!token) {
        setMessage({ type: "error", text: "Vui lòng đăng nhập lại" });
        setLoading(false);
        return;
      }

      // Try different backend ports
      const backendPorts = [5001, 5000, 5002];
      let response;
      let lastError;

      for (const port of backendPorts) {
        try {
          const url = isEditMode 
            ? `http://localhost:${port}/api/courses/${editId}`
            : `http://localhost:${port}/api/courses`;
          
          const method = isEditMode ? 'PUT' : 'POST';
          
          
          response = await fetch(url, {
            method,
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify(courseData)
          });

          if (response.ok) {
            break;
          } else {
            const errorText = await response.text();
            lastError = new Error(`HTTP ${response.status}: ${errorText}`);
          }
        } catch (error) {
          lastError = error;
          continue;
        }
      }

      if (!response || !response.ok) {
        throw lastError || new Error('Không thể kết nối đến server');
      }

      const data = await response.json();

      if (data.success || data._id) {
        const successMessage = isEditMode 
          ? (data.message || "Cập nhật khóa học thành công!")
          : (data.message || "Thêm khóa học thành công!");
        
        
        setMessage({ type: "success", text: successMessage });
        
        // Show success message for longer time in edit mode
        const redirectDelay = isEditMode ? 3000 : 2000;
        setTimeout(() => {
          router.push("/admin/lessons");
        }, redirectDelay);
      } else {
        const errorMessage = isEditMode ? "Có lỗi xảy ra khi cập nhật" : "Có lỗi xảy ra khi tạo khóa học";
        setMessage({ type: "error", text: data.message || errorMessage });
      }
    } catch (error: any) {
      console.error("Error creating course:", error);
      setMessage({ 
        type: "error", 
        text: "Không thể kết nối đến server. Vui lòng kiểm tra backend đang chạy." 
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isLoggedIn || user?.role !== "admin") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-violet-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang kiểm tra quyền truy cập...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push("/admin/lessons")}
            className="flex items-center text-gray-600 hover:text-violet-600 mb-4 transition-colors"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
            </svg>
            Quay lại
          </button>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditMode ? 'Chỉnh sửa khóa học' : 'Thêm khóa học mới'}
            {isEditMode && editId && (
              <span className="text-sm font-normal text-gray-500 ml-2">
                (ID: {editId})
              </span>
            )}
          </h1>
          <p className="text-gray-600 mt-2">
            {isEditMode ? 'Cập nhật thông tin khóa học với từ vựng, ngữ pháp và bài tập' : 'Tạo khóa học với từ vựng, ngữ pháp và bài tập'}
          </p>
          
        </div>

        {/* Message */}
        {message.text && (
          <div
            className={`mb-6 p-4 rounded-xl ${
              message.type === "success"
                ? "bg-green-50 text-green-800 border border-green-200"
                : "bg-red-50 text-red-800 border border-red-200"
            }`}
          >
            <div className="flex items-center">
              {message.type === "success" ? (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
              ) : (
                <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
              )}
              {message.text}
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Basic Info Card */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Thông tin cơ bản</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên khóa học <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={courseName}
                  onChange={(e) => setCourseName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="VD: English for Beginners"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Cấp độ <span className="text-red-500">*</span>
                </label>
                <select
                  value={level}
                  onChange={(e) => setLevel(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  required
                >
                  <option value="Beginner">Beginner (Sơ cấp)</option>
                  <option value="Intermediate">Intermediate (Trung cấp)</option>
                  <option value="Advanced">Advanced (Nâng cao)</option>
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">Mô tả</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={4}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="Mô tả chi tiết về khóa học..."
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Ảnh minh họa</label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      const reader = new FileReader();
                      reader.onloadend = () => {
                        setImage(reader.result as string);
                      };
                      reader.readAsDataURL(file);
                    }
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-violet-50 file:text-violet-700 hover:file:bg-violet-100"
                />
                {image && (
                  <div className="mt-2">
                    <img src={image} alt="Preview" className="h-32 w-auto rounded-lg object-cover" />
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Thời lượng (giờ)</label>
                <input
                  type="number"
                  value={duration}
                  onChange={(e) => setDuration(Number(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-violet-500 focus:border-transparent"
                  placeholder="0"
                  min="0"
                />
              </div>

              <div className="md:col-span-2">
                <label className="flex items-center space-x-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isPublished}
                    onChange={(e) => setIsPublished(e.target.checked)}
                    className="w-5 h-5 text-violet-600 border-gray-300 rounded focus:ring-violet-500"
                  />
                  <span className="text-sm font-medium text-gray-700">Xuất bản khóa học ngay</span>
                </label>
              </div>
            </div>
          </div>

          {/* Content Tabs */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
            <div className="flex space-x-2 mb-6 border-b border-gray-200">
              <button
                type="button"
                onClick={() => setActiveTab("vocab")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "vocab"
                    ? "text-violet-600 border-b-2 border-violet-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Từ vựng ({vocabularies.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("grammar")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "grammar"
                    ? "text-violet-600 border-b-2 border-violet-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Ngữ pháp ({grammars.length})
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("exercise")}
                className={`px-6 py-3 font-medium transition-colors ${
                  activeTab === "exercise"
                    ? "text-violet-600 border-b-2 border-violet-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Bài tập ({exercises.length})
              </button>
            </div>

            {/* Vocabulary Tab */}
            {activeTab === "vocab" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách từ vựng</h3>
                  <button
                    type="button"
                    onClick={addVocabulary}
                    className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm từ vựng
                  </button>
                </div>

                {vocabularies.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                    <p>Chưa có từ vựng nào. Nhấn "Thêm từ vựng" để bắt đầu.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {vocabularies.map((vocab, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">Từ vựng #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeVocabulary(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <input
                            type="text"
                            value={vocab.word}
                            onChange={(e) => updateVocabulary(index, "word", e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Từ vựng"
                          />
                          <input
                            type="text"
                            value={vocab.meaning}
                            onChange={(e) => updateVocabulary(index, "meaning", e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Nghĩa"
                          />
                          <input
                            type="text"
                            value={vocab.example}
                            onChange={(e) => updateVocabulary(index, "example", e.target.value)}
                            className="md:col-span-2 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Ví dụ"
                          />
                          <input
                            type="text"
                            value={vocab.pronunciation || ""}
                            onChange={(e) => updateVocabulary(index, "pronunciation", e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Phát âm (tùy chọn)"
                          />
                          <select
                            value={vocab.partOfSpeech || ""}
                            onChange={(e) => updateVocabulary(index, "partOfSpeech", e.target.value)}
                            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                          >
                            <option value="">Chọn loại từ</option>
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
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Grammar Tab */}
            {activeTab === "grammar" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách ngữ pháp</h3>
                  <button
                    type="button"
                    onClick={addGrammar}
                    className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm ngữ pháp
                  </button>
                </div>

                {grammars.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                    <p>Chưa có ngữ pháp nào. Nhấn "Thêm ngữ pháp" để bắt đầu.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {grammars.map((grammar, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">Ngữ pháp #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeGrammar(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={grammar.topic}
                            onChange={(e) => updateGrammar(index, "topic", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Chủ đề ngữ pháp"
                          />
                          <textarea
                            value={grammar.explanation}
                            onChange={(e) => updateGrammar(index, "explanation", e.target.value)}
                            rows={3}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Giải thích"
                          />
                          <input
                            type="text"
                            value={grammar.example}
                            onChange={(e) => updateGrammar(index, "example", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Ví dụ"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Exercise Tab */}
            {activeTab === "exercise" && (
              <div>
                <div className="flex justify-between items-center mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">Danh sách bài tập</h3>
                  <button
                    type="button"
                    onClick={addExercise}
                    className="flex items-center px-4 py-2 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors"
                  >
                    <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                    Thêm bài tập
                  </button>
                </div>

                {exercises.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <svg className="w-16 h-16 mx-auto mb-4 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                    </svg>
                    <p>Chưa có bài tập nào. Nhấn "Thêm bài tập" để bắt đầu.</p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {exercises.map((exercise, index) => (
                      <div key={index} className="p-4 border border-gray-200 rounded-xl">
                        <div className="flex justify-between items-start mb-3">
                          <h4 className="font-medium text-gray-900">Bài tập #{index + 1}</h4>
                          <button
                            type="button"
                            onClick={() => removeExercise(index)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                        <div className="space-y-3">
                          <input
                            type="text"
                            value={exercise.question}
                            onChange={(e) => updateExercise(index, "question", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Câu hỏi"
                          />
                          <div className="grid grid-cols-2 gap-3">
                            <select
                              value={exercise.type}
                              onChange={(e) => updateExercise(index, "type", e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            >
                              <option value="quiz">Quiz</option>
                              <option value="fill-in">Fill in the blank</option>
                              <option value="multiple-choice">Multiple Choice</option>
                              <option value="true-false">True/False</option>
                              <option value="matching">Matching</option>
                            </select>
                            <select
                              value={exercise.difficulty}
                              onChange={(e) => updateExercise(index, "difficulty", e.target.value)}
                              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            >
                              <option value="easy">Dễ</option>
                              <option value="medium">Trung bình</option>
                              <option value="hard">Khó</option>
                            </select>
                          </div>
                          <div className="space-y-2">
                            <label className="text-sm font-medium text-gray-700">Các lựa chọn:</label>
                            {exercise.options.map((option, optIndex) => (
                              <input
                                key={optIndex}
                                type="text"
                                value={option}
                                onChange={(e) => updateExerciseOption(index, optIndex, e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                                placeholder={`Lựa chọn ${optIndex + 1}`}
                              />
                            ))}
                          </div>
                          <input
                            type="text"
                            value={exercise.correctAnswer}
                            onChange={(e) => updateExercise(index, "correctAnswer", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Đáp án đúng"
                          />
                          <input
                            type="text"
                            value={exercise.explanation || ""}
                            onChange={(e) => updateExercise(index, "explanation", e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Giải thích (tùy chọn)"
                          />
                          <input
                            type="number"
                            value={exercise.points}
                            onChange={(e) => updateExercise(index, "points", Number(e.target.value))}
                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-violet-500"
                            placeholder="Điểm"
                            min="1"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Submit Button */}
          <div className="flex justify-end space-x-4">
            
            <button
              type="button"
              onClick={() => router.push("/admin/lessons")}
              className="px-6 py-3 border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 transition-colors"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-violet-600 text-white rounded-xl hover:bg-violet-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
            >
              {loading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  {isEditMode ? 'Đang cập nhật...' : 'Đang xử lý...'}
                </>
              ) : (
                <>
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={isEditMode ? "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" : "M5 13l4 4L19 7"} />
                  </svg>
                  {isEditMode ? 'Cập nhật khóa học' : 'Tạo khóa học'}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
