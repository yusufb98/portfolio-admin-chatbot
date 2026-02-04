# YusuPortfolyo

Modern, minimal ve çok dilli (i18n) portfolyo websitesi + admin panel + yapılandırılabilir chatbot.

- Public site: Hakkımda / Yetenekler / Deneyimler / Projeler / İletişim
- Admin panel: içerik yönetimi (CRUD), mesajlar, ayarlar, çeviriler
- Backend: Express + SQLite (better-sqlite3) + JWT auth + dosya yükleme

## Canlı

- https://yusufbaykan.com

## Ekran Görüntüleri

![Hero](docs/screenshots/hero.png)
![About](docs/screenshots/about.png)
![Experiences](docs/screenshots/experiences.png)

---

## Teknoloji Yığını

**Frontend**: React 18, Vite, TailwindCSS, Framer Motion, Zustand, React Router, Axios

**Backend**: Node.js, Express, SQLite (better-sqlite3), JWT, bcryptjs, multer, helmet, express-rate-limit

---

## Proje Yapısı

```
.
├─ client/                 # React (Vite)
├─ server/                 # Express API
├─ docs/                   # Detaylı dokümantasyon
└─ package.json            # Root script'ler (concurrently)
```

Detaylı mimari notları için:
- docs/README.md
- docs/endpoints/API.md
- docs/DESIGN_SYSTEM.md

---

## Hızlı Başlangıç (Development)

### Gereksinimler

- Node.js 18+ (önerilir)
- npm

### Kurulum

```bash
npm run install:all
```

### Ortam değişkenleri (Backend)

`server/.env` dosyasını oluştur:

```bash
cp server/.env.example server/.env
```

Minimum gerekli değişkenler:

- `PORT` (default: `7847`)
- `JWT_SECRET` (production’da mutlaka değiştir)
- `NODE_ENV` (`development` | `production`)
- `CLIENT_URL` (sadece production CORS için)

### Çalıştırma

```bash
npm run dev
```

- Frontend: `http://localhost:8847`
- Backend API: `http://localhost:7847/api`
- Health check: `http://localhost:7847/api/health`

Not: Frontend, development ortamında `/api` ve `/uploads` isteklerini Vite proxy ile backend’e yönlendirir (client/vite.config.js).

---

## Admin Panel

- Giriş: `http://localhost:8847/admin/login`

Varsayılan giriş bilgileri (ilk kurulumda seed edilir):
- Kullanıcı adı: `admin`
- Şifre: `admin123`

> Production’a çıkmadan önce admin şifresini değiştir.

---

## Veritabanı

- SQLite dosyası: `server/database/portfolio.db`
- Şema + seed işlemleri: `server/database/init.js`

Backend ayağa kalkarken `server/server.js`, `init.js`’i otomatik çağırır ve dosya yoksa oluşturur.

---

## Production

Bu projede backend, production modunda frontend build çıktısını da servis eder.

```bash
npm run build
# sonra
cd server && NODE_ENV=production npm start
```

Production’da CORS origin kontrolü için `server/.env` içinde `CLIENT_URL` tanımlı olmalı.

---

## API Dokümantasyonu

Endpoint listesi: docs/endpoints/API.md

Tüm endpoint’ler `/api` prefix’i ile başlar.

---

## Lisans

MIT
