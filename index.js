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
    const { amount_cents, billing_data } = req.body;

    // Log incoming request data (optional)
    console.log("📩 Received checkout request:");
    console.log("Amount:", amount_cents);
    console.log("Billing Data:", billing_data);

    const checkoutRequest = {
      public_key: PAYMOB_PUBLIC_KEY,
      amount_cents,
      currency: "EGP",
      billing_data,
      delivery_needed: false,
      items: [],
      success_url: "https://omar-habibb.github.io/optimum-auto/thankyou.html",
      cancel_url: "https://omar-habibb.github.io/optimum-auto/cancel.html" // optional
    };

    const response = await axios.post(
      'https://accept.paymob.com/api/acceptance/unified_checkout',
      checkoutRequest
    );

    const { redirect_url } = response.data;

    if (redirect_url) {
      console.log("✅ Checkout URL:", redirect_url);
      res.json({ checkout_url: redirect_url });
    } else {
      console.log("⚠️ No redirect_url returned.");
      res.status(400).json({ error: "No checkout URL received." });
    }

  } catch (error) {
    console.error("❌ PAYMOB UNIFIED CHECKOUT ERROR ❌");

    if (error.response) {
      console.error("🔹 Status Code:", error.response.status);
      console.error("🔹 Response Data:", error.response.data);
    } else {
      console.error("🔸 General Error:", error.message);
    }

    res.status(500).json({ error: "Something went wrong with Paymob checkout." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
