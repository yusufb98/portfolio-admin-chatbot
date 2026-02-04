const express = require('express');
const router = express.Router();
const db = require('../database/db');
const authMiddleware = require('../middleware/auth');

// Get all projects (public - only visible ones)
router.get('/', (req, res) => {
  try {
    const { featured, category } = req.query;
    
    let query = 'SELECT * FROM projects WHERE is_visible = 1';
    const params = [];

    if (featured === 'true') {
      query += ' AND featured = 1';
    }

    if (category) {
      query += ' AND category = ?';
      params.push(category);
    }

    query += ' ORDER BY order_index ASC, created_at DESC';

    const projects = db.prepare(query).all(...params);
    
    // Parse technologies from comma-separated string to array
    const formattedProjects = projects.map(project => ({
      ...project,
      technologies: project.technologies ? project.technologies.split(',') : []
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Get projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all projects (admin - including hidden)
router.get('/admin', authMiddleware, (req, res) => {
  try {
    const projects = db.prepare('SELECT * FROM projects ORDER BY order_index ASC').all();
    
    const formattedProjects = projects.map(project => ({
      ...project,
      technologies: project.technologies ? project.technologies.split(',') : []
    }));

    res.json(formattedProjects);
  } catch (error) {
    console.error('Get admin projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get single project
router.get('/:id', (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    project.technologies = project.technologies ? project.technologies.split(',') : [];
    res.json(project);
  } catch (error) {
    console.error('Get project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create project (admin only)
router.post('/', authMiddleware, (req, res) => {
  try {
    const {
      title,
      description,
      short_description,
      image_url,
      live_url,
      github_url,
      technologies,
      category,
      featured,
      is_visible
    } = req.body;

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Get max order_index
    const maxOrder = db.prepare('SELECT MAX(order_index) as max FROM projects').get();
    const orderIndex = (maxOrder.max || 0) + 1;

    const techString = Array.isArray(technologies) ? technologies.join(',') : technologies;

    const result = db.prepare(`
      INSERT INTO projects (title, description, short_description, image_url, live_url, github_url, technologies, category, featured, is_visible, order_index)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      title,
      description || null,
      short_description || null,
      image_url || null,
      live_url || null,
      github_url || null,
      techString || null,
      category || 'Web App',
      featured ? 1 : 0,
      is_visible !== false ? 1 : 0,
      orderIndex
    );

    const newProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(result.lastInsertRowid);
    newProject.technologies = newProject.technologies ? newProject.technologies.split(',') : [];

    res.status(201).json(newProject);
  } catch (error) {
    console.error('Create project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update project (admin only)
router.put('/:id', authMiddleware, (req, res) => {
  try {
    const {
      title,
      description,
      short_description,
      image_url,
      live_url,
      github_url,
      technologies,
      category,
      featured,
      is_visible,
      order_index
    } = req.body;

    const techString = Array.isArray(technologies) ? technologies.join(',') : technologies;

    db.prepare(`
      UPDATE projects SET
        title = COALESCE(?, title),
        description = COALESCE(?, description),
        short_description = COALESCE(?, short_description),
        image_url = COALESCE(?, image_url),
        live_url = COALESCE(?, live_url),
        github_url = COALESCE(?, github_url),
        technologies = COALESCE(?, technologies),
        category = COALESCE(?, category),
        featured = COALESCE(?, featured),
        is_visible = COALESCE(?, is_visible),
        order_index = COALESCE(?, order_index)
      WHERE id = ?
    `).run(
      title,
      description,
      short_description,
      image_url,
      live_url,
      github_url,
      techString,
      category,
      featured !== undefined ? (featured ? 1 : 0) : null,
      is_visible !== undefined ? (is_visible ? 1 : 0) : null,
      order_index,
      req.params.id
    );

    const updatedProject = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    
    if (!updatedProject) {
      return res.status(404).json({ error: 'Project not found' });
    }

    updatedProject.technologies = updatedProject.technologies ? updatedProject.technologies.split(',') : [];
    res.json(updatedProject);
  } catch (error) {
    console.error('Update project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Delete project (admin only)
router.delete('/:id', authMiddleware, (req, res) => {
  try {
    const project = db.prepare('SELECT * FROM projects WHERE id = ?').get(req.params.id);
    
    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    db.prepare('DELETE FROM projects WHERE id = ?').run(req.params.id);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('Delete project error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Reorder projects (admin only)
router.post('/reorder', authMiddleware, (req, res) => {
  try {
    const { projectIds } = req.body;

    if (!Array.isArray(projectIds)) {
      return res.status(400).json({ error: 'projectIds must be an array' });
    }

    const updateStmt = db.prepare('UPDATE projects SET order_index = ? WHERE id = ?');
    
    projectIds.forEach((id, index) => {
      updateStmt.run(index, id);
    });

    res.json({ message: 'Projects reordered successfully' });
  } catch (error) {
    console.error('Reorder projects error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router;
