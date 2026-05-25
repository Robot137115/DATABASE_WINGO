// ===== WINGO BOT SERVER REAL-TIME =====
const express = require("express");
const axios = require("axios");
const cheerio = require("cheerio");
const http = require("http");
const { WebSocketServer } = require("ws");

const PORT = process.env.PORT || 8080;
const TARGET = "https://didihub.com/wingo";

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

let history = [];
const MAX_HISTORY = 200;

function addPeriod(data) {
  const exist = history.find(p => p.period === data.period);
  if (!exist) history.unshift(data);
  if (history.length > MAX_HISTORY) history.pop();
}

function getStats() {
  let big=0, small=0, red=0, green=0, violet=0;
  history.slice(0,50).forEach(p=>{
    if(p.size==="Big") big++;
    if(p.size==="Small") small++;
    if(p.color==="red") red++;
    if(p.color==="green") green++;
    if(p.color==="violet") violet++;
  });
  return { big, small, red, green, violet };
}

function predict() {
  const last = history.slice(0,30);
  if(last.length===0) return { hotNumber:0, confidence:0, trend:"-" };
  const freq={};
  last.forEach(p=>freq[p.number]=(freq[p.number]||0)+1);
  let best=0, bestCount=0;
  for(const n in freq){ if(freq[n]>bestCount){best=n; bestCount=freq[n];} }
  const trendBig=last.filter(p=>p.size==="Big").length;
  const trendSmall=last.filter(p=>p.size==="Small").length;
  return {
    hotNumber:best,
    confidence:(bestCount/last.length).toFixed(2),
    trend:trendBig>trendSmall?"BIG":"SMALL"
  };
}

async function scrape() {
  try {
    const res = await axios.get(TARGET, {
      timeout:10000,
      headers:{ "User-Agent":"Mozilla/5.0 Chrome/120 Safari/537" }
    });
    const $ = cheerio.load(res.data);
    $("table tbody tr").each((i,el)=>{
      const td = $(el).find("td");
      const period = $(td[0]).text().trim();
      const number = Number($(td[1]).text().trim());
      if(!period) return;
      let color="red";
      if(number===0||number===5) color="violet";
      else if(number>=5) color="green";
      const size = number>=5?"Big":"Small";
      addPeriod({ period, number, color, size });
    });
  } catch(err) {
    console.log("SCRAPE ERROR RETRY...");
  }
}

function broadcast() {
  const data = {
    history: history.slice(0,50),
    prediction: predict(),
    stats: getStats(),
    serverTime: new Date().toLocaleTimeString()
  };
  const msg = JSON.stringify(data);
  wss.clients.forEach(client=>{
    if(client.readyState===1) client.send(msg);
  });
}

setInterval(async ()=>{
  await scrape();
  broadcast();
  console.log("UPDATE", new Date().toLocaleTimeString());
},16000);

app.get("/",(req,res)=>res.send("✅ WINGO BOT SERVER LIVE"));
app.get("/history",(req,res)=>res.json(history));
app.get("/predict",(req,res)=>res.json(predict()));
app.get("/stats",(req,res)=>res.json(getStats()));

wss.on("connection",(ws)=>{
  console.log("🔗 Client terhubung");
  ws.on("close",()=>console.log("❌ Client putus"));
});

server.listen(PORT,"0.0.0.0",()=>{
  console.log("BOT RUNNING PORT",PORT);
});