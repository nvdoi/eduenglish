import mongoose from 'mongoose';
import Course from '../models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

// Helper function to generate vocabulary based on level
const generateVocabulary = (level, count = 20) => {
  const vocabSets = {
    Beginner: [
      { word: "hello", meaning: "xin chào", example: "Hello, how are you?", pronunciation: "həˈloʊ", partOfSpeech: "interjection" },
      { word: "goodbye", meaning: "tạm biệt", example: "Goodbye, see you tomorrow!", pronunciation: "ɡʊdˈbaɪ", partOfSpeech: "interjection" },
      { word: "thank", meaning: "cảm ơn", example: "Thank you very much.", pronunciation: "θæŋk", partOfSpeech: "verb" },
      { word: "please", meaning: "làm ơn", example: "Please help me.", pronunciation: "pliːz", partOfSpeech: "adverb" },
      { word: "sorry", meaning: "xin lỗi", example: "I'm sorry for being late.", pronunciation: "ˈsɑːri", partOfSpeech: "adjective" },
      { word: "yes", meaning: "có, vâng", example: "Yes, I agree.", pronunciation: "jes", partOfSpeech: "adverb" },
      { word: "no", meaning: "không", example: "No, I don't want to.", pronunciation: "noʊ", partOfSpeech: "adverb" },
      { word: "name", meaning: "tên", example: "My name is John.", pronunciation: "neɪm", partOfSpeech: "noun" },
      { word: "friend", meaning: "bạn bè", example: "She is my best friend.", pronunciation: "frend", partOfSpeech: "noun" },
      { word: "family", meaning: "gia đình", example: "I love my family.", pronunciation: "ˈfæməli", partOfSpeech: "noun" },
      { word: "house", meaning: "nhà", example: "This is my house.", pronunciation: "haʊs", partOfSpeech: "noun" },
      { word: "school", meaning: "trường học", example: "I go to school every day.", pronunciation: "skuːl", partOfSpeech: "noun" },
      { word: "book", meaning: "sách", example: "I'm reading a book.", pronunciation: "bʊk", partOfSpeech: "noun" },
      { word: "water", meaning: "nước", example: "I need some water.", pronunciation: "ˈwɔːtər", partOfSpeech: "noun" },
      { word: "food", meaning: "thức ăn", example: "This food is delicious.", pronunciation: "fuːd", partOfSpeech: "noun" },
      { word: "happy", meaning: "vui vẻ", example: "I am very happy today.", pronunciation: "ˈhæpi", partOfSpeech: "adjective" },
      { word: "good", meaning: "tốt", example: "That's a good idea.", pronunciation: "ɡʊd", partOfSpeech: "adjective" },
      { word: "big", meaning: "to, lớn", example: "This is a big house.", pronunciation: "bɪɡ", partOfSpeech: "adjective" },
      { word: "small", meaning: "nhỏ", example: "I have a small dog.", pronunciation: "smɔːl", partOfSpeech: "adjective" },
      { word: "love", meaning: "yêu", example: "I love you.", pronunciation: "lʌv", partOfSpeech: "verb" }
    ],
    Intermediate: [
      { word: "achieve", meaning: "đạt được", example: "She achieved her goal.", pronunciation: "əˈtʃiːv", partOfSpeech: "verb" },
      { word: "benefit", meaning: "lợi ích", example: "Exercise has many benefits.", pronunciation: "ˈbenɪfɪt", partOfSpeech: "noun" },
      { word: "challenge", meaning: "thách thức", example: "This is a big challenge.", pronunciation: "ˈtʃælɪndʒ", partOfSpeech: "noun" },
      { word: "develop", meaning: "phát triển", example: "We need to develop new skills.", pronunciation: "dɪˈveləp", partOfSpeech: "verb" },
      { word: "environment", meaning: "môi trường", example: "We must protect the environment.", pronunciation: "ɪnˈvaɪrənmənt", partOfSpeech: "noun" },
      { word: "experience", meaning: "kinh nghiệm", example: "I have five years of experience.", pronunciation: "ɪkˈspɪriəns", partOfSpeech: "noun" },
      { word: "improve", meaning: "cải thiện", example: "I want to improve my English.", pronunciation: "ɪmˈpruːv", partOfSpeech: "verb" },
      { word: "knowledge", meaning: "kiến thức", example: "Knowledge is power.", pronunciation: "ˈnɑːlɪdʒ", partOfSpeech: "noun" },
      { word: "opportunity", meaning: "cơ hội", example: "This is a great opportunity.", pronunciation: "ˌɑːpərˈtuːnəti", partOfSpeech: "noun" },
      { word: "professional", meaning: "chuyên nghiệp", example: "He is a professional teacher.", pronunciation: "prəˈfeʃənl", partOfSpeech: "adjective" },
      { word: "require", meaning: "yêu cầu", example: "This job requires experience.", pronunciation: "rɪˈkwaɪər", partOfSpeech: "verb" },
      { word: "situation", meaning: "tình huống", example: "We are in a difficult situation.", pronunciation: "ˌsɪtʃuˈeɪʃn", partOfSpeech: "noun" },
      { word: "technology", meaning: "công nghệ", example: "Technology is changing rapidly.", pronunciation: "tekˈnɑːlədʒi", partOfSpeech: "noun" },
      { word: "understand", meaning: "hiểu", example: "I understand your problem.", pronunciation: "ˌʌndərˈstænd", partOfSpeech: "verb" },
      { word: "valuable", meaning: "có giá trị", example: "Time is valuable.", pronunciation: "ˈvæljuəbl", partOfSpeech: "adjective" },
      { word: "communicate", meaning: "giao tiếp", example: "We communicate by email.", pronunciation: "kəˈmjuːnɪkeɪt", partOfSpeech: "verb" },
      { word: "decision", meaning: "quyết định", example: "I made a good decision.", pronunciation: "dɪˈsɪʒn", partOfSpeech: "noun" },
      { word: "effective", meaning: "hiệu quả", example: "This is an effective method.", pronunciation: "ɪˈfektɪv", partOfSpeech: "adjective" },
      { word: "organize", meaning: "tổ chức", example: "Let's organize a meeting.", pronunciation: "ˈɔːrɡənaɪz", partOfSpeech: "verb" },
      { word: "responsible", meaning: "có trách nhiệm", example: "You are responsible for this.", pronunciation: "rɪˈspɑːnsəbl", partOfSpeech: "adjective" }
    ],
    Advanced: [
      { word: "accommodate", meaning: "chứa, điều chỉnh", example: "The hotel can accommodate 200 guests.", pronunciation: "əˈkɑːmədeɪt", partOfSpeech: "verb" },
      { word: "ambiguous", meaning: "mơ hồ", example: "The statement was ambiguous.", pronunciation: "æmˈbɪɡjuəs", partOfSpeech: "adjective" },
      { word: "comprehensive", meaning: "toàn diện", example: "We need a comprehensive solution.", pronunciation: "ˌkɑːmprɪˈhensɪv", partOfSpeech: "adjective" },
      { word: "demonstrate", meaning: "chứng minh", example: "Let me demonstrate how it works.", pronunciation: "ˈdemənstreɪt", partOfSpeech: "verb" },
      { word: "elaborate", meaning: "phức tạp, chi tiết", example: "She gave an elaborate explanation.", pronunciation: "ɪˈlæbərət", partOfSpeech: "adjective" },
      { word: "facilitate", meaning: "tạo điều kiện", example: "Technology facilitates communication.", pronunciation: "fəˈsɪlɪteɪt", partOfSpeech: "verb" },
      { word: "hypothesis", meaning: "giả thuyết", example: "The hypothesis was proven correct.", pronunciation: "haɪˈpɑːθəsɪs", partOfSpeech: "noun" },
      { word: "implement", meaning: "thực hiện", example: "We will implement the new policy.", pronunciation: "ˈɪmplɪment", partOfSpeech: "verb" },
      { word: "justify", meaning: "biện minh", example: "Can you justify your decision?", pronunciation: "ˈdʒʌstɪfaɪ", partOfSpeech: "verb" },
      { word: "legitimate", meaning: "hợp pháp", example: "That's a legitimate concern.", pronunciation: "lɪˈdʒɪtɪmət", partOfSpeech: "adjective" },
      { word: "methodology", meaning: "phương pháp luận", example: "The research methodology was sound.", pronunciation: "ˌmeθəˈdɑːlədʒi", partOfSpeech: "noun" },
      { word: "nevertheless", meaning: "tuy nhiên", example: "It was difficult; nevertheless, we succeeded.", pronunciation: "ˌnevərðəˈles", partOfSpeech: "adverb" },
      { word: "paradigm", meaning: "mô hình", example: "There's been a paradigm shift.", pronunciation: "ˈpærədaɪm", partOfSpeech: "noun" },
      { word: "subsequent", meaning: "tiếp theo", example: "Subsequent events proved him right.", pronunciation: "ˈsʌbsɪkwənt", partOfSpeech: "adjective" },
      { word: "theoretical", meaning: "lý thuyết", example: "This is a theoretical framework.", pronunciation: "ˌθiːəˈretɪkl", partOfSpeech: "adjective" },
      { word: "unprecedented", meaning: "chưa từng có", example: "This is an unprecedented situation.", pronunciation: "ʌnˈpresɪdentɪd", partOfSpeech: "adjective" },
      { word: "versatile", meaning: "linh hoạt", example: "She is a versatile performer.", pronunciation: "ˈvɜːrsətl", partOfSpeech: "adjective" },
      { word: "whereby", meaning: "theo đó", example: "A system whereby users can vote.", pronunciation: "werˈbaɪ", partOfSpeech: "adverb" },
      { word: "yield", meaning: "mang lại", example: "The research yielded interesting results.", pronunciation: "jiːld", partOfSpeech: "verb" },
      { word: "zealous", meaning: "nhiệt tình", example: "He is zealous about his work.", pronunciation: "ˈzeləs", partOfSpeech: "adjective" }
    ]
  };
  
  return vocabSets[level] || vocabSets.Beginner;
};

