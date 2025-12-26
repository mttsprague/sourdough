const express = require('express');
const stripe = require('stripe')('sk_test_YOUR_SECRET_KEY_HERE'); // Replace with your secret key
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
    origin: ['http://localhost:3000', 'https://mttsprague.github.io']
}));
app.use(express.json());

// Create Stripe Checkout Session
app.post('/create-checkout-session', async (req, res) => {
    try {
        const { items } = req.body;

        // Convert cart items to Stripe line items
        const lineItems = items.map(item => ({
            price_data: {
                currency: 'usd',
                product_data: {
                    name: item.name,
                    images: [], // You can add product images here
                },
                unit_amount: Math.round(item.price * 100), // Convert to cents
            },
            quantity: item.quantity,
        }));

        // Create checkout session
        const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: lineItems,
            mode: 'payment',
            success_url: 'https://mttsprague.github.io/sourdough/?success=true',
            cancel_url: 'https://mttsprague.github.io/sourdough/?canceled=true',
            shipping_address_collection: {
                allowed_countries: ['US'],
            },
            customer_email: '', // Optionally collect email
        });

        res.json({ id: session.id });
    } catch (error) {
        console.error('Error creating checkout session:', error);
        res.status(500).json({ error: error.message });
    }
});

// Webhook to handle successful payments (optional but recommended)
app.post('/webhook', express.raw({ type: 'application/json' }), (req, res) => {
    const sig = req.headers['stripe-signature'];
    const webhookSecret = 'whsec_YOUR_WEBHOOK_SECRET'; // You'll get this from Stripe

    let event;

    try {
        event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
    } catch (err) {
        return res.status(400).send(`Webhook Error: ${err.message}`);
    }

    // Handle the event
    if (event.type === 'checkout.session.completed') {
        const session = event.data.object;
        console.log('Payment successful:', session);
        // Here you can send confirmation email, update inventory, etc.
    }

    res.json({ received: true });
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
