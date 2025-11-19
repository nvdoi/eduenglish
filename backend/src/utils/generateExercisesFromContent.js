import mongoose from 'mongoose';
import Course from '../models/Course.js';
import dotenv from 'dotenv';

dotenv.config();

// Generate vocabulary exercises from course vocabularies
const generateVocabExercises = (vocabularies, level) => {
  const exercises = [];
  const points = level === 'Beginner' ? 5 : level === 'Intermediate' ? 10 : 15;
  const difficulty = level === 'Beginner' ? 'easy' : level === 'Intermediate' ? 'medium' : 'hard';
  
  // Take first 10 vocabularies for exercises
  const selectedVocabs = vocabularies.slice(0, 10);
  
  selectedVocabs.forEach((vocab, index) => {
    // Create a meaning question
    const wrongMeanings = vocabularies
      .filter(v => v.word !== vocab.word)
      .map(v => v.meaning)
      .sort(() => 0.5 - Math.random())
      .slice(0, 3);
    
    exercises.push({
      question: `What does "${vocab.word}" mean?`,
      type: "multiple-choice",
      options: [vocab.meaning, ...wrongMeanings].sort(() => 0.5 - Math.random()),
      correctAnswer: vocab.meaning,
      explanation: `"${vocab.word}" nghĩa là "${vocab.meaning}". Ví dụ: ${vocab.example}`,
      difficulty,
      points
    });
    
    // Create a fill-in-the-blank question using the example
    if (vocab.example && vocab.example.includes(vocab.word)) {
      const blankExample = vocab.example.replace(new RegExp(vocab.word, 'i'), '___');
      const wrongWords = vocabularies
        .filter(v => v.word !== vocab.word && v.partOfSpeech === vocab.partOfSpeech)
        .map(v => v.word)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);
      
      if (wrongWords.length === 3) {
        exercises.push({
          question: `Fill in the blank: ${blankExample}`,
          type: "multiple-choice",
          options: [vocab.word, ...wrongWords].sort(() => 0.5 - Math.random()),
          correctAnswer: vocab.word,
          explanation: `Đáp án đúng là "${vocab.word}" (${vocab.meaning}). Câu đầy đủ: ${vocab.example}`,
          difficulty,
          points
        });
      }
    }
  });
  
  return exercises.slice(0, 10); // Return only 10 vocab exercises
};

