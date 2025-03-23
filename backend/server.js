const express = require("express");
const cors = require("cors");
const fs = require("fs");
const axios = require("axios");

const app = express();
app.use(cors());
app.use(express.json()); // Enable JSON parsing for POST requests

const FLASK_API = "http://127.0.0.1:8081/ask"; // Flask API endpoint

// Load restaurant data
const restaurants = JSON.parse(fs.readFileSync("restaurants.json", "utf8"));

// Simple search by name (fallback option)
app.get("/search", (req, res) => {
  const query = req.query.query.toLowerCase();
  const results = restaurants.filter((r) =>
    r.name.toLowerCase().includes(query)
  );
  res.json({ restaurants: results });
});

// Chatbot endpoint (Queries the Flask API)
app.post("/ask", async (req, res) => {
  const userQuery = req.body.query;

  if (!userQuery) {
    return res.status(400).json({ error: "Query parameter is required" });
  }

  try {
    const response = await axios.get(FLASK_API, { params: { query: userQuery } });
    console.log(response.data)
    res.json(response.data);
  } catch (error) {
    console.error("Error querying Flask API:", error.message);
    res.status(500).json({ error: "AI request to Flask API failed" });
  }
});

// Start the server
app.listen(8000, () => console.log("Server running on http://localhost:8000"));
