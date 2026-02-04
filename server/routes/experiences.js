const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

// Get all visible experiences (public)
router.get('/', (req, res) => {
  try {
    const experiences = db.prepare(`
      SELECT * FROM experiences 
      WHERE is_visible = 1 
      ORDER BY order_index ASC, start_date DESC
    `).all();
    res.json(experiences);
  } catch (error) {
    console.error('Get experiences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all experiences for admin (including hidden)
router.get('/admin', authMiddleware, (req, res) => {
  try {
    const experiences = db.prepare(`
      SELECT * FROM experiences 
      ORDER BY order_index ASC, start_date DESC
    `).all();
    res.json(experiences);
  } catch (error) {
    console.error('Get admin experiences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get experience by ID
router.get('/:id', (req, res) => {
  try {
    const experience = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }
    
    res.json(experience);
  } catch (error) {
    console.error('Get experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create new experience (admin only)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { 
      title, 
      organization, 
      description, 
      start_date, 
      end_date, 
      location, 
      type,
      image_url,
      link_url,
      is_current,
      is_visible 
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM experiences').get();
    const orderIndex = (maxOrder.max || 0) + 1;

    const result = db.prepare(`
      INSERT INTO experiences (
        title, organization, description, start_date, end_date, 
        location, type, image_url, link_url, is_current, is_visible, order_index
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      organization || null,
      description || null,
      start_date || null,
      end_date || null,
      location || null,
      type || 'work',
      image_url || null,
      link_url || null,
      is_current ? 1 : 0,
      is_visible !== false ? 1 : 0,
      orderIndex
    );

    const newExperience = db.prepare('SELECT * FROM experiences WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newExperience);
  } catch (error) {
    console.error('Create experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update experience (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { 
      title, 
      organization, 
      description, 
      start_date, 
      end_date, 
      location, 
      type,
      image_url,
      link_url,
      is_current,
      is_visible,
      order_index 
    } = req.body;

    db.prepare(`
      UPDATE experiences SET
        title = COALESCE(?, title),
        organization = COALESCE(?, organization),
        description = COALESCE(?, description),
        start_date = COALESCE(?, start_date),
        end_date = COALESCE(?, end_date),
        location = COALESCE(?, location),
        type = COALESCE(?, type),
        image_url = COALESCE(?, image_url),
        link_url = COALESCE(?, link_url),
        is_current = COALESCE(?, is_current),
        is_visible = COALESCE(?, is_visible),
        order_index = COALESCE(?, order_index)
      WHERE id = ?
    `).run(
      title, organization, description, start_date, end_date,
      location, type, image_url, link_url, 
      is_current !== undefined ? (is_current ? 1 : 0) : null,
      is_visible !== undefined ? (is_visible ? 1 : 0) : null,
      order_index, 
      req.params.id
    );

    const updatedExperience = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id);
    
    if (!updatedExperience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    res.json(updatedExperience);
  } catch (error) {
    console.error('Update experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete experience (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const experience = db.prepare('SELECT * FROM experiences WHERE id = ?').get(req.params.id);
    
    if (!experience) {
      return res.status(404).json({ error: 'Experience not found' });
    }

    db.prepare('DELETE FROM experiences WHERE id = ?').run(req.params.id);
    res.json({ message: 'Experience deleted successfully' });
  } catch (error) {
    console.error('Delete experience error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reorder experiences (admin only)
router.post('/reorder', authMiddleware, (req, res) => {
  try {
    const { experienceIds } = req.body;

    if (!Array.isArray(experienceIds)) {
      return res.status(400).json({ error: 'experienceIds must be an array' });
    }

    const updateOrder = db.prepare('UPDATE experiences SET order_index = ? WHERE id = ?');
    
    const transaction = db.transaction(() => {
      experienceIds.forEach((id, index) => {
        updateOrder.run(index, id);
      });
    });

    transaction();
    res.json({ message: 'Order updated successfully' });
  } catch (error) {
    console.error('Reorder experiences error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
