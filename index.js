import express from "express";
import fetch from "node-fetch";
import cors from "cors";
import 'dotenv/config'; // Load API keys from .env

const app = express();
app.use(cors());
app.use(express.json());

// ✅ Load your Amadeus API keys from .env file
const API_KEY = process.env.API_KEY;
const API_SECRET = process.env.API_SECRET;

let accessToken = null;

// 🔹 Step 1: Get Access Token from Amadeus
async function getAccessToken() {
  const response = await fetch("https://test.api.amadeus.com/v1/security/oauth2/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "client_credentials",
      client_id: API_KEY,
      client_secret: API_SECRET,
    }),
  });

  const data = await response.json();
  accessToken = data.access_token;
  console.log("✅ Access token received");
  return accessToken;
}

// 🔹 Step 2: Flight Search Endpoint
app.post("/search-flights", async (req, res) => {
  const { origin, destination, departureDate, adults } = req.body;

  try {
    if (!accessToken) await getAccessToken();

    const url = `https://test.api.amadeus.com/v2/shopping/flight-offers?originLocationCode=${origin}&destinationLocationCode=${destination}&departureDate=${departureDate}&adults=${adults}`;

    const response = await fetch(url, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    const data = await response.json();

    if (data.errors) {
      console.error(data.errors);
      return res.status(400).json({ error: data.errors });
    }

    res.json(data);
  } catch (error) {
    console.error("❌ Error fetching flight data:", error);
    res.status(500).json({ error: "Failed to fetch flight data" });
  }
});

// 🔹 Step 3: Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));</script>