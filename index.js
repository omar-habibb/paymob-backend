require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY;

app.post('/start-checkout', async (req, res) => {
  try {
    console.log("Incoming data:", req.body);

    const { amount_cents, billing_data } = req.body;

    const checkoutRequest = {
      public_key: PAYMOB_PUBLIC_KEY,
      amount_cents: amount_cents,
      currency: "EGP",
      billing_data: billing_data,
      delivery_needed: false,
      items: [],
      success_url: "https://omar-habibb.github.io/optimum-auto/thankyou.html", // change this!
      cancel_url: "https://yourdomain.com/failed.html"     // optional
    };

    const response = await axios.post('https://accept.paymob.com/api/acceptance/unified_checkout', checkoutRequest);
    console.log("Paymob Response:", response.data);
    const { redirect_url } = response.data;

    if (redirect_url) {
      res.json({ checkout_url: redirect_url });
    } else {
      res.status(400).json({ error: "No checkout URL received." });
    }
  } catch (error) {
    
    console.error("Checkout error:");
console.error("Response Data:", error.response?.data);
console.error("Full Error:", error.toJSON ? error.toJSON() : error);

    res.status(500).json({ error: "Something went wrong with Paymob checkout." });
  }
});

const PORT = 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
