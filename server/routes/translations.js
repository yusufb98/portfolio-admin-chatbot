const express = require('express');
const router = express.Router();
const db = require('../database/db');
const auth = require('../middleware/auth');

// Get all active languages
router.get('/languages', (req, res) => {
  try {
    const languages = db.prepare(`
      SELECT * FROM languages 
      WHERE is_active = 1 
      ORDER BY order_index ASC
    `).all();
    res.json(languages);
  } catch (error) {
    console.error('Get languages error:', error);
    res.status(500).json({ message: 'Diller alınamadı' });
  }
});

// Get all languages (admin)
router.get('/languages/all', auth, (req, res) => {
  try {
    const languages = db.prepare(`
      SELECT * FROM languages 
      ORDER BY order_index ASC
    `).all();
    res.json(languages);
  } catch (error) {
    console.error('Get all languages error:', error);
    res.status(500).json({ message: 'Diller alınamadı' });
  }
});

// Update language settings (admin)
router.put('/languages/:code', auth, (req, res) => {
  try {
    const { code } = req.params;
    const { is_active, is_default } = req.body;

    // If setting as default, unset other defaults first
    if (is_default) {
      db.prepare('UPDATE languages SET is_default = 0').run();
    }

    db.prepare(`
      UPDATE languages 
      SET is_active = COALESCE(?, is_active),
          is_default = COALESCE(?, is_default)
      WHERE code = ?
    `).run(is_active, is_default, code);

    res.json({ message: 'Dil güncellendi' });
  } catch (error) {
    console.error('Update language error:', error);
    res.status(500).json({ message: 'Dil güncellenemedi' });
  }
});

// Get default language
router.get('/default-language', (req, res) => {
  try {
    const lang = db.prepare(`
      SELECT code FROM languages 
      WHERE is_default = 1 
      LIMIT 1
    `).get();
    res.json({ code: lang?.code || 'tr' });
  } catch (error) {
    console.error('Get default language error:', error);
    res.status(500).json({ message: 'Varsayılan dil alınamadı' });
  }
});

// Set default language (admin)
router.put('/default-language', auth, (req, res) => {
  try {
    const { code } = req.body;
    
    // Unset all defaults first
    db.prepare('UPDATE languages SET is_default = 0').run();
    
    // Set new default
    db.prepare('UPDATE languages SET is_default = 1 WHERE code = ?').run(code);
    
    res.json({ message: 'Varsayılan dil güncellendi' });
  } catch (error) {
    console.error('Set default language error:', error);
    res.status(500).json({ message: 'Varsayılan dil güncellenemedi' });
  }
});

// Get all translations for a language
router.get('/:lang', (req, res) => {
  try {
    const { lang } = req.params;
    const translations = db.prepare(`
      SELECT key, value, category FROM translations 
      WHERE lang_code = ?
    `).all(lang);

    // Convert to object format
    const result = {};
    translations.forEach(t => {
      result[t.key] = t.value;
    });

    res.json(result);
  } catch (error) {
    console.error('Get translations error:', error);
    res.status(500).json({ message: 'Çeviriler alınamadı' });
  }
});

// Get all translations grouped by key (admin - for editing)
router.get('/admin/all', auth, (req, res) => {
  try {
    const translations = db.prepare(`
      SELECT t.key, t.lang_code, t.value, t.category
      FROM translations t
      ORDER BY t.category, t.key, t.lang_code
    `).all();

    // Return ALL languages for admin (not just active ones)
    const languages = db.prepare(`
      SELECT code, name, native_name, flag, is_active FROM languages 
      ORDER BY order_index
    `).all();

    // Group by key
    const grouped = {};
    translations.forEach(t => {
      if (!grouped[t.key]) {
        grouped[t.key] = {
          key: t.key,
          category: t.category,
          translations: {}
        };
      }
      grouped[t.key].translations[t.lang_code] = t.value;
    });

    res.json({
      keys: Object.values(grouped),
      languages
    });
  } catch (error) {
    console.error('Get admin translations error:', error);
    res.status(500).json({ message: 'Çeviriler alınamadı' });
  }
});

// Get translation keys by category (admin)
router.get('/admin/category/:category', auth, (req, res) => {
  try {
    const { category } = req.params;
    const translations = db.prepare(`
      SELECT t.key, t.lang_code, t.value
      FROM translations t
      WHERE t.category = ?
      ORDER BY t.key, t.lang_code
    `).all(category);

    const languages = db.prepare(`
      SELECT code, name, native_name, flag FROM languages 
      WHERE is_active = 1 
      ORDER BY order_index
    `).all();

    // Group by key
    const grouped = {};
    translations.forEach(t => {
      if (!grouped[t.key]) {
        grouped[t.key] = {
          key: t.key,
          translations: {}
        };
      }
      grouped[t.key].translations[t.lang_code] = t.value;
    });

    res.json({
      keys: Object.values(grouped),
      languages
    });
  } catch (error) {
    console.error('Get category translations error:', error);
    res.status(500).json({ message: 'Çeviriler alınamadı' });
  }
});

