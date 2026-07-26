const pool = require('../config/db');
const fs = require('fs');
const path = require('path');

// Lazy-load Gemini AI only when available
let genai = null;
try {
  const { GoogleGenerativeAI } = require('@google/generative-ai');
  if (process.env.GEMINI_API_KEY) {
    genai = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  }
} catch (e) {
  console.warn('[QUIZ] @google/generative-ai not available:', e.message);
}

// Uploads directory: use /tmp on Vercel, local uploads otherwise
const uploadsDir = process.env.VERCEL
  ? '/tmp/uploads'
  : path.join(__dirname, '..', 'uploads');

// ─── Extract text from PDF ────────────────────────────────────────────────────
const extractTextFromPDF = async (dataBuffer) => {
  try {
    const PDFParse = require('pdf-parse');
    const pdfData = await PDFParse(dataBuffer);
    const text = pdfData.text || '';
    console.log(`[PDF] Extracted ${text.length} chars`);
    return { text };
  } catch (err) {
    console.error('[PDF] Error:', err.message);
    return { text: '' };
  }
};

// ─── Create Quiz ──────────────────────────────────────────────────────────────
exports.createQuiz = async (req, res) => {
  try {
    const { book_id } = req.body;
    if (!book_id) return res.status(400).json({ success: false, message: 'book_id required' });

    const { rows: [quiz] } = await pool.query(
      'INSERT INTO quizzes (book_id, title, created_by, published) VALUES ($1, $2, $3, 0) RETURNING id',
      [book_id, '', req.user.id]
    );

    return res.status(201).json({ success: true, quizId: quiz.id });
  } catch (error) {
    console.error('Create quiz error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Generate Quiz from Book PDF ─────────────────────────────────────────────
exports.generateQuiz = async (req, res) => {
  try {
    const { book_id } = req.params;
    console.log(`[QUIZ GEN] Starting for book_id: ${book_id}`);

    const { rows: books } = await pool.query('SELECT * FROM books WHERE id = $1', [book_id]);
    if (books.length === 0) {
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const book = books[0];

    // Attempt to read PDF from disk (works locally, /tmp on Vercel)
    let text = '';
    if (book.file_url) {
      const filePath = path.join(uploadsDir, path.basename(book.file_url));
      if (fs.existsSync(filePath)) {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await extractTextFromPDF(dataBuffer);
        text = (pdfData.text || '').slice(0, 20000);
      }
    }

    const questions = await generateQuestionsForBook(book, text);

    // Insert quiz
    const { rows: [quizRow] } = await pool.query(
      'INSERT INTO quizzes (book_id, title, created_by, published) VALUES ($1, $2, $3, 0) RETURNING id',
      [book_id, `كويز: ${book.title}`, req.user.id]
    );
    const quizId = quizRow.id;

    for (const q of questions) {
      await pool.query(
        'INSERT INTO quiz_questions (quiz_id, question, options_json, answer_index) VALUES ($1, $2, $3, $4)',
        [quizId, q.question || '', JSON.stringify(q.options || []), q.answerIndex ?? 0]
      );
    }

    return res.status(201).json({ success: true, quizId, questionsCount: questions.length });
  } catch (error) {
    console.error('Generate quiz error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ─── Add Question to Quiz ─────────────────────────────────────────────────────
exports.addQuestion = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const { question, options, answerIndex } = req.body;

    if (!question || !Array.isArray(options) || options.length !== 4 || answerIndex == null) {
      return res.status(400).json({ success: false, message: 'Invalid question format' });
    }

    await pool.query(
      'INSERT INTO quiz_questions (quiz_id, question, options_json, answer_index) VALUES ($1, $2, $3, $4)',
      [quiz_id, question, JSON.stringify(options), answerIndex]
    );

    return res.status(201).json({ success: true, message: 'Question added' });
  } catch (error) {
    console.error('Add question error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Update Question ──────────────────────────────────────────────────────────
exports.updateQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    const { question, options, answerIndex } = req.body;

    await pool.query(
      'UPDATE quiz_questions SET question = $1, options_json = $2, answer_index = $3 WHERE id = $4',
      [question, JSON.stringify(options), answerIndex, question_id]
    );

    return res.status(200).json({ success: true, message: 'Question updated' });
  } catch (error) {
    console.error('Update question error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Delete Question ──────────────────────────────────────────────────────────
exports.deleteQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    await pool.query('DELETE FROM quiz_questions WHERE id = $1', [question_id]);
    return res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Delete question error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Regenerate Quiz ──────────────────────────────────────────────────────────
exports.regenerateQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;

    const { rows: quizzes } = await pool.query('SELECT book_id FROM quizzes WHERE id = $1', [quiz_id]);
    if (quizzes.length === 0) return res.status(404).json({ success: false, message: 'Quiz not found' });

    const bookId = quizzes[0].book_id;
    const { rows: books } = await pool.query('SELECT * FROM books WHERE id = $1', [bookId]);
    if (books.length === 0) return res.status(404).json({ success: false, message: 'Book not found' });

    await pool.query('DELETE FROM quiz_questions WHERE quiz_id = $1', [quiz_id]);

    let text = '';
    const book = books[0];
    if (book.file_url) {
      const filePath = path.join(uploadsDir, path.basename(book.file_url));
      if (fs.existsSync(filePath)) {
        const dataBuffer = fs.readFileSync(filePath);
        const pdfData = await extractTextFromPDF(dataBuffer);
        text = (pdfData.text || '').slice(0, 20000);
      }
    }

    const newQuestions = await generateQuestionsForBook(book, text);
    for (const q of newQuestions) {
      await pool.query(
        'INSERT INTO quiz_questions (quiz_id, question, options_json, answer_index) VALUES ($1, $2, $3, $4)',
        [quiz_id, q.question || '', JSON.stringify(q.options || []), q.answerIndex ?? 0]
      );
    }

    return res.status(200).json({ success: true, questions: newQuestions });
  } catch (err) {
    console.error('Regenerate quiz error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── List Published Quizzes ───────────────────────────────────────────────────
exports.listQuizzes = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT q.id, q.title, q.book_id, b.title AS book_title
       FROM quizzes q
       LEFT JOIN books b ON q.book_id = b.id
       WHERE q.published = 1
       ORDER BY q.id DESC`
    );
    return res.status(200).json({ success: true, quizzes: rows });
  } catch (error) {
    console.error('List quizzes error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── List All Quizzes (Admin) ─────────────────────────────────────────────────
exports.listAllQuizzes = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT q.id, q.book_id, q.title, q.published, b.title AS book_title
       FROM quizzes q
       LEFT JOIN books b ON q.book_id = b.id
       ORDER BY q.id DESC`
    );
    return res.status(200).json({ success: true, quizzes: rows });
  } catch (error) {
    console.error('List all quizzes error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Get Quiz Details ─────────────────────────────────────────────────────────
exports.getQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;

    const { rows: quizzes } = await pool.query(
      'SELECT id, title FROM quizzes WHERE id = $1 AND published = 1',
      [quiz_id]
    );
    if (quizzes.length === 0) {
      return res.status(404).json({ success: false, message: 'Quiz not found or not published' });
    }

    const quiz = quizzes[0];
    const { rows: questions } = await pool.query(
      'SELECT id, question, options_json FROM quiz_questions WHERE quiz_id = $1',
      [quiz_id]
    );

    const cleanQuestions = questions.map(q => ({
      id: q.id,
      question: q.question,
      options: JSON.parse(q.options_json || '[]')
    }));

    return res.status(200).json({ success: true, quiz: { ...quiz, questions: cleanQuestions } });
  } catch (error) {
    console.error('Get quiz error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Publish Quiz ─────────────────────────────────────────────────────────────
exports.publishQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    await pool.query('UPDATE quizzes SET published = 1 WHERE id = $1', [quiz_id]);
    return res.status(200).json({ success: true, message: 'Quiz published' });
  } catch (error) {
    console.error('Publish quiz error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Delete Quiz ──────────────────────────────────────────────────────────────
exports.deleteQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    // ON DELETE CASCADE handles quiz_questions and quiz_results
    await pool.query('DELETE FROM quizzes WHERE id = $1', [quiz_id]);
    return res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Submit Quiz ──────────────────────────────────────────────────────────────
exports.submitQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array required' });
    }

    let score = 0;
    const totalQuestions = answers.length;

    for (const a of answers) {
      const { rows } = await pool.query(
        'SELECT answer_index FROM quiz_questions WHERE id = $1',
        [a.question_id]
      );
      if (rows.length && rows[0].answer_index === a.answerIndex) {
        score += 1;
      }
    }

    await pool.query(
      'INSERT INTO quiz_results (quiz_id, user_id, score) VALUES ($1, $2, $3)',
      [quiz_id, req.user.id, score]
    );

    // Compute rank
    const { rows: [higher] } = await pool.query(
      'SELECT COUNT(*) AS cnt FROM quiz_results WHERE quiz_id = $1 AND score > $2',
      [quiz_id, score]
    );
    const rank = parseInt(higher.cnt) + 1;

    let bonus = 0;
    if (rank === 1) bonus = 40;
    else if (rank === 2) bonus = 20;
    else if (rank === 3) bonus = 10;

    return res.status(200).json({ success: true, score, totalQuestions, rank, bonus });
  } catch (error) {
    console.error('Submit quiz error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ─── Leaderboard (per quiz) ───────────────────────────────────────────────────
exports.getLeaderboard = async (req, res) => {
  try {
    const { quiz_id } = req.params;

    const { rows } = await pool.query(
      `SELECT r.user_id, u.username, r.score, r.created_at
       FROM quiz_results r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.quiz_id = $1
       ORDER BY r.score DESC, r.created_at ASC
       LIMIT 50`,
      [quiz_id]
    );

    // We don't have total_questions per-row anymore, compute percentage from quiz size
    const { rows: qCount } = await pool.query(
      'SELECT COUNT(*) AS cnt FROM quiz_questions WHERE quiz_id = $1',
      [quiz_id]
    );
    const totalQ = parseInt(qCount[0].cnt) || 1;

    const leaderboard = rows.map(row => ({
      ...row,
      percentage: Math.round((row.score / totalQ) * 100)
    }));

    return res.status(200).json({ success: true, leaderboard });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// ─── Global Leaderboard ───────────────────────────────────────────────────────
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const { rows } = await pool.query(
      `SELECT u.id AS user_id, u.username,
              SUM(r.score) AS sum_score,
              SUM(r.score) AS total_score
       FROM quiz_results r
       LEFT JOIN users u ON r.user_id = u.id
       GROUP BY u.id, u.username
       ORDER BY total_score DESC
       LIMIT 50`
    );
    return res.status(200).json({ success: true, leaderboard: rows });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

// ─── Helper: Generate Questions for a Book ────────────────────────────────────
async function generateQuestionsForBook(book, text = '') {
  const randomSeed = Math.random().toString(36).substring(7) + Date.now();
  const mainTopic = book.category || 'الموضوع الرئيسي';
  const pubYear = book.published_year || 2020;
  const pageCount = book.pages || 300;

  let questions = [];

  // Try Gemini first
  if (genai && text.length > 50) {
    try {
      const prompt = `أنت خبير تربوي متميز تقوم بعمل 30 سؤالاً اختبارياً متقدماً عن كتاب.

📚 معلومات الكتاب:
- العنوان: "${book.title}"
- المؤلف: "${book.author}"
- الفئة: "${mainTopic}"

📖 محتوى الكتاب:
${text.substring(0, 6000)}

**متطلبات:**
1. اكتب 30 سؤالاً متعددة الخيارات (4 خيارات لكل سؤال)
2. كل سؤال يجب أن يكون مختلفاً تماماً (معرّف: ${randomSeed})
3. وزع الإجابات الصحيحة بالتساوي بين 0, 1, 2, 3
4. JSON فقط - بدون شرح!

القالب:
[
  {"question": "نص السؤال؟", "options": ["خ1", "خ2", "خ3", "خ4"], "answerIndex": 2},
  ...
]`;

      const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(prompt);
      const raw = result.response.text() || '';
      const jsonStart = raw.indexOf('[');
      const jsonEnd = raw.lastIndexOf(']') + 1;
      if (jsonStart !== -1 && jsonEnd > 0) {
        const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd));
        questions = parsed.filter(q =>
          q && q.question && Array.isArray(q.options) && q.options.length === 4 &&
          typeof q.answerIndex === 'number' && q.answerIndex >= 0 && q.answerIndex <= 3
        );
      }
    } catch (e) {
      console.warn('[QUIZ GEN] Gemini failed:', e.message);
    }
  }

  // Fallback questions if AI failed or insufficient
  if (questions.length < 30) {
    questions = generateSimpleFallback(book, mainTopic, pubYear, pageCount);
  }

  return questions.slice(0, 30);
}

function generateSimpleFallback(book, mainTopic, pubYear, pageCount) {
  return [
    { question: `ما هو عنوان هذا الكتاب؟`, options: [book.title, 'كتاب مشهور آخر', 'رواية بدون عنوان', 'قصة قديمة'], answerIndex: 0 },
    { question: `من هو كاتب "${book.title}"؟`, options: [book.author, 'مؤلف مختلف', 'شاعر معروف', 'كاتب مجهول'], answerIndex: 0 },
    { question: `في أي عام تم نشر هذا الكتاب؟`, options: [pubYear.toString(), (pubYear-5).toString(), (pubYear+3).toString(), 'قبل مئة سنة'], answerIndex: 0 },
    { question: `كم عدد صفحات "${book.title}" تقريباً؟`, options: [pageCount.toString(), (pageCount-100).toString(), (pageCount+150).toString(), 'أكثر من ألف صفحة'], answerIndex: 0 },
    { question: `ما هي الفئة الأساسية للكتاب؟`, options: [mainTopic, 'خيال علمي', 'سيرة ذاتية', 'شعر'], answerIndex: 0 },
    { question: `ما هو الهدف الرئيسي للمؤلف؟`, options: [`توصيل رسالة حول ${mainTopic}`, 'الحصول على جوائز فقط', 'جعل القراءة مملة', 'لا يوجد هدف'], answerIndex: 0 },
    { question: `هل هذا الكتاب مناسب للقراء المبتدئين؟`, options: ['نعم، مناسب جداً', 'لا، معقد جداً', 'فقط للمتخصصين', 'غير محدد'], answerIndex: 0 },
    { question: `ما رأيك في مستوى صعوبة الكتاب؟`, options: ['متوازن تماماً', 'صعب جداً', 'سهل جداً', 'غير متناسق'], answerIndex: 0 },
    { question: `من هي الفئة المستهدفة لهذا الكتاب؟`, options: ['الشباب والمثقفون', 'الأطفال الصغار', 'المتقاعدون فقط', 'لا فئة محددة'], answerIndex: 0 },
    { question: `هل يحتوي الكتاب على قصص واقعية؟`, options: ['يحتوي على كليهما', 'قصص خيالية فقط', 'مستندات فقط', 'غير واضح'], answerIndex: 0 },
    { question: `ما الذي يميز أسلوب ${book.author} الكتابي؟`, options: ['الوضوح والتشويق', 'التعقيد المتعمد', 'الإيجاز المخل', 'الركاكة اللغوية'], answerIndex: 0 },
    { question: `كيف يعالج الكتاب موضوع ${mainTopic}؟`, options: ['بأسلوب علمي منهجي', 'بشكل سطحي', 'بتحيز واضح', 'بشكل مبهم'], answerIndex: 0 },
    { question: `ما القيمة المضافة من قراءة "${book.title}"؟`, options: ['توسيع المعرفة', 'إضاعة الوقت', 'الترفيه فقط', 'لا قيمة'], answerIndex: 0 },
    { question: `هل ينصح بقراءة هذا الكتاب؟`, options: ['نعم بشدة', 'ربما', 'لا أنصح', 'حسب الاهتمام'], answerIndex: 0 },
    { question: `ما مدى موثوقية المعلومات في "${book.title}"؟`, options: ['موثوقة جداً', 'تحتاج تحقق', 'غير موثوقة', 'لا يمكن التقييم'], answerIndex: 0 },
    { question: `ما الجانب الأكثر إثارة في هذا الكتاب؟`, options: [`تناول موضوع ${mainTopic}`, 'الأسلوب الأدبي', 'البساطة في الشرح', 'حجم الكتاب'], answerIndex: 0 },
    { question: `هل يُقدّم الكتاب حلولاً عملية؟`, options: ['نعم، حلول عملية', 'نظرية فقط', 'يطرح أسئلة فقط', 'غير واضح'], answerIndex: 0 },
    { question: `كيف تصف تنظيم فصول الكتاب؟`, options: ['منطقي ومتسلسل', 'عشوائي', 'مربك للقارئ', 'طويل جداً'], answerIndex: 0 },
    { question: `ما الذي يجعل "${book.title}" مميزاً؟`, options: ['طريقة معالجة الموضوع', 'الغلاف الجميل فقط', 'اسم الكاتب الشهير', 'السعر المنخفض'], answerIndex: 0 },
    { question: `هل يُعدّ هذا الكتاب مرجعاً علمياً؟`, options: ['نعم، مرجع موثوق', 'لا، مجرد رأي', 'جزئياً', 'يعتمد على الموضوع'], answerIndex: 0 },
    { question: `ما اللغة التي يستخدمها ${book.author} في الكتابة؟`, options: ['لغة واضحة وبسيطة', 'لغة أكاديمية معقدة', 'لغة عامية', 'لغة مبهمة'], answerIndex: 0 },
    { question: `كيف يصف الكتاب مفهوم ${mainTopic}؟`, options: ['بشكل شامل ودقيق', 'بشكل مختصر', 'باستعمال أمثلة فقط', 'دون تعريف واضح'], answerIndex: 0 },
    { question: `ما عدد الفصول الرئيسية في "${book.title}" تقريباً؟`, options: ['أكثر من عشرة فصول', 'فصل واحد', 'ثلاثة فصول', 'غير منظم بفصول'], answerIndex: 0 },
    { question: `هل يتضمن الكتاب أمثلة توضيحية؟`, options: ['نعم، أمثلة وفيرة', 'نادراً', 'أبداً', 'بشكل مبالغ'], answerIndex: 0 },
    { question: `ما العمر المناسب لقراءة "${book.title}"؟`, options: ['16 سنة فأكثر', 'أطفال 5-10', 'كبار 60+', 'لا قيود عمرية'], answerIndex: 0 },
    { question: `هل يستحق "${book.title}" إعادة القراءة؟`, options: ['نعم، يكتسب تفاصيل جديدة', 'لا، مرة كافية', 'فقط للمراجعة', 'نعم للحفظ'], answerIndex: 0 },
    { question: `ما الموضوع الرئيسي الذي يتناوله الكتاب؟`, options: [mainTopic, 'أدب الرعب', 'الطبخ والمطبخ', 'علم الفضاء'], answerIndex: 0 },
    { question: `كيف تقيّم مصادر المؤلف في هذا الكتاب؟`, options: ['موثوقة ومتنوعة', 'ضعيفة ومحدودة', 'غير مذكورة', 'قديمة جداً'], answerIndex: 0 },
    { question: `هل يربط الكتاب النظرية بالتطبيق العملي؟`, options: ['نعم، توازن ممتاز', 'نظرية بحتة', 'تطبيق فقط', 'لا علاقة بينهما'], answerIndex: 0 },
    { question: `ما أهم درس يمكن استخلاصه من "${book.title}"؟`, options: [`أهمية فهم ${mainTopic}`, 'القراءة مضيعة للوقت', 'الاعتماد على الآخرين', 'لا دروس مستفادة'], answerIndex: 0 },
  ];
}