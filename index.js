require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY;
const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY;

app.post('/start-checkout', async (req, res) => {
  try {
    const { amount_cents, billing_data } = req.body;

    const intentionBody = {
      amount_cents,
      currency: "EGP",
      integration_id: YOUR_INTEGRATION_ID, // <- Replace this with your real Integration ID
      billing_data,
      items: [],
      redirection_url: "https://omar-habibb.github.io/optimum-auto/thankyou.html",
      notification_url: "https://webhook.site/your-test-webhook-url" // Optional for now
    };

    const paymobResponse = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      intentionBody,
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
      return res.status(400).json({ error: "Missing client secret from Paymob response." });
    }

  } catch (error) {
    console.error("❌ PAYMOB INTENTION API ERROR ❌");
    if (error.response) {
      console.error("Status:", error.response.status);
      console.error("Response:", error.response.data);
    } else {
      console.error("General Error:", error.message);
    }

    return res.status(500).json({ error: "Something went wrong creating the intention." });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
