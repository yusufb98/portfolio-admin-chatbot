const db = require('./db');
const bcrypt = require('bcryptjs');

console.log('🚀 Initializing database...');

// Create tables
db.exec(`
  -- Admin users table
  CREATE TABLE IF NOT EXISTS admins (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password_hash TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Languages table
  CREATE TABLE IF NOT EXISTS languages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    code TEXT UNIQUE NOT NULL,
    name TEXT NOT NULL,
    native_name TEXT NOT NULL,
    flag TEXT NOT NULL,
    is_active INTEGER DEFAULT 1,
    is_default INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0
  );

  -- Translations table for all translatable content
  CREATE TABLE IF NOT EXISTS translations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    lang_code TEXT NOT NULL,
    key TEXT NOT NULL,
    value TEXT,
    category TEXT DEFAULT 'general',
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    UNIQUE(lang_code, key)
  );

  -- Profile information table
  CREATE TABLE IF NOT EXISTS profile (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    full_name TEXT NOT NULL,
    title TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    github_url TEXT,
    linkedin_url TEXT,
    twitter_url TEXT,
    email TEXT,
    phone TEXT,
    location TEXT,
    cv_url TEXT,
    hero_subtitle TEXT,
    years_experience INTEGER DEFAULT 0,
    projects_completed INTEGER DEFAULT 0,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Projects table
  CREATE TABLE IF NOT EXISTS projects (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    description TEXT,
    short_description TEXT,
    image_url TEXT,
    live_url TEXT,
    github_url TEXT,
    technologies TEXT,
    category TEXT,
    featured INTEGER DEFAULT 0,
    order_index INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Skills table
  CREATE TABLE IF NOT EXISTS skills (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    proficiency INTEGER DEFAULT 80,
    icon TEXT,
    color TEXT,
    order_index INTEGER DEFAULT 0
  );

  -- Chatbot configuration table
  CREATE TABLE IF NOT EXISTS chatbot_config (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    bot_name TEXT DEFAULT 'Asistan',
    welcome_message TEXT DEFAULT 'Merhaba! Size nasıl yardımcı olabilirim?',
    fallback_message TEXT DEFAULT 'Üzgünüm, bu soruyu anlayamadım. Başka bir şey sormak ister misiniz?',
    bot_avatar TEXT,
    theme_color TEXT DEFAULT '#6366f1',
    is_active INTEGER DEFAULT 1,
    response_delay INTEGER DEFAULT 500,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Chatbot Q&A pairs table
  CREATE TABLE IF NOT EXISTS chatbot_qa (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    keywords TEXT NOT NULL,
    question TEXT NOT NULL,
    answer TEXT NOT NULL,
    category TEXT,
    is_active INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    hit_count INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Chat messages history table
  CREATE TABLE IF NOT EXISTS chat_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    visitor_name TEXT,
    message TEXT NOT NULL,
    response TEXT,
    matched_qa_id INTEGER,
    ip_address TEXT,
    user_agent TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (matched_qa_id) REFERENCES chatbot_qa(id)
  );

  -- Contact messages table
  CREATE TABLE IF NOT EXISTS contact_messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL,
    subject TEXT,
    message TEXT NOT NULL,
    is_read INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Site settings table
  CREATE TABLE IF NOT EXISTS site_settings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    key TEXT UNIQUE NOT NULL,
    value TEXT,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Experiences/Events table
  CREATE TABLE IF NOT EXISTS experiences (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    organization TEXT,
    description TEXT,
    start_date TEXT,
    end_date TEXT,
    location TEXT,
    type TEXT DEFAULT 'work',
    image_url TEXT,
    link_url TEXT,
    is_current INTEGER DEFAULT 0,
    is_visible INTEGER DEFAULT 1,
    order_index INTEGER DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  -- Skill categories table
  CREATE TABLE IF NOT EXISTS skill_categories (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT UNIQUE NOT NULL,
    icon TEXT,
    color TEXT,
    order_index INTEGER DEFAULT 0
  );

  -- Visitor analytics table
  CREATE TABLE IF NOT EXISTS visitors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    visitor_id TEXT NOT NULL,
    page_visited TEXT,
    referrer TEXT,
    ip_address TEXT,
    user_agent TEXT,
    country TEXT,
    visited_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );
`);

// Check if admin exists, if not create default admin
const adminExists = db.prepare('SELECT COUNT(*) as count FROM admins').get();
if (adminExists.count === 0) {
  const hashedPassword = bcrypt.hashSync('admin123', 10);
  db.prepare('INSERT INTO admins (username, password_hash) VALUES (?, ?)').run('admin', hashedPassword);
  console.log('✅ Default admin created (username: admin, password: admin123)');
}

// Check if profile exists, if not create default profile
const profileExists = db.prepare('SELECT COUNT(*) as count FROM profile').get();
if (profileExists.count === 0) {
  db.prepare(`
    INSERT INTO profile (full_name, title, bio, hero_subtitle, email, location, years_experience, projects_completed)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `).run(
    'Yusuf',
    'Robotik & Görüntü İşleme Mühendisi',
    'Merhaba! Otonom sistemler, araç görüntü işleme ve robotik simülasyon alanlarında uzmanım. ROS, Gazebo ve bilgisayarlı görü teknolojileri ile akıllı sistemler geliştiriyorum. Araştırma ve geliştirme odaklı çalışmalarımla geleceğin otonom teknolojilerine katkıda bulunuyorum.',
    'Otonom sistemler ve yapay zeka ile geleceği şekillendiriyorum',
    'hello@example.com',
    'Türkiye',
    3,
    12
  );
  console.log('✅ Default profile created');
}

// Check if chatbot config exists
const chatbotConfigExists = db.prepare('SELECT COUNT(*) as count FROM chatbot_config').get();
if (chatbotConfigExists.count === 0) {
  db.prepare(`
    INSERT INTO chatbot_config (bot_name, welcome_message, fallback_message, theme_color, is_active)
    VALUES (?, ?, ?, ?, ?)
  `).run(
    'RoboAsistan',
    'Merhaba! 🤖 Ben Yusuf\'un sanal asistanıyım. Robotik ve görüntü işleme hakkında sorularınızı yanıtlayabilirim!',
    'Hmm, bu soruyu tam anlayamadım. İletişim sayfasından Yusuf\'a doğrudan mesaj gönderebilirsiniz! 📧',
    '#10b981',
    1
  );
  console.log('✅ Default chatbot config created');
}

