try {
  require('dotenv').config();
  const express = require('express');
  const axios = require('axios');
  const cors = require('cors');
  const app = express();

  app.use(cors());
  app.use(express.json());

  const PAYMOB_SECRET_KEY = process.env.PAYMOB_SECRET_KEY;
  const PAYMOB_PUBLIC_KEY = process.env.PAYMOB_PUBLIC_KEY;
  const PAYMOB_INTEGRATION_ID = parseInt(process.env.PAYMOB_INTEGRATION_ID);

  // Simple test route
  app.get("/", (req, res) => {
    res.send("✅ Backend is alive!");
  });

  app.post('/start-checkout', async (req, res) => {
    try {
      const { amount, billing_data } = req.body;

      const checkoutRequest = {
        amount,
        currency: "EGP",
        payment_methods: ["card", PAYMOB_INTEGRATION_ID],
        billing_data,
        items: [],
        redirection_url: "https://yourdomain.com/thankyou",
        notification_url: "https://yourdomain.com/webhook"
      };

      const paymobResponse = await axios.post(
        "https://accept.paymob.com/v1/intention/",
        checkoutRequest,
        {
          headers: {
            Authorization: `Bearer ${PAYMOB_SECRET_KEY}`,
            "Content-Type": "application/json"
          }
        }
      );

      const { client_secret, id } = paymobResponse.data;
      const checkoutUrl = `https://accept.paymob.com/unifiedcheckout/?publicKey=${PAYMOB_PUBLIC_KEY}&clientSecret=${client_secret}`;

      res.json({ checkout_url: checkoutUrl });

    } catch (error) {
      console.error("❌ Paymob Error ❌");
      console.error("Status:", error.response?.status);
      console.error("Data:", error.response?.data || error.message);
      res.status(500).json({ error: error.response?.data || "Unexpected error" });
    }
  });

  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
  });

} catch (e) {
  console.error("💥 Backend startup failed!", e.message);
}
