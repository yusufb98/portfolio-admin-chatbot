const express = require('express');
const router = express.Router();
const db = require('../database/db');
const auth = require('../middleware/auth');

// Get all settings (public for some, admin for others)
router.get('/', (req, res) => {
  try {
    const settings = db.prepare('SELECT key, value FROM site_settings').all();
    const settingsObj = {};
    settings.forEach(s => {
      // Parse JSON values
      try {
        settingsObj[s.key] = JSON.parse(s.value);
      } catch {
        settingsObj[s.key] = s.value;
      }
    });
    res.json(settingsObj);
  } catch (error) {
    console.error('Get settings error:', error);
    res.status(500).json({ message: 'Ayarlar alınamadı' });
  }
});

// Update settings (admin only)
router.put('/', auth, (req, res) => {
  try {
    const settings = req.body;
    
    const upsert = db.prepare(`
      INSERT INTO site_settings (key, value)
      VALUES (?, ?)
      ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = CURRENT_TIMESTAMP
    `);

    const transaction = db.transaction(() => {
      for (const [key, value] of Object.entries(settings)) {
        const stringValue = typeof value === 'object' ? JSON.stringify(value) : String(value);
        upsert.run(key, stringValue);
      }
    });

    transaction();
    res.json({ message: 'Ayarlar kaydedildi' });
  } catch (error) {
    console.error('Update settings error:', error);
    res.status(500).json({ message: 'Ayarlar kaydedilemedi' });
  }
});

module.exports = router;
