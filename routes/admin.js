const express = require('express');
const router = express.Router();
const db = require('../models/db');
const { isAdmin } = require('../middleware/auth');

// Admin Login Page
router.get('/login', (req, res) => {
    res.render('admin/login');
});

// Handle Login Logic
router.post('/login', (req, res) => {
    const { username, password } = req.body;
    const envUser = process.env.ADMIN_USER || 'admin';
    const envPass = process.env.ADMIN_PASS || 'password123';

    if (username === envUser && password === envPass) {
        req.session.isAdmin = true;
        return res.redirect('/admin/dashboard');
    }
    res.send('Invalid credentials. <a href="/admin/login">Try again</a>');
});

// Logout
router.get('/logout', (req, res) => {
    req.session.isAdmin = false;
    res.redirect('/admin/login');
});

// Dashboard - Manage Videos
router.get('/dashboard', isAdmin, (req, res) => {
    db.all('SELECT * FROM videos ORDER BY id DESC', [], (err, rows) => {
        if (err) return res.status(500).send('DB Error');
        res.render('admin/dashboard', { videos: rows || [] });
    });
});

// Add New Video
router.post('/videos/add', isAdmin, (req, res) => {
    const { title, description, price, embed_code } = req.body;
    db.run(
        'INSERT INTO videos (title, description, price, embed_code) VALUES (?, ?, ?, ?)',
        [title, description, parseFloat(price), embed_code], 
        (err) => {
            if (err) console.error(err);
            res.redirect('/admin/dashboard');
        }
    );
});

// Delete Video
router.post('/videos/delete/:id', isAdmin, (req, res) => {
    db.run('DELETE FROM videos WHERE id = ?', [req.params.id], (err) => {
        if (err) console.error(err);
        res.redirect('/admin/dashboard');
    });
});

module.exports = router;