// Generate grammar exercises from course grammars
const generateGrammarExercises = (grammars, vocabularies, level) => {
  const exercises = [];
  const points = level === 'Beginner' ? 5 : level === 'Intermediate' ? 10 : 15;
  const difficulty = level === 'Beginner' ? 'easy' : level === 'Intermediate' ? 'medium' : 'hard';
  
  // Generate 4 questions per grammar topic (5 topics x 4 = 20 questions)
  grammars.forEach((grammar) => {
    const grammarExercises = [];
    
    // Skip if grammar or topic is undefined
    if (!grammar || !grammar.topic) {
      return;
    }
    
    // Create grammar-based questions based on the topic
    if (grammar.topic === "Present Simple" || grammar.topic === "Thì hiện tại đơn") {
      grammarExercises.push(
        { question: `She ___ to school every day.`, options: ["go", "goes", "going", "gone"], correctAnswer: "goes", explanation: `${grammar.topic}: Với chủ ngữ số ít (he/she/it), động từ thêm -s/es.` },
        { question: `They ___ football on weekends.`, options: ["play", "plays", "playing", "played"], correctAnswer: "play", explanation: `${grammar.topic}: Với chủ ngữ số nhiều, dùng động từ nguyên mẫu.` },
        { question: `He ___ English every day.`, options: ["study", "studies", "studying", "studied"], correctAnswer: "studies", explanation: `${grammar.topic}: Với he/she/it, động từ thêm -s/es.` },
        { question: `I ___ coffee in the morning.`, options: ["drink", "drinks", "drinking", "drank"], correctAnswer: "drink", explanation: `${grammar.topic}: Với I/you/we/they, dùng động từ nguyên mẫu.` }
      );
    } else if (grammar.topic === "To Be" || grammar.topic === "Động từ to be") {
      grammarExercises.push(
        { question: `I ___ a student.`, options: ["am", "is", "are", "be"], correctAnswer: "am", explanation: `${grammar.topic}: Với "I", ta dùng "am".` },
        { question: `She ___ happy today.`, options: ["am", "is", "are", "be"], correctAnswer: "is", explanation: `${grammar.topic}: Với he/she/it, ta dùng "is".` },
        { question: `They ___ my friends.`, options: ["am", "is", "are", "be"], correctAnswer: "are", explanation: `${grammar.topic}: Với you/we/they, ta dùng "are".` },
        { question: `You ___ very kind.`, options: ["am", "is", "are", "be"], correctAnswer: "are", explanation: `${grammar.topic}: Với "you", ta dùng "are".` }
      );
    } else if (grammar.topic === "Articles" || grammar.topic === "Mạo từ") {
      grammarExercises.push(
        { question: `I have ___ apple.`, options: ["a", "an", "the", "no article"], correctAnswer: "an", explanation: `${grammar.topic}: Dùng "an" trước nguyên âm.` },
        { question: `This is ___ book.`, options: ["a", "an", "the", "no article"], correctAnswer: "a", explanation: `${grammar.topic}: Dùng "a" trước phụ âm.` },
        { question: `___ sun is bright.`, options: ["A", "An", "The", "No article"], correctAnswer: "The", explanation: `${grammar.topic}: Dùng "the" với danh từ xác định duy nhất.` },
        { question: `I need ___ umbrella.`, options: ["a", "an", "the", "no article"], correctAnswer: "an", explanation: `${grammar.topic}: Dùng "an" trước nguyên âm.` }
      );
    } else if (grammar.topic === "Plural Nouns" || grammar.topic === "Danh từ số nhiều") {
      grammarExercises.push(
        { question: `I have two ___.`, options: ["cat", "cats", "cates", "caties"], correctAnswer: "cats", explanation: `${grammar.topic}: Danh từ số nhiều thường thêm -s.` },
        { question: `There are many ___ in the library.`, options: ["book", "books", "bookes", "bookies"], correctAnswer: "books", explanation: `${grammar.topic}: Danh từ số nhiều thêm -s.` },
        { question: `She has three ___.`, options: ["child", "childs", "children", "childrens"], correctAnswer: "children", explanation: `${grammar.topic}: "Child" có dạng số nhiều bất quy tắc là "children".` },
        { question: `I see five ___.`, options: ["dog", "dogs", "doges", "dogies"], correctAnswer: "dogs", explanation: `${grammar.topic}: Danh từ số nhiều thêm -s.` }
      );
    } else if (grammar.topic === "Personal Pronouns" || grammar.topic === "Đại từ nhân xưng") {
      grammarExercises.push(
        { question: `___ am a teacher.`, options: ["I", "You", "He", "They"], correctAnswer: "I", explanation: `${grammar.topic}: "I" là đại từ ngôi thứ nhất số ít.` },
        { question: `___ is my friend.`, options: ["I", "You", "He", "They"], correctAnswer: "He", explanation: `${grammar.topic}: "He" dùng cho nam giới số ít.` },
        { question: `___ are students.`, options: ["I", "He", "She", "They"], correctAnswer: "They", explanation: `${grammar.topic}: "They" dùng cho số nhiều.` },
        { question: `___ is very kind.`, options: ["I", "You", "She", "They"], correctAnswer: "She", explanation: `${grammar.topic}: "She" dùng cho nữ giới số ít.` }
      );
    } else if (grammar.topic === "Present Perfect" || grammar.topic === "Thì hiện tại hoàn thành") {
      grammarExercises.push(
        { question: `I ___ here for 5 years.`, options: ["live", "lived", "have lived", "am living"], correctAnswer: "have lived", explanation: `${grammar.topic}: Dùng have/has + V3 với "for" + khoảng thời gian.` },
        { question: `She ___ in London since 2010.`, options: ["lives", "lived", "has lived", "is living"], correctAnswer: "has lived", explanation: `${grammar.topic}: Dùng have/has + V3 với "since" + mốc thời gian.` },
        { question: `They ___ each other for 10 years.`, options: ["know", "knew", "have known", "are knowing"], correctAnswer: "have known", explanation: `${grammar.topic}: Present Perfect diễn tả hành động bắt đầu trong quá khứ và kéo dài đến hiện tại.` },
        { question: `I ___ my homework already.`, options: ["finish", "finished", "have finished", "am finishing"], correctAnswer: "have finished", explanation: `${grammar.topic}: Dùng Present Perfect với "already".` }
      );
    } else if (grammar.topic === "Past Continuous" || grammar.topic === "Thì quá khứ tiếp diễn") {
      grammarExercises.push(
        { question: `She ___ when I called.`, options: ["cooks", "cooked", "was cooking", "has cooked"], correctAnswer: "was cooking", explanation: `${grammar.topic}: Dùng was/were + V-ing cho hành động đang xảy ra trong quá khứ.` },
        { question: `They ___ TV when the power went out.`, options: ["watch", "watched", "were watching", "have watched"], correctAnswer: "were watching", explanation: `${grammar.topic}: Past Continuous với hành động bị gián đoạn.` },
        { question: `I ___ dinner when you arrived.`, options: ["cook", "cooked", "was cooking", "have cooked"], correctAnswer: "was cooking", explanation: `${grammar.topic}: Hành động đang diễn ra tại một thời điểm trong quá khứ.` },
        { question: `He ___ a book when I saw him.`, options: ["reads", "read", "was reading", "has read"], correctAnswer: "was reading", explanation: `${grammar.topic}: Was/were + V-ing diễn tả hành động đang xảy ra.` }
      );
    } else if (grammar.topic === "Modal Verbs" || grammar.topic === "Động từ khuyết thiếu") {
      grammarExercises.push(
        { question: `You ___ study harder. (advice)`, options: ["can", "should", "must", "may"], correctAnswer: "should", explanation: `${grammar.topic}: "Should" dùng để đưa ra lời khuyên.` },
        { question: `He ___ swim very well. (ability)`, options: ["can", "should", "must", "may"], correctAnswer: "can", explanation: `${grammar.topic}: "Can" diễn tả khả năng.` },
        { question: `You ___ be quiet in the library. (obligation)`, options: ["can", "should", "must", "may"], correctAnswer: "must", explanation: `${grammar.topic}: "Must" diễn tả sự bắt buộc.` },
        { question: `I ___ speak three languages. (ability)`, options: ["can", "should", "must", "may"], correctAnswer: "can", explanation: `${grammar.topic}: "Can" diễn tả khả năng làm được việc gì.` }
      );
    } else if (grammar.topic === "Conditional Type 1" || grammar.topic === "Câu điều kiện loại 1") {
      grammarExercises.push(
        { question: `If it ___, I will stay home.`, options: ["rain", "rains", "will rain", "rained"], correctAnswer: "rains", explanation: `${grammar.topic}: If + present simple, will + V.` },
        { question: `If you ___ hard, you will succeed.`, options: ["work", "works", "will work", "worked"], correctAnswer: "work", explanation: `${grammar.topic}: Mệnh đề "if" dùng thì hiện tại đơn.` },
        { question: `If she ___ time, she will help you.`, options: ["have", "has", "will have", "had"], correctAnswer: "has", explanation: `${grammar.topic}: If + present simple với chủ ngữ số ít.` },
        { question: `If they ___ early, they will catch the train.`, options: ["leave", "leaves", "will leave", "left"], correctAnswer: "leave", explanation: `${grammar.topic}: If + present simple với chủ ngữ số nhiều.` }
      );
    } else if (grammar.topic === "Passive Voice" || grammar.topic === "Câu bị động") {
      grammarExercises.push(
        { question: `The book ___ by Shakespeare.`, options: ["wrote", "was written", "is writing", "has written"], correctAnswer: "was written", explanation: `${grammar.topic}: Câu bị động quá khứ: was/were + V3.` },
        { question: `English ___ all over the world.`, options: ["speaks", "is spoken", "spoke", "has spoken"], correctAnswer: "is spoken", explanation: `${grammar.topic}: Câu bị động hiện tại: is/are + V3.` },
        { question: `The letter ___ yesterday.`, options: ["sent", "was sent", "is sent", "has sent"], correctAnswer: "was sent", explanation: `${grammar.topic}: Câu bị động quá khứ với thời gian cụ thể.` },
        { question: `This house ___ in 1990.`, options: ["built", "was built", "is built", "has built"], correctAnswer: "was built", explanation: `${grammar.topic}: Câu bị động quá khứ: was/were + V3.` }
      );
    } else if (grammar.topic === "Perfect Continuous" || (grammar.topic && grammar.topic.includes("Perfect Continuous"))) {
      grammarExercises.push(
        { question: `I ___ for three hours when you called.`, options: ["study", "studied", "have been studying", "had been studying"], correctAnswer: "had been studying", explanation: `${grammar.topic}: Past Perfect Continuous diễn tả hành động kéo dài trước một thời điểm trong quá khứ.` },
        { question: `She ___ for the company for 5 years before she quit.`, options: ["works", "worked", "has worked", "had been working"], correctAnswer: "had been working", explanation: `${grammar.topic}: Hành động kéo dài trước hành động khác trong quá khứ.` },
        { question: `I ___ here for 10 years by next month.`, options: ["work", "have worked", "will have worked", "had worked"], correctAnswer: "will have worked", explanation: `${grammar.topic}: Future Perfect diễn tả hành động sẽ hoàn thành trước một thời điểm tương lai.` },
        { question: `By 2030, I ___ my PhD.`, options: ["complete", "will complete", "will have completed", "have completed"], correctAnswer: "will have completed", explanation: `${grammar.topic}: Future Perfect với mốc thời gian trong tương lai.` }
      );
    } else if (grammar.topic === "Subjunctive Mood" || grammar.topic === "Thức giả định") {
      grammarExercises.push(
        { question: `I suggest that he ___ harder.`, options: ["study", "studies", "studied", "studying"], correctAnswer: "study", explanation: `${grammar.topic}: Sau suggest + that, dùng động từ nguyên mẫu.` },
        { question: `It's important that she ___ on time.`, options: ["be", "is", "was", "being"], correctAnswer: "be", explanation: `${grammar.topic}: It's important that + S + V(nguyên mẫu).` },
        { question: `I recommend that he ___ a doctor.`, options: ["see", "sees", "saw", "seeing"], correctAnswer: "see", explanation: `${grammar.topic}: Sau recommend + that, dùng động từ nguyên mẫu.` },
        { question: `The teacher insists that every student ___ homework.`, options: ["do", "does", "did", "doing"], correctAnswer: "do", explanation: `${grammar.topic}: Sau insist + that, dùng động từ nguyên mẫu.` }
      );
    } else if (grammar.topic === "Inversion" || grammar.topic === "Đảo ngữ") {
      grammarExercises.push(
        { question: `Never ___ such beauty.`, options: ["I have seen", "have I seen", "I saw", "did I saw"], correctAnswer: "have I seen", explanation: `${grammar.topic}: Đảo ngữ với "never": Never + auxiliary + subject + verb.` },
        { question: `Rarely ___ so much effort.`, options: ["I have seen", "have I seen", "I saw", "did I saw"], correctAnswer: "have I seen", explanation: `${grammar.topic}: Đảo ngữ với "rarely": Rarely + auxiliary + subject + verb.` },
        { question: `Only then ___ the truth.`, options: ["I realized", "did I realize", "I realize", "do I realize"], correctAnswer: "did I realize", explanation: `${grammar.topic}: Đảo ngữ với "only then": Only then + auxiliary + subject + verb.` },
        { question: `Under no circumstances ___ this rule.`, options: ["you should break", "should you break", "you break", "do you break"], correctAnswer: "should you break", explanation: `${grammar.topic}: Đảo ngữ với cụm phủ định ở đầu câu.` }
      );
    } else if (grammar.topic === "Cleft Sentences" || grammar.topic === "Câu chẻ") {
      grammarExercises.push(
        { question: `It was John ___ broke the window.`, options: ["who", "which", "that", "whom"], correctAnswer: "who", explanation: `${grammar.topic}: Cleft sentence nhấn mạnh chủ ngữ: It + be + focus + who/that.` },
        { question: `What I need ___ a good rest.`, options: ["is", "are", "was", "were"], correctAnswer: "is", explanation: `${grammar.topic}: What + S + V + be (số ít với 'what').` },
        { question: `It is English ___ I want to learn.`, options: ["who", "which", "that", "what"], correctAnswer: "that", explanation: `${grammar.topic}: Cleft sentence nhấn mạnh tân ngữ: It + be + focus + that.` },
        { question: `What matters most ___ your attitude.`, options: ["is", "are", "was", "were"], correctAnswer: "is", explanation: `${grammar.topic}: Cleft sentence với 'what' làm chủ ngữ số ít.` }
      );
    } else if (grammar.topic === "Participle Clauses" || grammar.topic === "Mệnh đề phân từ") {
      grammarExercises.push(
        { question: `___ his work, he went home.`, options: ["Finish", "Finished", "Having finished", "To finish"], correctAnswer: "Having finished", explanation: `${grammar.topic}: Participle clause với hành động hoàn thành: Having + V3.` },
        { question: `The man ___ there is my teacher.`, options: ["stand", "stands", "standing", "stood"], correctAnswer: "standing", explanation: `${grammar.topic}: Participle clause rút gọn mệnh đề quan hệ: V-ing (chủ động).` },
        { question: `___ by many people, the book became famous.`, options: ["Read", "Reading", "To read", "Reads"], correctAnswer: "Read", explanation: `${grammar.topic}: Participle clause bị động: V3/ed.` },
        { question: `___ the exam, she celebrated with friends.`, options: ["Pass", "Passed", "Having passed", "To pass"], correctAnswer: "Having passed", explanation: `${grammar.topic}: Participle clause hoàn thành: Having + V3.` }
      );
    } else {
      // Generic grammar questions for other topics
      for (let i = 0; i < 4; i++) {
        grammarExercises.push({
          question: `Which sentence correctly uses ${grammar.topic}? (Question ${i + 1})`,
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctAnswer: "Option A",
          explanation: `${grammar.explanation || 'This demonstrates correct usage of ' + grammar.topic}`
        });
      }
    }
    
    // Add all 4 exercises for this grammar topic
    grammarExercises.forEach(ex => {
      exercises.push({
        question: ex.question,
        type: "multiple-choice",
        options: ex.options,
        correctAnswer: ex.correctAnswer,
        explanation: ex.explanation,
        difficulty,
        points
      });
    });
  });
  
  return exercises; // Return all grammar exercises (5 topics x 4 = 20 questions)
};

