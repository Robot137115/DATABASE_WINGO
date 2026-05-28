const express = require("express");
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

let counter = 1;
let historyData = [];

function generatePeriod() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, "0");
  const d = String(now.getDate()).padStart(2, "0");
  const num = String(counter++).padStart(4, "0");
  return `${y}${m}${d}${num}`;
}

function generatePrediction() {
  const angka = Math.floor(Math.random() * 10);
  const warna = angka % 2 === 0 ? "red" : "green";
  const size = angka >= 5 ? "Big" : "Small";
  return { period: generatePeriod(), number: angka, color: warna, size };
}

app.get("/", (req, res) => res.send("✅ WINGO BOT SERVER LIVE"));

app.get("/api/prediksi", (req, res) => {
  const p = generatePrediction();
  historyData.unshift(p);
  historyData = historyData.slice(0, 10);
  res.json({ history: historyData });
});

module.exports = app;