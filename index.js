require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY;
const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY;
const PAYMOB_INTEGRATION_ID = parseInt(process.env.PAYMOB_INTEGRATION_ID);

app.post('/start-checkout', async (req, res) => {
  try {
    const { amount, billing_data } = req.body;
    console.log("Paymob Integration ID:", PAYMOB_INTEGRATION_ID);
console.log("Paymob Secret Key:", PAYMOB_SECRET_KEY?.slice(0, 10) + "...");
console.log("Paymob Public Key:", PAYMOB_PUBLIC_KEY);

    const intentionBody = {
      amount,
      currency: "EGP",
      payment_methods: ["card", PAYMOB_INTEGRATION_ID],
      billing_data,
      items: [],
      redirection_url: "https://omar-habibb.github.io/optimum-auto/thankyou.html",
      notification_url: "https://yourdomain.com/webhook"
    };

    const headers = {
      headers: {
        Authorization: `Bearer ${PAYMOB_SECRET_KEY}`,
        "Content-Type": "application/json"
      }
    };

    const response = await axios.post("https://accept.paymob.com/v1/intention/", intentionBody, headers);
    const { client_secret } = response.data;
    const checkout_url = `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${client_secret}`;

    res.json({ checkout_url });
  } catch (error) {
    if (error.response) {
      res.status(500).json({ error: error.response.data });
    } else {
      res.status(500).json({ error: "Something went wrong with Paymob checkout." });
    }
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT);
