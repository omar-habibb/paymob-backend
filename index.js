require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

// Load variables from Railway environment
const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY;
const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY;
const PAYMOB_INTEGRATION_ID = parseInt(process.env.PAYMOB_INTEGRATION_ID);

// Log the variables to ensure they're loaded (for debugging only)
console.log("🧪 PAYMOB_PUBLIC_KEY:", PAYMOB_PUBLIC_KEY);
console.log("🧪 PAYMOB_SECRET_KEY:", PAYMOB_SECRET_KEY);
console.log("🧪 PAYMOB_INTEGRATION_ID:", PAYMOB_INTEGRATION_ID);

// Optional root route to test backend is alive
app.get("/", (req, res) => {
  res.send("Backend is alive 🧠");
});

app.post('/start-checkout', async (req, res) => {
  try {
    const { amount_cents, billing_data } = req.body;

    const intentionPayload = {
      amount_cents,
      currency: "EGP",
      integration_id: PAYMOB_INTEGRATION_ID,
      billing_data,
      items: [],
      redirection_url: "https://omar-habibb.github.io/optimum-auto/thankyou.html",
      notification_url: "https://webhook.site/your-test-url" // Replace for live setup
    };

    const paymobResponse = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      intentionPayload,
      {
        headers: {
          Authorization: `Bearer ${PAYMOB_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const { client_secret } = paymobResponse.data;

    if (client_secret) {
      const checkout_url = `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${client_secret}`;
      return res.json({ checkout_url });
    } else {
      return res.status(400).json({ error: "Missing client_secret in Paymob response." });
    }

  } catch (error) {
    console.error("❌ PAYMOB INTENTION API ERROR ❌");

    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Data:", error.response.data);
    } else {
      console.error("Error:", error.message);
    }

    return res.status(500).json({ error: "Something went wrong with Paymob checkout." });
  }
});

// ✅ Use dynamic port for Railway deployment
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
