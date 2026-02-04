# Admin Panel Modül Dokümantasyonu

## Genel Bilgi

Admin panel, portfolyo sitesinin tüm içeriklerini yönetmek için kullanılan güvenli bir arayüzdür. JWT tabanlı kimlik doğrulama kullanır.

**Varsayılan Giriş Bilgileri:**
- Kullanıcı Adı: `admin`
- Şifre: `admin123`

---

## Sayfa Yapısı

### Layout.jsx
**Dosya:** `client/src/pages/admin/Layout.jsx`

**Amaç:** Admin panel için ana düzen bileşeni.

**Sorumluluklar:**
- Sidebar navigasyon menüsü
- Mobil responsive menü
- Tema değiştirme butonu
- Kullanıcı bilgileri gösterimi
- Auth kontrolü ve yönlendirme

**Renk Şeması:** Neutral (beyaz/siyah/gri tonları)

---

### Login.jsx
**Dosya:** `client/src/pages/admin/Login.jsx`

**Amaç:** Admin girişi sayfası.

**Sorumluluklar:**
- Kullanıcı adı ve şifre form
- JWT token alma ve saklama
- Hata mesajları gösterimi
- Başarılı girişte yönlendirme

**Tasarım Özellikleri:**
- Minimal beyaz kart tasarımı
- Neutral renk paleti (glassmorphism yok)
- Framer Motion animasyonları

---

### Dashboard.jsx
**Dosya:** `client/src/pages/admin/Dashboard.jsx`

**Amaç:** Admin ana sayfa / özet panel.

**Görüntülenen Bilgiler:**
- Toplam proje sayısı
- Toplam yetenek sayısı
- Chatbot sorgu istatistikleri
- Mesaj sayısı
- Son mesajlar listesi
- En çok sorulan sorular
- Hızlı erişim linkleri

**API Çağrıları:**
- `projectsAPI.getAll()`
- `skillsAPI.getAll()`
- `chatAPI.getStats()`
- `messagesAPI.getAll()`

---

### ProfileManagement.jsx
**Dosya:** `client/src/pages/admin/ProfileManagement.jsx`

**Amaç:** Profil bilgilerini düzenleme.

**Düzenlenebilir Alanlar:**
- İsim Soyisim
- Unvan / Başlık
- Hero alt başlık
- Biyografi
- Deneyim (yıl)
- Tamamlanan proje sayısı
- Email, Telefon, Konum
- Sosyal medya linkleri (GitHub, LinkedIn, Twitter)
- Avatar yükleme
- CV yükleme

**API Çağrıları:**
- `profileAPI.get()` - Profil çek
- `profileAPI.update(data)` - Profil güncelle
- `uploadAPI.upload(file, type)` - Dosya yükle

---

### ProjectsManagement.jsx
**Dosya:** `client/src/pages/admin/ProjectsManagement.jsx`

**Amaç:** Proje CRUD işlemleri.

**Özellikler:**
- Proje listesi (grid görünüm)
- Yeni proje ekleme (modal)
- Mevcut proje düzenleme
- Proje silme
- Öne çıkarma (featured) toggle
- Görünürlük toggle

**Proje Alanları:**
- Başlık
- Kısa açıklama
- Detaylı açıklama
- Proje görseli (yüklenebilir)
- Canlı URL
- GitHub URL
- Teknolojiler (virgülle ayrılmış)
- Kategori (Robotics, Computer Vision, Simulation, Autonomous Systems, Other)

**API Çağrıları:**
- `projectsAPI.getAllAdmin()` - Tüm projeleri çek
- `projectsAPI.create(data)` - Yeni proje
- `projectsAPI.update(id, data)` - Güncelle
- `projectsAPI.delete(id)` - Sil

---

### SkillsManagement.jsx
**Dosya:** `client/src/pages/admin/SkillsManagement.jsx`

**Amaç:** Yetenek CRUD işlemleri.

**Özellikler:**
- Kategorilere göre gruplandırılmış görünüm
- Yetenek ekleme/düzenleme (modal)
- Yetenek silme
- Yüzdelik seviye gösterimi

**Yetenek Alanları:**
- İsim
- Kategori (ROS & Robotics, Computer Vision, Programming, Tools & Frameworks, Other)
- Seviye (0-100%)
- Icon key
- Renk

**API Çağrıları:**
- `skillsAPI.getAll()` - Tüm yetenekler
- `skillsAPI.create(data)` - Yeni yetenek
- `skillsAPI.update(id, data)` - Güncelle
- `skillsAPI.delete(id)` - Sil

