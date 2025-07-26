const express = require('express');
const { SerialPort } = require('serialport');
const { ReadlineParser } = require('@serialport/parser-readline');
const path = require('path');

const app = express();
const port = 3000;

// Configuration du port série
const serial = new SerialPort({
  path: 'COM7', // Remplace par le port correct
  baudRate: 9600
});

const parser = serial.pipe(new ReadlineParser({ delimiter: '\n' }));

// Stockage des données
let detections = [];
let lastValidDetection = { angle: 0, distance: 0, timestamp: Date.now() };
let isConnected = false;

// Gérer la connexion série
serial.on('open', () => {
  console.log('✅ Port série ouvert avec succès');
  isConnected = true;
});

serial.on('error', (err) => {
  console.error('❌ Erreur port série:', err.message);
  isConnected = false;
});

serial.on('close', () => {
  console.log('⚠️  Port série fermé');
  isConnected = false;
});

// Traitement des données Arduino
parser.on('data', line => {
  try {
    // Nettoyer la ligne reçue
    const cleanLine = line.trim();
    console.log('📥 Données reçues:', cleanLine); // Debug
    
    if (!cleanLine || !cleanLine.startsWith('{')) {
      return; // Ignorer les lignes non-JSON
    }

    const data = JSON.parse(cleanLine);
    
    // Validation des données
    if (data.angle !== undefined && data.distance !== undefined) {
      const detection = {
        angle: parseInt(data.angle),
        distance: parseInt(data.distance),
        timestamp: Date.now(),
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        status: data.status || 'unknown'
      };
      
      // Filtrer les données aberrantes
      if (detection.angle >= 0 && detection.angle <= 180) {
        detections.push(detection);
        lastValidDetection = detection;
        
        // Log toutes les données pour debug
        console.log(`📊 Angle: ${detection.angle}° | Distance: ${detection.distance}cm | Status: ${detection.status}`);
        
        // Log spécial pour les détections d'objets
        if (detection.distance > 0 && detection.distance <= 200) {
          console.log(`🎯 OBJET DÉTECTÉ: ${detection.angle}° - ${detection.distance}cm`);
        }
      }
    }
  } catch (err) {
    console.error('❌ Erreur parsing JSON:', err.message);
    console.error('📄 Ligne problématique:', line);
  }
});

// Nettoyage périodique des anciennes données
setInterval(() => {
  const now = Date.now();
  const fiveMinutesAgo = now - (5 * 60 * 1000);
  
  // Garder seulement les données des 5 dernières minutes
  const oldLength = detections.length;
  detections = detections.filter(d => d.timestamp > fiveMinutesAgo);
  
  if (detections.length !== oldLength) {
    console.log(`🧹 Nettoyage: ${oldLength - detections.length} anciennes détections supprimées`);
  }
  
  // Limiter à 1000 détections maximum
  if (detections.length > 1000) {
    detections = detections.slice(-1000);
    console.log('📦 Limitation: gardé les 1000 dernières détections');
  }
}, 30000); // Toutes les 30 secondes

// Route de test pour debug
app.get('/test', (req, res) => {
  res.json({
    message: 'Serveur fonctionnel',
    timestamp: new Date().toISOString(),
    detections_count: detections.length,
    last_detection: lastValidDetection
  });
});

// API endpoints
app.get('/data', (req, res) => {
  try {
    // Ajouter les headers CORS
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Content-Type', 'application/json');
    
    // Si pas de données récentes, retourner au moins la dernière position connue
    if (detections.length === 0) {
      res.json([lastValidDetection]);
      return;
    }
    
    // Retourner les détections récentes (dernières 2 minutes)
    const twoMinutesAgo = Date.now() - 120000;
    const recentDetections = detections.filter(d => d.timestamp > twoMinutesAgo);
    
    // Si pas de détections récentes, retourner les 10 dernières
    if (recentDetections.length === 0) {
      res.json(detections.slice(-10));
    } else {
      res.json(recentDetections);
    }
  } catch (error) {
    console.error('❌ Erreur dans /data:', error);
    res.status(500).json({ error: 'Erreur serveur' });
  }
});

app.get('/status', (req, res) => {
  res.json({
    connected: isConnected,
    totalDetections: detections.length,
    lastDetection: lastValidDetection,
    uptime: process.uptime(),
    memoryUsage: process.memoryUsage()
  });
});

app.get('/history', (req, res) => {
  // Retourner toutes les détections avec objets détectés
  const objectDetections = detections.filter(d => d.distance > 0 && d.distance <= 200);
  res.json(objectDetections);
});

// Endpoint pour effacer les données
app.delete('/data', (req, res) => {
  detections = [];
  console.log('🗑️  Toutes les détections ont été effacées');
  res.json({ message: 'Données effacées', success: true });
});

// Middleware pour les fichiers statiques
app.use(express.static(path.join(__dirname, 'public')));

// Route par défaut
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Gestion des erreurs
app.use((err, req, res, next) => {
  console.error('❌ Erreur serveur:', err.stack);
  res.status(500).json({ error: 'Erreur interne du serveur' });
});

// Démarrage du serveur
app.listen(port, () => {
  console.log(`🚀 Serveur radar démarré sur http://localhost:${port}`);
  console.log(`📡 En attente de données du port ${serial.path}`);
  console.log(`📊 Interface disponible sur http://localhost:${port}`);
});

// Gestion propre de l'arrêt
process.on('SIGINT', () => {
  console.log('\n🛑 Arrêt du serveur...');
  serial.close(() => {
    process.exit(0);
  });
});

process.on('SIGTERM', () => {
  console.log('\n🛑 Arrêt du serveur...');
  serial.close(() => {
    process.exit(0);
  });
});