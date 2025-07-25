const canvas = document.getElementById("radarCanvas");
const ctx = canvas.getContext("2d");


const centerX = canvas.width / 2;
const centerY = canvas.height / 2;
const radius = 180;
let angle = 0;

let currentDetections = []; // tableau de points

//conversion de radian vers cartesien
function polarToCartesian(angle, distance) {
  const rad = angle * (Math.PI / 180);
  const x = centerX + distance * Math.cos(rad);
  const y = centerY + distance * Math.sin(rad);
  return { x, y };
}

function drawRadar() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // Cercles
  ctx.strokeStyle = "#0f0";
  for (let r = 40; r <= radius; r += 40) {
    ctx.beginPath();
    ctx.arc(centerX, centerY, r, 0, 2 * Math.PI);
    ctx.stroke();
  }

  // Lignes
  for (let a = 0; a < 360; a += 45) {
    const rad = a * (Math.PI / 180);
    const x = centerX + radius * Math.cos(rad);
    const y = centerY + radius * Math.sin(rad);
    ctx.beginPath();
    ctx.moveTo(centerX, centerY);
    ctx.lineTo(x, y);
    ctx.stroke();
  }

  // Aiguille
  const sweepX = centerX + radius * Math.cos(angle * Math.PI / 180);
  const sweepY = centerY + radius * Math.sin(angle * Math.PI / 180);
  ctx.strokeStyle = "#0f0";
  ctx.beginPath();
  ctx.moveTo(centerX, centerY);
  ctx.lineTo(sweepX, sweepY);
  ctx.stroke();

  // Points dynamiques
  ctx.fillStyle = "#f00";
  let info = "Détections :\n";

  currentDetections.forEach((d, i) => {
    const { x, y } = polarToCartesian(d.angle, d.distance);
    ctx.beginPath();
    ctx.arc(x, y, 5, 0, 2 * Math.PI);
    ctx.fill();
    info += `P${i + 1} - angle: ${d.angle}°, dist: ${d.distance}\n`;
  });

  document.getElementById("info").innerText = info.trim();

  angle = (angle + 1) % 360;
}

function updateFromServer() {
  fetch("http://localhost:3000/data")
    .then(response => response.json())
    .then(data => {
      currentDetections = data;
    })
    .catch(err => console.error("Erreur fetch:", err));
}

setInterval(drawRadar, 30);
setInterval(updateFromServer, 1000);