// Add default chatbot Q&A pairs
const qaExists = db.prepare('SELECT COUNT(*) as count FROM chatbot_qa').get();
if (qaExists.count === 0) {
  const defaultQAs = [
    {
      keywords: 'merhaba,selam,hey,naber,nasılsın',
      question: 'Merhaba / Selam',
      answer: 'Merhaba! 👋 Hoş geldiniz! Size nasıl yardımcı olabilirim?',
      category: 'greeting'
    },
    {
      keywords: 'kimsin,sen kimsin,nedir,ne yapıyorsun',
      question: 'Sen kimsin?',
      answer: 'Ben Yusuf\'un portfolyo sitesindeki sanal asistanıyım. Robotik ve görüntü işleme hakkında sorularınızı yanıtlayabilirim! 🤖',
      category: 'about'
    },
    {
      keywords: 'yusuf,hakkında,kim,tanıt',
      question: 'Yusuf kimdir?',
      answer: 'Yusuf, robotik ve araç görüntü işleme alanında uzman bir mühendistir. ROS, Gazebo ve bilgisayarlı görü teknolojileri ile otonom sistemler geliştirmektedir. Detaylar için "Hakkımda" bölümüne göz atabilirsiniz! 🤖',
      category: 'about'
    },
    {
      keywords: 'iletişim,email,mail,ulaş,telefon,contact',
      question: 'İletişim bilgileri nedir?',
      answer: 'Yusuf\'a ulaşmak için sayfanın alt kısmındaki iletişim formunu kullanabilir veya sosyal medya hesaplarından mesaj gönderebilirsiniz! 📧',
      category: 'contact'
    },
    {
      keywords: 'proje,projeler,çalışma,portfolio,iş',
      question: 'Hangi projeleri yaptı?',
      answer: 'Yusuf; otonom araç sistemleri, nesne algılama, SLAM ve robotik simülasyon projeleri geliştirdi. "Projeler" bölümünden tüm çalışmalarını inceleyebilirsiniz! 🚗',
      category: 'projects'
    },
    {
      keywords: 'teknoloji,dil,framework,yetenek,skill,bilgi',
      question: 'Hangi teknolojileri biliyor?',
      answer: 'Yusuf; ROS/ROS2, Gazebo, OpenCV, Python, C++, YOLO, TensorFlow ve daha birçok robotik/AI teknolojisinde deneyimlidir. "Yetenekler" bölümünden detaylı listeye ulaşabilirsiniz! 🤖',
      category: 'skills'
    },
    {
      keywords: 'cv,özgeçmiş,resume,indir,download',
      question: 'CV\'sini indirebilir miyim?',
      answer: 'Evet! Sayfanın üst kısmındaki "CV İndir" butonuna tıklayarak Yusuf\'un güncel CV\'sini PDF olarak indirebilirsiniz. 📄',
      category: 'cv'
    },
    {
      keywords: 'teşekkür,sağol,eyvallah,thanks',
      question: 'Teşekkürler',
      answer: 'Rica ederim! 😊 Başka sorularınız olursa çekinmeden sorabilirsiniz.',
      category: 'greeting'
    },
    {
      keywords: 'güle güle,görüşürüz,bye,hoşçakal',
      question: 'Güle güle',
      answer: 'Görüşmek üzere! 👋 İyi günler dilerim. Tekrar bekleriz!',
      category: 'greeting'
    }
  ];

  const insertQA = db.prepare(`
    INSERT INTO chatbot_qa (keywords, question, answer, category, is_active, order_index)
    VALUES (?, ?, ?, ?, 1, ?)
  `);

  defaultQAs.forEach((qa, index) => {
    insertQA.run(qa.keywords, qa.question, qa.answer, qa.category, index);
  });
  console.log('✅ Default chatbot Q&A pairs created');
}

// Add default skills
const skillsExist = db.prepare('SELECT COUNT(*) as count FROM skills').get();
if (skillsExist.count === 0) {
  const defaultSkills = [
    // Robotik
    { name: 'ROS/ROS2', category: 'Robotik', proficiency: 92, icon: 'ros', color: '#22314E' },
    { name: 'Gazebo', category: 'Robotik', proficiency: 88, icon: 'gazebo', color: '#F58220' },
    { name: 'SLAM', category: 'Robotik', proficiency: 80, icon: 'slam', color: '#00D4AA' },
    { name: 'Robot Kinematiği', category: 'Robotik', proficiency: 75, icon: 'robot', color: '#FF6B6B' },
    // Görüntü İşleme
    { name: 'OpenCV', category: 'Görüntü İşleme', proficiency: 90, icon: 'opencv', color: '#5C3EE8' },
    { name: 'YOLO', category: 'Görüntü İşleme', proficiency: 85, icon: 'yolo', color: '#00FFFF' },
    { name: 'TensorFlow', category: 'Görüntü İşleme', proficiency: 78, icon: 'tensorflow', color: '#FF6F00' },
    { name: 'PyTorch', category: 'Görüntü İşleme', proficiency: 75, icon: 'pytorch', color: '#EE4C2C' },
    // Programlama
    { name: 'Python', category: 'Programlama', proficiency: 95, icon: 'python', color: '#3776AB' },
    { name: 'C++', category: 'Programlama', proficiency: 85, icon: 'cpp', color: '#00599C' },
    { name: 'MATLAB', category: 'Programlama', proficiency: 80, icon: 'matlab', color: '#E16737' },
    { name: 'Linux', category: 'Programlama', proficiency: 88, icon: 'linux', color: '#FCC624' },
    // Araçlar
    { name: 'Git', category: 'Araçlar', proficiency: 90, icon: 'git', color: '#F05032' },
    { name: 'Docker', category: 'Araçlar', proficiency: 75, icon: 'docker', color: '#2496ED' },
    { name: 'RViz', category: 'Araçlar', proficiency: 85, icon: 'rviz', color: '#4A90D9' },
    { name: 'PCL', category: 'Araçlar', proficiency: 70, icon: 'pcl', color: '#00AA00' }
  ];

  const insertSkill = db.prepare(`
    INSERT INTO skills (name, category, proficiency, icon, color, order_index)
    VALUES (?, ?, ?, ?, ?, ?)
  `);

  defaultSkills.forEach((skill, index) => {
    insertSkill.run(skill.name, skill.category, skill.proficiency, skill.icon, skill.color, index);
  });
  console.log('✅ Default skills created');
}

// Add sample projects
const projectsExist = db.prepare('SELECT COUNT(*) as count FROM projects').get();
if (projectsExist.count === 0) {
  const defaultProjects = [
    {
      title: 'Otonom Araç Algılama Sistemi',
      description: 'Gerçek zamanlı nesne algılama ve takip sistemi. YOLO ve DeepSORT algoritmaları kullanarak araçları, yayaları ve trafik işaretlerini tespit eder. LiDAR ve kamera füzyonu ile 3D algılama sağlar.',
      short_description: 'Gerçek zamanlı nesne algılama ve takip',
      image_url: 'https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800',
      technologies: 'Python,YOLO,OpenCV,ROS2,TensorRT',
      category: 'Görüntü İşleme',
      featured: 1
    },
    {
      title: 'Mobil Robot SLAM Projesi',
      description: 'ROS2 tabanlı mobil robot için eşzamanlı konum belirleme ve haritalama (SLAM) sistemi. Cartographer ve Nav2 stack kullanarak otonom navigasyon sağlar.',
      short_description: 'LiDAR tabanlı SLAM ve navigasyon',
      image_url: 'https://images.unsplash.com/photo-1485827404703-89b55fcc595e?w=800',
      technologies: 'ROS2,Gazebo,Cartographer,Nav2,C++',
      category: 'Robotik',
      featured: 1
    },
    {
      title: 'Şerit Takip Sistemi',
      description: 'Kamera görüntüsünden şerit çizgilerini algılayan ve aracın şeritte kalmasını sağlayan kontrol sistemi. Perspektif dönüşümü ve polinom eğri uydurma algoritmaları kullanır.',
      short_description: 'Bilgisayarlı görü ile şerit algılama',
      image_url: 'https://images.unsplash.com/photo-1449965408869-eaa3f722e40d?w=800',
      technologies: 'Python,OpenCV,NumPy,ROS',
      category: 'Görüntü İşleme',
      featured: 1
    },
    {
      title: 'Gazebo Simülasyon Ortamı',
      description: 'Özel tasarlanmış robot modelleri ve gerçekçi sensör simülasyonları içeren Gazebo ortamı. URDF/SDF modelleme, sensör eklentileri ve fizik simülasyonu.',
      short_description: 'Robotik simülasyon ortamı geliştirme',
      image_url: 'https://images.unsplash.com/photo-1518314916381-77a37c2a49ae?w=800',
      technologies: 'Gazebo,ROS2,URDF,SDF,Python',
      category: 'Robotik',
      featured: 0
    },
    {
      title: '3D Nokta Bulutu İşleme',
      description: 'LiDAR sensöründen alınan 3D nokta bulutu verileri üzerinde segmentasyon, kümeleme ve nesne tanıma işlemleri. PCL ve Open3D kütüphaneleri ile geliştirildi.',
      short_description: 'LiDAR veri işleme ve analiz',
      image_url: 'https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=800',
      technologies: 'PCL,Open3D,Python,C++,ROS2',
      category: 'Görüntü İşleme',
      featured: 0
    }
  ];

  const insertProject = db.prepare(`
    INSERT INTO projects (title, description, short_description, image_url, technologies, category, featured, order_index)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?)
  `);

  defaultProjects.forEach((project, index) => {
    insertProject.run(
      project.title,
      project.description,
      project.short_description,
      project.image_url,
      project.technologies,
      project.category,
      project.featured,
      index
    );
  });
  console.log('✅ Default projects created');
}

