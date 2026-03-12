const pool = require('../config/db');
const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const PDFParse = require('pdf-parse');

const genai = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI({ apiKey: process.env.GEMINI_API_KEY }) : null;

// دالة مساعدة لاستخراج النص من PDF باستخدام pdf-parse
const extractTextFromPDF = async (dataBuffer) => {
  try {
    const pdfData = await PDFParse(dataBuffer);
    const text = pdfData.text || '';
    console.log(`[PDF] Extracted ${text.length} characters from PDF`);
    return { text };
  } catch (err) {
    console.error('[PDF] Error extracting text:', err.message);
    return { text: '' };
  }
};

// Create an empty quiz for a book (admin only)
exports.createQuiz = async (req, res) => {
  try {
    const { book_id } = req.body;
    if (!book_id) {
      return res.status(400).json({ success: false, message: 'book_id required' });
    }
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO quizzes (book_id, title, created_by, published) VALUES (?, ?, ?, 0)',
      [book_id, '', req.user.id]
    );
    connection.release();
    return res.status(201).json({ success: true, quizId: result.insertId });
  } catch (error) {
    console.error('Create quiz error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// Generate quiz from book PDF: admin only
exports.generateQuiz = async (req, res) => {
  try {
    const { book_id } = req.params;
    console.log(`[QUIZ GEN] Starting quiz generation for book_id: ${book_id}`);

    const connection = await pool.getConnection();
    console.log('[QUIZ GEN] Database connection acquired');
    
    const [books] = await connection.query('SELECT * FROM books WHERE id = ?', [book_id]);
    console.log(`[QUIZ GEN] Books query result: ${books.length} book(s) found`);
    
    if (books.length === 0) {
      connection.release();
      console.log(`[QUIZ GEN] ERROR: Book with id ${book_id} not found`);
      return res.status(404).json({ success: false, message: 'Book not found' });
    }

    const book = books[0];
    console.log(`[QUIZ GEN] Book found: ${book.title}, file_url: ${book.file_url}`);
    
    if (!book.file_url) {
      connection.release();
      console.log('[QUIZ GEN] ERROR: No PDF file for this book');
      return res.status(400).json({ success: false, message: 'No PDF uploaded for this book' });
    }

    // file path on disk
    const uploadsDir = path.join(__dirname, '..', 'uploads');
    const filePath = path.join(uploadsDir, path.basename(book.file_url));
    console.log(`[QUIZ GEN] Looking for PDF at: ${filePath}`);

    if (!fs.existsSync(filePath)) {
      connection.release();
      console.log(`[QUIZ GEN] ERROR: PDF file not found at path: ${filePath}`);
      const availableFiles = fs.readdirSync(uploadsDir);
      console.log(`[QUIZ GEN] Available files in uploads: ${availableFiles.join(', ')}`);
      return res.status(404).json({ success: false, message: 'PDF file not found on server' });
    }

    console.log('[QUIZ GEN] Reading PDF file...');
    const dataBuffer = fs.readFileSync(filePath);
    
    // ✅ استخدام pdf2json لاستخراج النص
    console.log('[QUIZ GEN] Extracting text with pdf-parse...');
    const pdfData = await extractTextFromPDF(dataBuffer);
    
    const text = (pdfData.text || '').slice(0, 20000);
    console.log(`[QUIZ GEN] PDF text extracted: ${text.length} characters`);
    
    if (text.length === 0) {
      console.warn('[QUIZ GEN] No text extracted from PDF - using fallback');
    } else {
      console.log('[QUIZ GEN] First 200 chars:', text.substring(0, 200));
    }

    // Prepare prompt for Gemini with Arabic output
    let questions = [];
    if (genai && text.length > 50) { // فقط لو في نص كافي
      console.log('[QUIZ GEN] Gemini client available, generating with AI...');
      
      // الحصول على عدد عشوائي للتنوع
      const randomSeed = Math.random().toString(36).substring(7) + Date.now();
      
      const prompt = `أنت خبير تربوي متميز تقوم بعمل 30 سؤالاً اختبارياً متقدماً عن كتاب.

📚 معلومات الكتاب:
- العنوان: "${book.title}"
- المؤلف: "${book.author}"
- الفئة: "${book.category || 'عام'}"
- سنة النشر: ${book.published_year || 2020}

📖 محتوى الكتاب:
${text.substring(0, 6000)}

**المتطلبات الصارمة:**
1. اكتب بالضبط 30 سؤالاً متعددة الخيارات (4 خيارات لكل سؤال)
2. كل سؤال محتاج يكون **مختلف تماماً** عن الآخر - لا تكرار الفكرة! (معرّف فريد: ${randomSeed})
3. الخيارات يجب تكون **خادعة**: ليست واضحة، لكن معقولة
4. توزيع الإجابات الصحيحة بالتساوي (0, 1, 2, 3 متساوي)
5. استخدم أساليب متنوعة: فهم النصوص، تحليل، مقارنة، استنتاجات
6. للدرجات العمرية 12-20: اجعل الأسئلة مثيرة وذكية
7. JSON فقط - بدون شرح أو كلام إضافي!

القالب المطلوب:
[
  {"question": "نص السؤال؟", "options": ["خ1", "خ2", "خ3", "خ4"], "answerIndex": 2},
  {"question": "نص السؤال؟", "options": ["خ1", "خ2", "خ3", "خ4"], "answerIndex": 0},
  ... 28 more
]`;

      try {
        const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
        console.log('[QUIZ GEN] Calling Gemini for 30 diverse questions...');
        
        const result = await model.generateContent(prompt);
        const response = result.response;
        const raw = response.text() || '';

        
        console.log('[QUIZ GEN] Gemini response received, raw length:', raw.length);
        
        try {
          // محاولة استخراج JSON من الـ response
          const jsonStart = raw.indexOf('[');
          const jsonEnd = raw.lastIndexOf(']') + 1;
          
          if (jsonStart === -1 || jsonEnd === 0) {
            throw new Error('No JSON array found in response');
          }
          
          const jsonText = raw.slice(jsonStart, jsonEnd);
          questions = JSON.parse(jsonText);
          console.log(`[QUIZ GEN] Parsed ${questions.length} questions from Gemini`);
          
          // التحقق من صحة الأسئلة
          questions = questions.filter(q => {
            const isValid = q.question && 
                   Array.isArray(q.options) && 
                   q.options.length === 4 && 
                   typeof q.answerIndex === 'number' && 
                   q.answerIndex >= 0 && 
                   q.answerIndex <= 3;
            
            if (!isValid) {
              console.warn('[QUIZ GEN] Invalid question filtered out:', q);
            }
            return isValid;
          });
          console.log(`[QUIZ GEN] After validation: ${questions.length} questions remain`);
        } catch (err) {
          console.warn('[QUIZ GEN] Gemini response parse failed:', err.message);
        }
      } catch (err) {
        console.warn('[QUIZ GEN] Gemini API call failed:', err.message);
      }
    } else {
      if (!genai) console.log('[QUIZ GEN] Gemini client not available');
      if (text.length <= 50) console.log('[QUIZ GEN] Insufficient text for AI');
      console.log('[QUIZ GEN] Using fallback questions');
    }

    // أسئلة احتياطية ذكية بالعربية - 30 سؤال متنوع
    console.log('[QUIZ GEN] Generating intelligent Arabic fallback questions (30 questions)...');
    
    // استخراج معلومات إضافية من النص
    const words = text.split(/\s+/).filter(w => w.length > 3).slice(0, 50);
    const mainTopic = book.category || 'الموضوع الرئيسي';
    const pubYear = book.published_year || 2020;
    const pageCount = book.pages || 300;
    
    // إنشاء 30 سؤال متنوع
    const fallbackQuestions = [
      // أسئلة عن الكتاب نفسه (5)
      { 
        question: `ما هو عنوان هذا الكتاب الذي نتعلم منه؟`, 
        options: [book.title, 'كتاب مشهور آخر', 'رواية بدون عنوان', 'قصة قديمة'], 
        answerIndex: 0 
      },
      { 
        question: `من هو كاتب "${book.title}"؟`, 
        options: [book.author, 'مؤلف مختلف', 'شاعر معروف', 'كاتب مجهول'], 
        answerIndex: 0 
      },
      { 
        question: `في أي عام تم نشر هذا الكتاب المميز؟`, 
        options: [
          pubYear.toString(),
          (pubYear - 5).toString(),
          (pubYear + 3).toString(),
          'قبل مئة سنة'
        ], 
        answerIndex: 0 
      },
      { 
        question: `كم عدد صفحات "${book.title}" تقريباً؟`, 
        options: [
          pageCount.toString(),
          (pageCount - 100).toString(),
          (pageCount + 150).toString(),
          'أكثر من ألف صفحة'
        ], 
        answerIndex: 0 
      },
      { 
        question: `ما هي الفئة الأساسية للكتاب؟`, 
        options: [mainTopic, 'خيال علمي', 'سيرة ذاتية', 'شعر'], 
        answerIndex: 0 
      },
      // أسئلة عن الفهم العميق (10)
      { 
        question: `أي من الخيارات التالية تعتقد أنه الهدف الرئيسي للمؤلف؟`, 
        options: [
          `توصيل رسالة حول ${mainTopic}`,
          'الحصول على جوائز أدبية فقط',
          'جعل القراءة ممله',
          'لا يوجد هدف واضح'
        ], 
        answerIndex: 0 
      },
      { 
        question: `كيف تقيّم جودة الأسلوب الكتابي في هذا الكتاب؟`, 
        options: ['ممتاز وجذاب', 'متوسط الجودة', 'ضعيف جداً', 'غير مفهوم'], 
        answerIndex: 0 
      },
      { 
        question: `هل هذا الكتاب مناسب للقراء المبتدئين؟`, 
        options: ['نعم، مناسب جداً', 'لا، معقد جداً', 'فقط للمتخصصين', 'غير محدد'], 
        answerIndex: 0 
      },
      { 
        question: `ماذا تعلمت من بداية هذا الكتاب؟`, 
        options: [
          `تفاصيل حول ${mainTopic}`,
          'لا شيء مهم',
          'معلومات عادية فقط',
          'نقاد الكتاب'
        ], 
        answerIndex: 0 
      },
      { 
        question: `هل محتوى الكتاب متسق ومنطقي؟`, 
        options: ['نعم، متسق جداً', 'به نقاط غير متسقة', 'مخبول تماماً', 'لا يمكن الحكم'], 
        answerIndex: 0 
      },
      { 
        question: `ما رأيك في مستوى صعوبة الكتاب؟`, 
        options: ['متوازن تماماً', 'صعب جداً', 'سهل جداً', 'غير متناسق'], 
        answerIndex: 0 
      },
      // أسئلة تحليلية (8)
      { 
        question: `من هي الفئة المستهدفة لهذا الكتاب برأيك؟`, 
        options: [
          'الشباب والمثقفون',
          'الأطفال الصغار',
          'المتقاعدون فقط',
          'لا يوجد فئة محددة'
        ], 
        answerIndex: 0 
      },
      { 
        question: `هل يحتوي الكتاب على قصص واقعية أم خيالية؟`, 
        options: [
          'يحتوي على كليهما',
          'قصص خيالية فقط',
          'مستندات واقعية فقط',
          'غير واضح'
        ], 
        answerIndex: 0 
      },
      { 
        question: `كم من الوقت استغرق قراءة هذا الكتاب عادة؟`, 
        options: [
          'ساعات عدة',
          'دقائق قليلة فقط',
          'يوم واحد بالكامل',
          'أسابيع من القراءة'
        ], 
        answerIndex: 0 
      },
      { 
        question: `هل الكتاب يحتوي على مراجع وتوثيق؟`, 
        options: ['نعم، توثيق كامل', 'قليل التوثيق', 'بدون أي مراجع', 'غير معروف'], 
        answerIndex: 0 
      },
      { 
        question: `ما هي أهم فكرة رئيسية في الكتاب؟`, 
        options: [
          `فكرة متعلقة بـ ${mainTopic}`,
          'فكرة عشوائية',
          'لا توجد فكرة واضحة',
          'أفكار متعددة بدون ربط'
        ], 
        answerIndex: 0 
      },
      { 
        question: `هل للكتاب تأثير اجتماعي إيجابي؟`, 
        options: ['نعم، تأثير كبير', 'تأثير سلبي', 'بدون تأثير', 'غير محدد'], 
        answerIndex: 0 
      },
      { 
        question: `هل يوصي الكثيرون بقراءة هذا الكتاب؟`, 
        options: ['نعم، بشدة', 'قليلون يوصون به', 'الجميع ينصحون به', 'لا أحد يعرفه'], 
        answerIndex: 0 
      },
      // أسئلة مقارنة (4)
      { 
        question: `مقارنة بينه وبين الكتب الأخرى في نفس الفئة، هو...؟`, 
        options: ['الأفضل واضحاً', 'متوسط الجودة', 'الأسوأ', 'لا يمكن المقارنة'], 
        answerIndex: 0 
      },
      { 
        question: `هل أسلوب هذا الكتاب فريد من نوعه؟`, 
        options: ['نعم، فريد جداً', 'شبه أسلوب شهير', 'أسلوب عادي', 'مملول'], 
        answerIndex: 0 
      },
      { 
        question: `كم مرة تستحق هذا الكتاب قراءته؟`, 
        options: ['مرات عديدة', 'مرة واحدة كافية', 'لا يستحق حتى مرة', 'غير معروف'], 
        answerIndex: 0 
      },
      { 
        question: `هل سيصبح هذا الكتاب علامة مرجعية في المستقبل؟`, 
        options: ['نعم، بالتأكيد', 'غير محتمل', 'غير متأكد', 'سيُنسى بسرعة'], 
        answerIndex: 0 
      },
      // أسئلة شخصية (3)
      { 
        question: `هل تنصح الآخرين بقراءة هذا الكتاب؟`, 
        options: ['نعم، بشدة', 'لا، إنه ممل', 'ربما، حسب الاهتمام', 'لم أقرره بعد'], 
        answerIndex: 0 
      },
      { 
        question: `ما مستوى الإثارة في هذا الكتاب؟`, 
        options: ['عالي جداً', 'منخفض', 'متوسط', 'متغير'], 
        answerIndex: 0 
      },
      { 
        question: `هل غير هذا الكتاب نظرتك لأي موضوع؟`, 
        options: ['نعم، تماماً', 'لا، رأيي لم يتغير', 'قليلاً', 'غير معروف'], 
        answerIndex: 0 
      }
    ];
    
    // دمج الأسئلة: نستخدم أسئلة Gemini لو موجودة وصحيحة (30 سؤال)، وإلا نستخدم fallback
    const finalQuestions = (questions && questions.length >= 25) ? questions : fallbackQuestions;
    console.log(`[QUIZ GEN] Using ${finalQuestions.length} questions (${questions && questions.length > 0 ? 'from Gemini' : 'fallback'})`);

    // Create quiz entry (draft)
    console.log('[QUIZ GEN] Inserting quiz record into database...');
    const [quizResult] = await connection.query(
      `INSERT INTO quizzes (book_id, title, created_by, published) VALUES (?, ?, ?, ?)`,
      [book.id, `Quiz for ${book.title}`, req.user.id, 0]
    );
    const quizId = quizResult.insertId;
    console.log(`[QUIZ GEN] Quiz record created with id: ${quizId}`);

    // Insert questions
    console.log(`[QUIZ GEN] Inserting ${finalQuestions.length} questions...`);
    for (const q of finalQuestions) {
      await connection.query(
        `INSERT INTO quiz_questions (quiz_id, question, options_json, answer_index) VALUES (?, ?, ?, ?)`,
        [quizId, q.question || '', JSON.stringify(q.options || []), q.answerIndex ?? 0]
      );
    }
    console.log('[QUIZ GEN] All questions inserted successfully');

    connection.release();
    console.log('[QUIZ GEN] ✅ Quiz generation completed successfully');

    return res.status(201).json({ 
      success: true, 
      quizId, 
      questionsCount: finalQuestions.length, 
      published: false, 
      autoQuestions: finalQuestions,
      usedAI: questions.length > 0,
      textExtracted: text.length
    });
  } catch (error) {
    console.error('[QUIZ GEN] ❌ Generate quiz error:', error.message || error);
    console.error('[QUIZ GEN] Stack trace:', error.stack);
    return res.status(500).json({ success: false, message: 'Server error: ' + error.message });
  }
};

// --- Admin utilities for managing quiz questions ---

exports.updateQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    const { question, options, answerIndex } = req.body;
    const connection = await pool.getConnection();
    await connection.query(
      'UPDATE quiz_questions SET question = ?, options_json = ?, answer_index = ? WHERE id = ?',
      [question || '', JSON.stringify(options || []), answerIndex ?? 0, question_id]
    );
    connection.release();
    return res.status(200).json({ success: true, message: 'Question updated' });
  } catch (error) {
    console.error('Update question error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.addQuestion = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const { question, options, answerIndex } = req.body;
    const connection = await pool.getConnection();
    const [result] = await connection.query(
      'INSERT INTO quiz_questions (quiz_id, question, options_json, answer_index) VALUES (?, ?, ?, ?)',
      [quiz_id, question || '', JSON.stringify(options || []), answerIndex ?? 0]
    );
    connection.release();
    return res.status(201).json({ success: true, questionId: result.insertId });
  } catch (error) {
    console.error('Add question error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteQuestion = async (req, res) => {
  try {
    const { question_id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('DELETE FROM quiz_questions WHERE id = ?', [question_id]);
    connection.release();
    return res.status(200).json({ success: true, message: 'Question deleted' });
  } catch (error) {
    console.error('Delete question error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.regenerateQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const connection = await pool.getConnection();
    const [quizzes] = await connection.query('SELECT book_id FROM quizzes WHERE id = ?', [quiz_id]);
    if (quizzes.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }
    const bookId = quizzes[0].book_id;
    await connection.query('DELETE FROM quiz_questions WHERE quiz_id = ?', [quiz_id]);
    connection.release();
    const newQuestions = await generateQuestionsForBook(bookId);
    const conn2 = await pool.getConnection();
    for (const q of newQuestions) {
      await conn2.query(
        `INSERT INTO quiz_questions (quiz_id, question, options_json, answer_index) VALUES (?, ?, ?, ?)`,
        [quiz_id, q.question || '', JSON.stringify(q.options || []), q.answerIndex ?? 0]
      );
    }
    conn2.release();
    return res.status(200).json({ success: true, questions: newQuestions });
  } catch (err) {
    console.error('Regenerate quiz error:', err);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// helper used by both generateQuiz and regenerateQuiz
async function generateQuestionsForBook(bookId) {
  const connection = await pool.getConnection();
  const [books] = await connection.query('SELECT * FROM books WHERE id = ?', [bookId]);
  connection.release();
  if (books.length === 0) return [];
  const book = books[0];
  const uploadsDir = path.join(__dirname, '..', 'uploads');
  const filePath = path.join(uploadsDir, path.basename(book.file_url || ''));
  let text = '';
  if (fs.existsSync(filePath)) {
    const dataBuffer = fs.readFileSync(filePath);
    const pdfData = await extractTextFromPDF(dataBuffer);
    text = (pdfData.text || '').slice(0, 20000);
  }
  const randomSeed = Math.random().toString(36).substring(7) + Date.now();
  const promptBase = `أنت خبير تربوي متخصص تقوم بكتابة 30 سؤالاً امتحانياً ذكياً عن كتاب.

📚 معلومات الكتاب:
- العنوان: "${book.title}"
- المؤلف: "${book.author}"
- الفئة: "${book.category || 'عام'}"

📖 محتوى الكتاب:
${text.substring(0, 6000)}

**متطلبات صارمة - يجب اتباعها بدقة:**
1. اكتب 30 سؤال بالضبط - 4 خيارات كل سؤال فقط
2. كل سؤال يجب يكون **مختلف 100%** عن الآخر (معرفة فريدة: ${randomSeed})
3. الخيارات يجب تكون **غامضة وذكية** - لا تكون جواب واضح
4. وزع الإجابات الصحيحة: استخدم 0, 1, 2, 3 بالتساوي تقريباً
5. اخلط أنواع الأسئلة: فهم، تحليل، استنتاج، مقارنة، تطبيق
6. اجعل الأسئلة صعبة ومثيرة للتفكير (مناسب 12-20 سنة)
7. JSON فقط - بدون شرح!

الشكل المطلوب:
[
  {"question": "نص؟", "options": ["أ", "ب", "ج", "د"], "answerIndex": 1},
  ... 29 more
]`;
  let questions = [];
  if (genai && text.length > 50) {
    try {
      const model = genai.getGenerativeModel({ model: 'gemini-1.5-flash' });
      const result = await model.generateContent(promptBase);
      const raw = result.response.text() || '';
      const jsonStart = raw.indexOf('[');
      const jsonEnd = raw.lastIndexOf(']') + 1;
      if (jsonStart !== -1 && jsonEnd > 0) {
        questions = JSON.parse(raw.slice(jsonStart, jsonEnd));
      }
    } catch (e) {
      console.warn('[Quiz Helper] Gemini failed:', e.message);
    }
  }
  if ((!questions || questions.length < 30) && process.env.OPENAI_API_KEY) {
    try {
      const { Configuration, OpenAIApi } = require('openai');
      const config = new Configuration({ apiKey: process.env.OPENAI_API_KEY });
      const openai = new OpenAIApi(config);
      const chatPrompt = promptBase.replace(/\n/g, "\n");
      const response = await openai.createChatCompletion({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'أنت مساعد ذكي لإنشاء أسئلة تعلّمية.' },
          { role: 'user', content: chatPrompt }
        ],
        max_tokens: 2500
      });
      const textResp = response.data.choices[0].message.content || '';
      const jsonStart = textResp.indexOf('[');
      const jsonEnd = textResp.lastIndexOf(']') + 1;
      if (jsonStart !== -1 && jsonEnd > 0) {
        const fromOpenAI = JSON.parse(textResp.slice(jsonStart, jsonEnd));
        questions = questions.concat(fromOpenAI);
      }
    } catch (e) {
      console.warn('[Quiz Helper] OpenAI fallback failed:', e.message);
    }
  }
  questions = (questions || []).filter(q => {
    return q && q.question && Array.isArray(q.options) && q.options.length === 4 &&
           typeof q.answerIndex === 'number' && q.answerIndex >= 0 && q.answerIndex <= 3;
  });
  if (questions.length < 30) {
    questions = generateSimpleFallback(book, text);
  }
  return questions.slice(0, 30);
}

function generateSimpleFallback(book, text) {
  const mainTopic = book.category || 'الموضوع الرئيسي';
  const pubYear = book.published_year || 2020;
  const pageCount = book.pages || 300;
  const fallback = [];
  // minimal fallback: duplicate previous array style but simplified
  for (let i = 0; i < 30; i++) {
    fallback.push({
      question: `سؤال افتراضي رقم ${i+1}`,
      options: ['أ', 'ب', 'ج', 'د'],
      answerIndex: 0
    });
  }
  return fallback;
}

// باقي الدوال كما هي (listQuizzes, getQuiz, publishQuiz, submitQuiz, getLeaderboard)

// باقي الدوال كما هي (listQuizzes, getQuiz, publishQuiz, submitQuiz, getLeaderboard)
// لا تغيير فيها من الكود السابق
exports.listQuizzes = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT q.id, q.title, q.book_id, b.title AS book_title
       FROM quizzes q
       LEFT JOIN books b ON q.book_id = b.id
       WHERE q.published = 1
       ORDER BY q.id DESC`
    );
    connection.release();
    return res.status(200).json({ success: true, quizzes: rows });
  } catch (error) {
    console.error('List quizzes error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.getQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const connection = await pool.getConnection();
    const [quizzes] = await connection.query('SELECT id, title FROM quizzes WHERE id = ? AND published = 1', [quiz_id]);
    if (quizzes.length === 0) {
      connection.release();
      return res.status(404).json({ success: false, message: 'Quiz not found or not published' });
    }
    const quiz = quizzes[0];
    const [questions] = await connection.query(
      'SELECT id, question, options_json FROM quiz_questions WHERE quiz_id = ?',
      [quiz_id]
    );
    connection.release();
    
    const cleanQuestions = questions.map((q) => ({
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

exports.publishQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const connection = await pool.getConnection();
    await connection.query('UPDATE quizzes SET published = 1 WHERE id = ?', [quiz_id]);
    connection.release();
    return res.status(200).json({ success: true, message: 'Quiz published' });
  } catch (error) {
    console.error('Publish quiz error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.deleteQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const connection = await pool.getConnection();
    
    // حذف جميع الأسئلة المتعلقة بهذا الكويز
    await connection.query('DELETE FROM quiz_questions WHERE quiz_id = ?', [quiz_id]);
    
    // حذف جميع النتائج المتعلقة بهذا الكويز
    await connection.query('DELETE FROM quiz_results WHERE quiz_id = ?', [quiz_id]);
    
    // حذف الكويز نفسه
    await connection.query('DELETE FROM quizzes WHERE id = ?', [quiz_id]);
    
    connection.release();
    return res.status(200).json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    console.error('Delete quiz error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

exports.submitQuiz = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const { answers } = req.body;

    if (!Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Answers array required' });
    }

    const connection = await pool.getConnection();
    // guarantee migration: add columns if missing
    await connection.query("ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS total_questions INT DEFAULT 0");
    await connection.query("ALTER TABLE quiz_results ADD COLUMN IF NOT EXISTS bonus_points INT DEFAULT 0");
    
    let score = 0;
    const totalQuestions = answers.length;
    
    // debug log of answers in case of issues
    console.log('[QUIZ] submitQuiz received answers:', answers);

    for (const a of answers) {
      const [rows] = await connection.query('SELECT answer_index FROM quiz_questions WHERE id = ?', [a.question_id]);
      if (rows.length && rows[0].answer_index === a.answerIndex) {
        score += 1;
      }
    }

    // insert result
    const [insertRes] = await connection.query(
      'INSERT INTO quiz_results (quiz_id, user_id, score, total_questions) VALUES (?, ?, ?, ?)', 
      [quiz_id, req.user.id, score, totalQuestions]
    );

    // compute rank based on score
    const [higher] = await connection.query(
      'SELECT COUNT(*) as cnt FROM quiz_results WHERE quiz_id = ? AND score > ?',
      [quiz_id, score]
    );
    const rank = higher[0].cnt + 1;
    let bonus = 0;
    if (rank === 1) bonus = 40;
    else if (rank === 2) bonus = 20;
    else if (rank === 3) bonus = 10;

    connection.release();

    return res.status(200).json({ success: true, score, totalQuestions, rank, bonus });
  } catch (error) {
    console.error('Submit quiz error:', error);
    // expose underlying error message for debugging during development
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};

exports.getLeaderboard = async (req, res) => {
  try {
    const { quiz_id } = req.params;
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT r.user_id, u.username, r.score, r.total_questions, r.created_at 
       FROM quiz_results r
       LEFT JOIN users u ON r.user_id = u.id
       WHERE r.quiz_id = ?
       ORDER BY r.score DESC, r.created_at ASC
       LIMIT 50`,
      [quiz_id]
    );
    connection.release();
    
    const leaderboardWithPercentage = rows.map(row => ({
      ...row,
      percentage: row.total_questions ? Math.round((row.score / row.total_questions) * 100) : 0
    }));
    
    return res.status(200).json({ success: true, leaderboard: leaderboardWithPercentage });
  } catch (error) {
    console.error('Get leaderboard error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// admin-only: list every quiz regardless of publication
exports.listAllQuizzes = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    const [rows] = await connection.query(
      `SELECT q.id, q.book_id, q.title, q.published, b.title AS book_title
       FROM quizzes q
       LEFT JOIN books b ON q.book_id = b.id
       ORDER BY q.id DESC`
    );
    connection.release();
    return res.status(200).json({ success: true, quizzes: rows });
  } catch (error) {
    console.error('List all quizzes error:', error);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
};

// global leaderboard aggregated by user total score
exports.getGlobalLeaderboard = async (req, res) => {
  try {
    const connection = await pool.getConnection();
    // include bonus points in total
    const [rows] = await connection.query(
      `SELECT u.id as user_id, u.username,
              SUM(r.score) AS sum_score,
              SUM(IFNULL(r.bonus_points,0)) AS sum_bonus,
              SUM(r.score + IFNULL(r.bonus_points,0)) AS total_score
       FROM quiz_results r
       LEFT JOIN users u ON r.user_id = u.id
       GROUP BY r.user_id
       ORDER BY total_score DESC
       LIMIT 50`
    );
    connection.release();
    console.log('[QUIZ] global leaderboard fetched', rows.length);
    return res.status(200).json({ success: true, leaderboard: rows });
  } catch (error) {
    console.error('Get global leaderboard error:', error);
    return res.status(500).json({ success: false, message: error.message || 'Server error' });
  }
};