// Helper function to generate grammar based on level
const generateGrammar = (level) => {
  const grammarSets = {
    Beginner: [
      { topic: "Present Simple Tense", explanation: "Thì hiện tại đơn dùng để diễn tả thói quen, sự thật hiển nhiên.", example: "I go to school every day.\\nShe likes coffee.", rules: ["Với I/You/We/They: V (nguyên mẫu)", "Với He/She/It: V-s/es"], commonMistakes: ["He go to school (sai) → He goes to school (đúng)"] },
      { topic: "To Be (am/is/are)", explanation: "Động từ 'to be' dùng để chỉ trạng thái, nghề nghiệp, vị trí.", example: "I am a student.\\nShe is happy.\\nThey are at home.", rules: ["I + am", "He/She/It + is", "You/We/They + are"], commonMistakes: ["I is happy (sai) → I am happy (đúng)"] },
      { topic: "Articles (a/an/the)", explanation: "Mạo từ đứng trước danh từ để xác định hoặc không xác định.", example: "I have a book.\\nShe is an engineer.\\nThe sun is bright.", rules: ["a + phụ âm", "an + nguyên âm", "the + xác định"], commonMistakes: ["I have an book (sai) → I have a book (đúng)"] },
      { topic: "Plural Nouns", explanation: "Danh từ số nhiều thường thêm -s hoặc -es.", example: "one book → two books\\none box → two boxes", rules: ["Thêm -s: books, cats", "Thêm -es: boxes, watches"], commonMistakes: ["two book (sai) → two books (đúng)"] },
      { topic: "Personal Pronouns", explanation: "Đại từ nhân xưng thay thế cho danh từ chỉ người.", example: "I love you.\\nHe helps her.\\nWe know them.", rules: ["Chủ ngữ: I, you, he, she, it, we, they", "Tân ngữ: me, you, him, her, it, us, them"], commonMistakes: ["Me am happy (sai) → I am happy (đúng)"] }
    ],
    Intermediate: [
      { topic: "Present Perfect Tense", explanation: "Thì hiện tại hoàn thành diễn tả hành động đã xảy ra và có liên quan đến hiện tại.", example: "I have lived here for 5 years.\\nShe has finished her homework.", rules: ["have/has + V3/ed", "Dùng với: for, since, already, yet"], commonMistakes: ["I have live here (sai) → I have lived here (đúng)"] },
      { topic: "Past Continuous Tense", explanation: "Thì quá khứ tiếp diễn diễn tả hành động đang xảy ra tại một thời điểm trong quá khứ.", example: "I was studying at 8pm yesterday.\\nThey were playing football when it rained.", rules: ["was/were + V-ing", "Dùng khi có hành động khác xen vào"], commonMistakes: ["I was study (sai) → I was studying (đúng)"] },
      { topic: "Modal Verbs", explanation: "Động từ khuyết thiếu diễn tả khả năng, sự cho phép, lời khuyên.", example: "I can swim.\\nYou should study harder.\\nMay I come in?", rules: ["can, could, may, might, must, should + V(nguyên mẫu)", "Không chia theo ngôi"], commonMistakes: ["He cans swim (sai) → He can swim (đúng)"] },
      { topic: "Conditional Sentences Type 1", explanation: "Câu điều kiện loại 1 diễn tả điều có thể xảy ra ở hiện tại hoặc tương lai.", example: "If it rains, I will stay home.\\nIf you study hard, you will pass the exam.", rules: ["If + present simple, will + V", "Điều kiện có thể xảy ra"], commonMistakes: ["If it will rain (sai) → If it rains (đúng)"] },
      { topic: "Passive Voice", explanation: "Câu bị động nhấn mạnh đối tượng chịu tác động của hành động.", example: "The book was written by Shakespeare.\\nEnglish is spoken worldwide.", rules: ["be + V3/ed", "by + tác nhân (có thể bỏ)"], commonMistakes: ["The book written (sai) → The book was written (đúng)"] }
    ],
    Advanced: [
      { topic: "Perfect Continuous Tenses", explanation: "Các thì hoàn thành tiếp diễn nhấn mạnh tính liên tục của hành động.", example: "I have been working here for 10 years.\\nShe had been studying before the exam.", rules: ["Present: have/has been + V-ing", "Past: had been + V-ing"], commonMistakes: ["I have been work (sai) → I have been working (đúng)"] },
      { topic: "Subjunctive Mood", explanation: "Thức giả định dùng để diễn tả điều ước, yêu cầu, đề nghị.", example: "I suggest that he study harder.\\nIt's important that she be on time.", rules: ["suggest/recommend/insist + that + S + V(nguyên mẫu)", "Không chia động từ"], commonMistakes: ["I suggest he studies (sai) → I suggest he study (đúng)"] },
      { topic: "Inversion", explanation: "Đảo ngữ dùng để nhấn mạnh hoặc trong văn viết trang trọng.", example: "Never have I seen such beauty.\\nOnly then did I realize the truth.", rules: ["Negative adverb + auxiliary + subject + verb", "Dùng trong văn viết formal"], commonMistakes: ["Never I have seen (sai) → Never have I seen (đúng)"] },
      { topic: "Cleft Sentences", explanation: "Câu chẻ dùng để nhấn mạnh một phần của câu.", example: "It was John who broke the window.\\nWhat I need is a good rest.", rules: ["It + be + focus + that/who...", "What + S + V + be..."], commonMistakes: ["It is John broke (sai) → It was John who broke (đúng)"] },
      { topic: "Participle Clauses", explanation: "Mệnh đề phân từ rút gọn mệnh đề quan hệ hoặc trạng ngữ.", example: "Having finished his work, he went home.\\nThe man standing there is my teacher.", rules: ["V-ing (chủ động)", "V3/ed (bị động)", "Having + V3 (hoàn thành)"], commonMistakes: ["Finish his work, he went (sai) → Having finished his work, he went (đúng)"] }
    ]
  };
  
  return grammarSets[level] || grammarSets.Beginner;
};

