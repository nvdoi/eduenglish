"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-hot-toast';

interface Vocabulary {
  _id: string;
  word: string;
  meaning: string;
  example?: string;
  pronunciation?: string;
  partOfSpeech?: string;
  favourite: boolean;
  userId?: string;
  createdAt: string;
}

export default function VocabularyPage() {
  const { user, isLoggedIn } = useAuth();
  const [vocabularies, setVocabularies] = useState<Vocabulary[]>([]);
  const [filteredVocabularies, setFilteredVocabularies] = useState<Vocabulary[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPartOfSpeech, setFilterPartOfSpeech] = useState('all');
  const [showFavouritesOnly, setShowFavouritesOnly] = useState(false);
  const [isAddingNew, setIsAddingNew] = useState(false);
  const [newVocabulary, setNewVocabulary] = useState({
    word: '',
    meaning: '',
    example: '',
    pronunciation: '',
    partOfSpeech: ''
  });

  const partsOfSpeech = [
    { value: 'all', label: 'Tất cả loại từ' },
    { value: 'noun', label: 'Danh từ (Noun)' },
    { value: 'verb', label: 'Động từ (Verb)' },
    { value: 'adjective', label: 'Tính từ (Adjective)' },
    { value: 'adverb', label: 'Trạng từ (Adverb)' },
    { value: 'preposition', label: 'Giới từ (Preposition)' },
    { value: 'conjunction', label: 'Liên từ (Conjunction)' },
    { value: 'pronoun', label: 'Đại từ (Pronoun)' },
    { value: 'interjection', label: 'Thán từ (Interjection)' }
  ];

  useEffect(() => {
    fetchVocabularies();
  }, [user, isLoggedIn]);

  useEffect(() => {
    filterVocabularies();
  }, [vocabularies, searchTerm, filterPartOfSpeech, showFavouritesOnly]);

  const fetchVocabularies = async () => {
    try {
      setIsLoading(true);
      const userId = user?.id || localStorage.getItem('userId');
      const url = userId 
        ? `http://localhost:5001/api/vocabularies?userId=${userId}`
        : 'http://localhost:5001/api/vocabularies';
      
      const response = await fetch(url);
      const data = await response.json();
      
      if (data.success) {
        setVocabularies(data.data || []);
      }
    } catch (error) {
      console.error('Error fetching vocabularies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const filterVocabularies = () => {
    let filtered = [...vocabularies];

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(vocab =>
        vocab.word.toLowerCase().includes(searchTerm.toLowerCase()) ||
        vocab.meaning.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    // Filter by part of speech
    if (filterPartOfSpeech !== 'all') {
      filtered = filtered.filter(vocab => vocab.partOfSpeech === filterPartOfSpeech);
    }

    // Filter by favourites
    if (showFavouritesOnly) {
      filtered = filtered.filter(vocab => vocab.favourite);
    }

    setFilteredVocabularies(filtered);
  };

  const toggleFavourite = async (id: string) => {
    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/vocabularies/${id}/favourite`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      const data = await response.json();
      if (data.success) {
        setVocabularies(prev =>
          prev.map(vocab =>
            vocab._id === id ? { ...vocab, favourite: data.data.favourite } : vocab
          )
        );
      }
    } catch (error) {
      console.error('Error toggling favourite:', error);
    }
  };

  const handleAddVocabulary = async () => {
    if (!newVocabulary.word || !newVocabulary.meaning) {
      toast.error('Vui lòng nhập từ vựng và nghĩa');
      return;
    }

    try {
      const token = localStorage.getItem('token');
      const userId = user?.id || localStorage.getItem('userId');
      
      const response = await fetch('http://localhost:5001/api/vocabularies', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...newVocabulary,
          userId
        })
      });

      const data = await response.json();
      if (data.success) {
        setVocabularies(prev => [data.data, ...prev]);
        setNewVocabulary({
          word: '',
          meaning: '',
          example: '',
          pronunciation: '',
          partOfSpeech: ''
        });
        setIsAddingNew(false);
      }
    } catch (error) {
      console.error('Error adding vocabulary:', error);
    }
  };

  const handleDeleteVocabulary = async (id: string) => {
    if (!confirm('Bạn có chắc muốn xóa từ vựng này?')) return;

    try {
      const token = localStorage.getItem('token');
      const response = await fetch(`http://localhost:5001/api/vocabularies/${id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();
      if (data.success) {
        setVocabularies(prev => prev.filter(vocab => vocab._id !== id));
      }
    } catch (error) {
      console.error('Error deleting vocabulary:', error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-cyan-50 via-white to-teal-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <span>📚</span>
            <span>Sổ tay từ vựng</span>
          </h1>
          <p className="text-xl text-gray-600">
            Lưu trữ và quản lý những từ vựng yêu thích của bạn
          </p>
        </div>

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            {/* Search Input */}
            <div className="md:col-span-1">
              <input
                type="text"
                placeholder="🔍 Tìm kiếm từ vựng..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Part of Speech Filter */}
            <div className="md:col-span-1">
              <select
                value={filterPartOfSpeech}
                onChange={(e) => setFilterPartOfSpeech(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none transition-all"
              >
                {partsOfSpeech.map(pos => (
                  <option key={pos.value} value={pos.value}>{pos.label}</option>
                ))}
              </select>
            </div>

            {/* Favourites Toggle */}
            <div className="md:col-span-1 flex items-center gap-4">
              <button
                onClick={() => setShowFavouritesOnly(!showFavouritesOnly)}
                className={`flex-1 px-4 py-3 rounded-xl font-semibold transition-all ${
                  showFavouritesOnly
                    ? 'bg-gradient-to-r from-pink-500 to-red-500 text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {showFavouritesOnly ? '❤️ Yêu thích' : '🤍 Tất cả'}
              </button>
              
              {isLoggedIn && (
                <button
                  onClick={() => setIsAddingNew(!isAddingNew)}
                  className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  ➕ Thêm
                </button>
              )}
            </div>
          </div>

          {/* Add New Vocabulary Form */}
          {isAddingNew && (
            <div className="mt-6 p-6 bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl border-2 border-cyan-200">
              <h3 className="text-xl font-bold text-gray-900 mb-4">➕ Thêm từ vựng mới</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <input
                  type="text"
                  placeholder="Từ vựng *"
                  value={newVocabulary.word}
                  onChange={(e) => setNewVocabulary({ ...newVocabulary, word: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Nghĩa *"
                  value={newVocabulary.meaning}
                  onChange={(e) => setNewVocabulary({ ...newVocabulary, meaning: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                />
                <input
                  type="text"
                  placeholder="Phiên âm"
                  value={newVocabulary.pronunciation}
                  onChange={(e) => setNewVocabulary({ ...newVocabulary, pronunciation: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                />
                <select
                  value={newVocabulary.partOfSpeech}
                  onChange={(e) => setNewVocabulary({ ...newVocabulary, partOfSpeech: e.target.value })}
                  className="px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                >
                  <option value="">Chọn loại từ</option>
                  {partsOfSpeech.slice(1).map(pos => (
                    <option key={pos.value} value={pos.value}>{pos.label}</option>
                  ))}
                </select>
                <input
                  type="text"
                  placeholder="Ví dụ"
                  value={newVocabulary.example}
                  onChange={(e) => setNewVocabulary({ ...newVocabulary, example: e.target.value })}
                  className="md:col-span-2 px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-cyan-500 outline-none"
                />
              </div>
              <div className="flex gap-3 mt-4">
                <button
                  onClick={handleAddVocabulary}
                  className="flex-1 px-6 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  ✅ Lưu
                </button>
                <button
                  onClick={() => setIsAddingNew(false)}
                  className="px-6 py-3 bg-gray-200 text-gray-700 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                >
                  ❌ Hủy
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">📚</div>
            <div className="text-3xl font-bold text-gray-900">{vocabularies.length}</div>
            <div className="text-gray-600 font-medium">Tổng từ vựng</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">❤️</div>
            <div className="text-3xl font-bold text-pink-600">
              {vocabularies.filter(v => v.favourite).length}
            </div>
            <div className="text-gray-600 font-medium">Yêu thích</div>
          </div>
          <div className="bg-white rounded-2xl shadow-lg p-6 text-center">
            <div className="text-4xl mb-2">🔍</div>
            <div className="text-3xl font-bold text-cyan-600">{filteredVocabularies.length}</div>
            <div className="text-gray-600 font-medium">Kết quả tìm kiếm</div>
          </div>
        </div>

        {/* Vocabulary List */}
        {isLoading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-cyan-500"></div>
            <p className="mt-4 text-gray-600">Đang tải từ vựng...</p>
          </div>
        ) : filteredVocabularies.length === 0 ? (
          <div className="bg-white rounded-2xl shadow-lg p-12 text-center">
            <div className="text-6xl mb-4">📭</div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Chưa có từ vựng</h3>
            <p className="text-gray-600 mb-6">
              {showFavouritesOnly
                ? 'Bạn chưa có từ vựng yêu thích nào. Hãy thêm từ vựng và đánh dấu yêu thích!'
                : 'Hãy bắt đầu thêm từ vựng vào sổ tay của bạn!'}
            </p>
            {isLoggedIn && !isAddingNew && (
              <button
                onClick={() => setIsAddingNew(true)}
                className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all"
              >
                ➕ Thêm từ vựng đầu tiên
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVocabularies.map((vocab) => (
              <div
                key={vocab._id}
                className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 relative group"
              >
                {/* Favourite Heart Icon - Top Left */}
                <button
                  onClick={() => toggleFavourite(vocab._id)}
                  className="absolute top-4 left-4 hover:scale-125 transition-all z-10"
                  title={vocab.favourite ? 'Bỏ yêu thích' : 'Yêu thích'}
                  style={{ 
                    background: 'none', 
                    border: 'none', 
                    cursor: 'pointer', 
                    fontSize: '32px',
                    color: vocab.favourite ? '#dc2626' : '#d1d5db',
                    filter: vocab.favourite ? 'drop-shadow(0 0 2px rgba(220, 38, 38, 0.5))' : 'none'
                  }}
                >
                  {vocab.favourite ? '♥' : '♡'}
                </button>

                {/* Delete Button - Top Right */}
                {isLoggedIn && (
                  <button
                    onClick={() => handleDeleteVocabulary(vocab._id)}
                    className="absolute top-4 right-4 text-2xl opacity-0 group-hover:opacity-100 hover:scale-125 transition-all"
                    title="Xóa"
                  >
                    🗑️
                  </button>
                )}

                {/* Content */}
                <div className="mt-8">
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {vocab.word}
                  </h3>
                  
                  {vocab.pronunciation && (
                    <p className="text-gray-500 italic mb-3">/{vocab.pronunciation}/</p>
                  )}
                  
                  {vocab.partOfSpeech && (
                    <span className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-100 to-teal-100 text-cyan-700 rounded-full text-sm font-semibold mb-3">
                      {partsOfSpeech.find(p => p.value === vocab.partOfSpeech)?.label || vocab.partOfSpeech}
                    </span>
                  )}
                  
                  <p className="text-gray-700 font-medium mb-3">
                    <span className="font-bold">Nghĩa:</span> {vocab.meaning}
                  </p>
                  
                  {vocab.example && (
                    <div className="bg-gradient-to-r from-cyan-50 to-teal-50 rounded-xl p-3 border-l-4 border-cyan-500">
                      <p className="text-gray-700 italic text-sm">
                        <span className="font-bold not-italic">Ví dụ:</span> {vocab.example}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
