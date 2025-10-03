require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json());

function isSafeInput(value) {
  if (typeof value !== 'string') return true; 
  const v = value.trim();
  if (/^[=+\-@]/.test(v)) return false;   // starts with =, +, -, @
  if (/<\s*script/i.test(v)) return false; // contains <script>
  return true;
}

// Show this message if someone visits the backend in a browser
app.get('/', (req, res) => {
  res.send('Backend is alive 🧠');
});

app.post('/start-checkout', async (req, res) => {
  try {
    const { amount, billing_data } = req.body;

    for (const [key, val] of Object.entries(billing_data || {})) {
  if (!isSafeInput(val)) {
    return res.status(400).json({ error: `Invalid input in ${key}` });
  }
}

const intentionPayload = {
  amount,
  currency: "EGP",
  payment_methods: ["card",parseInt(process.env.PAYMOB_INTEGRATION_ID)],
  billing_data,
  items: [],
  redirection_url: "https://omar-habibb.github.io/optimum-auto/thankyou.html",
  notification_url: "https://webhook.site/your-temporary-test-url"
};


    const response = await axios.post(
      "https://accept.paymob.com/v1/intention/",
      intentionPayload,
      {
        headers: {
          Authorization: `Bearer ${process.env.PAYMOB_SECRET_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const { client_secret } = response.data;

    if (client_secret) {
      const checkout_url = `https://accept.paymob.com/unifiedcheckout/?publicKey=${process.env.PAYMOB_PUBLIC_KEY}&clientSecret=${client_secret}`;
      res.json({ checkout_url });
    } else {
      res.status(400).json({ error: "Missing client_secret in response." });
    }
} catch (error) {
  console.error("❌ Paymob Error ❌");

  let errorDetails;

  if (error.response) {
    console.error("Status:", error.response.status);
    console.error("Data:", error.response.data);
    errorDetails = error.response.data;
  } else {
    console.error("Error:", error.message);
    errorDetails = error.message;
  }

  // Only send a response if one hasn’t been sent yet
  if (!res.headersSent) {
    res.status(500).json({ error: errorDetails });
  }
}


});

// This line is very important for Railway
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
