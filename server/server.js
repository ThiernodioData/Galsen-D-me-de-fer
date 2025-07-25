const express = require("express");
const cors = require("cors");
const { SerialPort, ReadlineParser } = require("serialport");

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Remplace "COM7" par ton port réel selon ton système
const serialPort = new SerialPort({
  path: "COM7",
  baudRate: 9600,
});

const parser = serialPort.pipe(new ReadlineParser({ delimiter: "\n" }));

let latestData = [];

parser.on("data", (data) => {
  try {
    const parsedData = JSON.parse(data.toString());
    latestData.push(parsedData);
    if (latestData.length > 20) latestData.shift();
    console.log("📡 Données reçues:", parsedData);
  } catch (err) {
    console.error("❌ Erreur de parsing JSON:", err.message);
  }
});

serialPort.on("error", (err) => {
  console.error("❌ Erreur du port série:", err.message);
});

serialPort.on("open", () => {
  console.log("✅ Port série ouvert");
});

app.get("/data", (req, res) => {
  res.json(latestData);
});

// Fichiers statiques
app.use(express.static(__dirname + "/../public"));

app.listen(PORT, () => {
  console.log(`🚀 Serveur local lancé sur http://localhost:${PORT}`);
});
