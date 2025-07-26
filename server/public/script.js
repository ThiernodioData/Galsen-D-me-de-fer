class RadarSystem {
  constructor() {
    this.canvas = document.getElementById("radarCanvas");
    this.ctx = this.canvas.getContext("2d");
    
    // Configuration radar
    this.centerX = this.canvas.width / 2;
    this.centerY = this.canvas.height - 20;
    this.maxRadius = 180;
    this.sweepMin = 0;
    this.sweepMax = 180;
    
    // État du système
    this.currentAngle = 0;
    this.lastAngle = 0;
    this.currentDetections = [];
    this.allDetections = [];
    this.isPaused = false;
    this.lastUpdateTime = 0;
    this.sweepDirection = 1; // 1 = vers 180°, -1 = vers 0°
    this.lastSweepDirection = 1;
    
    // Variables pour gérer l'effacement après chaque balayage de 180°
    this.sweepStartTime = Date.now();
    this.lastSweepCompleteTime = 0;
    this.sweepCycleDetections = []; // Détections du cycle de balayage en cours
    this.currentSweepDirection = null; // Direction actuelle du balayage
    this.lastExtreme = null; // Dernier extrême atteint ("min" ou "max")
    
    // Éléments DOM
    this.elements = {
      connectionStatus: document.getElementById("connection-status"),
      currentAngle: document.getElementById("current-angle"),
      detectionCount: document.getElementById("detection-count"),
      detectionList: document.getElementById("detection-list"),
      liveAngle: document.getElementById("live-angle"),
      liveDistance: document.getElementById("live-distance"),
      lastUpdate: document.getElementById("last-update")
    };
    
    this.initializeEventListeners();
    this.startRadarLoop();
    this.startDataFetching();
  }

  initializeEventListeners() {
    document.getElementById("btn-pause").addEventListener("click", () => {
      this.isPaused = true;
      this.updateConnectionStatus("Pause", "paused");
    });

    document.getElementById("btn-resume").addEventListener("click", () => {
      this.isPaused = false;
      this.updateConnectionStatus("Connecté", "connected");
    });

    document.getElementById("btn-reset").addEventListener("click", () => {
      this.currentDetections = [];
      this.allDetections = [];
      this.sweepCycleDetections = [];
      this.currentSweepDirection = null;
      this.lastExtreme = null;
      this.updateDetectionList();
      this.updateDetectionCount();
    });

    document.getElementById("clear-detections").addEventListener("click", () => {
      this.allDetections = [];
      this.currentSweepDirection = null;
      this.lastExtreme = null;
      this.updateDetectionList();
      this.updateDetectionCount();
    });

    document.getElementById("btn-save").addEventListener("click", () => {
      this.saveDetections();
    });
  }

  // Méthode pour détecter la fin d'un balayage de 180°
  checkSweepComplete(newAngle) {
    let sweepCompleted = false;
    const now = Date.now();
    
    // Déterminer la direction actuelle du balayage
    if (this.lastAngle !== newAngle) {
      const angleDiff = newAngle - this.lastAngle;
      
      // Déterminer la direction basée sur la différence d'angle
      if (Math.abs(angleDiff) > 90) {
        // Gestion du saut d'angle (peut arriver avec certains capteurs)
        this.currentSweepDirection = angleDiff > 0 ? "up" : "down";
      } else {
        this.currentSweepDirection = angleDiff > 0 ? "up" : "down";
      }
      
      // Détecter quand on atteint un extrême
      let newExtreme = null;
      
      if (newAngle >= 175) {
        newExtreme = "max";
        console.log("📍 Extrême MAX atteint (≥175°)");
      } else if (newAngle <= 5) {
        newExtreme = "min";
        console.log("📍 Extrême MIN atteint (≤5°)");
      }
      
      // Si on a atteint un nouvel extrême différent du précédent
      if (newExtreme && newExtreme !== this.lastExtreme) {
        sweepCompleted = true;
        console.log(`🎯 BALAYAGE COMPLET! Passage de ${this.lastExtreme || 'début'} → ${newExtreme}`);
        this.lastExtreme = newExtreme;
      }
      
      // Sécurité temporelle - forcer l'effacement après 3 secondes
      if (now - this.sweepStartTime > 3000) {
        sweepCompleted = true;
        console.log(`⏰ Timeout: effacement forcé après ${(now - this.sweepStartTime)/1000}s`);
      }
    }
    
    if (sweepCompleted) {
      console.log("🧹 EFFACEMENT DES DÉTECTIONS - BALAYAGE DE 180° TERMINÉ");
      
      // Sauvegarder les détections du balayage dans l'historique
      this.sweepCycleDetections.forEach(detection => {
        const exists = this.allDetections.some(d => 
          d.angle === detection.angle && 
          d.distance === detection.distance && 
          Math.abs(d.timestamp - detection.timestamp) < 1000
        );
        
        if (!exists) {
          this.allDetections.unshift(detection);
        }
      });
      
      // Effacer complètement les détections affichées
      this.currentDetections = [];
      this.sweepCycleDetections = [];
      this.sweepStartTime = now;
      this.lastSweepCompleteTime = now;
      
      // Limiter l'historique
      if (this.allDetections.length > 100) {
        this.allDetections = this.allDetections.slice(0, 100);
      }
      
      this.updateDetectionList();
      this.updateDetectionCount();
      
      console.log("✅ Écran radar nettoyé - Prêt pour nouveau balayage");
    }
    
    this.lastAngle = newAngle;
  }

  polarToCartesian(angle, distance) {
    // Conversion des coordonnées polaires en cartésiennes
    const rad = (180 - angle) * Math.PI / 180; // Inversion pour correspondre au radar
    const normalizedDistance = Math.min(distance * 2, this.maxRadius); // Échelle
    const x = this.centerX + normalizedDistance * Math.cos(rad);
    const y = this.centerY - normalizedDistance * Math.sin(rad);
    return { x, y };
  }

  drawRadar() {
    // Effacer le canvas
    this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

    // Dessiner les cercles de distance
    this.ctx.strokeStyle = "#003300";
    this.ctx.lineWidth = 1;
    for (let r = 40; r <= this.maxRadius; r += 40) {
      this.ctx.beginPath();
      this.ctx.arc(this.centerX, this.centerY, r, Math.PI, 0, false);
      this.ctx.stroke();
      
      // Étiquettes de distance
      this.ctx.fillStyle = "#006600";
      this.ctx.font = "10px monospace";
      this.ctx.fillText(`${r/2}cm`, this.centerX + r - 15, this.centerY - 5);
    }

    // Dessiner les lignes radiales
    this.ctx.strokeStyle = "#003300";
    for (let angle = this.sweepMin; angle <= this.sweepMax; angle += 30) {
      const rad = (180 - angle) * Math.PI / 180;
      const x = this.centerX + this.maxRadius * Math.cos(rad);
      const y = this.centerY - this.maxRadius * Math.sin(rad);
      
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(x, y);
      this.ctx.stroke();
      
      // Étiquettes d'angle
      this.ctx.fillStyle = "#006600";
      this.ctx.font = "10px monospace";
      const labelX = this.centerX + (this.maxRadius + 15) * Math.cos(rad);
      const labelY = this.centerY - (this.maxRadius + 15) * Math.sin(rad);
      this.ctx.fillText(`${angle}°`, labelX - 10, labelY + 5);
    }

    // Dessiner l'aiguille du radar (balayage)
    if (!this.isPaused) {
      const sweepRad = (180 - this.currentAngle) * Math.PI / 180;
      const sweepX = this.centerX + this.maxRadius * Math.cos(sweepRad);
      const sweepY = this.centerY - this.maxRadius * Math.sin(sweepRad);
      
      // Ligne de balayage principale
      this.ctx.strokeStyle = "#00ff00";
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(this.centerX, this.centerY);
      this.ctx.lineTo(sweepX, sweepY);
      this.ctx.stroke();

      // Effet de traînée
      this.ctx.strokeStyle = "rgba(0, 255, 0, 0.3)";
      this.ctx.lineWidth = 8;
      this.ctx.stroke();
    }

    // Dessiner les détections (seulement celles du balayage en cours)
    this.drawDetections();
  }

  drawDetections() {
    const now = Date.now();
    
    // Filtrer seulement les détections actuelles du balayage en cours
    const currentObjectDetections = this.currentDetections.filter(d => d.distance > 0);
    
    currentObjectDetections.forEach((detection, index) => {
      if (detection.distance > 0 && detection.distance <= 200) {
        const { x, y } = this.polarToCartesian(detection.angle, detection.distance);
        
        // Vérifier que le point est dans la zone visible
        if (x >= 0 && x <= this.canvas.width && y >= 0 && y <= this.canvas.height) {
          // Couleur basée sur la distance
          let color = "#ff0000"; // Rouge pour proche (0-10cm)
          if (detection.distance > 10) color = "#ff8800"; // Orange pour moyen (10-25cm)
          if (detection.distance > 25) color = "#ffff00"; // Jaune pour éloigné (25-40cm)
          if (detection.distance > 40) color = "#00ff00"; // Vert pour très loin (40cm+)
          
          // Point principal plus visible
          this.ctx.fillStyle = color;
          this.ctx.beginPath();
          this.ctx.arc(x, y, 8, 0, 2 * Math.PI);
          this.ctx.fill();
          
          // Contour blanc pour meilleure visibilité
          this.ctx.strokeStyle = "#ffffff";
          this.ctx.lineWidth = 1;
          this.ctx.stroke();
          
          // Effet de pulsation pour toutes les détections actuelles
          this.ctx.strokeStyle = color;
          this.ctx.lineWidth = 3;
          this.ctx.beginPath();
          const pulseRadius = 12 + Math.sin(now / 200) * 4;
          this.ctx.arc(x, y, pulseRadius, 0, 2 * Math.PI);
          this.ctx.stroke();
          
          // Étiquette avec informations
          this.ctx.fillStyle = "#ffffff";
          this.ctx.font = "bold 11px monospace";
          this.ctx.strokeStyle = "#000000";
          this.ctx.lineWidth = 3;
          
          // Contour noir pour le texte
          this.ctx.strokeText(`${detection.distance}cm`, x + 12, y - 8);
          this.ctx.strokeText(`${detection.angle}°`, x + 12, y + 8);
          
          // Texte blanc par dessus
          this.ctx.fillText(`${detection.distance}cm`, x + 12, y - 8);
          this.ctx.fillText(`${detection.angle}°`, x + 12, y + 8);
        }
      }
    });
    
    console.log(`📊 Détections affichées ce balayage: ${currentObjectDetections.length}`);
  }

  async fetchDataFromServer() {
    if (this.isPaused) return;
    
    try {
      const response = await fetch("http://localhost:3000/data", {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        cache: 'no-cache'
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data && data.length > 0) {
        // Traiter les nouvelles données
        const latestData = data[data.length - 1];
        
        // Vérifier si un balayage de 180° est terminé
        this.checkSweepComplete(latestData.angle);
        
        this.currentAngle = latestData.angle;
        
        // Filtrer les détections valides (distance > 0 et <= 200cm)
        const validDetections = data
          .filter(d => d.distance >= 0 && d.distance <= 200)
          .map(d => ({
            ...d,
            timestamp: d.timestamp || Date.now(),
            id: d.id || `${d.angle}-${d.distance}-${Date.now()}`
          }));
        
        // Mettre à jour les détections du balayage en cours
        this.currentDetections = validDetections;
        
        // Ajouter les détections avec objets au balayage en cours
        const objectDetections = validDetections.filter(d => d.distance > 0);
        objectDetections.forEach(detection => {
          // Éviter les doublons dans le balayage en cours
          const exists = this.sweepCycleDetections.some(d => 
            d.angle === detection.angle && 
            d.distance === detection.distance && 
            Math.abs(d.timestamp - detection.timestamp) < 800
          );
          
          if (!exists) {
            this.sweepCycleDetections.push(detection);
          }
        });
        
        // Mettre à jour l'interface
        this.updateLiveData(latestData);
        this.updateConnectionStatus("Connecté", "connected");
        
      } else {
        console.log('⚠️ Aucune donnée reçue du serveur');
      }
    } catch (error) {
      console.error("❌ Erreur lors de la récupération des données:", error);
      this.updateConnectionStatus("Erreur de connexion", "disconnected");
    }
  }

  updateLiveData(data) {
    this.elements.liveAngle.textContent = `Angle: ${data.angle}°`;
    this.elements.liveDistance.textContent = `Distance: ${data.distance > 0 ? data.distance + ' cm' : 'Aucune détection'}`;
    this.elements.lastUpdate.textContent = `Dernière MAJ: ${new Date().toLocaleTimeString()}`;
    this.elements.currentAngle.textContent = `${data.angle}°`;
  }

  updateDetectionList() {
    const listElement = this.elements.detectionList;
    listElement.innerHTML = "";
    
    // Afficher les 10 dernières détections de l'historique
    const recentDetections = this.allDetections.slice(0, 10);
    
    recentDetections.forEach((detection, index) => {
      const item = document.createElement("div");
      item.className = "detection-item";
      
      // Marquer les détections très récentes
      if (Date.now() - detection.timestamp < 5000) {
        item.classList.add("recent");
      }
      
      const timeStr = new Date(detection.timestamp).toLocaleTimeString();
      item.innerHTML = `
        <strong>Détection #${index + 1}</strong><br>
        Angle: ${detection.angle}° | Distance: ${detection.distance}cm<br>
        <small>Heure: ${timeStr}</small>
      `;
      
      listElement.appendChild(item);
    });
  }

  updateDetectionCount() {
    this.elements.detectionCount.textContent = this.allDetections.length;
  }

  updateConnectionStatus(status, type) {
    this.elements.connectionStatus.textContent = status;
    this.elements.connectionStatus.className = type;
  }

  startRadarLoop() {
    const animate = () => {
      this.drawRadar();
      requestAnimationFrame(animate);
    };
    animate();
  }

  startDataFetching() {
    // Récupération très fréquente des données pour un affichage temps réel
    setInterval(() => {
      this.fetchDataFromServer();
    }, 50); // Toutes les 50ms pour une fluidité maximale
    
    // Premier appel immédiat
    this.fetchDataFromServer();
  }

  saveDetections() {
    if (this.allDetections.length === 0) {
      alert("Aucune détection à sauvegarder");
      return;
    }
    
    const dataStr = JSON.stringify(this.allDetections, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = `radar_detections_${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    
    URL.revokeObjectURL(url);
  }
}

// Initialiser le système radar quand la page est chargée
document.addEventListener("DOMContentLoaded", () => {
  new RadarSystem();
});