const generateExercisesFromContent = async () => {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: "EnglishAI"
    });
    console.log('Connected to MongoDB');

    const courses = await Course.find({});
    console.log(`Found ${courses.length} courses`);

    let updatedCount = 0;
    let skippedCount = 0;

    for (const course of courses) {
      // Check if course has vocabularies and grammars
      if (!course.vocabularies || course.vocabularies.length === 0) {
        console.log(`Skipping "${course.name}" - no vocabularies`);
        skippedCount++;
        continue;
      }

      if (!course.grammars || course.grammars.length === 0) {
        console.log(`Skipping "${course.name}" - no grammars`);
        skippedCount++;
        continue;
      }

      console.log(`\nGenerating exercises for: ${course.name} (${course.level})`);

      // Generate exercises based on course content
      // 5 grammars x 4 questions = 20 grammar exercises
      const grammarExercises = generateGrammarExercises(course.grammars, course.vocabularies, course.level);

      // Use only grammar exercises (20 questions)
      const allExercises = grammarExercises;

      // Update course with new exercises
      course.exercises = allExercises;
      await course.save();

      console.log(`Generated: ${allExercises.length} exercises (all grammar-based)`);
      updatedCount++;
    }

    console.log(`\nSuccessfully generated exercises for ${updatedCount} courses!`);
    console.log(`Skipped ${skippedCount} courses (missing content)`);

    process.exit(0);
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
};

// generateExercisesFromContent();
