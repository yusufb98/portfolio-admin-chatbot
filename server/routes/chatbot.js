const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

// Get chatbot config (public)
router.get('/config', (req, res) => {
  try {
    const config = db.prepare('SELECT * FROM chatbot_config WHERE id = 1').get();
    res.json(config);
  } catch (error) {
    console.error('Get chatbot config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update chatbot config (admin only)
router.put('/config', authMiddleware, (req, res) => {
  try {
    const {
      bot_name,
      welcome_message,
      fallback_message,
      bot_avatar,
      theme_color,
      is_active,
      response_delay
    } = req.body;

    db.prepare(`
      UPDATE chatbot_config SET
        bot_name = COALESCE(?, bot_name),
        welcome_message = COALESCE(?, welcome_message),
        fallback_message = COALESCE(?, fallback_message),
        bot_avatar = COALESCE(?, bot_avatar),
        theme_color = COALESCE(?, theme_color),
        is_active = COALESCE(?, is_active),
        response_delay = COALESCE(?, response_delay),
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `).run(
      bot_name,
      welcome_message,
      fallback_message,
      bot_avatar,
      theme_color,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      response_delay
    );

    const updatedConfig = db.prepare('SELECT * FROM chatbot_config WHERE id = 1').get();
    res.json(updatedConfig);
  } catch (error) {
    console.error('Update chatbot config error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all Q&A pairs (admin)
router.get('/qa', authMiddleware, (req, res) => {
  try {
    const qaPairs = db.prepare('SELECT * FROM chatbot_qa ORDER BY order_index ASC').all();
    res.json(qaPairs);
  } catch (error) {
    console.error('Get Q&A pairs error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create Q&A pair (admin only)
router.post('/qa', authMiddleware, (req, res) => {
  try {
    const { keywords, question, answer, category, is_active } = req.body;

    if (!keywords || !question || !answer) {
      return res.status(400).json({ error: 'Keywords, question, and answer are required' });
    }

    const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM chatbot_qa').get();
    const orderIndex = (maxOrder.max || 0) + 1;

    const result = db.prepare(`
      INSERT INTO chatbot_qa (keywords, question, answer, category, is_active, order_index)
      VALUES (?, ?, ?, ?, ?, ?)
    `).run(keywords, question, answer, category || 'general', is_active !== false ? 1 : 0, orderIndex);

    const newQA = db.prepare('SELECT * FROM chatbot_qa WHERE id = ?').get(result.lastInsertRowid);
    res.status(201).json(newQA);
  } catch (error) {
    console.error('Create Q&A error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update Q&A pair (admin only)
router.put('/qa/:id', authMiddleware, (req, res) => {
  try {
    const { keywords, question, answer, category, is_active, order_index } = req.body;

    db.prepare(`
      UPDATE chatbot_qa SET
        keywords = COALESCE(?, keywords),
        question = COALESCE(?, question),
        answer = COALESCE(?, answer),
        category = COALESCE(?, category),
        is_active = COALESCE(?, is_active),
        order_index = COALESCE(?, order_index)
      WHERE id = ?
    `).run(
      keywords,
      question,
      answer,
      category,
      is_active !== undefined ? (is_active ? 1 : 0) : null,
      order_index,
      req.params.id
    );

    const updatedQA = db.prepare('SELECT * FROM chatbot_qa WHERE id = ?').get(req.params.id);
    
    if (!updatedQA) {
      return res.status(404).json({ error: 'Q&A pair not found' });
    }

    res.json(updatedQA);
  } catch (error) {
    console.error('Update Q&A error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete Q&A pair (admin only)
router.delete('/qa/:id', authMiddleware, (req, res) => {
  try {
    const qa = db.prepare('SELECT * FROM chatbot_qa WHERE id = ?').get(req.params.id);
    
    if (!qa) {
      return res.status(404).json({ error: 'Q&A pair not found' });
    }

    db.prepare('DELETE FROM chatbot_qa WHERE id = ?').run(req.params.id);
    res.json({ message: 'Q&A pair deleted successfully' });
  } catch (error) {
    console.error('Delete Q&A error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Chat endpoint (public)
router.post('/chat', (req, res) => {
  try {
    const { message, visitor_id, visitor_name } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // Check if chatbot is active
    const config = db.prepare('SELECT * FROM chatbot_config WHERE id = 1').get();
    
    if (!config.is_active) {
      return res.json({
        response: 'Chatbot şu anda aktif değil. Lütfen daha sonra tekrar deneyin.',
        matched: false
      });
    }

    // Find matching Q&A
    const qaPairs = db.prepare('SELECT * FROM chatbot_qa WHERE is_active = 1 ORDER BY order_index ASC').all();
    
    const messageLower = message.toLowerCase().trim();
    let matchedQA = null;
    let bestMatchScore = 0;

    for (const qa of qaPairs) {
      const keywords = qa.keywords.toLowerCase().split(',').map(k => k.trim());
      
      for (const keyword of keywords) {
        if (messageLower.includes(keyword)) {
          // Simple scoring: longer keyword matches are better
          const score = keyword.length;
          if (score > bestMatchScore) {
            bestMatchScore = score;
            matchedQA = qa;
          }
        }
      }
    }

    let response;
    let matchedQaId = null;

    if (matchedQA) {
      response = matchedQA.answer;
      matchedQaId = matchedQA.id;
      
      // Update hit count
      db.prepare('UPDATE chatbot_qa SET hit_count = hit_count + 1 WHERE id = ?').run(matchedQA.id);
    } else {
      response = config.fallback_message;
    }

    // Save chat message
    const visitorIdToUse = visitor_id || `visitor_${Date.now()}`;
    
    db.prepare(`
      INSERT INTO chat_messages (visitor_id, visitor_name, message, response, matched_qa_id, ip_address, user_agent)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(
      visitorIdToUse,
      visitor_name || null,
      message,
      response,
      matchedQaId,
      req.ip,
      req.get('user-agent')
    );

    res.json({
      response,
      matched: !!matchedQA,
      visitor_id: visitorIdToUse
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat history (admin only)
router.get('/messages', authMiddleware, (req, res) => {
  try {
    const { limit = 100, offset = 0 } = req.query;
    
    const messages = db.prepare(`
      SELECT cm.*, cq.question as matched_question
      FROM chat_messages cm
      LEFT JOIN chatbot_qa cq ON cm.matched_qa_id = cq.id
      ORDER BY cm.created_at DESC
      LIMIT ? OFFSET ?
    `).all(parseInt(limit), parseInt(offset));

    const total = db.prepare('SELECT COUNT(*) as count FROM chat_messages').get();

    res.json({
      messages,
      total: total.count,
      limit: parseInt(limit),
      offset: parseInt(offset)
    });
  } catch (error) {
    console.error('Get messages error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get chat statistics (admin only)
router.get('/stats', authMiddleware, (req, res) => {
  try {
    const totalMessages = db.prepare('SELECT COUNT(*) as count FROM chat_messages').get();
    const matchedMessages = db.prepare('SELECT COUNT(*) as count FROM chat_messages WHERE matched_qa_id IS NOT NULL').get();
    const uniqueVisitors = db.prepare('SELECT COUNT(DISTINCT visitor_id) as count FROM chat_messages').get();
    const todayMessages = db.prepare(`
      SELECT COUNT(*) as count FROM chat_messages 
      WHERE date(created_at) = date('now')
    `).get();

    const topQuestions = db.prepare(`
      SELECT question, hit_count FROM chatbot_qa 
      WHERE hit_count > 0 
      ORDER BY hit_count DESC 
      LIMIT 5
    `).all();

    res.json({
      total_messages: totalMessages.count,
      matched_messages: matchedMessages.count,
      match_rate: totalMessages.count > 0 
        ? ((matchedMessages.count / totalMessages.count) * 100).toFixed(1) 
        : 0,
      unique_visitors: uniqueVisitors.count,
      today_messages: todayMessages.count,
      top_questions: topQuestions
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