// Helper function to generate exercises based on level
const generateExercises = (level) => {
  const exerciseSets = {
    Beginner: [
      { question: "I ___ a student.", type: "multiple-choice", options: ["am", "is", "are", "be"], correctAnswer: "am", explanation: "Với chủ ngữ 'I', ta dùng 'am'.", difficulty: "easy", points: 5 },
      { question: "She ___ to school every day.", type: "multiple-choice", options: ["go", "goes", "going", "gone"], correctAnswer: "goes", explanation: "Với he/she/it, động từ thêm -s/es.", difficulty: "easy", points: 5 },
      { question: "What is the plural of 'book'?", type: "multiple-choice", options: ["books", "bookes", "book", "bookies"], correctAnswer: "books", explanation: "Danh từ số nhiều thường thêm -s.", difficulty: "easy", points: 5 },
      { question: "I have ___ apple.", type: "multiple-choice", options: ["a", "an", "the", "no article"], correctAnswer: "an", explanation: "'Apple' bắt đầu bằng nguyên âm nên dùng 'an'.", difficulty: "easy", points: 5 },
      { question: "They ___ happy.", type: "multiple-choice", options: ["am", "is", "are", "be"], correctAnswer: "are", explanation: "Với 'they', ta dùng 'are'.", difficulty: "easy", points: 5 },
      { question: "My name ___ John.", type: "multiple-choice", options: ["am", "is", "are", "be"], correctAnswer: "is", explanation: "'Name' là danh từ số ít nên dùng 'is'.", difficulty: "easy", points: 5 },
      { question: "I ___ English every day.", type: "multiple-choice", options: ["study", "studies", "studying", "studied"], correctAnswer: "study", explanation: "Với 'I', dùng động từ nguyên mẫu.", difficulty: "easy", points: 5 },
      { question: "This is ___ book.", type: "multiple-choice", options: ["a", "an", "the", "no article"], correctAnswer: "a", explanation: "'Book' bắt đầu bằng phụ âm nên dùng 'a'.", difficulty: "easy", points: 5 },
      { question: "We ___ students.", type: "multiple-choice", options: ["am", "is", "are", "be"], correctAnswer: "are", explanation: "Với 'we', ta dùng 'are'.", difficulty: "easy", points: 5 },
      { question: "He ___ a teacher.", type: "multiple-choice", options: ["am", "is", "are", "be"], correctAnswer: "is", explanation: "Với 'he', ta dùng 'is'.", difficulty: "easy", points: 5 },
      { question: "I have two ___.", type: "multiple-choice", options: ["cat", "cats", "cates", "caties"], correctAnswer: "cats", explanation: "Danh từ số nhiều thêm -s.", difficulty: "easy", points: 5 },
      { question: "___ you happy?", type: "multiple-choice", options: ["Am", "Is", "Are", "Be"], correctAnswer: "Are", explanation: "Câu hỏi với 'you' dùng 'Are'.", difficulty: "easy", points: 5 },
      { question: "She ___ my friend.", type: "multiple-choice", options: ["am", "is", "are", "be"], correctAnswer: "is", explanation: "Với 'she', ta dùng 'is'.", difficulty: "easy", points: 5 },
      { question: "I ___ water every day.", type: "multiple-choice", options: ["drink", "drinks", "drinking", "drank"], correctAnswer: "drink", explanation: "Với 'I', dùng động từ nguyên mẫu.", difficulty: "easy", points: 5 },
      { question: "This is ___ orange.", type: "multiple-choice", options: ["a", "an", "the", "no article"], correctAnswer: "an", explanation: "'Orange' bắt đầu bằng nguyên âm nên dùng 'an'.", difficulty: "easy", points: 5 },
      { question: "They ___ football.", type: "multiple-choice", options: ["play", "plays", "playing", "played"], correctAnswer: "play", explanation: "Với 'they', dùng động từ nguyên mẫu.", difficulty: "easy", points: 5 },
      { question: "It ___ a dog.", type: "multiple-choice", options: ["am", "is", "are", "be"], correctAnswer: "is", explanation: "Với 'it', ta dùng 'is'.", difficulty: "easy", points: 5 },
      { question: "I have ___ car.", type: "multiple-choice", options: ["a", "an", "the", "no article"], correctAnswer: "a", explanation: "'Car' bắt đầu bằng phụ âm nên dùng 'a'.", difficulty: "easy", points: 5 },
      { question: "You ___ nice.", type: "multiple-choice", options: ["am", "is", "are", "be"], correctAnswer: "are", explanation: "Với 'you', ta dùng 'are'.", difficulty: "easy", points: 5 },
      { question: "He ___ books.", type: "multiple-choice", options: ["read", "reads", "reading", "readed"], correctAnswer: "reads", explanation: "Với he/she/it, động từ thêm -s.", difficulty: "easy", points: 5 }
    ],
    Intermediate: [
      { question: "I ___ here for 5 years.", type: "multiple-choice", options: ["live", "lived", "have lived", "am living"], correctAnswer: "have lived", explanation: "Present Perfect với 'for' diễn tả thời gian kéo dài đến hiện tại.", difficulty: "medium", points: 10 },
      { question: "She ___ when I called.", type: "multiple-choice", options: ["cooks", "cooked", "was cooking", "has cooked"], correctAnswer: "was cooking", explanation: "Past Continuous diễn tả hành động đang xảy ra khi có hành động khác xen vào.", difficulty: "medium", points: 10 },
      { question: "You ___ study harder.", type: "multiple-choice", options: ["can", "should", "must", "may"], correctAnswer: "should", explanation: "'Should' dùng để đưa ra lời khuyên.", difficulty: "medium", points: 10 },
      { question: "If it ___, I will stay home.", type: "multiple-choice", options: ["rain", "rains", "will rain", "rained"], correctAnswer: "rains", explanation: "Câu điều kiện loại 1: If + present simple, will + V.", difficulty: "medium", points: 10 },
      { question: "The book ___ by Shakespeare.", type: "multiple-choice", options: ["wrote", "was written", "is writing", "has written"], correctAnswer: "was written", explanation: "Câu bị động: be + V3/ed.", difficulty: "medium", points: 10 },
      { question: "I ___ my homework already.", type: "multiple-choice", options: ["finish", "finished", "have finished", "am finishing"], correctAnswer: "have finished", explanation: "Present Perfect với 'already' diễn tả hành động đã hoàn thành.", difficulty: "medium", points: 10 },
      { question: "They ___ TV when the power went out.", type: "multiple-choice", options: ["watch", "watched", "were watching", "have watched"], correctAnswer: "were watching", explanation: "Past Continuous với hành động bị gián đoạn.", difficulty: "medium", points: 10 },
      { question: "He ___ swim very well.", type: "multiple-choice", options: ["can", "cans", "could", "is can"], correctAnswer: "can", explanation: "Modal verb 'can' diễn tả khả năng.", difficulty: "medium", points: 10 },
      { question: "If you ___ hard, you will succeed.", type: "multiple-choice", options: ["work", "works", "will work", "worked"], correctAnswer: "work", explanation: "Câu điều kiện loại 1: If + present simple.", difficulty: "medium", points: 10 },
      { question: "English ___ all over the world.", type: "multiple-choice", options: ["speaks", "is spoken", "spoke", "has spoken"], correctAnswer: "is spoken", explanation: "Câu bị động ở hiện tại: is/are + V3/ed.", difficulty: "medium", points: 10 },
      { question: "She ___ in London since 2010.", type: "multiple-choice", options: ["lives", "lived", "has lived", "is living"], correctAnswer: "has lived", explanation: "Present Perfect với 'since' + mốc thời gian.", difficulty: "medium", points: 10 },
      { question: "I ___ dinner when you arrived.", type: "multiple-choice", options: ["cook", "cooked", "was cooking", "have cooked"], correctAnswer: "was cooking", explanation: "Past Continuous với hành động đang diễn ra.", difficulty: "medium", points: 10 },
      { question: "You ___ be quiet in the library.", type: "multiple-choice", options: ["can", "should", "must", "may"], correctAnswer: "must", explanation: "'Must' diễn tả sự bắt buộc.", difficulty: "medium", points: 10 },
      { question: "If she ___ time, she will help you.", type: "multiple-choice", options: ["have", "has", "will have", "had"], correctAnswer: "has", explanation: "Câu điều kiện loại 1 với chủ ngữ số ít.", difficulty: "medium", points: 10 },
      { question: "The letter ___ yesterday.", type: "multiple-choice", options: ["sent", "was sent", "is sent", "has sent"], correctAnswer: "was sent", explanation: "Câu bị động ở quá khứ: was/were + V3/ed.", difficulty: "medium", points: 10 },
      { question: "We ___ each other for 10 years.", type: "multiple-choice", options: ["know", "knew", "have known", "are knowing"], correctAnswer: "have known", explanation: "Present Perfect với 'for' + khoảng thời gian.", difficulty: "medium", points: 10 },
      { question: "He ___ a book when I saw him.", type: "multiple-choice", options: ["reads", "read", "was reading", "has read"], correctAnswer: "was reading", explanation: "Past Continuous với thời điểm cụ thể trong quá khứ.", difficulty: "medium", points: 10 },
      { question: "I ___ speak three languages.", type: "multiple-choice", options: ["can", "cans", "could", "am can"], correctAnswer: "can", explanation: "Modal verb 'can' không chia theo ngôi.", difficulty: "medium", points: 10 },
      { question: "If they ___ early, they will catch the train.", type: "multiple-choice", options: ["leave", "leaves", "will leave", "left"], correctAnswer: "leave", explanation: "Câu điều kiện loại 1 với chủ ngữ số nhiều.", difficulty: "medium", points: 10 },
      { question: "This house ___ in 1990.", type: "multiple-choice", options: ["built", "was built", "is built", "has built"], correctAnswer: "was built", explanation: "Câu bị động ở quá khứ với năm cụ thể.", difficulty: "medium", points: 10 }
    ],
    Advanced: [
      { question: "I ___ here for 10 years by next month.", type: "multiple-choice", options: ["work", "have worked", "will have worked", "had worked"], correctAnswer: "will have worked", explanation: "Future Perfect diễn tả hành động sẽ hoàn thành trước một thời điểm trong tương lai.", difficulty: "hard", points: 15 },
      { question: "I suggest that he ___ harder.", type: "multiple-choice", options: ["study", "studies", "studied", "studying"], correctAnswer: "study", explanation: "Subjunctive mood: suggest + that + S + V(nguyên mẫu).", difficulty: "hard", points: 15 },
      { question: "Never ___ such beauty.", type: "multiple-choice", options: ["I have seen", "have I seen", "I saw", "did I saw"], correctAnswer: "have I seen", explanation: "Đảo ngữ với 'never': Never + auxiliary + subject + verb.", difficulty: "hard", points: 15 },
      { question: "It was John ___ broke the window.", type: "multiple-choice", options: ["who", "which", "that", "whom"], correctAnswer: "who", explanation: "Cleft sentence nhấn mạnh chủ ngữ: It + be + focus + who/that.", difficulty: "hard", points: 15 },
      { question: "___ his work, he went home.", type: "multiple-choice", options: ["Finish", "Finished", "Having finished", "To finish"], correctAnswer: "Having finished", explanation: "Participle clause với hành động hoàn thành: Having + V3.", difficulty: "hard", points: 15 },
      { question: "I ___ for three hours when you called.", type: "multiple-choice", options: ["study", "studied", "have been studying", "had been studying"], correctAnswer: "had been studying", explanation: "Past Perfect Continuous diễn tả hành động kéo dài trước một thời điểm trong quá khứ.", difficulty: "hard", points: 15 },
      { question: "It's important that she ___ on time.", type: "multiple-choice", options: ["be", "is", "was", "being"], correctAnswer: "be", explanation: "Subjunctive mood: It's important that + S + V(nguyên mẫu).", difficulty: "hard", points: 15 },
      { question: "Only then ___ the truth.", type: "multiple-choice", options: ["I realized", "did I realize", "I realize", "do I realize"], correctAnswer: "did I realize", explanation: "Đảo ngữ với 'only then': Only then + auxiliary + subject + verb.", difficulty: "hard", points: 15 },
      { question: "What I need ___ a good rest.", type: "multiple-choice", options: ["is", "are", "was", "were"], correctAnswer: "is", explanation: "Cleft sentence: What + S + V + be (số ít với 'what').", difficulty: "hard", points: 15 },
      { question: "The man ___ there is my teacher.", type: "multiple-choice", options: ["stand", "stands", "standing", "stood"], correctAnswer: "standing", explanation: "Participle clause rút gọn mệnh đề quan hệ: V-ing (chủ động).", difficulty: "hard", points: 15 },
      { question: "She ___ for the company for 5 years before she quit.", type: "multiple-choice", options: ["works", "worked", "has worked", "had been working"], correctAnswer: "had been working", explanation: "Past Perfect Continuous với hành động kéo dài trước hành động khác trong quá khứ.", difficulty: "hard", points: 15 },
      { question: "I recommend that he ___ a doctor.", type: "multiple-choice", options: ["see", "sees", "saw", "seeing"], correctAnswer: "see", explanation: "Subjunctive mood: recommend + that + S + V(nguyên mẫu).", difficulty: "hard", points: 15 },
      { question: "Rarely ___ so much effort.", type: "multiple-choice", options: ["I have seen", "have I seen", "I saw", "did I saw"], correctAnswer: "have I seen", explanation: "Đảo ngữ với 'rarely': Rarely + auxiliary + subject + verb.", difficulty: "hard", points: 15 },
      { question: "It is English ___ I want to learn.", type: "multiple-choice", options: ["who", "which", "that", "what"], correctAnswer: "that", explanation: "Cleft sentence nhấn mạnh tân ngữ: It + be + focus + that.", difficulty: "hard", points: 15 },
      { question: "___ by many people, the book became famous.", type: "multiple-choice", options: ["Read", "Reading", "To read", "Reads"], correctAnswer: "Read", explanation: "Participle clause bị động: V3/ed.", difficulty: "hard", points: 15 },
      { question: "By 2030, I ___ my PhD.", type: "multiple-choice", options: ["complete", "will complete", "will have completed", "have completed"], correctAnswer: "will have completed", explanation: "Future Perfect với mốc thời gian trong tương lai.", difficulty: "hard", points: 15 },
      { question: "The teacher insists that every student ___ homework.", type: "multiple-choice", options: ["do", "does", "did", "doing"], correctAnswer: "do", explanation: "Subjunctive mood: insist + that + S + V(nguyên mẫu).", difficulty: "hard", points: 15 },
      { question: "Under no circumstances ___ this rule.", type: "multiple-choice", options: ["you should break", "should you break", "you break", "do you break"], correctAnswer: "should you break", explanation: "Đảo ngữ với 'under no circumstances': phrase + auxiliary + subject + verb.", difficulty: "hard", points: 15 },
      { question: "What matters most ___ your attitude.", type: "multiple-choice", options: ["is", "are", "was", "were"], correctAnswer: "is", explanation: "Cleft sentence với 'what' làm chủ ngữ số ít.", difficulty: "hard", points: 15 },
      { question: "___ the exam, she celebrated with friends.", type: "multiple-choice", options: ["Pass", "Passed", "Having passed", "To pass"], correctAnswer: "Having passed", explanation: "Participle clause hoàn thành: Having + V3.", difficulty: "hard", points: 15 }
    ]
  };
  
  return exerciseSets[level] || exerciseSets.Beginner;
};

