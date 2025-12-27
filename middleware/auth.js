const db = require('../models/db');

module.exports = {
    // Check if user is logged in as admin
    isAdmin: (req, res, next) => {
        if (req.session.isAdmin) return next();
        res.redirect('/admin/login');
    },
    
    // Check if user has paid for the specific video
    hasPaidAccess: (req, res, next) => {
        const videoId = parseInt(req.params.id);
        const sessionId = req.sessionID;

        // 1. Check current session cache for speed
        if (req.session.paidVideos && req.session.paidVideos.includes(videoId)) {
            return next();
        }

        // 2. Verify against database (persistent access for that session)
        db.get(
            'SELECT * FROM transactions WHERE video_id = ? AND (session_id = ? OR status = "confirmed") AND status = "confirmed"', 
            [videoId, sessionId], 
            (err, row) => {
                if (err) {
                    console.error('Auth Check Error:', err);
                    return res.status(500).send('Internal Server Error');
                }

                if (row) {
                    // Update session cache
                    if (!req.session.paidVideos) req.session.paidVideos = [];
                    if (!req.session.paidVideos.includes(videoId)) {
                        req.session.paidVideos.push(videoId);
                    }
                    return next();
                }

                // If no record found or not confirmed, redirect to checkout
                res.redirect(`/checkout/${videoId}`);
            }
        );
    }
};
