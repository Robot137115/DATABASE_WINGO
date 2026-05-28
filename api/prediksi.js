// api/prediksi.js
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

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  if (req.method === "OPTIONS") return res.status(200).end();

  const p = generatePrediction();
  historyData.unshift(p);
  historyData = historyData.slice(0, 10);
  res.status(200).json({ history: historyData });
};
// api/prediksi.js
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
  return { 
    period: generatePeriod(), 
    number: angka, 
    color: warna, 
    size 
  };
}

module.exports = (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const p = generatePrediction();
  historyData.unshift(p);
  historyData = historyData.slice(0, 10);
  
  return res.status(200).json({ history: historyData });
};