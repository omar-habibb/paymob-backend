const express = require('express');
const axios = require('axios');
const cors = require('cors');
require('dotenv').config();

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

app.post('/start-payment', async (req, res) => {
  try {
    const { amount_cents, billing_data } = req.body;

    // Step 1: Get auth token
    const auth = await axios.post('https://accept.paymob.com/api/auth/tokens', {
      api_key: process.env.API_KEY
    });

    const token = auth.data.token;

    // Step 2: Create order
    const order = await axios.post('https://accept.paymob.com/api/ecommerce/orders', {
      auth_token: token,
      delivery_needed: false,
      amount_cents: amount_cents,
      currency: "EGP",
      items: []
    });

    const orderId = order.data.id;

    // Step 3: Create payment key
    const paymentKey = await axios.post('https://accept.paymob.com/api/acceptance/payment_keys', {
      auth_token: token,
      amount_cents: amount_cents,
      expiration: 3600,
      order_id: orderId,
      billing_data: billing_data,
      currency: "EGP",
      integration_id: process.env.INTEGRATION_ID
    });

    const iframe_url = `https://accept.paymob.com/api/acceptance/iframes/${process.env.IFRAME_ID}?payment_token=${paymentKey.data.token}`;

    res.json({ iframe_url });
  } catch (err) {
    console.error(err.response?.data || err.message);
    res.status(500).json({ error: 'Something went wrong', details: err.message });
  }
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});
 
