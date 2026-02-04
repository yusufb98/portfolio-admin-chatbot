# Modül Dokümantasyonu

## Backend Modülleri

### Database

**Dosya:** `server/database/db.js`

**Amaç:** SQLite veritabanı bağlantısını yönetir.

**Sorumluluklar:**
- better-sqlite3 ile veritabanı bağlantısı oluşturur
- WAL mode ve foreign keys etkinleştirir
- Singleton pattern ile tek bağlantı sağlar

---

**Dosya:** `server/database/init.js`

**Amaç:** Veritabanı şemasını oluşturur ve başlangıç verilerini ekler.

**Oluşturulan Tablolar:**
1. `admins` - Admin kullanıcıları
2. `profile` - Portfolyo sahibi profili
3. `projects` - Projeler
4. `skills` - Yetenekler
5. `chatbot_config` - Chatbot ayarları
6. `chatbot_qa` - Soru-cevap çiftleri
7. `chat_messages` - Chat mesaj geçmişi
8. `contact_messages` - İletişim mesajları
9. `site_settings` - Site ayarları
10. `visitors` - Ziyaretçi takibi

**Seed Data:**
- Varsayılan admin (admin/admin123)
- Örnek profil bilgileri
- Chatbot yapılandırması
- Örnek soru-cevaplar
- Örnek yetenekler
- Örnek projeler

---

### Middleware

**Dosya:** `server/middleware/auth.js`

**Amaç:** JWT token doğrulama middleware'i.

**Sorumluluklar:**
- Authorization header'dan token çıkarır
- Token'ı doğrular
- `req.admin` objesine kullanıcı bilgilerini ekler
- Geçersiz token'da 401 döner

---

### Routes

**Dosya:** `server/routes/auth.js`

**Amaç:** Kimlik doğrulama endpoint'leri.

**Endpoint'ler:**
- `POST /login` - Giriş
- `GET /verify` - Token doğrulama
- `PUT /change-password` - Şifre değiştirme

---

**Dosya:** `server/routes/profile.js`

**Amaç:** Profil yönetimi.

**Endpoint'ler:**
- `GET /` - Profil getir
- `PUT /` - Profil güncelle

---

**Dosya:** `server/routes/projects.js`

**Amaç:** Proje CRUD işlemleri.

**Endpoint'ler:**
- `GET /` - Projeleri listele
- `GET /admin` - Tüm projeleri listele (admin)
- `GET /:id` - Tek proje
- `POST /` - Oluştur
- `PUT /:id` - Güncelle
- `DELETE /:id` - Sil
- `POST /reorder` - Sıralama

---

**Dosya:** `server/routes/skills.js`

**Amaç:** Yetenek CRUD işlemleri.

**Endpoint'ler:**
- `GET /` - Listele
- `GET /grouped` - Kategoriye göre gruplu
- `POST /` - Oluştur
- `PUT /:id` - Güncelle
- `DELETE /:id` - Sil

---

**Dosya:** `server/routes/chatbot.js`

**Amaç:** Chatbot yönetimi ve mesajlaşma.

**Endpoint'ler:**
- `GET /config` - Yapılandırma
- `PUT /config` - Yapılandırma güncelle
- `GET /qa` - Soru-cevaplar
- `POST /qa` - Soru-cevap ekle
- `PUT /qa/:id` - Güncelle
- `DELETE /qa/:id` - Sil
- `POST /chat` - Mesaj gönder
- `GET /stats` - İstatistikler

---

**Dosya:** `server/routes/contact.js`

**Amaç:** İletişim mesajları yönetimi.

**Endpoint'ler:**
- `POST /` - Mesaj gönder
- `GET /` - Mesajları listele
- `PUT /:id/read` - Okundu işaretle
- `DELETE /:id` - Sil

---

**Dosya:** `server/routes/upload.js`

**Amaç:** Dosya yükleme işlemleri.

**Desteklenen Tipler:**
- avatar (5MB, images)
- cv (5MB, pdf/doc)
- projects (5MB, images)

**Endpoint'ler:**
- `POST /` - Yükle
- `DELETE /` - Sil

---

**Dosya:** `server/routes/settings.js`

**Amaç:** Site ayarları yönetimi.

**Endpoint'ler:**
- `GET /` - Ayarları getir
- `PUT /` - Ayarları güncelle

---

## Frontend Modülleri

### Store

**Dosya:** `client/src/store/index.js`

**Amaç:** Zustand ile global state yönetimi.

