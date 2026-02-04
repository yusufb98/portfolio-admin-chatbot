# YusuPortfolyo - Proje Dokümantasyonu

## Genel Bakış

Bu proje, admin paneli ve interaktif chatbot içeren modern, minimal ve profesyonel bir portfolyo web sitesidir. Robotik ve Bilgisayarlı Görü mühendisi temalı içerik ile hazırlanmıştır.

## Tasarım Felsefesi

- **Minimal & Profesyonel** - Glassmorphism yok, temiz çizgiler
- **Nötr Renk Paleti** - Siyah/beyaz/gri tonları, emerald vurgu
- **Smooth Animasyonlar** - Framer Motion ile hassas geçişler
- **Responsive** - Tüm ekran boyutlarına uyumlu

## Teknoloji Stack

### Backend
- **Node.js** - Runtime
- **Express.js** (v4.18.2) - Web framework
- **better-sqlite3** - SQLite veritabanı
- **JWT** - Authentication
- **bcryptjs** - Şifre hashleme
- **multer** - Dosya yükleme

### Frontend
- **React 18** - UI framework
- **Vite 5** - Build tool
- **Tailwind CSS 3.4** - Styling (minimal neutral tema)
- **Framer Motion** - Animasyonlar
- **Zustand** - State management
- **React Router v6** - Routing
- **Axios** - HTTP client
- **React Hot Toast** - Bildirimler
- **React Icons** - İkonlar

## Proje Yapısı

```
YusuPortfolyo/
├── client/                 # Frontend React uygulaması
│   ├── public/            # Statik dosyalar
│   ├── src/
│   │   ├── components/    # UI bileşenleri
│   │   │   └── Chatbot/   # Chatbot widget
│   │   ├── pages/         # Sayfa bileşenleri
│   │   │   └── admin/     # Admin panel sayfaları
│   │   ├── services/      # API servisleri
│   │   ├── store/         # Zustand store
│   │   ├── App.jsx        # Ana uygulama
│   │   ├── main.jsx       # Entry point
│   │   └── index.css      # Global stil sistemi
│   ├── tailwind.config.js # Tailwind konfigürasyonu
│   └── package.json
├── server/                 # Backend Node.js uygulaması
│   ├── database/          # Veritabanı
│   │   ├── db.js          # Bağlantı
│   │   └── init.js        # Schema & seed
│   ├── middleware/        # Express middleware
│   ├── routes/            # API routes
│   ├── uploads/           # Yüklenen dosyalar
│   ├── server.js          # Entry point
│   └── package.json
├── docs/                   # Dokümantasyon
│   ├── README.md          # Bu dosya
│   ├── DESIGN_SYSTEM.md   # Tasarım sistemi
│   ├── endpoints/         # API endpoint docs
│   └── modules/           # Modül açıklamaları
└── package.json           # Root package
```

## Özellikler

### Public Site
- ✅ Hero section (typing animasyonu, grid pattern arka plan)
- ✅ Hakkımda bölümü (profil bilgileri, iletişim kartları)
- ✅ Yetenekler (kategoriye göre filtreleme, progress bar animasyonu)
- ✅ Projeler (filtreleme, modal detay, önceki/sonraki navigasyon)
- ✅ İletişim formu (validasyon, toast bildirimleri)
- ✅ Footer (hızlı linkler, yukarı çık butonu)
- ✅ Dark/Light tema geçişi (animasyonlu toggle)
- ✅ Smooth scroll navigasyon
- ✅ SEO optimizasyonu (dinamik sayfa title)
- ✅ Responsive minimal tasarım
- ✅ CV indirme

### Admin Panel
- ✅ JWT authentication ile güvenli giriş
- ✅ Dashboard (istatistikler, son mesajlar, hızlı işlemler)
- ✅ Profil yönetimi (avatar, CV yükleme)
- ✅ Proje yönetimi (CRUD, sıralama, öne çıkarma)
- ✅ Yetenek yönetimi (CRUD, kategorilendirme)
- ✅ Chatbot yönetimi (ayarlar, soru-cevap)
- ✅ Mesaj yönetimi (okuma, silme)
- ✅ Site ayarları (sayfa başlığı, şifre değiştirme, SEO, tema)

### Chatbot
- ✅ Anahtar kelime bazlı yanıtlar
- ✅ Hoşgeldin mesajı
- ✅ Fallback mesajı
- ✅ Yazıyor göstergesi (bounce animasyonu)
- ✅ Mesaj geçmişi
- ✅ Sohbet sıfırlama
- ✅ Admin'den yapılandırılabilir

## Kurulum

```bash
# Root dizinde
npm install

# Server bağımlılıkları
cd server && npm install

# Client bağımlılıkları
cd ../client && npm install
```

## Çalıştırma

### Development
```bash
# Server (port 5000)
cd server && npm run dev

# Client (port 5173)
cd client && npm run dev
```

### Production
```bash
# Build
cd client && npm run build

# Start
cd ../server && npm start
```

## Varsayılan Giriş Bilgileri

- **Kullanıcı Adı:** admin
- **Şifre:** admin123

⚠️ Production'da şifreyi değiştirmeyi unutmayın!

## Ortam Değişkenleri

`server/.env` dosyası:
```
PORT=5000
JWT_SECRET=your-super-secret-jwt-key-change-in-production
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

## Lisans

MIT