console.log('✅ Database initialization complete!');
console.log('📁 Database location:', require('path').join(__dirname, 'portfolio.db'));

// Initialize languages
const languagesExist = db.prepare('SELECT COUNT(*) as count FROM languages').get();
if (languagesExist.count === 0) {
  const languages = [
    { code: 'tr', name: 'Turkish', native_name: 'Türkçe', flag: '🇹🇷', is_default: 1 },
    { code: 'en', name: 'English', native_name: 'English', flag: '🇬🇧', is_default: 0 },
    { code: 'de', name: 'German', native_name: 'Deutsch', flag: '🇩🇪', is_default: 0 },
    { code: 'fr', name: 'French', native_name: 'Français', flag: '🇫🇷', is_default: 0 },
    { code: 'es', name: 'Spanish', native_name: 'Español', flag: '🇪🇸', is_default: 0 },
    { code: 'pt', name: 'Portuguese', native_name: 'Português', flag: '🇵🇹', is_default: 0 },
    { code: 'it', name: 'Italian', native_name: 'Italiano', flag: '🇮🇹', is_default: 0 },
    { code: 'ru', name: 'Russian', native_name: 'Русский', flag: '🇷🇺', is_default: 0 },
    { code: 'zh', name: 'Chinese', native_name: '中文', flag: '🇨🇳', is_default: 0 },
    { code: 'ja', name: 'Japanese', native_name: '日本語', flag: '🇯🇵', is_default: 0 },
    { code: 'ko', name: 'Korean', native_name: '한국어', flag: '🇰🇷', is_default: 0 },
    { code: 'ar', name: 'Arabic', native_name: 'العربية', flag: '🇸🇦', is_default: 0 },
    { code: 'hi', name: 'Hindi', native_name: 'हिन्दी', flag: '🇮🇳', is_default: 0 },
    { code: 'nl', name: 'Dutch', native_name: 'Nederlands', flag: '🇳🇱', is_default: 0 },
    { code: 'pl', name: 'Polish', native_name: 'Polski', flag: '🇵🇱', is_default: 0 }
  ];

  const insertLang = db.prepare(`
    INSERT INTO languages (code, name, native_name, flag, is_active, is_default, order_index)
    VALUES (?, ?, ?, ?, 1, ?, ?)
  `);

  languages.forEach((lang, index) => {
    insertLang.run(lang.code, lang.name, lang.native_name, lang.flag, lang.is_default, index);
  });
  console.log('✅ Languages initialized (15 languages)');
}

