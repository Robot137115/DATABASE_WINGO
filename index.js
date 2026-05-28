const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();

// ===== 1. BUKA CORS UNTUK ACODE =====
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.sendStatus(200);
  next();
});

// ===== 2. SETUP PENYIMPANAN =====
const DATA_FILE = process.env.VERCEL? "/tmp/history.json" : path.join(__dirname, "history.json");
let counter = 1;
let historyData = [];

// load history kalau file sudah ada
try {
  if (fs.existsSync(DATA_FILE)) {
    historyData = JSON.parse(fs.readFileSync(DATA_FILE, "utf8"));
    // lanjutkan counter dari data terakhir
    if (historyData.length > 0) {
      const lastPeriod = historyData[0].period;
      counter = parseInt(lastPeriod.slice(-4)) + 1;
    }
  }
} catch (e) {
  console.log("Gagal load history, mulai baru");
}

function saveHistory() {
  try {
    fs.writeFileSync(DATA_FILE, JSON.stringify(historyData, null, 2));
  } catch (e) {
    console.error("Gagal save:", e.message);
  }
}

// ===== 3. FUNGSI PREDIKSI =====
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
  const warna = angka % 2 === 0? "red" : "green";
  const size = angka >= 5? "Big" : "Small";
  return {
    period: generatePeriod(),
    number: angka,
    color: warna,
    size,
    time: new Date().toISOString()
  };
}

// ===== 4. ENDPOINTS =====
app.get("/", (req, res) => {
  res.send("✅ WINGO BOT SERVER LIVE");
});

app.get("/api/prediksi", (req, res) => {
  const prediction = generatePrediction();
  historyData.unshift(prediction);
  historyData = historyData.slice(0, 10); // simpan 10 terakhir
  saveHistory(); // <-- ini yang bikin kesimpan

  res.json({
    history: historyData,
    latest: prediction,
    message: "Prediksi otomatis Didihub"
  });
});

// endpoint tambahan buat lihat history saja
app.get("/api/history", (req, res) => {
  res.json({ history: historyData });
});

// ===== 5. JALANKAN =====
if (require.main === module) {
  // untuk tes di lokal / Termux
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => console.log("Server jalan di port", PORT));
}

module.exports = app;