# Rachel's Rise - Backend Setup

This backend server handles Stripe payment processing for the Rachel's Rise website.

## Setup Instructions

### 1. Create a Stripe Account
1. Go to https://stripe.com
2. Sign up for a free account
3. Complete verification

### 2. Get Your Stripe Keys
1. Go to https://dashboard.stripe.com/test/apikeys
2. Copy your **Publishable key** (starts with `pk_test_`)
3. Copy your **Secret key** (starts with `sk_test_`)

### 3. Configure the Application

**Update Frontend (script.js):**
```javascript
const STRIPE_PUBLISHABLE_KEY = 'pk_test_YOUR_ACTUAL_KEY';
const BACKEND_URL = 'https://your-backend-url.com';
```

**Update Backend (server.js):**
```javascript
const stripe = require('stripe')('sk_test_YOUR_ACTUAL_SECRET_KEY');
```

### 4. Deploy the Backend

#### Option A: Deploy to Render (Free & Easy)
1. Go to https://render.com and sign up
2. Click "New +" → "Web Service"
3. Connect your GitHub repository
4. Configure:
   - **Name**: rachels-rise-backend
   - **Root Directory**: backend
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Click "Create Web Service"
6. Copy your service URL (e.g., `https://rachels-rise-backend.onrender.com`)
7. Update `BACKEND_URL` in script.js with this URL

#### Option B: Deploy to Railway (Alternative)
1. Go to https://railway.app and sign up
2. Create new project → Deploy from GitHub
3. Select your repository
4. Set root directory to `backend`
5. Deploy and copy your URL

#### Option C: Deploy to Heroku
1. Install Heroku CLI
2. Run:
```bash
cd backend
heroku create rachels-rise-backend
git push heroku main
```

### 5. Test the Integration
1. Use test card: `4242 4242 4242 4242`
2. Any future expiry date
3. Any CVC

### 6. Go Live
1. Switch from test keys to live keys in Stripe Dashboard
2. Update both frontend and backend with live keys
3. Test with real payment

## Local Development

```bash
cd backend
npm install
npm start
```

Server will run on http://localhost:3000

## Environment Variables (Optional)
Create a `.env` file:
```
STRIPE_SECRET_KEY=sk_test_your_key
PORT=3000
```

Update server.js to use:
```javascript
require('dotenv').config();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
```
