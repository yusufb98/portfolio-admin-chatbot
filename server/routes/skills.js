const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

// ==================== SKILL CATEGORIES ====================

// Get all skill categories (public)
router.get('/categories', (req, res) => {
  try {
    const categories = db.prepare(`
      SELECT * FROM skill_categories 
      ORDER BY order_index ASC
    `).all();
    res.json(categories);
  } catch (error) {
    console.error('Get skill categories error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create skill category (admin only)
router.post('/categories', authMiddleware, (req, res) => {
  try {
    const { name, icon, color } = req.body;

    if (!name) {
      return res.status(400).json({ error: 'Name is required' });
    }

    const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM skill_categories').get();
    const orderIndex = (maxOrder.max || 0) + 1;

    const result = db.prepare(`
      INSERT INTO skill_categories (name, icon, color, order_index)
      VALUES (?, ?, ?, ?)
    `).run(name, icon || null, color || '#6366f1', orderIndex);

    const newCategory = db.prepare('SELECT * FROM skill_categories WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newCategory);
  } catch (error) {
    if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
      return res.status(400).json({ error: 'Category already exists' });
    }
    console.error('Create skill category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update skill category (admin only)
router.put('/categories/:id', authMiddleware, (req, res) => {
  try {
    const { name, icon, color, order_index } = req.body;

    db.prepare(`
      UPDATE skill_categories SET
        name = COALESCE(?, name),
        icon = COALESCE(?, icon),
        color = COALESCE(?, color),
        order_index = COALESCE(?, order_index)
      WHERE id = ?
    `).run(name, icon, color, order_index, req.params.id);

    const updatedCategory = db.prepare('SELECT * FROM skill_categories WHERE id = ?').get(req.params.id);
    
    if (!updatedCategory) {
      return res.status(404).json({ error: 'Category not found' });
    }

    res.json(updatedCategory);
  } catch (error) {
    console.error('Update skill category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete skill category (admin only)
router.delete('/categories/:id', authMiddleware, (req, res) => {
  try {
    const category = db.prepare('SELECT * FROM skill_categories WHERE id = ?').get(req.params.id);
    
    if (!category) {
      return res.status(404).json({ error: 'Category not found' });
    }

    // Update skills with this category to 'Diğer'
    db.prepare('UPDATE skills SET category = ? WHERE category = ?').run('Diğer', category.name);

    db.prepare('DELETE FROM skill_categories WHERE id = ?').run(req.params.id);
    res.json({ message: 'Category deleted successfully' });
  } catch (error) {
    console.error('Delete skill category error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// ==================== SKILLS ====================

// Get all skills (public)
router.get('/', (req, res) => {
  try {
    const { category } = req.query;
    
    let query = 'SELECT * FROM skills';
    const params = [];

    if (category) {
      query += ' WHERE category = ?';
      params.push(category);
    }

    query += ' ORDER BY order_index ASC';

    const skills = db.prepare(query).all(...params);
    res.json(skills);
  } catch (error) {
    console.error('Get skills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get skills grouped by category
router.get('/grouped', (req, res) => {
  try {
    const skills = db.prepare('SELECT * FROM skills ORDER BY order_index ASC').all();
    
    const grouped = skills.reduce((acc, skill) => {
      if (!acc[skill.category]) {
        acc[skill.category] = [];
      }
      acc[skill.category].push(skill);
      return acc;
    }, {});

    res.json(grouped);
  } catch (error) {
    console.error('Get grouped skills error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create skill (admin only)
router.post('/', authMiddleware, (req, res) => {
  try {
    const { name, category, proficiency, icon, color } = req.body;

    if (!name || !category) {
      return res.status(400).json({ error: 'Name and category are required' });
    }

    const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM skills').get();
    const orderIndex = (maxOrder.max || 0) + 1;

    const result = db.prepare(`
      INSERT INTO skills (name, category, proficiency, icon, color, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(name, category, proficiency || 80, icon || null, color || '#6366f1', orderIndex);

    const newSkill = db.prepare('SELECT * FROM skills WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newSkill);
  } catch (error) {
    console.error('Create skill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update skill (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const { name, category, proficiency, icon, color, order_index } = req.body;

    db.prepare(`
      UPDATE skills SET
        name = COALESCE(?, name),
        category = COALESCE(?, category),
        proficiency = COALESCE(?, proficiency),
        icon = COALESCE(?, icon),
        color = COALESCE(?, color),
        order_index = COALESCE(?, order_index)
      WHERE id = ?
    `).run(name, category, proficiency, icon, color, order_index, req.params.id);

    const updatedSkill = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
    
    if (!updatedSkill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    res.json(updatedSkill);
  } catch (error) {
    console.error('Update skill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete skill (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const skill = db.prepare('SELECT * FROM skills WHERE id = ?').get(req.params.id);
    
    if (!skill) {
      return res.status(404).json({ error: 'Skill not found' });
    }

    db.prepare('DELETE FROM skills WHERE id = ?').run(req.params.id);
    res.json({ message: 'Skill deleted successfully' });
  } catch (error) {
    console.error('Delete skill error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
