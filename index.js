const express = require("express");
const app = express();

app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

let counter = 1, historyData = [];
function generatePeriod(){ /* ...kode kamu... */ }
function generatePrediction(){ /* ...kode kamu... */ }

app.get("/", (req,res)=>res.send("✅ WINGO BOT SERVER LIVE"));
app.get("/api/prediksi", (req,res)=>{
  const p = generatePrediction();
  historyData.unshift(p); historyData = historyData.slice(0,10);
  res.json({history: historyData});
});

module.exports = app;