// Update or create translation (admin)
router.put('/:lang/:key', auth, (req, res) => {
  try {
    const { lang, key } = req.params;
    const { value, category } = req.body;

    db.prepare(`
      INSERT INTO translations (lang_code, key, value, category, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(lang_code, key) DO UPDATE SET 
        value = excluded.value,
        category = COALESCE(excluded.category, category),
        updated_at = CURRENT_TIMESTAMP
    `).run(lang, key, value, category || key.split('.')[0]);

    res.json({ message: 'Çeviri güncellendi' });
  } catch (error) {
    console.error('Update translation error:', error);
    res.status(500).json({ message: 'Çeviri güncellenemedi' });
  }
});

// Bulk update translations (admin)
router.put('/bulk/update', auth, (req, res) => {
  try {
    const { translations } = req.body; // Array of { lang_code, key, value }

    const upsert = db.prepare(`
      INSERT INTO translations (lang_code, key, value, category, updated_at)
      VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(lang_code, key) DO UPDATE SET 
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction(() => {
      for (const t of translations) {
        const category = t.key.split('.')[0];
        upsert.run(t.lang_code, t.key, t.value, category);
      }
    });

    transaction();
    res.json({ message: 'Çeviriler güncellendi' });
  } catch (error) {
    console.error('Bulk update translations error:', error);
    res.status(500).json({ message: 'Çeviriler güncellenemedi' });
  }
});

// Add new translation key (admin)
router.post('/key', auth, (req, res) => {
  try {
    const { key, category, translations } = req.body;
    // translations = { tr: 'value', en: 'value', ... }

    const insert = db.prepare(`
      INSERT INTO translations (lang_code, key, value, category)
      VALUES (?, ?, ?, ?)
      ON CONFLICT(lang_code, key) DO UPDATE SET 
        value = excluded.value,
        updated_at = CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction(() => {
      for (const [lang, value] of Object.entries(translations)) {
        insert.run(lang, key, value, category || key.split('.')[0]);
      }
    });

    transaction();
    res.json({ message: 'Çeviri anahtarı eklendi' });
  } catch (error) {
    console.error('Add translation key error:', error);
    res.status(500).json({ message: 'Çeviri anahtarı eklenemedi' });
  }
});

// Delete translation key (admin)
router.delete('/key/:key', auth, (req, res) => {
  try {
    const { key } = req.params;
    db.prepare('DELETE FROM translations WHERE key = ?').run(key);
    res.json({ message: 'Çeviri anahtarı silindi' });
  } catch (error) {
    console.error('Delete translation key error:', error);
    res.status(500).json({ message: 'Çeviri anahtarı silinemedi' });
  }
});

// Get all categories
router.get('/categories/list', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT DISTINCT category FROM translations 
      ORDER BY category
    `).all();
    res.json(categories.map(c => c.category));
  } catch (error) {
    console.error('Get categories error:', error);
    res.status(500).json({ message: 'Kategoriler alınamadı' });
  }
});

// Add missing nav.experiences translations (one-time migration)
router.post('/migrate/nav-experiences', auth, (req, res) => {
  try {
    const experiencesTranslations = {
      'tr': 'Deneyimler',
      'en': 'Experiences',
      'de': 'Erfahrungen',
      'fr': 'Expériences',
      'es': 'Experiencias',
      'pt': 'Experiências',
      'it': 'Esperienze',
      'ru': 'Опыт',
      'zh': '经历',
      'ja': '経験',
      'ko': '경력',
      'ar': 'الخبرات',
      'hi': 'अनुभव',
      'nl': 'Ervaringen',
      'pl': 'Doświadczenia'
    };

    const insertStmt = db.prepare(`
      INSERT OR REPLACE INTO translations (lang_code, key, value, category)
      VALUES (?, ?, ?, ?)
    `);

    for (const [lang, value] of Object.entries(experiencesTranslations)) {
      insertStmt.run(lang, 'nav.experiences', value, 'navigation');
    }

    res.json({ message: 'nav.experiences çevirileri eklendi' });
  } catch (error) {
    console.error('Migration error:', error);
    res.status(500).json({ message: 'Migration başarısız' });
  }
});

module.exports = router;
