# API Endpoints Dokümantasyonu

## Genel Bilgi

Tüm API endpoint'leri `/api` prefix'i ile başlar. Protected endpoint'ler JWT token gerektirir.

### Base URL
- Development: `http://localhost:5000/api`
- Production: `https://your-domain.com/api`

### Authentication
Protected endpoint'ler için `Authorization` header'ı gereklidir:
```
Authorization: Bearer <token>
```

---

## Auth Endpoints

### POST /api/auth/login
Admin girişi yapar.

**Request Body:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "message": "Login successful",
  "token": "jwt-token-here",
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

### GET /api/auth/verify
Token doğrulaması yapar.

**Headers:** Authorization required

**Response:**
```json
{
  "valid": true,
  "admin": {
    "id": 1,
    "username": "admin"
  }
}
```

### PUT /api/auth/change-password
Admin şifresini değiştirir.

**Headers:** Authorization required

**Request Body:**
```json
{
  "currentPassword": "old-password",
  "newPassword": "new-password"
}
```

**Response:**
```json
{
  "message": "Password changed successfully"
}
```

---

## Profile Endpoints

### GET /api/profile
Profil bilgilerini getirir.

**Response:**
```json
{
  "id": 1,
  "full_name": "Yusu Emre",
  "title": "Full Stack Developer",
  "bio": "...",
  "email": "yusu@example.com",
  "avatar_url": "/uploads/avatar/image.jpg",
  "cv_url": "/uploads/cv/resume.pdf",
  "social_links": {...}
}
```

### PUT /api/profile
Profili günceller.

**Headers:** Authorization required

**Request Body:**
```json
{
  "full_name": "New Name",
  "title": "New Title",
  "bio": "New bio...",
  "email": "new@email.com",
  "avatar_url": "/uploads/avatar/image.jpg",
  "social_links": {
    "github": "https://github.com/user",
    "linkedin": "https://linkedin.com/in/user"
  }
}
```

---

## Projects Endpoints

### GET /api/projects
Tüm projeleri listeler.

**Query Parameters:**
- `featured` (boolean): Sadece öne çıkan projeler
- `category` (string): Kategori filtresi
- `limit` (number): Sonuç limiti

**Response:**
```json
[
  {
    "id": 1,
    "title": "Project Name",
    "description": "...",
    "image_url": "/uploads/projects/image.jpg",
    "live_url": "https://example.com",
    "github_url": "https://github.com/user/repo",
    "technologies": "React, Node.js",
    "is_featured": 1,
    "is_visible": 1
  }
]
```

### GET /api/projects/admin
Admin için tüm projeleri listeler (gizli dahil).

**Headers:** Authorization required

### GET /api/projects/:id
Tek proje detayı.

### POST /api/projects
Yeni proje oluşturur.

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "Project Name",
  "description": "Description",
  "image_url": "/uploads/projects/image.jpg",
  "live_url": "https://example.com",
  "github_url": "https://github.com/user/repo",
  "technologies": "React, Node.js",
  "category": "web",
  "is_featured": true,
  "is_visible": true
}
```

### PUT /api/projects/:id
Projeyi günceller.

**Headers:** Authorization required

### DELETE /api/projects/:id
Projeyi siler.

**Headers:** Authorization required

### POST /api/projects/reorder
Proje sıralamasını değiştirir.

**Headers:** Authorization required

**Request Body:**
```json
{
  "projectIds": [3, 1, 2, 4]
}
```

---

## Skills Endpoints

### GET /api/skills
Tüm yetenekleri listeler.

**Query Parameters:**
- `category` (string): Kategori filtresi

### GET /api/skills/grouped
Kategoriye göre gruplanmış yetenekler.

**Response:**
```json
{
  "Frontend": [
    { "id": 1, "name": "React", "proficiency": 90, "color": "#61dafb" }
  ],
  "Backend": [...]
}
```

### POST /api/skills
Yeni yetenek ekler.

**Headers:** Authorization required

### PUT /api/skills/:id
Yeteneği günceller.

**Headers:** Authorization required

### DELETE /api/skills/:id
Yeteneği siler.

**Headers:** Authorization required

---

## Chatbot Endpoints

### GET /api/chatbot/config
Chatbot yapılandırmasını getirir.

### PUT /api/chatbot/config
Chatbot yapılandırmasını günceller.

**Headers:** Authorization required

**Request Body:**
```json
{
  "bot_name": "YusuBot",
  "welcome_message": "Merhaba!",
  "fallback_message": "Anlayamadım...",
  "theme_color": "#6366f1",
  "response_delay": 500,
  "is_active": true
}
```

### GET /api/chatbot/qa
Soru-cevap listesini getirir.

### POST /api/chatbot/qa
Yeni soru-cevap ekler.

**Headers:** Authorization required

**Request Body:**
```json
{
  "keywords": "merhaba, selam",
  "question": "Nasıl selam verebilirim?",
  "answer": "Merhaba! Size nasıl yardımcı olabilirim?",
  "is_active": true
}
```

### PUT /api/chatbot/qa/:id
Soru-cevabı günceller.

**Headers:** Authorization required

### DELETE /api/chatbot/qa/:id
Soru-cevabı siler.

**Headers:** Authorization required

### POST /api/chatbot/chat
Chatbot ile mesajlaşma.

**Request Body:**
```json
{
  "message": "Merhaba",
  "visitor_id": "uuid-string",
  "visitor_name": "Visitor"
}
```

**Response:**
```json
{
  "response": "Merhaba! Size nasıl yardımcı olabilirim?",
  "matched": true
}
```

### GET /api/chatbot/stats
Chatbot istatistiklerini getirir.

**Headers:** Authorization required

---

## Contact Endpoints

### POST /api/contact
İletişim mesajı gönderir.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Konu",
  "message": "Mesaj içeriği..."
}
```

