"use client";

import { useState } from 'react';

interface IPASound {
  symbol: string;
  description: string;
  examples: string[];
  audioText: string;
}

export default function IPAPage() {
  const [activeTab, setActiveTab] = useState<'vowels' | 'consonants'>('vowels');
  const [playingSound, setPlayingSound] = useState<string | null>(null);

  // Vowels - Nguyên âm
  const vowels: IPASound[] = [
    {
      symbol: 'iː',
      description: 'Nguyên âm dài, môi căng, lưỡi ở vị trí cao phía trước',
      examples: ['see /siː/', 'tree /triː/', 'key /kiː/'],
      audioText: 'ee'
    },
    {
      symbol: 'ɪ',
      description: 'Nguyên âm ngắn, lưỡi hơi thấp hơn /iː/',
      examples: ['sit /sɪt/', 'big /bɪɡ/', 'fish /fɪʃ/'],
      audioText: 'ih'
    },
    {
      symbol: 'e',
      description: 'Nguyên âm ngắn, lưỡi ở giữa phía trước',
      examples: ['bed /bed/', 'red /red/', 'head /hed/'],
      audioText: 'eh'
    },
    {
      symbol: 'æ',
      description: 'Nguyên âm ngắn, miệng mở rộng',
      examples: ['cat /kæt/', 'bad /bæd/', 'hat /hæt/'],
      audioText: 'a'
    },
    {
      symbol: 'ɑː',
      description: 'Nguyên âm dài, miệng mở rộng, lưỡi thấp',
      examples: ['car /kɑː/', 'father /ˈfɑːðə/', 'heart /hɑːt/'],
      audioText: 'ah'
    },
    {
      symbol: 'ɒ',
      description: 'Nguyên âm ngắn, môi tròn, lưỡi thấp',
      examples: ['hot /hɒt/', 'dog /dɒɡ/', 'box /bɒks/'],
      audioText: 'o'
    },
    {
      symbol: 'ɔː',
      description: 'Nguyên âm dài, môi tròn',
      examples: ['door /dɔː/', 'call /kɔːl/', 'saw /sɔː/'],
      audioText: 'aw'
    },
    {
      symbol: 'ʊ',
      description: 'Nguyên âm ngắn, môi tròn, lưỡi cao',
      examples: ['book /bʊk/', 'good /ɡʊd/', 'put /pʊt/'],
      audioText: 'uh'
    },
    {
      symbol: 'uː',
      description: 'Nguyên âm dài, môi tròn chặt, lưỡi cao',
      examples: ['food /fuːd/', 'blue /bluː/', 'true /truː/'],
      audioText: 'oo'
    },
    {
      symbol: 'ʌ',
      description: 'Nguyên âm ngắn, lưỡi ở giữa',
      examples: ['cup /kʌp/', 'sun /sʌn/', 'love /lʌv/'],
      audioText: 'uh'
    },
    {
      symbol: 'ɜː',
      description: 'Nguyên âm dài, lưỡi ở giữa',
      examples: ['bird /bɜːd/', 'turn /tɜːn/', 'learn /lɜːn/'],
      audioText: 'er'
    },
    {
      symbol: 'ə',
      description: 'Nguyên âm yếu (schwa), âm trung tính',
      examples: ['about /əˈbaʊt/', 'teacher /ˈtiːtʃə/', 'sofa /ˈsəʊfə/'],
      audioText: 'uh'
    },
    // Diphthongs - Nguyên âm đôi
    {
      symbol: 'eɪ',
      description: 'Nguyên âm đôi, từ /e/ đến /ɪ/',
      examples: ['day /deɪ/', 'make /meɪk/', 'rain /reɪn/'],
      audioText: 'ay'
    },
    {
      symbol: 'aɪ',
      description: 'Nguyên âm đôi, từ /a/ đến /ɪ/',
      examples: ['my /maɪ/', 'time /taɪm/', 'fly /flaɪ/'],
      audioText: 'eye'
    },
    {
      symbol: 'ɔɪ',
      description: 'Nguyên âm đôi, từ /ɔ/ đến /ɪ/',
      examples: ['boy /bɔɪ/', 'coin /kɔɪn/', 'voice /vɔɪs/'],
      audioText: 'oy'
    },
    {
      symbol: 'aʊ',
      description: 'Nguyên âm đôi, từ /a/ đến /ʊ/',
      examples: ['now /naʊ/', 'house /haʊs/', 'cloud /klaʊd/'],
      audioText: 'ow'
    },
    {
      symbol: 'əʊ',
      description: 'Nguyên âm đôi, từ /ə/ đến /ʊ/',
      examples: ['go /ɡəʊ/', 'home /həʊm/', 'know /nəʊ/'],
      audioText: 'oh'
    },
    {
      symbol: 'ɪə',
      description: 'Nguyên âm đôi, từ /ɪ/ đến /ə/',
      examples: ['here /hɪə/', 'near /nɪə/', 'beer /bɪə/'],
      audioText: 'ear'
    },
    {
      symbol: 'eə',
      description: 'Nguyên âm đôi, từ /e/ đến /ə/',
      examples: ['hair /heə/', 'care /keə/', 'bear /beə/'],
      audioText: 'air'
    },
    {
      symbol: 'ʊə',
      description: 'Nguyên âm đôi, từ /ʊ/ đến /ə/',
      examples: ['pure /pjʊə/', 'sure /ʃʊə/', 'tour /tʊə/'],
      audioText: 'oor'
    }
  ];

  // Consonants - Phụ âm
  const consonants: IPASound[] = [
    {
      symbol: 'p',
      description: 'Phụ âm vô thanh, hai môi khép lại',
      examples: ['pen /pen/', 'happy /ˈhæpi/', 'stop /stɒp/'],
      audioText: 'p'
    },
    {
      symbol: 'b',
      description: 'Phụ âm hữu thanh, hai môi khép lại',
      examples: ['bad /bæd/', 'baby /ˈbeɪbi/', 'job /dʒɒb/'],
      audioText: 'b'
    },
    {
      symbol: 't',
      description: 'Phụ âm vô thanh, đầu lưỡi chạm lợi trên',
      examples: ['tea /tiː/', 'better /ˈbetə/', 'cat /kæt/'],
      audioText: 't'
    },
    {
      symbol: 'd',
      description: 'Phụ âm hữu thanh, đầu lưỡi chạm lợi trên',
      examples: ['dog /dɒɡ/', 'ladder /ˈlædə/', 'bad /bæd/'],
      audioText: 'd'
    },
    {
      symbol: 'k',
      description: 'Phụ âm vô thanh, gốc lưỡi chạm vòm miệng',
      examples: ['cat /kæt/', 'school /skuːl/', 'back /bæk/'],
      audioText: 'k'
    },
    {
      symbol: 'ɡ',
      description: 'Phụ âm hữu thanh, gốc lưỡi chạm vòm miệng',
      examples: ['go /ɡəʊ/', 'bigger /ˈbɪɡə/', 'dog /dɒɡ/'],
      audioText: 'g'
    },
    {
      symbol: 'f',
      description: 'Phụ âm vô thanh, răng trên chạm môi dưới',
      examples: ['fish /fɪʃ/', 'coffee /ˈkɒfi/', 'laugh /lɑːf/'],
      audioText: 'f'
    },
    {
      symbol: 'v',
      description: 'Phụ âm hữu thanh, răng trên chạm môi dưới',
      examples: ['very /ˈveri/', 'river /ˈrɪvə/', 'love /lʌv/'],
      audioText: 'v'
    },
    {
      symbol: 'θ',
      description: 'Phụ âm vô thanh, lưỡi giữa răng',
      examples: ['think /θɪŋk/', 'bath /bɑːθ/', 'tooth /tuːθ/'],
      audioText: 'th'
    },
    {
      symbol: 'ð',
      description: 'Phụ âm hữu thanh, lưỡi giữa răng',
      examples: ['this /ðɪs/', 'mother /ˈmʌðə/', 'breathe /briːð/'],
      audioText: 'the'
    },
    {
      symbol: 's',
      description: 'Phụ âm vô thanh, lưỡi gần lợi trên',
      examples: ['see /siː/', 'miss /mɪs/', 'city /ˈsɪti/'],
      audioText: 's'
    },
    {
      symbol: 'z',
      description: 'Phụ âm hữu thanh, lưỡi gần lợi trên',
      examples: ['zoo /zuː/', 'easy /ˈiːzi/', 'dogs /dɒɡz/'],
      audioText: 'z'
    },
    {
      symbol: 'ʃ',
      description: 'Phụ âm vô thanh, lưỡi gần vòm miệng',
      examples: ['ship /ʃɪp/', 'fish /fɪʃ/', 'nation /ˈneɪʃən/'],
      audioText: 'sh'
    },
    {
      symbol: 'ʒ',
      description: 'Phụ âm hữu thanh, lưỡi gần vòm miệng',
      examples: ['vision /ˈvɪʒən/', 'measure /ˈmeʒə/', 'beige /beɪʒ/'],
      audioText: 'zh'
    },
    {
      symbol: 'tʃ',
      description: 'Phụ âm vô thanh, kết hợp /t/ và /ʃ/',
      examples: ['church /tʃɜːtʃ/', 'watch /wɒtʃ/', 'nature /ˈneɪtʃə/'],
      audioText: 'ch'
    },
    {
      symbol: 'dʒ',
      description: 'Phụ âm hữu thanh, kết hợp /d/ và /ʒ/',
      examples: ['judge /dʒʌdʒ/', 'age /eɪdʒ/', 'bridge /brɪdʒ/'],
      audioText: 'j'
    },
    {
      symbol: 'h',
      description: 'Phụ âm vô thanh, hơi thở qua họng',
      examples: ['house /haʊs/', 'happy /ˈhæpi/', 'behind /bɪˈhaɪnd/'],
      audioText: 'h'
    },
    {
      symbol: 'm',
      description: 'Phụ âm mũi, hai môi khép lại',
      examples: ['man /mæn/', 'summer /ˈsʌmə/', 'come /kʌm/'],
      audioText: 'm'
    },
    {
      symbol: 'n',
      description: 'Phụ âm mũi, lưỡi chạm lợi trên',
      examples: ['no /nəʊ/', 'dinner /ˈdɪnə/', 'sun /sʌn/'],
      audioText: 'n'
    },
    {
      symbol: 'ŋ',
      description: 'Phụ âm mũi, gốc lưỡi chạm vòm miệng',
      examples: ['sing /sɪŋ/', 'finger /ˈfɪŋɡə/', 'long /lɒŋ/'],
      audioText: 'ng'
    },
    {
      symbol: 'l',
      description: 'Phụ âm bên, lưỡi chạm lợi trên',
      examples: ['love /lʌv/', 'hello /həˈləʊ/', 'ball /bɔːl/'],
      audioText: 'l'
    },
    {
      symbol: 'r',
      description: 'Phụ âm xấp xỉ, lưỡi cuộn lên',
      examples: ['red /red/', 'sorry /ˈsɒri/', 'car /kɑː/'],
      audioText: 'r'
    },
    {
      symbol: 'j',
      description: 'Phụ âm bán nguyên âm, lưỡi cao phía trước',
      examples: ['yes /jes/', 'you /juː/', 'yellow /ˈjeləʊ/'],
      audioText: 'y'
    },
    {
      symbol: 'w',
      description: 'Phụ âm bán nguyên âm, môi tròn',
      examples: ['we /wiː/', 'swim /swɪm/', 'away /əˈweɪ/'],
      audioText: 'w'
    }
  ];

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

  const playSound = async (sound: IPASound) => {
    if (playingSound === sound.symbol) return;
    
    setPlayingSound(sound.symbol);
    
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
      const utterance = new SpeechSynthesisUtterance(sound.audioText);
      
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

      // Set up event listeners
      utterance.onend = () => {
        setPlayingSound(null);
      };

      utterance.onerror = (event) => {
        console.error('Speech synthesis error:', event.error);
        setPlayingSound(null);
      };

      // Speak the text
      window.speechSynthesis.speak(utterance);

    } catch (error) {
      console.error('Audio error:', error);
      setPlayingSound(null);
    }
  };

  const currentSounds = activeTab === 'vowels' ? vowels : consonants;

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-white to-rose-50 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold text-gray-900 mb-4 flex items-center justify-center gap-3">
            <span>🔊</span>
            <span>Phát âm IPA</span>
          </h1>
          <p className="text-xl text-gray-600 mb-6">
            Học phát âm chuẩn với bảng ký hiệu phiên âm quốc tế (International Phonetic Alphabet)
          </p>
          <div className="flex justify-center gap-4 text-sm text-gray-600">
            <div className="flex items-center gap-2">
              <span className="text-2xl">👂</span>
              <span>Nghe phát âm chuẩn</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">📖</span>
              <span>Xem ví dụ minh họa</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">🎯</span>
              <span>Luyện tập chính xác</span>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-2xl shadow-lg p-2 inline-flex gap-2">
            <button
              onClick={() => setActiveTab('vowels')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'vowels'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              🗣️ Nguyên âm ({vowels.length})
            </button>
            <button
              onClick={() => setActiveTab('consonants')}
              className={`px-8 py-3 rounded-xl font-semibold transition-all ${
                activeTab === 'consonants'
                  ? 'bg-gradient-to-r from-pink-500 to-rose-500 text-white shadow-lg'
                  : 'text-gray-600 hover:bg-gray-100'
              }`}
            >
              💬 Phụ âm ({consonants.length})
            </button>
          </div>
        </div>

        {/* IPA Sounds Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {currentSounds.map((sound, index) => (
            <div
              key={index}
              className="bg-white rounded-2xl shadow-lg p-6 hover:shadow-xl transition-all duration-300 border-2 border-transparent hover:border-pink-200"
            >
              {/* Symbol and Play Button */}
              <div className="flex items-center justify-between mb-4">
                <div className="text-5xl font-bold text-pink-600">
                  /{sound.symbol}/
                </div>
                <button
                  onClick={() => playSound(sound)}
                  disabled={playingSound === sound.symbol}
                  className={`p-4 rounded-full transition-all ${
                    playingSound === sound.symbol
                      ? 'bg-pink-600 text-white animate-pulse'
                      : 'bg-gradient-to-r from-pink-500 to-rose-500 text-white hover:scale-110'
                  } shadow-lg`}
                  title="Nghe phát âm"
                >
                  {playingSound === sound.symbol ? '🔊' : '🔊'}
                </button>
              </div>

              {/* Description */}
              <div className="mb-4">
                <h3 className="font-semibold text-gray-900 mb-2">Cách phát âm:</h3>
                <p className="text-gray-600 text-sm leading-relaxed">
                  {sound.description}
                </p>
              </div>

              {/* Examples */}
              <div>
                <h3 className="font-semibold text-gray-900 mb-2">Ví dụ:</h3>
                <ul className="space-y-2">
                  {sound.examples.map((example, idx) => (
                    <li
                      key={idx}
                      className="text-gray-700 text-sm bg-gradient-to-r from-pink-50 to-rose-50 px-3 py-2 rounded-lg"
                    >
                      {example}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ))}
        </div>

        {/* Info Section */}
        <div className="mt-12 bg-white rounded-2xl shadow-lg p-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-6 text-center">
            💡 Mẹo học phát âm IPA hiệu quả
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">🎯 Luyện tập đều đặn</h3>
              <p className="text-gray-700">
                Dành 10-15 phút mỗi ngày để luyện phát âm các ký hiệu IPA. Bắt đầu với nguyên âm đơn trước khi chuyển sang phụ âm và nguyên âm đôi.
              </p>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">👄 Quan sát vị trí miệng</h3>
              <p className="text-gray-700">
                Chú ý đến vị trí lưỡi, môi và hàm khi phát âm. Sử dụng gương để quan sát và điều chỉnh cách phát âm của bạn.
              </p>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">🔊 Nghe và lặp lại</h3>
              <p className="text-gray-700">
                Click vào icon loa để nghe phát âm chuẩn, sau đó lặp lại nhiều lần cho đến khi bạn có thể phát âm chính xác.
              </p>
            </div>
            <div className="bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-3">📚 Áp dụng vào từ thực tế</h3>
              <p className="text-gray-700">
                Sau khi học một ký hiệu IPA, tìm thêm các từ có chứa âm đó và luyện tập phát âm trong ngữ cảnh thực tế.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
