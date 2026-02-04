const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

// Get profile (public)
router.get('/', (req, res) => {
  try {
    const profile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    
    if (!profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    res.json(profile);
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update profile (admin only)
router.put('/', authMiddleware, (req, res) => {
  try {
    const {
      full_name,
      title,
      bio,
      avatar_url,
      github_url,
      linkedin_url,
      twitter_url,
      email,
      phone,
      location,
      cv_url,
      hero_subtitle,
      years_experience,
      projects_completed
    } = req.body;

    const stmt = db.prepare(`
      UPDATE profile SET
        full_name = COALESCE(?, full_name),
        title = COALESCE(?, title),
        bio = COALESCE(?, bio),
        avatar_url = COALESCE(?, avatar_url),
        github_url = COALESCE(?, github_url),
        linkedin_url = COALESCE(?, linkedin_url),
        twitter_url = COALESCE(?, twitter_url),
        email = COALESCE(?, email),
        phone = COALESCE(?, phone),
        location = COALESCE(?, location),
        cv_url = COALESCE(?, cv_url),
        hero_subtitle = COALESCE(?, hero_subtitle),
        years_experience = COALESCE(?, years_experience),
        projects_completed = COALESCE(?, projects_completed),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `);

    stmt.run(
      full_name, title, bio, avatar_url, github_url, linkedin_url,
      twitter_url, email, phone, location, cv_url, hero_subtitle,
      years_experience, projects_completed
    );

    const updatedProfile = db.prepare('SELECT * FROM profile WHERE id = 1').get();
    res.json(updatedProfile);
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