### GET /api/contact
Tüm mesajları listeler.

**Headers:** Authorization required

### PUT /api/contact/:id/read
Mesajı okundu olarak işaretler.

**Headers:** Authorization required

### DELETE /api/contact/:id
Mesajı siler.

**Headers:** Authorization required

---

## Upload Endpoints

### POST /api/upload
Dosya yükler.

**Headers:** Authorization required

**Form Data:**
- `file`: Dosya
- `type`: 'avatar' | 'cv' | 'projects'

**Response:**
```json
{
  "url": "/uploads/avatar/1699999999999-filename.jpg"
}
```

### DELETE /api/upload
Dosya siler.

**Headers:** Authorization required

**Request Body:**
```json
{
  "url": "/uploads/avatar/1699999999999-filename.jpg"
}
```

---

## Settings Endpoints

### GET /api/settings
Site ayarlarını getirir.

### PUT /api/settings
Site ayarlarını günceller.

**Headers:** Authorization required

**Request Body:**
```json
{
  "site_title": "Portfolyo",
  "site_description": "SEO açıklaması",
  "site_keywords": "portfolyo, developer",
  "google_analytics": "G-XXXXXXXXXX",
  "default_theme": "system",
  "maintenance_mode": false
}
```

---

## Experiences Endpoints

### GET /api/experiences
Tüm görünür deneyimleri listeler.

**Response:**
```json
[
  {
    "id": 1,
    "title": "Software Engineer",
    "organization": "ABC Tech",
    "description": "Job description...",
    "start_date": "2023-01-01",
    "end_date": "2024-01-01",
    "location": "Istanbul, Turkey",
    "type": "work",
    "image_url": "/uploads/experiences/image.jpg",
    "link_url": "https://example.com",
    "is_current": 0,
    "is_visible": 1,
    "order_index": 0
  }
]
```

### GET /api/experiences/admin
Admin için tüm deneyimleri listeler (gizli dahil).

**Headers:** Authorization required

### GET /api/experiences/:id
Tek bir deneyimi getirir.

### POST /api/experiences
Yeni deneyim oluşturur.

**Headers:** Authorization required

**Request Body:**
```json
{
  "title": "Job Title",
  "organization": "Company Name",
  "description": "Description...",
  "start_date": "2023-01-01",
  "end_date": "2024-01-01",
  "location": "City, Country",
  "type": "work|education|project|certificate|event|other",
  "image_url": "optional image url",
  "link_url": "optional link url",
  "is_current": false,
  "is_visible": true
}
```

### PUT /api/experiences/:id
Deneyimi günceller.

**Headers:** Authorization required

### DELETE /api/experiences/:id
Deneyimi siler.

**Headers:** Authorization required

### POST /api/experiences/reorder
Deneyim sıralamasını günceller.

**Headers:** Authorization required

**Request Body:**
```json
{
  "experienceIds": [3, 1, 2]
}
```

---

## Skill Categories Endpoints

### GET /api/skills/categories
Tüm yetenek kategorilerini listeler.

**Response:**
```json
[
  {
    "id": 1,
    "name": "ROS & Robotik",
    "icon": "robot",
    "color": "#6366f1",
    "order_index": 0
  }
]
```

### POST /api/skills/categories
Yeni kategori oluşturur.

**Headers:** Authorization required

**Request Body:**
```json
{
  "name": "Category Name",
  "icon": "optional-icon",
  "color": "#6366f1"
}
```

### PUT /api/skills/categories/:id
Kategoriyi günceller.

**Headers:** Authorization required

### DELETE /api/skills/categories/:id
Kategoriyi siler. Bu kategorideki yetenekler "Diğer" kategorisine taşınır.

**Headers:** Authorization required

---

**Response:**
```json
{
  "status": "ok",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```
