const express = require('express');
const router = express.Router();
const db = require('../models/db');
const axios = require('axios');
const { hasPaidAccess } = require('../middleware/auth');

// Homepage - List all published videos
router.get('/', (req, res) => {
    db.all('SELECT id, title, description, price FROM videos WHERE is_published = 1', [], (err, rows) => {
        if (err) return res.status(500).send('Database error');
        res.render('index', { videos: rows || [] });
    });
});

// Checkout Initiation - Creates a Coinbase Charge
router.get('/checkout/:id', (req, res) => {
    db.get('SELECT * FROM videos WHERE id = ?', [req.params.id], async (err, video) => {
        if (err || !video) return res.status(404).send('Video not found');
        
        // If the API key is missing, provide a clear error
        if (!process.env.COINBASE_API_KEY) {
            return res.status(500).send('Coinbase API Key is not configured in .env');
        }

        try {
            // Create a Charge on Coinbase Commerce
            const response = await axios.post('https://api.commerce.coinbase.com/charges', {
                name: `Unlock: ${video.title}`,
                description: video.description,
                pricing_type: 'fixed_price',
                local_price: { 
                    amount: video.price.toString(), 
                    currency: 'USD' 
                },
                metadata: {
                    video_id: video.id,
                    session_id: req.sessionID
                },
                redirect_url: `${req.protocol}://${req.get('host')}/video/${video.id}`,
                cancel_url: `${req.protocol}://${req.get('host')}/`
            }, {
                headers: {
                    'X-CC-Api-Key': process.env.COINBASE_API_KEY,
                    'X-CC-Version': '2018-03-22',
                    'Content-Type': 'application/json'
                }
            });

            const chargeData = response.data.data;

            // Save pending transaction to DB
            db.run(
                'INSERT INTO transactions (charge_id, video_id, session_id, status) VALUES (?, ?, ?, ?)',
                [chargeData.code, video.id, req.sessionID, 'pending'],
                (err) => {
                    if (err) console.error('Error saving transaction:', err.message);
                }
            );

            // Redirect user to the hosted payment page
            res.redirect(chargeData.hosted_url);
        } catch (error) {
            console.error('Coinbase API Error:', error.response ? error.response.data : error.message);
            res.status(500).send('Error creating payment charge. Please check console logs.');
        }
    });
});

// Protected Video Page
router.get('/video/:id', hasPaidAccess, (req, res) => {
    db.get('SELECT title, embed_code FROM videos WHERE id = ?', [req.params.id], (err, video) => {
        if (err || !video) return res.status(404).send('Video not found');
        res.render('video', { video });
    });
});

module.exports = router;
