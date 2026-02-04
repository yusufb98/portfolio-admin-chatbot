const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

// Submit contact message (public)
router.post('/', (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email, and message are required' });
    }

    const result = db.prepare(`
      INSERT INTO contact_messages (name, email, subject, message)
      VALUES (?, ?, ?, ?)
    `).run(name, email, subject || null, message);

    res.status(201).json({
      message: 'Message sent successfully',
      id: result.lastInsertRowid
    });
  } catch (error) {
    console.error('Submit contact error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all contact messages (admin only)
router.get('/', authMiddleware, (req, res) => {
  try {
    const { is_read, limit = 50, offset = 0 } = req.query;
    
    let query = 'SELECT * FROM contact_messages';
    const params = [];

    if (is_read !== undefined) {
      query += ' WHERE is_read = ?';
      params.push(is_read === 'true' ? 1 : 0);
    }

    query += ' ORDER BY created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const messages = db.prepare(query).all(...params);
    const total = db.prepare('SELECT COUNT(*) as count FROM contact_messages').get();
    const unread = db.prepare('SELECT COUNT(*) as count FROM contact_messages WHERE is_read = 0').get();

    res.json({
      messages,
      total: total.count,
      unread: unread.count
    });
  } catch (error) {
    console.error('Get contact messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Mark message as read (admin only)
router.put('/:id/read', authMiddleware, (req, res) => {
  try {
    db.prepare('UPDATE contact_messages SET is_read = 1 WHERE id = ?').run(req.params.id);
    res.json({ message: 'Marked as read' });
  } catch (error) {
    console.error('Mark read error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete contact message (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const message = db.prepare('SELECT * FROM contact_messages WHERE id = ?').get(req.params.id);
    
    if (!message) {
      return res.status(404).json({ error: 'Message not found' });
    }

    db.prepare('DELETE FROM contact_messages WHERE id = ?').run(req.params.id);
    res.json({ message: 'Message deleted successfully' });
  } catch (error) {
    console.error('Delete message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