---

### ChatbotManagement.jsx
**Dosya:** `client/src/pages/admin/ChatbotManagement.jsx`

**Amaç:** Chatbot yapılandırması ve soru-cevap yönetimi.

**İki Tab:**

#### 1. Genel Ayarlar
- Chatbot aktif/pasif durumu
- Bot adı
- Tema rengi
- Hoşgeldin mesajı
- Fallback mesajı (cevap bulunamadığında)
- Yanıt gecikmesi (ms)

#### 2. Soru-Cevaplar
- Q&A çifti ekleme/düzenleme
- Q&A silme
- Hit count gösterimi
- Aktif/Pasif durumu

**Q&A Alanları:**
- Anahtar kelimeler (virgülle ayrılmış)
- Soru
- Cevap
- Kategori (general, projects, skills, contact)
- Aktif durumu

**API Çağrıları:**
- `chatbotAPI.getConfig()` - Ayarları çek
- `chatbotAPI.updateConfig(data)` - Ayarları güncelle
- `chatbotAPI.getQA()` - Q&A listesi
- `chatbotAPI.createQA(data)` - Yeni Q&A
- `chatbotAPI.updateQA(id, data)` - Q&A güncelle
- `chatbotAPI.deleteQA(id)` - Q&A sil

---

### MessagesManagement.jsx
**Dosya:** `client/src/pages/admin/MessagesManagement.jsx`

**Amaç:** İletişim formundan gelen mesajları yönetme.

**Özellikler:**
- Mesaj listesi (okunmuş/okunmamış)
- Filtre (Tümü, Okunmamış, Okunmuş)
- Mesaj detay modal
- Okunmuş olarak işaretleme (otomatik)
- Mesaj silme
- E-posta ile yanıtla linki

**API Çağrıları:**
- `contactAPI.getAll()` - Tüm mesajlar
- `contactAPI.markAsRead(id)` - Okundu işaretle
- `contactAPI.delete(id)` - Sil

---

### Settings.jsx
**Dosya:** `client/src/pages/admin/Settings.jsx`

**Amaç:** Hesap ve site ayarları.

**İki Tab:**

#### 1. Şifre Değiştir
- Mevcut şifre
- Yeni şifre
- Yeni şifre tekrar

#### 2. Site Ayarları
- Site başlığı
- Site açıklaması (SEO)
- Anahtar kelimeler (SEO)
- Google Analytics ID
- Varsayılan tema (sistem/açık/koyu)
- Bakım modu toggle

**API Çağrıları:**
- `authAPI.changePassword(current, new)` - Şifre değiştir
- `settingsAPI.get()` - Ayarları çek
- `settingsAPI.update(data)` - Ayarları güncelle

---

## Tasarım Sistemi

### Renk Paleti
Tüm admin sayfaları aşağıdaki neutral renk paletini kullanır:

- **Background:** `bg-neutral-100` (light) / `bg-neutral-950` (dark)
- **Card/Surface:** `bg-white` (light) / `bg-neutral-900` (dark)
- **Border:** `border-neutral-200` (light) / `border-neutral-800` (dark)
- **Text Primary:** `text-neutral-900` (light) / `text-white` (dark)
- **Text Secondary:** `text-neutral-500` / `text-neutral-400` (dark)
- **Accent (vurgu):** Emerald tonları (yeşil)

### Bileşenler
Tüm form elemanları `input` CSS sınıfını kullanır (index.css'de tanımlı).
Butonlar için `btn-primary`, `btn-secondary`, `btn-ghost` sınıfları kullanılır.

### Animasyonlar
Tüm sayfalar Framer Motion ile giriş animasyonları içerir:
```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
```

---

## Son Güncelleme

**Tarih:** 1 Şubat 2026
**Değişiklikler:**
- Bakım modu artık tam çalışır durumda
- `MaintenanceMode.jsx` bileşeni eklendi
- `Home.jsx` bakım modu kontrolü eklendi
- Bozuk placeholder URL'leri düzeltildi (via.placeholder.com → inline SVG)
- App.jsx'teki eski renk sınıfları düzeltildi

**Önceki Güncellemeler:**
- Tüm `dark-*` sınıfları `neutral-*` ile değiştirildi
- Tüm `primary-500` referansları neutral/emerald ile değiştirildi
- Gradient arka planlar kaldırıldı
- Minimal, profesyonel tasarım uygulandı
- Glassmorphism efektleri kaldırıldı