// Initialize default translations for all 15 languages
const translationsExist = db.prepare('SELECT COUNT(*) as count FROM translations').get();
if (translationsExist.count === 0) {
  const allTranslations = {
    // Turkish (Default)
    tr: {
      'nav.home': 'Ana Sayfa',
      'nav.about': 'Hakkımda',
      'nav.skills': 'Yetenekler',
      'nav.experiences': 'Deneyimler',
      'nav.projects': 'Projeler',
      'nav.contact': 'İletişim',
      'nav.download_cv': 'CV İndir',
      'hero.greeting': 'Merhaba, ben',
      'hero.scroll_down': 'Aşağı Kaydır',
      'hero.view_projects': 'Projelerimi Gör',
      'hero.contact_me': 'İletişime Geç',
      'hero.open_to_work': 'Yeni projelere açığım',
      'about.title': 'Hakkımda',
      'about.subtitle': 'Kim Olduğumu Keşfedin',
      'about.years_exp': 'Yıl Deneyim',
      'about.projects_done': 'Proje Tamamlandı',
      'skills.title': 'Yetenekler',
      'skills.subtitle': 'Teknik Becerilerim',
      'projects.title': 'Projeler',
      'projects.subtitle': 'Son Çalışmalarım',
      'projects.view_all': 'Tümünü Gör',
      'projects.view_project': 'Projeyi Gör',
      'projects.github': 'GitHub',
      'projects.featured': 'Öne Çıkan',
      'projects.all': 'Tümü',
      'projects.live_demo': 'Canlı Demo',
      'projects.source_code': 'Kaynak Kod',
      'projects.technologies': 'Teknolojiler',
      'projects.no_projects': 'Bu kategoride proje bulunmuyor',
      'contact.title': 'İletişim',
      'contact.subtitle': 'Benimle İletişime Geçin',
      'contact.name': 'Adınız',
      'contact.email': 'E-posta Adresiniz',
      'contact.subject': 'Konu',
      'contact.message': 'Mesajınız',
      'contact.send': 'Mesaj Gönder',
      'contact.sending': 'Gönderiliyor...',
      'contact.success': 'Mesajınız başarıyla gönderildi!',
      'contact.error': 'Bir hata oluştu. Lütfen tekrar deneyin.',
      'contact.info_title': 'İletişim Bilgileri',
      'contact.location': 'Konum',
      'contact.phone': 'Telefon',
      'footer.rights': 'Tüm hakları saklıdır.',
      'footer.made_with': 'ile yapıldı',
      'footer.quick_links': 'Hızlı Bağlantılar',
      'footer.back_to_top': 'Yukarı Çık',
      'chatbot.placeholder': 'Bir mesaj yazın...',
      'chatbot.send': 'Gönder',
      'chatbot.title': 'Asistan',
      'chatbot.online': 'Çevrimiçi',
      'chatbot.error': 'Mesaj gönderilemedi. Lütfen tekrar deneyin.',
      'common.loading': 'Yükleniyor...',
      'common.error': 'Hata',
      'common.success': 'Başarılı',
      'common.cancel': 'İptal',
      'common.save': 'Kaydet',
      'common.delete': 'Sil',
      'common.edit': 'Düzenle',
      'common.close': 'Kapat',
      'maintenance.title': 'Bakım Modu',
      'maintenance.message': 'Site şu anda bakım modunda. Kısa bir süre içinde geri döneceğiz.',
      'maintenance.working': 'Çalışmalarımız devam ediyor...'
    },
    // English
    en: {
      'nav.home': 'Home',
      'nav.about': 'About',
      'nav.skills': 'Skills',
      'nav.experiences': 'Experiences',
      'nav.projects': 'Projects',
      'nav.contact': 'Contact',
      'nav.download_cv': 'Download CV',
      'hero.greeting': 'Hello, I am',
      'hero.scroll_down': 'Scroll Down',
      'hero.view_projects': 'View Projects',
      'hero.contact_me': 'Contact Me',
      'hero.open_to_work': 'Open to new projects',
      'about.title': 'About Me',
      'about.subtitle': 'Discover Who I Am',
      'about.years_exp': 'Years Experience',
      'about.projects_done': 'Projects Completed',
      'skills.title': 'Skills',
      'skills.subtitle': 'My Technical Skills',
      'projects.title': 'Projects',
      'projects.subtitle': 'My Recent Work',
      'projects.view_all': 'View All',
      'projects.view_project': 'View Project',
      'projects.github': 'GitHub',
      'projects.featured': 'Featured',
      'projects.all': 'All',
      'projects.live_demo': 'Live Demo',
      'projects.source_code': 'Source Code',
      'projects.technologies': 'Technologies',
      'projects.no_projects': 'No projects in this category',
      'contact.title': 'Contact',
      'contact.subtitle': 'Get In Touch With Me',
      'contact.name': 'Your Name',
      'contact.email': 'Your Email',
      'contact.subject': 'Subject',
      'contact.message': 'Your Message',
      'contact.send': 'Send Message',
      'contact.sending': 'Sending...',
      'contact.success': 'Message sent successfully!',
      'contact.error': 'An error occurred. Please try again.',
      'contact.info_title': 'Contact Information',
      'contact.location': 'Location',
      'contact.phone': 'Phone',
      'footer.rights': 'All rights reserved.',
      'footer.made_with': 'Made with',
      'footer.quick_links': 'Quick Links',
      'footer.back_to_top': 'Back to Top',
      'chatbot.placeholder': 'Type a message...',
      'chatbot.send': 'Send',
      'chatbot.title': 'Assistant',
      'chatbot.online': 'Online',
      'chatbot.error': 'Failed to send message. Please try again.',
      'common.loading': 'Loading...',
      'common.error': 'Error',
      'common.success': 'Success',
      'common.cancel': 'Cancel',
      'common.save': 'Save',
      'common.delete': 'Delete',
      'common.edit': 'Edit',
      'common.close': 'Close',
      'maintenance.title': 'Maintenance Mode',
      'maintenance.message': 'The site is currently under maintenance. We will be back soon.',
      'maintenance.working': 'We are working on it...'
    },
    // German
    de: {
      'nav.home': 'Startseite',
      'nav.about': 'Über Mich',
      'nav.skills': 'Fähigkeiten',
      'nav.experiences': 'Erfahrungen',
      'nav.projects': 'Projekte',
      'nav.contact': 'Kontakt',
      'nav.download_cv': 'Lebenslauf',
      'hero.greeting': 'Hallo, ich bin',
      'hero.scroll_down': 'Nach Unten',
      'hero.view_projects': 'Projekte Ansehen',
      'hero.contact_me': 'Kontaktieren',
      'hero.open_to_work': 'Offen für neue Projekte',
      'about.title': 'Über Mich',
      'about.subtitle': 'Entdecken Sie Wer Ich Bin',
      'about.years_exp': 'Jahre Erfahrung',
      'about.projects_done': 'Projekte Abgeschlossen',
      'skills.title': 'Fähigkeiten',
      'skills.subtitle': 'Meine Technischen Fähigkeiten',
      'projects.title': 'Projekte',
      'projects.subtitle': 'Meine Neuesten Arbeiten',
      'projects.view_all': 'Alle Ansehen',
      'projects.view_project': 'Projekt Ansehen',
      'projects.github': 'GitHub',
      'projects.featured': 'Empfohlen',
      'projects.all': 'Alle',
      'projects.live_demo': 'Live Demo',
      'projects.source_code': 'Quellcode',
      'projects.technologies': 'Technologien',
      'projects.no_projects': 'Keine Projekte in dieser Kategorie',
      'contact.title': 'Kontakt',
      'contact.subtitle': 'Kontaktieren Sie Mich',
      'contact.name': 'Ihr Name',
      'contact.email': 'Ihre E-Mail',
      'contact.subject': 'Betreff',
      'contact.message': 'Ihre Nachricht',
      'contact.send': 'Nachricht Senden',
      'contact.sending': 'Wird gesendet...',
      'contact.success': 'Nachricht erfolgreich gesendet!',
      'contact.error': 'Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.',
      'contact.info_title': 'Kontaktinformationen',
      'contact.location': 'Standort',
      'contact.phone': 'Telefon',
      'footer.rights': 'Alle Rechte vorbehalten.',
      'footer.made_with': 'Erstellt mit',
      'footer.quick_links': 'Schnelllinks',
      'footer.back_to_top': 'Nach Oben',
      'chatbot.placeholder': 'Nachricht eingeben...',
      'chatbot.send': 'Senden',
      'chatbot.title': 'Assistent',
      'chatbot.online': 'Online',
      'chatbot.error': 'Nachricht konnte nicht gesendet werden.',
      'common.loading': 'Wird geladen...',
      'common.error': 'Fehler',
      'common.success': 'Erfolg',
      'common.cancel': 'Abbrechen',
      'common.save': 'Speichern',
      'common.delete': 'Löschen',
      'common.edit': 'Bearbeiten',
      'common.close': 'Schließen',
      'maintenance.title': 'Wartungsmodus',
      'maintenance.message': 'Die Website befindet sich derzeit im Wartungsmodus.',
      'maintenance.working': 'Wir arbeiten daran...'
    },
    // French
    fr: {
      'nav.home': 'Accueil',
      'nav.about': 'À Propos',
      'nav.skills': 'Compétences',
      'nav.experiences': 'Expériences',
      'nav.projects': 'Projets',
      'nav.contact': 'Contact',
      'nav.download_cv': 'Télécharger CV',
      'hero.greeting': 'Bonjour, je suis',
      'hero.scroll_down': 'Défiler',
      'hero.view_projects': 'Voir Projets',
      'hero.contact_me': 'Me Contacter',
      'hero.open_to_work': 'Ouvert aux nouveaux projets',
      'about.title': 'À Propos',
      'about.subtitle': 'Découvrez Qui Je Suis',
      'about.years_exp': 'Ans d\'Expérience',
      'about.projects_done': 'Projets Réalisés',
      'skills.title': 'Compétences',
      'skills.subtitle': 'Mes Compétences Techniques',
      'projects.title': 'Projets',
      'projects.subtitle': 'Mes Travaux Récents',
      'projects.view_all': 'Tout Voir',
      'projects.view_project': 'Voir Projet',
      'projects.github': 'GitHub',
      'projects.featured': 'En Vedette',
      'projects.all': 'Tous',
      'projects.live_demo': 'Démo',
      'projects.source_code': 'Code Source',
      'projects.technologies': 'Technologies',
      'projects.no_projects': 'Aucun projet dans cette catégorie',
      'contact.title': 'Contact',
      'contact.subtitle': 'Contactez-Moi',
      'contact.name': 'Votre Nom',
      'contact.email': 'Votre Email',
      'contact.subject': 'Sujet',
      'contact.message': 'Votre Message',
      'contact.send': 'Envoyer',
      'contact.sending': 'Envoi en cours...',
      'contact.success': 'Message envoyé avec succès!',
      'contact.error': 'Une erreur est survenue. Veuillez réessayer.',
      'contact.info_title': 'Coordonnées',
      'contact.location': 'Localisation',
      'contact.phone': 'Téléphone',
      'footer.rights': 'Tous droits réservés.',
      'footer.made_with': 'Fait avec',
      'footer.quick_links': 'Liens Rapides',
      'footer.back_to_top': 'Retour en Haut',
      'chatbot.placeholder': 'Tapez un message...',
      'chatbot.send': 'Envoyer',
      'chatbot.title': 'Assistant',
      'chatbot.online': 'En Ligne',
      'chatbot.error': 'Échec de l\'envoi. Veuillez réessayer.',
      'common.loading': 'Chargement...',
      'common.error': 'Erreur',
      'common.success': 'Succès',
      'common.cancel': 'Annuler',
      'common.save': 'Enregistrer',
      'common.delete': 'Supprimer',
      'common.edit': 'Modifier',
      'common.close': 'Fermer',
      'maintenance.title': 'Mode Maintenance',
      'maintenance.message': 'Le site est en maintenance. Nous serons bientôt de retour.',
      'maintenance.working': 'Nous travaillons dessus...'
    },
    // Spanish
    es: {
      'nav.home': 'Inicio',
      'nav.about': 'Sobre Mí',
      'nav.skills': 'Habilidades',
      'nav.experiences': 'Experiencias',
      'nav.projects': 'Proyectos',
      'nav.contact': 'Contacto',
      'nav.download_cv': 'Descargar CV',
      'hero.greeting': 'Hola, soy',
      'hero.scroll_down': 'Desplazar',
      'hero.view_projects': 'Ver Proyectos',
      'hero.contact_me': 'Contáctame',
      'hero.open_to_work': 'Abierto a nuevos proyectos',
      'about.title': 'Sobre Mí',
      'about.subtitle': 'Descubre Quién Soy',
      'about.years_exp': 'Años de Experiencia',
      'about.projects_done': 'Proyectos Completados',
      'skills.title': 'Habilidades',
      'skills.subtitle': 'Mis Habilidades Técnicas',
      'projects.title': 'Proyectos',
      'projects.subtitle': 'Mis Trabajos Recientes',
      'projects.view_all': 'Ver Todos',
      'projects.view_project': 'Ver Proyecto',
      'projects.github': 'GitHub',
      'projects.featured': 'Destacado',
      'projects.all': 'Todos',
      'projects.live_demo': 'Demo',
      'projects.source_code': 'Código Fuente',
      'projects.technologies': 'Tecnologías',
      'projects.no_projects': 'No hay proyectos en esta categoría',
      'contact.title': 'Contacto',
      'contact.subtitle': 'Ponte en Contacto',
      'contact.name': 'Tu Nombre',
      'contact.email': 'Tu Email',
      'contact.subject': 'Asunto',
      'contact.message': 'Tu Mensaje',
      'contact.send': 'Enviar Mensaje',
      'contact.sending': 'Enviando...',
      'contact.success': '¡Mensaje enviado con éxito!',
      'contact.error': 'Ocurrió un error. Por favor, inténtalo de nuevo.',
      'contact.info_title': 'Información de Contacto',
      'contact.location': 'Ubicación',
      'contact.phone': 'Teléfono',
      'footer.rights': 'Todos los derechos reservados.',
      'footer.made_with': 'Hecho con',
      'footer.quick_links': 'Enlaces Rápidos',
      'footer.back_to_top': 'Volver Arriba',
      'chatbot.placeholder': 'Escribe un mensaje...',
      'chatbot.send': 'Enviar',
      'chatbot.title': 'Asistente',
      'chatbot.online': 'En Línea',
      'chatbot.error': 'No se pudo enviar. Inténtalo de nuevo.',
      'common.loading': 'Cargando...',
      'common.error': 'Error',
      'common.success': 'Éxito',
      'common.cancel': 'Cancelar',
      'common.save': 'Guardar',
      'common.delete': 'Eliminar',
      'common.edit': 'Editar',
      'common.close': 'Cerrar',
      'maintenance.title': 'Modo Mantenimiento',
      'maintenance.message': 'El sitio está en mantenimiento. Volveremos pronto.',
      'maintenance.working': 'Estamos trabajando en ello...'
    },
    // Portuguese
    pt: {
      'nav.home': 'Início',
      'nav.about': 'Sobre',
      'nav.skills': 'Habilidades',
      'nav.experiences': 'Experiências',
      'nav.projects': 'Projetos',
      'nav.contact': 'Contato',
      'nav.download_cv': 'Baixar CV',
      'hero.greeting': 'Olá, eu sou',
      'hero.scroll_down': 'Rolar',
      'hero.view_projects': 'Ver Projetos',
      'hero.contact_me': 'Contate-me',
      'hero.open_to_work': 'Aberto a novos projetos',
      'about.title': 'Sobre Mim',
      'about.subtitle': 'Descubra Quem Sou',
      'about.years_exp': 'Anos de Experiência',
      'about.projects_done': 'Projetos Concluídos',
      'skills.title': 'Habilidades',
      'skills.subtitle': 'Minhas Habilidades Técnicas',
      'projects.title': 'Projetos',
      'projects.subtitle': 'Meus Trabalhos Recentes',
      'projects.view_all': 'Ver Todos',
      'projects.view_project': 'Ver Projeto',
      'projects.github': 'GitHub',
      'projects.featured': 'Destaque',
      'projects.all': 'Todos',
      'projects.live_demo': 'Demo',
      'projects.source_code': 'Código Fonte',
      'projects.technologies': 'Tecnologias',
      'projects.no_projects': 'Nenhum projeto nesta categoria',
      'contact.title': 'Contato',
      'contact.subtitle': 'Entre em Contato',
      'contact.name': 'Seu Nome',
      'contact.email': 'Seu Email',
      'contact.subject': 'Assunto',
      'contact.message': 'Sua Mensagem',
      'contact.send': 'Enviar Mensagem',
      'contact.sending': 'Enviando...',
      'contact.success': 'Mensagem enviada com sucesso!',
      'contact.error': 'Ocorreu um erro. Por favor, tente novamente.',
      'contact.info_title': 'Informações de Contato',
      'contact.location': 'Localização',
      'contact.phone': 'Telefone',
      'footer.rights': 'Todos os direitos reservados.',
      'footer.made_with': 'Feito com',
      'footer.quick_links': 'Links Rápidos',
      'footer.back_to_top': 'Voltar ao Topo',
      'chatbot.placeholder': 'Digite uma mensagem...',
      'chatbot.send': 'Enviar',
      'chatbot.title': 'Assistente',
      'chatbot.online': 'Online',
      'chatbot.error': 'Falha ao enviar. Tente novamente.',
      'common.loading': 'Carregando...',
      'common.error': 'Erro',
      'common.success': 'Sucesso',
      'common.cancel': 'Cancelar',
      'common.save': 'Salvar',
      'common.delete': 'Excluir',
      'common.edit': 'Editar',
      'common.close': 'Fechar',
      'maintenance.title': 'Modo Manutenção',
      'maintenance.message': 'O site está em manutenção. Voltaremos em breve.',
      'maintenance.working': 'Estamos trabalhando nisso...'
    },
    // Italian
    it: {
      'nav.home': 'Home',
      'nav.about': 'Chi Sono',
      'nav.skills': 'Competenze',
      'nav.experiences': 'Esperienze',
      'nav.projects': 'Progetti',
      'nav.contact': 'Contatti',
      'nav.download_cv': 'Scarica CV',
      'hero.greeting': 'Ciao, sono',
      'hero.scroll_down': 'Scorri',
      'hero.view_projects': 'Vedi Progetti',
      'hero.contact_me': 'Contattami',
      'hero.open_to_work': 'Aperto a nuovi progetti',
      'about.title': 'Chi Sono',
      'about.subtitle': 'Scopri Chi Sono',
      'about.years_exp': 'Anni di Esperienza',
      'about.projects_done': 'Progetti Completati',
      'skills.title': 'Competenze',
      'skills.subtitle': 'Le Mie Competenze Tecniche',
      'projects.title': 'Progetti',
      'projects.subtitle': 'I Miei Lavori Recenti',
      'projects.view_all': 'Vedi Tutti',
      'projects.view_project': 'Vedi Progetto',
      'projects.github': 'GitHub',
      'projects.featured': 'In Evidenza',
      'projects.all': 'Tutti',
      'projects.live_demo': 'Demo',
      'projects.source_code': 'Codice Sorgente',
      'projects.technologies': 'Tecnologie',
      'projects.no_projects': 'Nessun progetto in questa categoria',
      'contact.title': 'Contatti',
      'contact.subtitle': 'Contattami',
      'contact.name': 'Il Tuo Nome',
      'contact.email': 'La Tua Email',
      'contact.subject': 'Oggetto',
      'contact.message': 'Il Tuo Messaggio',
      'contact.send': 'Invia Messaggio',
      'contact.sending': 'Invio in corso...',
      'contact.success': 'Messaggio inviato con successo!',
      'contact.error': 'Si è verificato un errore. Riprova.',
      'contact.info_title': 'Informazioni di Contatto',
      'contact.location': 'Posizione',
      'contact.phone': 'Telefono',
      'footer.rights': 'Tutti i diritti riservati.',
      'footer.made_with': 'Fatto con',
      'footer.quick_links': 'Link Rapidi',
      'footer.back_to_top': 'Torna Su',
      'chatbot.placeholder': 'Scrivi un messaggio...',
      'chatbot.send': 'Invia',
      'chatbot.title': 'Assistente',
      'chatbot.online': 'Online',
      'chatbot.error': 'Invio fallito. Riprova.',
      'common.loading': 'Caricamento...',
      'common.error': 'Errore',
      'common.success': 'Successo',
      'common.cancel': 'Annulla',
      'common.save': 'Salva',
      'common.delete': 'Elimina',
      'common.edit': 'Modifica',
      'common.close': 'Chiudi',
      'maintenance.title': 'Modalità Manutenzione',
      'maintenance.message': 'Il sito è in manutenzione. Torneremo presto.',
      'maintenance.working': 'Ci stiamo lavorando...'
    },
    // Russian
    ru: {
      'nav.home': 'Главная',
      'nav.about': 'Обо Мне',
      'nav.skills': 'Навыки',
      'nav.experiences': 'Опыт',
      'nav.projects': 'Проекты',
      'nav.contact': 'Контакты',
      'nav.download_cv': 'Скачать CV',
      'hero.greeting': 'Привет, я',
      'hero.scroll_down': 'Прокрутить',
      'hero.view_projects': 'Мои Проекты',
      'hero.contact_me': 'Связаться',
      'hero.open_to_work': 'Открыт для новых проектов',
      'about.title': 'Обо Мне',
      'about.subtitle': 'Узнайте Кто Я',
      'about.years_exp': 'Лет Опыта',
      'about.projects_done': 'Завершённых Проектов',
      'skills.title': 'Навыки',
      'skills.subtitle': 'Мои Технические Навыки',
      'projects.title': 'Проекты',
      'projects.subtitle': 'Мои Недавние Работы',
      'projects.view_all': 'Смотреть Все',
      'projects.view_project': 'Смотреть Проект',
      'projects.github': 'GitHub',
      'projects.featured': 'Избранное',
      'projects.all': 'Все',
      'projects.live_demo': 'Демо',
      'projects.source_code': 'Исходный Код',
      'projects.technologies': 'Технологии',
      'projects.no_projects': 'Нет проектов в этой категории',
      'contact.title': 'Контакты',
      'contact.subtitle': 'Свяжитесь Со Мной',
      'contact.name': 'Ваше Имя',
      'contact.email': 'Ваш Email',
      'contact.subject': 'Тема',
      'contact.message': 'Ваше Сообщение',
      'contact.send': 'Отправить',
      'contact.sending': 'Отправка...',
      'contact.success': 'Сообщение успешно отправлено!',
      'contact.error': 'Произошла ошибка. Попробуйте ещё раз.',
      'contact.info_title': 'Контактная Информация',
      'contact.location': 'Местоположение',
      'contact.phone': 'Телефон',
      'footer.rights': 'Все права защищены.',
      'footer.made_with': 'Сделано с',
      'footer.quick_links': 'Быстрые Ссылки',
      'footer.back_to_top': 'Наверх',
      'chatbot.placeholder': 'Введите сообщение...',
      'chatbot.send': 'Отправить',
      'chatbot.title': 'Ассистент',
      'chatbot.online': 'Онлайн',
      'chatbot.error': 'Не удалось отправить. Попробуйте снова.',
      'common.loading': 'Загрузка...',
      'common.error': 'Ошибка',
      'common.success': 'Успешно',
      'common.cancel': 'Отмена',
      'common.save': 'Сохранить',
      'common.delete': 'Удалить',
      'common.edit': 'Редактировать',
      'common.close': 'Закрыть',
      'maintenance.title': 'Режим Обслуживания',
      'maintenance.message': 'Сайт на техническом обслуживании. Скоро вернёмся.',
      'maintenance.working': 'Мы работаем над этим...'
    },
    // Chinese
    zh: {
      'nav.home': '首页',
      'nav.about': '关于我',
      'nav.skills': '技能',
      'nav.experiences': '经历',
      'nav.projects': '项目',
      'nav.contact': '联系',
      'nav.download_cv': '下载简历',
      'hero.greeting': '你好，我是',
      'hero.scroll_down': '向下滚动',
      'hero.view_projects': '查看项目',
      'hero.contact_me': '联系我',
      'hero.open_to_work': '接受新项目',
      'about.title': '关于我',
      'about.subtitle': '了解我是谁',
      'about.years_exp': '年经验',
      'about.projects_done': '完成项目',
      'skills.title': '技能',
      'skills.subtitle': '我的技术技能',
      'projects.title': '项目',
      'projects.subtitle': '我的近期作品',
      'projects.view_all': '查看全部',
      'projects.view_project': '查看项目',
      'projects.github': 'GitHub',
      'projects.featured': '精选',
      'projects.all': '全部',
      'projects.live_demo': '演示',
      'projects.source_code': '源代码',
      'projects.technologies': '技术栈',
      'projects.no_projects': '该类别暂无项目',
      'contact.title': '联系方式',
      'contact.subtitle': '与我联系',
      'contact.name': '您的姓名',
      'contact.email': '您的邮箱',
      'contact.subject': '主题',
      'contact.message': '您的留言',
      'contact.send': '发送消息',
      'contact.sending': '发送中...',
      'contact.success': '消息发送成功！',
      'contact.error': '发生错误，请重试。',
      'contact.info_title': '联系信息',
      'contact.location': '位置',
      'contact.phone': '电话',
      'footer.rights': '版权所有。',
      'footer.made_with': '用心制作',
      'footer.quick_links': '快速链接',
      'footer.back_to_top': '返回顶部',
      'chatbot.placeholder': '输入消息...',
      'chatbot.send': '发送',
      'chatbot.title': '助手',
      'chatbot.online': '在线',
      'chatbot.error': '发送失败，请重试。',
      'common.loading': '加载中...',
      'common.error': '错误',
      'common.success': '成功',
      'common.cancel': '取消',
      'common.save': '保存',
      'common.delete': '删除',
      'common.edit': '编辑',
      'common.close': '关闭',
      'maintenance.title': '维护模式',
      'maintenance.message': '网站正在维护中，请稍后再来。',
      'maintenance.working': '我们正在努力...'
    },
    // Japanese
    ja: {
      'nav.home': 'ホーム',
      'nav.about': '私について',
      'nav.skills': 'スキル',
      'nav.experiences': '経験',
      'nav.projects': 'プロジェクト',
      'nav.contact': 'お問い合わせ',
      'nav.download_cv': '履歴書',
      'hero.greeting': 'こんにちは、',
      'hero.scroll_down': 'スクロール',
      'hero.view_projects': 'プロジェクトを見る',
      'hero.contact_me': 'お問い合わせ',
      'hero.open_to_work': '新プロジェクト募集中',
      'about.title': '私について',
      'about.subtitle': '私を知る',
      'about.years_exp': '年の経験',
      'about.projects_done': '完了プロジェクト',
      'skills.title': 'スキル',
      'skills.subtitle': '技術スキル',
      'projects.title': 'プロジェクト',
      'projects.subtitle': '最近の作品',
      'projects.view_all': 'すべて見る',
      'projects.view_project': '詳細を見る',
      'projects.github': 'GitHub',
      'projects.featured': '注目',
      'projects.all': 'すべて',
      'projects.live_demo': 'デモ',
      'projects.source_code': 'ソースコード',
      'projects.technologies': '技術',
      'projects.no_projects': 'このカテゴリにはプロジェクトがありません',
      'contact.title': 'お問い合わせ',
      'contact.subtitle': 'ご連絡ください',
      'contact.name': 'お名前',
      'contact.email': 'メールアドレス',
      'contact.subject': '件名',
      'contact.message': 'メッセージ',
      'contact.send': '送信',
      'contact.sending': '送信中...',
      'contact.success': 'メッセージが送信されました！',
      'contact.error': 'エラーが発生しました。もう一度お試しください。',
      'contact.info_title': '連絡先情報',
      'contact.location': '所在地',
      'contact.phone': '電話番号',
      'footer.rights': '全著作権所有。',
      'footer.made_with': '作成者',
      'footer.quick_links': 'クイックリンク',
      'footer.back_to_top': 'トップへ',
      'chatbot.placeholder': 'メッセージを入力...',
      'chatbot.send': '送信',
      'chatbot.title': 'アシスタント',
      'chatbot.online': 'オンライン',
      'chatbot.error': '送信に失敗しました。再試行してください。',
      'common.loading': '読み込み中...',
      'common.error': 'エラー',
      'common.success': '成功',
      'common.cancel': 'キャンセル',
      'common.save': '保存',
      'common.delete': '削除',
      'common.edit': '編集',
      'common.close': '閉じる',
      'maintenance.title': 'メンテナンスモード',
      'maintenance.message': 'サイトはメンテナンス中です。',
      'maintenance.working': '作業中です...'
    },
    // Korean
    ko: {
      'nav.home': '홈',
      'nav.about': '소개',
      'nav.skills': '기술',
      'nav.experiences': '경력',
      'nav.projects': '프로젝트',
      'nav.contact': '연락처',
      'nav.download_cv': '이력서',
      'hero.greeting': '안녕하세요, 저는',
      'hero.scroll_down': '스크롤',
      'hero.view_projects': '프로젝트 보기',
      'hero.contact_me': '연락하기',
      'hero.open_to_work': '새 프로젝트 가능',
      'about.title': '소개',
      'about.subtitle': '저를 알아보세요',
      'about.years_exp': '년 경력',
      'about.projects_done': '완료 프로젝트',
      'skills.title': '기술',
      'skills.subtitle': '기술 스택',
      'projects.title': '프로젝트',
      'projects.subtitle': '최근 작업',
      'projects.view_all': '전체 보기',
      'projects.view_project': '프로젝트 보기',
      'projects.github': 'GitHub',
      'projects.featured': '추천',
      'projects.all': '전체',
      'projects.live_demo': '데모',
      'projects.source_code': '소스 코드',
      'projects.technologies': '기술 스택',
      'projects.no_projects': '이 카테고리에 프로젝트가 없습니다',
      'contact.title': '연락처',
      'contact.subtitle': '연락주세요',
      'contact.name': '이름',
      'contact.email': '이메일',
      'contact.subject': '제목',
      'contact.message': '메시지',
      'contact.send': '보내기',
      'contact.sending': '전송 중...',
      'contact.success': '메시지가 전송되었습니다!',
      'contact.error': '오류가 발생했습니다. 다시 시도해주세요.',
      'contact.info_title': '연락처 정보',
      'contact.location': '위치',
      'contact.phone': '전화',
      'footer.rights': '모든 권리 보유.',
      'footer.made_with': '제작',
      'footer.quick_links': '빠른 링크',
      'footer.back_to_top': '맨 위로',
      'chatbot.placeholder': '메시지 입력...',
      'chatbot.send': '보내기',
      'chatbot.title': '어시스턴트',
      'chatbot.online': '온라인',
      'chatbot.error': '전송 실패. 다시 시도해주세요.',
      'common.loading': '로딩 중...',
      'common.error': '오류',
      'common.success': '성공',
      'common.cancel': '취소',
      'common.save': '저장',
      'common.delete': '삭제',
      'common.edit': '편집',
      'common.close': '닫기',
      'maintenance.title': '유지보수 모드',
      'maintenance.message': '사이트가 유지보수 중입니다.',
      'maintenance.working': '작업 중입니다...'
    },
    // Arabic
    ar: {
      'nav.home': 'الرئيسية',
      'nav.about': 'من أنا',
      'nav.skills': 'المهارات',
      'nav.experiences': 'الخبرات',
      'nav.projects': 'المشاريع',
      'nav.contact': 'اتصل بي',
      'nav.download_cv': 'تحميل السيرة',
      'hero.greeting': 'مرحباً، أنا',
      'hero.scroll_down': 'اسحب للأسفل',
      'hero.view_projects': 'عرض المشاريع',
      'hero.contact_me': 'تواصل معي',
      'hero.open_to_work': 'متاح لمشاريع جديدة',
      'about.title': 'من أنا',
      'about.subtitle': 'تعرف علي',
      'about.years_exp': 'سنوات خبرة',
      'about.projects_done': 'مشروع مكتمل',
      'skills.title': 'المهارات',
      'skills.subtitle': 'مهاراتي التقنية',
      'projects.title': 'المشاريع',
      'projects.subtitle': 'أعمالي الأخيرة',
      'projects.view_all': 'عرض الكل',
      'projects.view_project': 'عرض المشروع',
      'projects.github': 'GitHub',
      'projects.featured': 'مميز',
      'projects.all': 'الكل',
      'projects.live_demo': 'عرض حي',
      'projects.source_code': 'الكود المصدري',
      'projects.technologies': 'التقنيات',
      'projects.no_projects': 'لا توجد مشاريع في هذه الفئة',
      'contact.title': 'اتصل بي',
      'contact.subtitle': 'تواصل معي',
      'contact.name': 'اسمك',
      'contact.email': 'بريدك الإلكتروني',
      'contact.subject': 'الموضوع',
      'contact.message': 'رسالتك',
      'contact.send': 'إرسال الرسالة',
      'contact.sending': 'جاري الإرسال...',
      'contact.success': 'تم إرسال الرسالة بنجاح!',
      'contact.error': 'حدث خطأ. يرجى المحاولة مرة أخرى.',
      'contact.info_title': 'معلومات الاتصال',
      'contact.location': 'الموقع',
      'contact.phone': 'الهاتف',
      'footer.rights': 'جميع الحقوق محفوظة.',
      'footer.made_with': 'صنع بـ',
      'footer.quick_links': 'روابط سريعة',
      'footer.back_to_top': 'العودة للأعلى',
      'chatbot.placeholder': 'اكتب رسالة...',
      'chatbot.send': 'إرسال',
      'chatbot.title': 'المساعد',
      'chatbot.online': 'متصل',
      'chatbot.error': 'فشل الإرسال. حاول مرة أخرى.',
      'common.loading': 'جاري التحميل...',
      'common.error': 'خطأ',
      'common.success': 'نجاح',
      'common.cancel': 'إلغاء',
      'common.save': 'حفظ',
      'common.delete': 'حذف',
      'common.edit': 'تعديل',
      'common.close': 'إغلاق',
      'maintenance.title': 'وضع الصيانة',
      'maintenance.message': 'الموقع تحت الصيانة. سنعود قريباً.',
      'maintenance.working': 'نحن نعمل على ذلك...'
    },
    // Hindi
    hi: {
      'nav.home': 'होम',
      'nav.about': 'मेरे बारे में',
      'nav.skills': 'कौशल',
      'nav.experiences': 'अनुभव',
      'nav.projects': 'प्रोजेक्ट्स',
      'nav.contact': 'संपर्क',
      'nav.download_cv': 'CV डाउनलोड',
      'hero.greeting': 'नमस्ते, मैं हूं',
      'hero.scroll_down': 'नीचे स्क्रॉल करें',
      'hero.view_projects': 'प्रोजेक्ट्स देखें',
      'hero.contact_me': 'संपर्क करें',
      'hero.open_to_work': 'नए प्रोजेक्ट्स के लिए उपलब्ध',
      'about.title': 'मेरे बारे में',
      'about.subtitle': 'जानिए मैं कौन हूं',
      'about.years_exp': 'वर्ष का अनुभव',
      'about.projects_done': 'पूर्ण प्रोजेक्ट्स',
      'skills.title': 'कौशल',
      'skills.subtitle': 'मेरे तकनीकी कौशल',
      'projects.title': 'प्रोजेक्ट्स',
      'projects.subtitle': 'मेरे हाल के काम',
      'projects.view_all': 'सभी देखें',
      'projects.view_project': 'प्रोजेक्ट देखें',
      'projects.github': 'GitHub',
      'projects.featured': 'विशेष',
      'projects.all': 'सभी',
      'projects.live_demo': 'लाइव डेमो',
      'projects.source_code': 'सोर्स कोड',
      'projects.technologies': 'तकनीकें',
      'projects.no_projects': 'इस श्रेणी में कोई प्रोजेक्ट नहीं',
      'contact.title': 'संपर्क',
      'contact.subtitle': 'मुझसे संपर्क करें',
      'contact.name': 'आपका नाम',
      'contact.email': 'आपका ईमेल',
      'contact.subject': 'विषय',
      'contact.message': 'आपका संदेश',
      'contact.send': 'संदेश भेजें',
      'contact.sending': 'भेज रहा है...',
      'contact.success': 'संदेश सफलतापूर्वक भेजा गया!',
      'contact.error': 'त्रुटि हुई। कृपया पुनः प्रयास करें।',
      'contact.info_title': 'संपर्क जानकारी',
      'contact.location': 'स्थान',
      'contact.phone': 'फोन',
      'footer.rights': 'सर्वाधिकार सुरक्षित।',
      'footer.made_with': 'के साथ बनाया',
      'footer.quick_links': 'त्वरित लिंक',
      'footer.back_to_top': 'ऊपर जाएं',
      'chatbot.placeholder': 'संदेश लिखें...',
      'chatbot.send': 'भेजें',
      'chatbot.title': 'सहायक',
      'chatbot.online': 'ऑनलाइन',
      'chatbot.error': 'भेजने में विफल। पुनः प्रयास करें।',
      'common.loading': 'लोड हो रहा है...',
      'common.error': 'त्रुटि',
      'common.success': 'सफल',
      'common.cancel': 'रद्द करें',
      'common.save': 'सहेजें',
      'common.delete': 'हटाएं',
      'common.edit': 'संपादित करें',
      'common.close': 'बंद करें',
      'maintenance.title': 'रखरखाव मोड',
      'maintenance.message': 'साइट रखरखाव में है। जल्द वापस आएंगे।',
      'maintenance.working': 'हम इस पर काम कर रहे हैं...'
    },
    // Dutch
    nl: {
      'nav.home': 'Home',
      'nav.about': 'Over Mij',
      'nav.skills': 'Vaardigheden',
      'nav.experiences': 'Ervaringen',
      'nav.projects': 'Projecten',
      'nav.contact': 'Contact',
      'nav.download_cv': 'CV Downloaden',
      'hero.greeting': 'Hallo, ik ben',
      'hero.scroll_down': 'Scroll Omlaag',
      'hero.view_projects': 'Projecten Bekijken',
      'hero.contact_me': 'Contact Opnemen',
      'hero.open_to_work': 'Beschikbaar voor projecten',
      'about.title': 'Over Mij',
      'about.subtitle': 'Ontdek Wie Ik Ben',
      'about.years_exp': 'Jaar Ervaring',
      'about.projects_done': 'Projecten Afgerond',
      'skills.title': 'Vaardigheden',
      'skills.subtitle': 'Mijn Technische Vaardigheden',
      'projects.title': 'Projecten',
      'projects.subtitle': 'Mijn Recente Werk',
      'projects.view_all': 'Alles Bekijken',
      'projects.view_project': 'Project Bekijken',
      'projects.github': 'GitHub',
      'projects.featured': 'Uitgelicht',
      'projects.all': 'Alles',
      'projects.live_demo': 'Live Demo',
      'projects.source_code': 'Broncode',
      'projects.technologies': 'Technologieën',
      'projects.no_projects': 'Geen projecten in deze categorie',
      'contact.title': 'Contact',
      'contact.subtitle': 'Neem Contact Op',
      'contact.name': 'Uw Naam',
      'contact.email': 'Uw Email',
      'contact.subject': 'Onderwerp',
      'contact.message': 'Uw Bericht',
      'contact.send': 'Verstuur Bericht',
      'contact.sending': 'Verzenden...',
      'contact.success': 'Bericht succesvol verzonden!',
      'contact.error': 'Er is een fout opgetreden. Probeer het opnieuw.',
      'contact.info_title': 'Contactgegevens',
      'contact.location': 'Locatie',
      'contact.phone': 'Telefoon',
      'footer.rights': 'Alle rechten voorbehouden.',
      'footer.made_with': 'Gemaakt met',
      'footer.quick_links': 'Snelle Links',
      'footer.back_to_top': 'Naar Boven',
      'chatbot.placeholder': 'Typ een bericht...',
      'chatbot.send': 'Verstuur',
      'chatbot.title': 'Assistent',
      'chatbot.online': 'Online',
      'chatbot.error': 'Verzenden mislukt. Probeer opnieuw.',
      'common.loading': 'Laden...',
      'common.error': 'Fout',
      'common.success': 'Succes',
      'common.cancel': 'Annuleren',
      'common.save': 'Opslaan',
      'common.delete': 'Verwijderen',
      'common.edit': 'Bewerken',
      'common.close': 'Sluiten',
      'maintenance.title': 'Onderhoudsmodus',
      'maintenance.message': 'De site is in onderhoud. We zijn snel terug.',
      'maintenance.working': 'We werken eraan...'
    },
    // Polish
    pl: {
      'nav.home': 'Strona Główna',
      'nav.about': 'O Mnie',
      'nav.skills': 'Umiejętności',
      'nav.experiences': 'Doświadczenia',
      'nav.projects': 'Projekty',
      'nav.contact': 'Kontakt',
      'nav.download_cv': 'Pobierz CV',
      'hero.greeting': 'Cześć, jestem',
      'hero.scroll_down': 'Przewiń w Dół',
      'hero.view_projects': 'Zobacz Projekty',
      'hero.contact_me': 'Skontaktuj Się',
      'hero.open_to_work': 'Otwarty na nowe projekty',
      'about.title': 'O Mnie',
      'about.subtitle': 'Poznaj Mnie',
      'about.years_exp': 'Lat Doświadczenia',
      'about.projects_done': 'Ukończonych Projektów',
      'skills.title': 'Umiejętności',
      'skills.subtitle': 'Moje Umiejętności Techniczne',
      'projects.title': 'Projekty',
      'projects.subtitle': 'Moje Ostatnie Prace',
      'projects.view_all': 'Zobacz Wszystkie',
      'projects.view_project': 'Zobacz Projekt',
      'projects.github': 'GitHub',
      'projects.featured': 'Wyróżnione',
      'projects.all': 'Wszystkie',
      'projects.live_demo': 'Demo',
      'projects.source_code': 'Kod Źródłowy',
      'projects.technologies': 'Technologie',
      'projects.no_projects': 'Brak projektów w tej kategorii',
      'contact.title': 'Kontakt',
      'contact.subtitle': 'Skontaktuj Się Ze Mną',
      'contact.name': 'Twoje Imię',
      'contact.email': 'Twój Email',
      'contact.subject': 'Temat',
      'contact.message': 'Twoja Wiadomość',
      'contact.send': 'Wyślij Wiadomość',
      'contact.sending': 'Wysyłanie...',
      'contact.success': 'Wiadomość wysłana pomyślnie!',
      'contact.error': 'Wystąpił błąd. Spróbuj ponownie.',
      'contact.info_title': 'Dane Kontaktowe',
      'contact.location': 'Lokalizacja',
      'contact.phone': 'Telefon',
      'footer.rights': 'Wszelkie prawa zastrzeżone.',
      'footer.made_with': 'Wykonane z',
      'footer.quick_links': 'Szybkie Linki',
      'footer.back_to_top': 'Do Góry',
      'chatbot.placeholder': 'Wpisz wiadomość...',
      'chatbot.send': 'Wyślij',
      'chatbot.title': 'Asystent',
      'chatbot.online': 'Online',
      'chatbot.error': 'Nie udało się wysłać. Spróbuj ponownie.',
      'common.loading': 'Ładowanie...',
      'common.error': 'Błąd',
      'common.success': 'Sukces',
      'common.cancel': 'Anuluj',
      'common.save': 'Zapisz',
      'common.delete': 'Usuń',
      'common.edit': 'Edytuj',
      'common.close': 'Zamknij',
      'maintenance.title': 'Tryb Konserwacji',
      'maintenance.message': 'Strona jest w trakcie konserwacji. Wrócimy wkrótce.',
      'maintenance.working': 'Pracujemy nad tym...'
    }
  };

  const insertTrans = db.prepare(`
    INSERT INTO translations (lang_code, key, value, category)
    VALUES (?, ?, ?, ?)
  `);

  // Insert all translations for all 15 languages
  for (const [langCode, translations] of Object.entries(allTranslations)) {
    for (const [key, value] of Object.entries(translations)) {
      const category = key.split('.')[0];
      insertTrans.run(langCode, key, value, category);
    }
  }

  console.log('✅ Default translations created for all 15 languages');
}

console.log('🎉 All initialization complete!');