const seedCoursesWithContent = async () => {
  try {
    console.log('🔌 Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "EnglishAI"
    });
    console.log('✅ Connected to MongoDB');

    // Get all courses
    const courses = await Course.find({});
    console.log(`📚 Found ${courses.length} courses`);

    let updatedCount = 0;

    for (const course of courses) {
      // Skip if course already has content
      if (course.vocabularies && course.vocabularies.length > 0) {
        console.log(`⏭️  Skipping "${course.name}" - already has content`);
        continue;
      }

      console.log(`\n📝 Adding content to: ${course.name} (${course.level})`);

      // Generate content based on level
      const vocabularies = generateVocabulary(course.level, 20);
      const grammars = generateGrammar(course.level);
      const exercises = generateExercises(course.level);

      // Update course with embedded data
      course.vocabularies = vocabularies;
      course.grammars = grammars;
      course.exercises = exercises;

      await course.save();
      
      console.log(`   ✅ Added: 20 vocabularies, 5 grammars, 20 exercises`);
      updatedCount++;
    }

    console.log(`\n✅ Successfully updated ${updatedCount} courses with content!`);
    console.log(`⏭️  Skipped ${courses.length - updatedCount} courses (already have content)`);

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding courses:', error);
    process.exit(1);
  }
};

// Run the seed function
seedCoursesWithContent();
