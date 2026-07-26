// ─────────────────────────────────────────────────────────────────
// Seed: Insert initial data into Neon PostgreSQL
// Usage: node scripts/seed.js
// ─────────────────────────────────────────────────────────────────
require('dotenv').config();
const { Pool } = require('pg');
const bcrypt = require('bcryptjs');

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function seed() {
  const client = await pool.connect();

  try {
    console.log('🌱 Seeding Neon PostgreSQL database...\n');

    // ── 1. Users ──────────────────────────────────────────────────
    console.log('👥 Creating users...');
    const adminHash = await bcrypt.hash('admin123', 10);
    const userHash  = await bcrypt.hash('test123456', 10);

    const { rows: [admin] } = await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role
      RETURNING id, username, email, role
    `, ['Admin', 'admin@example.com', adminHash, 'admin']);

    const { rows: [user1] } = await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
      RETURNING id, username, email, role
    `, ['Ahmed Hassan', 'test@example.com', userHash, 'user']);

    const { rows: [user2] } = await client.query(`
      INSERT INTO users (username, email, password, role)
      VALUES ($1, $2, $3, $4)
      ON CONFLICT (email) DO UPDATE SET password = EXCLUDED.password
      RETURNING id, username, email, role
    `, ['Sara Mohamed', 'sara@example.com', userHash, 'user']);

    console.log(`   ✓ Admin: ${admin.email} (id: ${admin.id})`);
    console.log(`   ✓ User: ${user1.email} (id: ${user1.id})`);
    console.log(`   ✓ User: ${user2.email} (id: ${user2.id})`);

    // ── 2. Books ──────────────────────────────────────────────────
    console.log('\n📚 Creating books...');
    const booksData = [
      {
        title: 'مقدمة في علم الحاسوب',
        author: 'Dr. Ali Ahmad',
        description: 'كتاب شامل يغطي أساسيات علم الحاسوب من خوارزميات وبنى بيانات وبرمجة. مثالي للمبتدئين والمتوسطين.',
        category: 'تقنية',
        published_year: 2022,
        pages: 450,
        cover_url: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=400&q=80',
        file_url: null,
        file_name: null,
        created_by: admin.id
      },
      {
        title: 'رياضيات متقدمة للمهندسين',
        author: 'Prof. Omar Khalid',
        description: 'كتاب الرياضيات المتقدمة الشامل للطلاب والمهندسين، يشمل التفاضل والتكامل والجبر الخطي والمعادلات التفاضلية.',
        category: 'رياضيات',
        published_year: 2021,
        pages: 620,
        cover_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400&q=80',
        file_url: null,
        file_name: null,
        created_by: admin.id
      },
      {
        title: 'تعلم اللغة الإنجليزية بسهولة',
        author: 'Sara Williams',
        description: 'دليل شامل لتعلم اللغة الإنجليزية من الصفر إلى الاحتراف مع تمارين عملية وأمثلة يومية.',
        category: 'لغات',
        published_year: 2023,
        pages: 320,
        cover_url: 'https://images.unsplash.com/photo-1457369804613-52c61a468e7d?w=400&q=80',
        file_url: null,
        file_name: null,
        created_by: admin.id
      },
      {
        title: 'فيزياء الكم للجميع',
        author: 'Dr. Nadia Hassan',
        description: 'شرح مبسط ومثير لفيزياء الكم ونظرية النسبية، يجعل العلوم الصعبة في متناول الجميع.',
        category: 'علوم',
        published_year: 2020,
        pages: 380,
        cover_url: 'https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=400&q=80',
        file_url: null,
        file_name: null,
        created_by: admin.id
      },
      {
        title: 'الذكاء الاصطناعي وتطبيقاته',
        author: 'Dr. Mahmoud Sayed',
        description: 'استكشاف شامل لعالم الذكاء الاصطناعي من Machine Learning إلى Deep Learning وتطبيقات GPT.',
        category: 'تقنية',
        published_year: 2024,
        pages: 520,
        cover_url: 'https://images.unsplash.com/photo-1677442135703-1787eea5ce01?w=400&q=80',
        file_url: null,
        file_name: null,
        created_by: admin.id
      },
      {
        title: 'الأدب العربي الحديث',
        author: 'أ. فاطمة الزهراء',
        description: 'رحلة أدبية في أعماق الأدب العربي المعاصر من نجيب محفوظ إلى أحمد خالد توفيق مع تحليل نقدي.',
        category: 'أدب',
        published_year: 2022,
        pages: 290,
        cover_url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?w=400&q=80',
        file_url: null,
        file_name: null,
        created_by: admin.id
      },
      {
        title: 'إدارة الأعمال الحديثة',
        author: 'Prof. Karim Mansour',
        description: 'كتاب متكامل في إدارة الأعمال يغطي القيادة والتخطيط الاستراتيجي وإدارة الموارد البشرية والتسويق الرقمي.',
        category: 'إدارة',
        published_year: 2023,
        pages: 410,
        cover_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400&q=80',
        file_url: null,
        file_name: null,
        created_by: admin.id
      },
      {
        title: 'علم النفس التطبيقي',
        author: 'Dr. Rania Ibrahim',
        description: 'دليل عملي لفهم النفس البشرية وتطبيق مبادئ علم النفس في الحياة اليومية والعمل.',
        category: 'علم النفس',
        published_year: 2021,
        pages: 350,
        cover_url: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&q=80',
        file_url: null,
        file_name: null,
        created_by: admin.id
      },
      {
        title: 'تاريخ الحضارة الإسلامية',
        author: 'أ.د. محمد العمري',
        description: 'سفر تاريخي في أعماق الحضارة الإسلامية من العصر الذهبي إلى العصر الحديث، مع وثائق ومخطوطات نادرة.',
        category: 'تاريخ',
        published_year: 2020,
        pages: 680,
        cover_url: 'https://images.unsplash.com/photo-1585842378054-ee2e52f94ba2?w=400&q=80',
        file_url: null,
        file_name: null,
        created_by: admin.id
      },
      {
        title: 'أساسيات الاقتصاد',
        author: 'Dr. Youssef Amin',
        description: 'مدخل سهل وشامل لعلم الاقتصاد يشمل الاقتصاد الجزئي والكلي والاقتصاد الدولي مع أمثلة عملية.',
        category: 'اقتصاد',
        published_year: 2023,
        pages: 480,
        cover_url: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=400&q=80',
        file_url: null,
        file_name: null,
        created_by: admin.id
      }
    ];

    const bookIds = [];
    for (const book of booksData) {
      const { rows: [inserted] } = await client.query(`
        INSERT INTO books
          (title, author, description, category, published_year, pages, cover_url, file_url, file_name, created_by)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
        ON CONFLICT DO NOTHING
        RETURNING id
      `, [book.title, book.author, book.description, book.category,
          book.published_year, book.pages, book.cover_url,
          book.file_url, book.file_name, book.created_by]);
      if (inserted) {
        bookIds.push(inserted.id);
        console.log(`   ✓ Book: "${book.title}" (id: ${inserted.id})`);
      }
    }

    // ── 3. Favorites ──────────────────────────────────────────────
    console.log('\n❤️  Creating favorites...');
    if (bookIds.length >= 3) {
      for (const bid of bookIds.slice(0, 3)) {
        await client.query(
          'INSERT INTO favorites (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [user1.id, bid]
        );
      }
      for (const bid of bookIds.slice(1, 4)) {
        await client.query(
          'INSERT INTO favorites (user_id, book_id) VALUES ($1, $2) ON CONFLICT DO NOTHING',
          [user2.id, bid]
        );
      }
      console.log(`   ✓ Added favorites for ${user1.username} and ${user2.username}`);
    }

    // ── 4. Quiz ───────────────────────────────────────────────────
    console.log('\n🎯 Creating sample quiz...');
    if (bookIds.length > 0) {
      const { rows: [quiz] } = await client.query(`
        INSERT INTO quizzes (book_id, title, created_by, published)
        VALUES ($1, $2, $3, 1)
        RETURNING id
      `, [bookIds[0], `اختبار: ${booksData[0].title}`, admin.id]);

      const sampleQuestions = [
        { question: 'ما هو أول موضوع يتناوله الكتاب؟', options: ['الخوارزميات', 'الفيزياء', 'التاريخ', 'الأدب'], answerIndex: 0 },
        { question: 'من المستهدف من هذا الكتاب؟', options: ['المبتدئون والمتوسطون', 'الخبراء فقط', 'الأطفال فقط', 'لا أحد'], answerIndex: 0 },
        { question: 'كم عدد صفحات الكتاب؟', options: ['450 صفحة', '100 صفحة', '1000 صفحة', '50 صفحة'], answerIndex: 0 },
        { question: 'من كتب هذا الكتاب؟', options: ['Dr. Ali Ahmad', 'Dr. Omar', 'Sara Williams', 'أحمد'], answerIndex: 0 },
        { question: 'في أي عام صدر الكتاب؟', options: ['2022', '2015', '2010', '2000'], answerIndex: 0 }
      ];

      for (const q of sampleQuestions) {
        await client.query(
          'INSERT INTO quiz_questions (quiz_id, question, options_json, answer_index) VALUES ($1, $2, $3, $4)',
          [quiz.id, q.question, JSON.stringify(q.options), q.answerIndex]
        );
      }
      console.log(`   ✓ Quiz created with ${sampleQuestions.length} questions (id: ${quiz.id})`);

      // Sample result
      await client.query(
        'INSERT INTO quiz_results (quiz_id, user_id, score) VALUES ($1, $2, $3)',
        [quiz.id, user1.id, 4]
      );
      console.log(`   ✓ Sample quiz result added for ${user1.username}`);
    }

    // ── 5. Summary ────────────────────────────────────────────────
    console.log('\n─────────────────────────────────────────');
    console.log('✅ Seed complete! Summary:');
    const { rows: userCount } = await client.query('SELECT COUNT(*) AS cnt FROM users');
    const { rows: bookCount } = await client.query('SELECT COUNT(*) AS cnt FROM books');
    const { rows: favCount  } = await client.query('SELECT COUNT(*) AS cnt FROM favorites');
    const { rows: quizCount } = await client.query('SELECT COUNT(*) AS cnt FROM quizzes');
    console.log(`   👥 Users:     ${userCount[0].cnt}`);
    console.log(`   📚 Books:     ${bookCount[0].cnt}`);
    console.log(`   ❤️  Favorites: ${favCount[0].cnt}`);
    console.log(`   🎯 Quizzes:   ${quizCount[0].cnt}`);
    console.log('\n🔑 Test Credentials:');
    console.log('   Admin → admin@example.com / admin123');
    console.log('   User  → test@example.com  / test123456');
    console.log('─────────────────────────────────────────\n');

  } catch (error) {
    console.error('\n❌ Seed failed:', error.message);
    console.error(error);
    throw error;
  } finally {
    client.release();
    await pool.end();
  }
}

seed().catch(err => {
  console.error(err);
  process.exit(1);
});
