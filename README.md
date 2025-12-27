# PrivateVideoAccess

A turn-key solution to host private video content behind a crypto-currency paywall. Administers can add video embed codes (YouTube, Vimeo, Cloudinary, etc.) and set a USD price. Users unlock access by paying via Coinbase Commerce.

## Features
-   **Crypto-Only Payments**: Supports BTC, ETH, LTC, USDC, DOGE, and more via Coinbase.
-   **Secure Access**: Videos are only accessible after payment confirmation via webhooks.
-   **Session Persistence**: Unlocked videos remain available for the duration of the user's session.
-   **Admin Panel**: Easy management of content and pricing.
-   **SQLite Database**: Simple setup with no external database server required.

## Prerequisites
-   **Node.js**: v16 or higher
-   **Coinbase Commerce Account**: To obtain API keys for payment processing.

## Installation

1.  Clone or download the project files.
2.  Open a terminal in the project directory.
3.  Install dependencies:
    `npm install`
4.  Create a `.env` file in the root directory:
    `cp .env.example .env`
5.  Update your `.env` file with your specific credentials:
    -   `ADMIN_USER`: Your desired admin username.
    -   `ADMIN_PASS`: Your desired admin password.
    -   `COINBASE_API_KEY`: Found in Coinbase Commerce Settings > API keys.
    -   `COINBASE_WEBHOOK_SECRET`: Found in Coinbase Commerce Settings > Webhook subscriptions (Add an endpoint for `http://your-domain.com/webhook/coinbase`).

## How to Run

1.  Start the server:
    `npm start`
2.  Access the application:
    -   Public Gallery: `http://localhost:3000`
    -   Admin Login: `http://localhost:3000/admin/login`

## Production Deployment Note

1.  **Webhook Delivery**: For Coinbase to send webhooks to your local machine during development, use a tool like `ngrok`:
    `ngrok http 3000`
    Then use the ngrok URL in your Coinbase settings: `https://xxxx-xxx.ngrok-free.app/webhook/coinbase`.
2.  **HTTPS**: Always use HTTPS in production. Update `server.js` session configuration to `secure: true`.
3.  **Persistence**: The SQLite database (`database.sqlite`) will be created automatically in the root folder.

## Project Structure
-   `/models/db.js`: Database schema and connection.
-   `/middleware/auth.js`: Logic to check for admin status and payment verification.
-   `/routes/admin.js`: CRUD operations for video management.
-   `/routes/public.js`: Frontend routes and payment initialization.
-   `/routes/webhooks.js`: Listener for payment confirmation from Coinbase.
-   `/views`: HTML templates using EJS for dynamic content.
