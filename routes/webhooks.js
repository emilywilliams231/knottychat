const express = require('express');
const router = express.Router();
const db = require('../models/db');
const crypto = require('crypto');

/**
 * Webhook handler for Coinbase Commerce
 * Coinbase sends events here when payment status changes
 */
router.post('/coinbase', (req, res) => {
    const signature = req.headers['x-cc-webhook-signature'];
    const secret = process.env.COINBASE_WEBHOOK_SECRET;

    // Verify Webhook Signature (Safety Check)
    if (secret && signature) {
        const hash = crypto
            .createHmac('sha256', secret)
            .update(JSON.stringify(req.body))
            .digest('hex');

        if (hash !== signature) {
            console.error('Invalid Webhook Signature');
            return res.status(400).send('Invalid signature');
        }
    }

    const event = req.body.event;
    console.log(`Received Webhook Event: ${event.type}`);

    // We specifically care about confirmed charges
    if (event.type === 'charge:confirmed' || event.type === 'charge:resolved') {
        const chargeCode = event.data.code;
        
        db.run(
            'UPDATE transactions SET status = "confirmed" WHERE charge_id = ?',
            [chargeCode],
            function(err) {
                if (err) {
                    console.error('Error updating transaction:', err.message);
                } else {
                    console.log(`Transaction confirmed for charge: ${chargeCode}`);
                }
            }
        );
    }

    // Always return 200 to acknowledge receipt
    res.status(200).send('Webhook Received');
});

module.exports = router;