**Store'lar:**
1. `useThemeStore` - Tema (dark/light) yönetimi
2. `useAuthStore` - Kimlik doğrulama durumu
3. `useChatStore` - Chatbot mesaj geçmişi

---

### Services

**Dosya:** `client/src/services/api.js`

**Amaç:** Axios ile API çağrıları.

**API Modülleri:**
- `authAPI` - Kimlik doğrulama
- `profileAPI` - Profil
- `projectsAPI` - Projeler
- `skillsAPI` - Yetenekler
- `chatbotAPI` - Chatbot
- `contactAPI` - İletişim
- `uploadAPI` - Dosya yükleme
- `settingsAPI` - Site ayarları

---

### Components

**Dosya:** `client/src/components/Navbar.jsx`

**Amaç:** Ana navigasyon barı.

**Özellikler:**
- Scroll'da border ve blur efekti
- Mobil slide-out menü
- Dark/Light tema toggle (animasyonlu)
- Smooth scroll linkleri
- Underline animasyonlu nav-link

**Tasarım Notları:**
- Minimal siyah/beyaz renk şeması
- Logo settings'den dinamik olarak alınır

---

**Dosya:** `client/src/components/Hero.jsx`

**Amaç:** Ana sayfa hero bölümü.

**Özellikler:**
- Typing animasyonu (cursor blink)
- Sosyal linkler (GitHub, LinkedIn)
- İstatistik sayaçları
- CV indirme ve iletişim butonları
- Subtle grid pattern arka plan

**Tasarım Notları:**
- Badge-accent ile durum göstergesi
- Emerald gradient vurgular (subtle)

---

**Dosya:** `client/src/components/About.jsx`

**Amaç:** Hakkımda bölümü.

**Özellikler:**
- İki sütunlu layout
- Profil bilgileri grid
- CV indirme butonu
- İletişim bilgileri

**Tasarım Notları:**
- Dekoratif sol kenar çizgisi (emerald)
- card-hover efektli bilgi kartları

---

**Dosya:** `client/src/components/Skills.jsx`

**Amaç:** Yetenekler bölümü.

**Özellikler:**
- Kategoriye göre filtreleme
- Progress bar animasyonu
- Staggered giriş animasyonları
- Temiz grid layout

**Tasarım Notları:**
- Filter butonları için btn-secondary stil
- progress-fill ile görsel seviye gösterimi

---

**Dosya:** `client/src/components/Projects.jsx`

**Amaç:** Projeler bölümü.

**Özellikler:**
- Responsive grid görünüm
- Kategori filtreleme
- Modal detay görünümü
- Önceki/Sonraki proje navigasyonu
- Teknoloji etiketleri

**Tasarım Notları:**
- card-hover efekti
- AnimatePresence ile modal geçişleri
- tag sınıfı ile teknoloji etiketleri

---

**Dosya:** `client/src/components/Contact.jsx`

**Amaç:** İletişim formu.

**Özellikler:**
- Form validasyonu
- Loading state
- Sosyal medya linkleri
- Başarı/hata toast bildirimleri

**Tasarım Notları:**
- İki sütunlu layout (bilgi + form)
- input ve label sınıfları
- İkon hover efektleri

---

**Dosya:** `client/src/components/Footer.jsx`

**Amaç:** Sayfa alt bilgisi.

**Özellikler:**
- Üç sütunlu grid (marka, linkler, iletişim)
- Sosyal medya linkleri
- Yukarı çık butonu
- Dinamik yıl

**Tasarım Notları:**
- border-t ile üst ayrımı
- Minimal ve temiz tasarım

---

**Dosya:** `client/src/components/Chatbot/Chatbot.jsx`

**Amaç:** Floating chatbot widget.

**Özellikler:**
- Açılır/kapanır tasarım
- Mesaj geçmişi
- Yazıyor göstergesi (typing indicator)
- Anahtar kelime eşleştirme
- Sohbet sıfırlama

**Tasarım Notları:**
- Siyah/beyaz minimal tema
- rounded-xl butonlar
- Emerald online durumu noktası

---

### Admin Pages

**Dosya:** `client/src/pages/admin/Login.jsx`

**Amaç:** Admin giriş sayfası.

---

**Dosya:** `client/src/pages/admin/Layout.jsx`

**Amaç:** Admin panel layout'u.

**Özellikler:**
- Sidebar navigasyon
- Auth kontrolü
- Responsive tasarım

---

**Dosya:** `client/src/pages/admin/Dashboard.jsx`

**Amaç:** Admin dashboard.

