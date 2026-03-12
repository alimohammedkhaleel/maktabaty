const pool = require('../config/db');

// محاكاة نموذج AI بسيط - يمكن استبداله بـ TensorFlow.js أو OpenAI API
class SimpleAI {
  constructor() {
    this.keywords = {
      author: ['who is the author', 'who wrote', 'author of'],
      summary: ['what is this book about', 'summarize', 'summary', 'overview'],
      characters: ['characters', 'protagonist', 'main character'],
      plot: ['plot', 'story', 'what happens'],
      chapter: ['chapter', 'page', 'pages'],
      theme: ['theme', 'themes', 'message']
    };
  }

  generateResponse(question, bookData) {
    const lowerQuestion = question.toLowerCase();
    
    // التحقق من الكلمات الرئيسية
    for (const [key, words] of Object.entries(this.keywords)) {
      for (const word of words) {
        if (lowerQuestion.includes(word)) {
          return this.getAnswer(key, bookData);
        }
      }
    }

    // إجابة عامة
    return {
      answer: `هذا كتاب بعنوان "${bookData.title}" بواسطة ${bookData.author}. ${bookData.description || 'لم تتوفر معلومات إضافية.'}`,
      confidence: 0.6
    };
  }

  getAnswer(type, bookData) {
    const answers = {
      author: {
        answer: `الكتاب "${bookData.title}" تم تأليفه بواسطة ${bookData.author}.`,
        confidence: 0.95
      },
      summary: {
        answer: `ملخص الكتاب: ${bookData.description || 'لم تتوفر ملخصات تفصيلية.'}`,
        confidence: 0.85
      },
      chapter: {
        answer: `كتاب "${bookData.title}" يحتوي على ${bookData.pages || 'عدد غير محدد'} صفحة.`,
        confidence: 0.9
      },
      theme: {
        answer: `المواضيع الرئيسية في "${bookData.title}": ${bookData.category || 'متنوعة'}`,
        confidence: 0.75
      }
    };

    return answers[type] || {
      answer: 'لم أتمكن من فهم سؤالك تماماً. يرجى إعادة الصياغة.',
      confidence: 0.5
    };
  }
}

const ai = new SimpleAI();

// طرح سؤال على الـ AI
exports.askQuestion = async (req, res) => {
  try {
    const { question, book_id } = req.body;

    if (!question || !book_id) {
      return res.status(400).json({
        success: false,
        message: 'Question and book ID are required'
      });
    }

    const connection = await pool.getConnection();

    // الحصول على بيانات الكتاب
    const [books] = await connection.query(
      'SELECT * FROM books WHERE id = ?',
      [book_id]
    );

    if (books.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const bookData = books[0];

    // توليد الإجابة باستخدام الـ AI
    const aiResponse = ai.generateResponse(question, bookData);

    // حفظ السؤال والإجابة في قاعدة البيانات
    await connection.query(
      `INSERT INTO qa_history (user_id, book_id, question, answer, confidence)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, book_id, question, aiResponse.answer, aiResponse.confidence]
    );

    connection.release();

    return res.status(200).json({
      success: true,
      question,
      answer: aiResponse.answer,
      confidence: aiResponse.confidence,
      book: {
        id: bookData.id,
        title: bookData.title,
        author: bookData.author
      }
    });
  } catch (error) {
    console.error('Ask question error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// الحصول على السجل التاريخي للأسئلة
exports.getQAHistory = async (req, res) => {
  try {
    const connection = await pool.getConnection();

    const [history] = await connection.query(
      `SELECT q.*, b.title as book_title FROM qa_history q
       LEFT JOIN books b ON q.book_id = b.id
       WHERE q.user_id = ?
       ORDER BY q.created_at DESC
       LIMIT 50`,
      [req.user.id]
    );

    connection.release();

    return res.status(200).json({
      success: true,
      count: history.length,
      history
    });
  } catch (error) {
    console.error('Get QA history error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// حل أسئلة تلقائية للكتاب
exports.generateAutoQuestions = async (req, res) => {
  try {
    const { book_id } = req.params;

    const connection = await pool.getConnection();

    const [books] = await connection.query(
      'SELECT * FROM books WHERE id = ?',
      [book_id]
    );

    if (books.length === 0) {
      connection.release();
      return res.status(404).json({
        success: false,
        message: 'Book not found'
      });
    }

    const bookData = books[0];

    // أسئلة تلقائية قياسية
    const autoQuestions = [
      'من هو مؤلف هذا الكتاب؟',
      'ما هي فئة هذا الكتاب؟',
      'كم عدد صفحات الكتاب؟',
      'ما هو موضوع هذا الكتاب؟',
      'متى تم نشر هذا الكتاب؟'
    ];

    // توليد الإجابات
    const answers = autoQuestions.map(q => {
      const response = ai.generateResponse(q, bookData);
      return {
        question: q,
        answer: response.answer,
        confidence: response.confidence
      };
    });

    // حفظ الأسئلة والإجابات
    for (const item of answers) {
      await connection.query(
        `INSERT INTO qa_history (user_id, book_id, question, answer, confidence)
         VALUES (?, ?, ?, ?, ?)`,
        [req.user.id, book_id, item.question, item.answer, item.confidence]
      );
    }

    connection.release();

    return res.status(200).json({
      success: true,
      book: {
        id: bookData.id,
        title: bookData.title
      },
      autoQuestions: answers
    });
  } catch (error) {
    console.error('Generate auto questions error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};

// البحث في محتوى الكتب
exports.searchInBooks = async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({
        success: false,
        message: 'Search query is required'
      });
    }

    const connection = await pool.getConnection();

    const [results] = await connection.query(
      `SELECT id, title, author, description FROM books
       WHERE MATCH(title, author, description) AGAINST(? IN BOOLEAN MODE)
       LIMIT 10`,
      [query]
    );

    connection.release();

    return res.status(200).json({
      success: true,
      count: results.length,
      results
    });
  } catch (error) {
    console.error('Search in books error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server error'
    });
  }
};
