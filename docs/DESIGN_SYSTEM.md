# Tasarım Sistemi Dokümantasyonu

## Genel Bakış

Bu portfolyo projesi **minimal ve profesyonel** bir tasarım anlayışı ile geliştirilmiştir. Glassmorphism veya karmaşık efektler yerine sadelik, temiz tipografi ve hassas animasyonlar tercih edilmiştir.

## Renk Paleti

### Ana Renkler

| Renk | Light Mode | Dark Mode | Kullanım |
|------|------------|-----------|----------|
| Primary Text | `neutral-900` | `white` | Başlıklar, önemli metinler |
| Secondary Text | `neutral-600` | `neutral-400` | Normal metinler |
| Muted Text | `neutral-500` | `neutral-500` | Açıklamalar, alt bilgiler |
| Background | `white` | `neutral-950` | Sayfa arka planı |
| Surface | `neutral-50` | `neutral-900` | Kart ve bileşen arka planları |
| Border | `neutral-200` | `neutral-800` | Çizgiler ve kenarlıklar |
| Accent | `emerald-600` | `emerald-400` | Vurgu rengi (online durumu, badge) |

### Tailwind Konfigürasyonu

```javascript
colors: {
  neutral: {
    50: '#fafafa',
    100: '#f5f5f5',
    200: '#e5e5e5',
    300: '#d4d4d4',
    400: '#a3a3a3',
    500: '#737373',
    600: '#525252',
    700: '#404040',
    800: '#262626',
    900: '#171717',
    950: '#0a0a0a',
  },
  accent: {
    // Emerald tones
    500: '#10b981',
    600: '#059669',
  }
}
```

## Tipografi

### Font Ailesi

- **Sans-serif:** Inter (tüm metinler)
- **Monospace:** JetBrains Mono (kod blokları)

### Başlık Sınıfları

```css
.heading-xl  /* 5xl-7xl, bold, -0.03em tracking */
.heading-lg  /* 3xl-5xl, bold, -0.02em tracking */
.heading-md  /* 2xl-3xl, semibold, -0.02em tracking */
.heading-sm  /* xl-2xl, semibold, -0.01em tracking */
```

### Metin Sınıfları

```css
.text-body     /* base-lg, neutral-600/400, 1.7 line-height */
.text-caption  /* sm, neutral-500, 0.02em tracking */
.text-overline /* xs, uppercase, widest tracking */
.text-accent   /* emerald-600/400 */
```

## Bileşen Sınıfları

### Butonlar

```css
.btn-primary   /* Siyah bg, beyaz text (ters dark mode) */
.btn-secondary /* Şeffaf bg, border, hover efekti */
.btn-ghost     /* Minimal, sadece hover'da bg */
.btn-icon      /* Kare, sadece ikon için */
```

### Formlar

```css
.input  /* Tam genişlik, border, focus ring */
.label  /* sm, medium, neutral-700/300 */
```

### Kartlar

```css
.card       /* Beyaz bg, border, rounded-2xl */
.card-hover /* card + hover efektleri (shadow, translate) */
```

### Navigasyon

```css
.nav-link  /* Underline animasyonu ile link */
```

### Badge ve Etiketler

```css
.badge        /* Küçük, rounded-full, neutral bg */
.badge-accent /* Emerald tonlarında badge */
.tag          /* Teknoloji etiketi */
```

### İlerleme Göstergeleri

```css
.progress-bar  /* Yatay ilerleme çubuğu container */
.progress-fill /* İlerleme dolgusu */
.dot-indicator /* Pulse animasyonlu nokta */
```

## Animasyonlar

### Framer Motion

Tüm bileşenlerde smooth giriş animasyonları:

```jsx
initial={{ opacity: 0, y: 20 }}
animate={{ opacity: 1, y: 0 }}
transition={{ duration: 0.6 }}
```

### CSS Animasyonları

```css
.animate-fade-in    /* Sadece opacity */
.animate-fade-up    /* Aşağıdan yukarı */
.animate-fade-down  /* Yukarıdan aşağı */
.animate-scale-in   /* Zoom in efekti */
.animate-slide-left /* Soldan kayma */
.animate-slide-right/* Sağdan kayma */
```

### Gecikme Sınıfları

```css
.delay-100 /* 100ms */
.delay-200 /* 200ms */
.delay-300 /* 300ms */
.delay-400 /* 400ms */
.delay-500 /* 500ms */
```

## Özel Efektler

### Grid Pattern

Hero bölümünde ince çizgili arka plan:

```css
.grid-pattern {
  background-image: 
    linear-gradient(rgba(0,0,0,0.03) 1px, transparent 1px),
    linear-gradient(90deg, rgba(0,0,0,0.03) 1px, transparent 1px);
  background-size: 60px 60px;
}
```

### Hover Lift

```css
.hover-lift:hover {
  transform: translateY(-4px);
}
```

### Cursor Blink

Typing animasyonu için:

```css
.cursor-blink {
  animation: blink 1s step-end infinite;
}
```

## Layout

### Container

```css
.container-custom {
  max-width: 72rem; /* 6xl */
  padding: 1.5rem-3rem; /* responsive */
  margin: 0 auto;
}
```

### Section

```css
.section {
  padding-top: 6rem-8rem; /* responsive */
  padding-bottom: 6rem-8rem;
}
```

## Dark Mode

`darkMode: 'class'` konfigürasyonu ile class-based dark mode:

- Toggle buton ile kullanıcı kontrolü
- localStorage'da tercih saklama
- Sistem tercihini takip (opsiyonel)

## Responsive Breakpoints

- Mobile: default (< 768px)
- Tablet: `md:` (>= 768px)
- Desktop: `lg:` (>= 1024px)

## Best Practices

1. **Glassmorphism kullanmayın** - Temiz solid renkler tercih edin
2. **Gradient'ları minimal tutun** - Sadece subtle vurgular için
3. **Bol whitespace kullanın** - İçerik nefes alabilmeli
4. **Tutarlı spacing** - Tailwind spacing scale'ini takip edin
5. **Erişilebilirlik** - Kontrast oranlarına dikkat edin
6. **Performans** - Gereksiz animasyonlardan kaçının