**Özellikler:**
- İstatistik kartları
- Son mesajlar
- Top chatbot soruları
- Hızlı işlemler

---

**Dosya:** `client/src/pages/admin/ProfileManagement.jsx`

**Amaç:** Profil düzenleme.

---

**Dosya:** `client/src/pages/admin/ProjectsManagement.jsx`

**Amaç:** Proje CRUD yönetimi.

---

**Dosya:** `client/src/pages/admin/SkillsManagement.jsx`

**Amaç:** Yetenek ve kategori CRUD yönetimi.

**Özellikler:**
- Yetenek ekleme/düzenleme/silme
- Kategori yönetimi (ekleme/düzenleme/silme)
- Proficiency (seviye) slider
- Renk seçimi

---

**Dosya:** `client/src/pages/admin/ExperiencesManagement.jsx`

**Amaç:** Deneyim ve etkinlik CRUD yönetimi.

**Özellikler:**
- İş deneyimi, eğitim, sertifika, etkinlik türleri
- Timeline görünümü (frontend)
- Görünürlük toggle
- Resim yükleme (URL veya dosya)
- Tarih aralığı ve "Devam Ediyor" seçeneği

---

**Dosya:** `client/src/pages/admin/ChatbotManagement.jsx`

**Amaç:** Chatbot yapılandırma ve soru-cevap yönetimi.

---

**Dosya:** `client/src/pages/admin/MessagesManagement.jsx`

**Amaç:** İletişim mesajları görüntüleme.

---

**Dosya:** `client/src/pages/admin/Settings.jsx`

**Amaç:** Şifre değiştirme, site ayarları ve SEO/Meta tags yönetimi.

**Tablar:**
1. Şifre Değiştir - Admin şifre güncelleme
2. Site Ayarları - Tema, bakım modu, analytics
3. SEO & Meta Tags - OG tags, Twitter card, tab title

---

**Dosya:** `client/src/pages/admin/TranslationsManagement.jsx`

**Amaç:** Çoklu dil ve çeviri yönetimi.

**Özellikler:**
- 15 dil desteği
- Dil aktif/pasif toggle
- Varsayılan dil seçimi
- Çeviri ekleme/düzenleme/silme
- Kategori bazlı filtreleme

---

## Yeni Eklenen Modüller (v2)

### Backend - Experiences Routes

**Dosya:** `server/routes/experiences.js`

**Amaç:** Deneyim ve etkinlik CRUD işlemleri.

**Endpoint'ler:**
- `GET /` - Görünür deneyimleri listele
- `GET /admin` - Tüm deneyimleri listele (admin)
- `GET /:id` - Tek deneyim
- `POST /` - Oluştur
- `PUT /:id` - Güncelle
- `DELETE /:id` - Sil
- `POST /reorder` - Sıralama

**Deneyim Türleri:**
- work (İş Deneyimi)
- education (Eğitim)
- project (Proje)
- certificate (Sertifika)
- event (Etkinlik)
- other (Diğer)

---

### Backend - Skill Categories

**Dosya:** `server/routes/skills.js` (güncellenmiş)

**Yeni Endpoint'ler:**
- `GET /categories` - Kategorileri listele
- `POST /categories` - Kategori oluştur
- `PUT /categories/:id` - Kategori güncelle
- `DELETE /categories/:id` - Kategori sil

---

### Frontend - Experiences Component

**Dosya:** `client/src/components/Experiences.jsx`

**Amaç:** Ana sayfada deneyimleri timeline görünümünde gösterir.

**Özellikler:**
- Alternatif sol/sağ layout
- Tür bazlı filtreleme
- Responsive tasarım
- Framer Motion animasyonları
- Tarih formatlama

---

### Database - Yeni Tablolar

**Tablo:** `experiences`
```sql
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
```

**Tablo:** `skill_categories`
```sql
CREATE TABLE IF NOT EXISTS skill_categories (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  name TEXT UNIQUE NOT NULL,
  icon TEXT,
  color TEXT,
  order_index INTEGER DEFAULT 0
);
```

---

## Site Ayarları Özellikleri

### Tab Title (Sekme Başlığı)
- `tab_title` - Tarayıcı sekmesinde görünen başlık

### Open Graph Meta Tags
- `og_title` - Link paylaşım başlığı
- `og_description` - Link paylaşım açıklaması
- `og_image` - Link paylaşım resmi (1200x630 önerilir)
- `og_url` - Canonical URL

### Twitter Card
- `twitter_handle` - Twitter kullanıcı adı
- `twitter_card_type` - summary veya summary_large_image
