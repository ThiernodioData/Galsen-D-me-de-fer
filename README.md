# 🛡️ GALSEN DOME - Système de Défense Radar IoT

<!-- requipere et affiche lis image depuis img -->


> **Système de radar de défense antimissile utilisant Arduino et interface web temps réel**

Un projet IoT complet combinant détection ultrasonique, contrôle de servomoteurs, et interface web interactive pour simuler un système de défense radar professionnel.

---

## 📋 Table des Matières

- [🎯 Aperçu du Projet](#-aperçu-du-projet)
- [✨ Fonctionnalités](#-fonctionnalités)
- [🛠️ Composants Requis](#️-composants-requis)
- [⚙️ Installation](#️-installation)
- [🚀 Démarrage Rapide](#-démarrage-rapide)
- [📐 Schéma de Câblage](#-schéma-de-câblage)
- [💻 Utilisation](#-utilisation)
- [🔧 Configuration](#-configuration)
- [📊 API Documentation](#-api-documentation)
- [🐛 Dépannage](#-dépannage)
- [🤝 Contribution](#-contribution)
- [📄 Licence](#-licence)

---

## 🎯 Aperçu du Projet

GALSEN DOME est un système de radar de défense IoT qui combine :

- **Detection radar 360°** avec balayage automatique 0-180°
- **Interface web professionnelle** avec visualisation temps réel
- **Système d'alertes multi-niveaux** selon la distance des menaces
- **Communication bidirectionnelle** Arduino ↔ Serveur ↔ Interface Web
- **Simulation de défense antimissile** avec servomoteur de lancement

### 🎬 Démonstration

![Radar Interface](docs/images/radar-interface.png)

*Interface principale montrant la détection radar en temps réel*

---

## ✨ Fonctionnalités

### 🔍 Détection et Surveillance
- ✅ Balayage radar automatique 0-180°
- ✅ Détection d'objets jusqu'à 200cm
- ✅ Précision ±1cm avec filtrage des fausses détections
- ✅ Tracking d'objets multiples simultanés

### 🎮 Interface Utilisateur
- ✅ Visualisation radar temps réel (Canvas HTML5)
- ✅ Panneau de contrôle militaire thématique
- ✅ Historique complet des détections
- ✅ Export des données en JSON
- ✅ Interface responsive (desktop/mobile)

### 🚨 Système d'Alertes
- ✅ 5 niveaux d'alerte par distance
- ✅ Alertes visuelles (LEDs rouge/verte)
- ✅ Alertes sonores (buzzer programmable)
- ✅ Notifications web temps réel

### 🚀 Système de Défense
- ✅ Simulation lancement missile (servomoteur)
- ✅ Mode défense automatique
- ✅ Contrôles manuels avancés
- ✅ Mode guerre avec interface modifiée

---

## 🛠️ Composants Requis

### 📟 Hardware Arduino

| Composant | Modèle | Quantité | Prix Estimé |
|-----------|--------|----------|-------------|
| **Microcontrôleur** | Arduino Uno R3 | 1 | 25€ |
| **Capteur Ultrasonique** | HC-SR04 | 1 | 5€ |
| **Servomoteur Radar** | SG90 (9g) | 1 | 8€ |
| **Servomoteur Lanceur** | SG90 (9g) | 1 | 8€ |
| **LED Rouge** | 5mm | 1 | 0.5€ |
| **LED Verte** | 5mm | 1 | 0.5€ |
| **Buzzer** | 5V actif | 1 | 3€ |
| **Résistances** | 220Ω | 2 | 1€ |
| **Breadboard** | 830 points | 1 | 5€ |
| **Câbles Dupont** | M-M, M-F | 20+ | 5€ |

**💰 Coût Total Hardware : ~61€**

### 💻 Software Requis

- **Arduino IDE** 2.0+ pour upload firmware
- **Node.js** 16+ avec npm
- **Navigateur web** moderne (Chrome, Firefox, Safari)
- **Port série USB** disponible

---

## ⚙️ Installation

### 1️⃣ Cloner le Projet

```bash
# Via Git
git clone https://github.com/[username]/galsen-dome.git
cd galsen-dome

# Ou télécharger le ZIP et extraire
```

### 2️⃣ Installation Node.js

**Windows :**
```bash
# Télécharger depuis https://nodejs.org/
# Installer la version LTS recommandée
# Vérifier l'installation
node --version
npm --version
```

**macOS :**
```bash
# Via Homebrew
brew install node

# Ou télécharger depuis https://nodejs.org/
```

**Linux (Ubuntu/Debian) :**
```bash
# Via apt
sudo apt update
sudo apt install nodejs npm

# Via snap
sudo snap install node --classic
```

### 3️⃣ Installation des Dépendances

```bash
# Dans le dossier du projet
npm install

# Ou installation manuelle des packages
npm install express serialport @serialport/parser-readline cors
```

### 4️⃣ Arduino IDE Setup

1. **Télécharger Arduino IDE :** https://www.arduino.cc/en/software
2. **Installer les bibliothèques requises :**
   - `Servo.h` (incluse par défaut)
   - Pas de bibliothèques externes nécessaires

3. **Configuration du port série :**
   - Connecter Arduino via USB
   - Sélectionner le bon port dans `Tools > Port`
   - Sélectionner `Arduino Uno` dans `Tools > Board`

---

## 🚀 Démarrage Rapide

### Étape 1 : Assemblage Hardware

1. **Connecter les composants selon le schéma :**
   ```
   Arduino Uno R3 Connections:
   ├── Pin 9  → HC-SR04 Trigger
   ├── Pin 10 → HC-SR04 Echo  
   ├── Pin 6  → Servo Radar Signal
   ├── Pin 11 → Servo Lanceur Signal
   ├── Pin 3  → Buzzer Positif
   ├── Pin 4  → LED Rouge (+ résistance 220Ω)
   ├── Pin 5  → LED Verte (+ résistance 220Ω)
   ├── 5V     → Alimentation capteur et servos
   └── GND    → Masse commune
   ```

2. **Vérifier les connexions** avant mise sous tension

### Étape 2 : Upload du Firmware Arduino

```bash
# 1. Ouvrir Arduino IDE
# 2. Ouvrir le fichier arduino/galsen_dome.ino
# 3. Vérifier le port série sélectionné
# 4. Cliquer sur Upload (→)
```

### Étape 3 : Configuration du Port Série

```javascript
// Dans server.js, ligne 8 :
const serial = new SerialPort({
  path: 'COM7',     // Windows : COM3, COM4, etc.
                   // macOS : /dev/tty.usbmodem...
                   // Linux : /dev/ttyUSB0, /dev/ttyACM0
  baudRate: 9600
});
```

**🔍 Comment trouver votre port :**

**Windows :**
```cmd
# Gestionnaire de périphériques > Ports (COM et LPT)
# Ou dans Arduino IDE : Tools > Port
```

**macOS/Linux :**
```bash
# Lister les ports disponibles
ls /dev/tty.*        # macOS
ls /dev/ttyUSB*      # Linux
ls /dev/ttyACM*      # Linux

# Ou utiliser Arduino IDE : Tools > Port
```

### Étape 4 : Démarrer le Serveur

```bash
# Dans le terminal, dossier du projet
node server.js

# Vous devriez voir :
# ✅ Port série ouvert avec succès
# 🚀 Serveur radar démarré sur http://localhost:3000
# 📡 En attente de données du port COM7
```

### Étape 5 : Accéder à l'Interface

1. **Ouvrir le navigateur** à l'adresse : http://localhost:3000
2. **Vérifier la connexion** : Status doit être "OPÉRATIONNEL"
3. **Tester la détection** : Placer un objet devant le capteur

---

## 📐 Schéma de Câblage

```
                    ARDUINO UNO R3
                    ┌─────────────┐
                    │  ┌─┐ ┌─┐    │
             +5V ───┤  │ │ │ │    │
             GND ───┤  │U│ │U│    │
                    │  │S│ │S│    │  
   HC-SR04 Trig ────┤  │B│ │B│  9 ├──── HC-SR04 Trigger
   HC-SR04 Echo ────┤  └─┘ └─┘ 10 ├──── HC-SR04 Echo
                    │           6 ├──── Servo Radar
                    │          11 ├──── Servo Lanceur  
    Buzzer      ────┤           3 ├──── Buzzer (PWM)
    LED Rouge   ────┤           4 ├──── LED Rouge + R(220Ω)
    LED Verte   ────┤           5 ├──── LED Verte + R(220Ω)
                    │             │
                    │    5V   GND │
                    └──┬────┬─────┘
                       │    │
                    ┌──┴────┴──┐
                    │ BREADBOARD│
                    │   POWER   │
                    └───────────┘
                            
    HC-SR04          SERVO RADAR      SERVO LANCEUR
   ┌─────────┐      ┌───────────┐    ┌───────────┐
   │VCC  TRIG│      │RED   BRN  │    │RED   BRN  │
   │GND  ECHO│      │ +5V  GND  │    │ +5V  GND  │
   └─────────┘      │ORG   PIN6 │    │ORG  PIN11 │
                    └───────────┘    └───────────┘
```

---

## 💻 Utilisation

### 🎮 Interface Principale

L'interface web offre plusieurs sections :

#### 📊 Barre de Statut
- **État Système** : Connecté/Déconnecté
- **Secteur Couvert** : Angle actuel du radar
- **Menaces Détectées** : Compteur total
- **Niveau de Menace** : FAIBLE → MAXIMUM
- **Missiles Disponibles** : Compteur simulation

#### 🎯 Visualisation Radar
- **Écran radar circulaire** avec grille de distance
- **Balayage temps réel** 0-180°
- **Points de détection** colorés par distance :
  - 🔴 **Rouge** : 0-5cm (Danger critique)
  - 🟠 **Orange** : 5-15cm (Alerte moyenne)
  - 🟡 **Jaune** : 15-30cm (Précaution)
  - 🟢 **Vert** : 30cm+ (Surveillance)

#### 🎛️ Contrôles Système

**🚀 Système d'Attaque :**
- **Lancer Missiles** : Déclenche le servomoteur lanceur
- **Verrouillage Cible** : Mode de ciblage assisté
- **Contrôle de Tir** : Gestion avancée des tirs

**🛡️ Défense Automatique :**
- **Défense Auto** : Interception automatique
- **Mode Interception** : Réponse rapide aux menaces
- **Bouclier Énergétique** : Protection renforcée

**⚠️ Système d'Alerte :**
- **Alerte Imminente** : Mode d'urgence maximum
- **Mode Guerre** : Interface et logique de combat
- **Évacuation d'Urgence** : Procédures de sécurité

**⚙️ Configuration :**
- **Paramètres** : Réglages du système
- **Calibrage Radar** : Optimisation de la détection
- **Diagnostics** : Tests des composants

### 📱 Utilisation Mobile

L'interface est entièrement responsive :
- **Écran tactile** compatible
- **Contrôles adaptés** à la taille d'écran
- **Navigation optimisée** pour mobile

---

## 🔧 Configuration

### ⚙️ Paramètres Arduino

Dans `arduino/galsen_dome.ino` :

```cpp
// Distances de détection (en cm)
const int CLOSE_DISTANCE = 5;     // Rouge - Alerte critique
const int MEDIUM_DISTANCE = 15;   // Orange - Alerte moyenne  
const int FAR_DISTANCE = 30;      // Jaune - Précaution
const int BUZZER_MAX_DISTANCE = 40; // Limite buzzer

// Paramètres radar
const int MAX_DISTANCE = 200;     // Portée maximale
const int sweepDelay = 20;        // Vitesse de balayage (ms)
```

### 🖥️ Paramètres Serveur

Dans `server.js` :

```javascript
// Configuration port série
const serial = new SerialPort({
  path: 'COM7',        // À modifier selon votre système
  baudRate: 9600       // Vitesse de communication
});

// Port du serveur web
const port = 3000;     // http://localhost:3000
```

### 🎨 Personnalisation Interface

Dans `style.css` :
- **Thème couleurs** : Modifier les variables CSS
- **Animations** : Ajuster les keyframes
- **Layout** : Adapter la grille responsive

---

## 📊 API Documentation

### 🔗 Endpoints Disponibles

#### `GET /data`
Récupère les données de détection temps réel
```json
[
  {
    "angle": 45,
    "distance": 25,
    "timestamp": 1627834567890,
    "id": "1627834567890-abc123",
    "status": "warning"
  }
]
```

#### `GET /status`
Statut général du système
```json
{
  "connected": true,
  "totalDetections": 156,
  "lastDetection": { "angle": 90, "distance": 15 },
  "uptime": 3600,
  "memoryUsage": { "rss": 45678912 }
}
```

#### `GET /history`
Historique complet des détections
```json
[
  // Array of all object detections
]
```

#### `DELETE /data`
Effacer toutes les données
```json
{
  "message": "Données effacées",
  "success": true
}
```

### 📡 Communication Série

**Format Arduino → Serveur :**
```json
{
  "angle": 45,
  "distance": 25,
  "timestamp": 1627834567890,
  "sweep_direction": 1,
  "status": "warning"
}
```

---

## 🐛 Dépannage

### ❌ Problèmes Courants

#### 🔌 "Port série non trouvé"
```bash
# Solutions :
1. Vérifier la connexion USB Arduino
2. Installer les drivers Arduino (CH340/FTDI)
3. Redémarrer l'Arduino
4. Changer le port dans server.js
5. Autoriser l'accès au port (permissions Linux)
```

#### 🌐 "Interface ne charge pas"
```bash
# Vérifications :
1. Serveur Node.js démarré : node server.js
2. Port 3000 libre (pas d'autre application)
3. Navigateur à jour
4. JavaScript activé
5. Pas de bloqueur de scripts
```

#### 📡 "Pas de données de détection"
```bash
# Diagnostics :
1. LED Arduino clignote → Code uploadé correctement
2. Capteur HC-SR04 bien alimenté (5V/GND)
3. Connexions Trigger/Echo correctes
4. Obstacles devant le capteur pour tester
5. Console série Arduino IDE pour debug
```

#### 🔊 "Servomoteurs ne bougent pas"
```bash
# Solutions :
1. Alimentation suffisante (servos consomment du courant)
2. Connexions signal PWM (pin 6 et 11)
3. Servos non défaillants (test manuel)
4. Code servo correctement uploadé
```

### 🛠️ Debug Avancé

#### Console Arduino IDE
```cpp
// Activer les messages debug dans le code Arduino
Serial.println("Debug: Distance mesurée = " + String(distance));
```

#### Console Serveur Node.js
```bash
# Démarrer avec logs détaillés
DEBUG=* node server.js

# Ou voir les logs de communication série
node server.js | grep "Données reçues"
```

#### Console Navigateur (F12)
```javascript
// Vérifier les erreurs JavaScript
console.log("État radar:", radarSystem);

// Vérifier les requêtes réseau
// Onglet Network > Voir les appels à /data
```

### 🔧 Réinitialisation Complète

```bash
# 1. Arrêter le serveur (Ctrl+C)
# 2. Déconnecter/reconnecter Arduino
# 3. Re-upload du code Arduino
# 4. Redémarrer le serveur
node server.js

# 5. Rafraîchir l'interface web (F5)
# 6. Effacer le cache navigateur si nécessaire
```

---

## 📁 Structure du Projet

```
galsen-dome/
├── 📄 README.md                    # Ce fichier
├── 📄 package.json                 # Configuration Node.js
├── 📄 package-lock.json            # Versions exactes des dépendances
├── 📄 server.js                    # Serveur principal Node.js
├── 📄 index.html                   # Interface web principale
├── 📄 style.css                    # Styles CSS de l'interface
├── 📄 script.js                    # JavaScript frontend
├── 📁 arduino/
│   └── 📄 galsen_dome.ino          # Code Arduino principal
├── 📁 docs/
│   ├── 📄 rapport_technique.pdf    # Rapport complet
│   ├── 📄 schema_cablage.pdf       # Schémas électroniques
│   └── 📁 images/                  # Captures d'écran
├── 📁 demo/
│   └── 📄 demonstration.mp4        # Vidéo de démonstration
└── 📁 examples/
    ├── 📄 test_servo.ino           # Test servomoteurs seuls
    ├── 📄 test_hcsr04.ino          # Test capteur ultrasonique
    └── 📄 calibration.ino          # Calibrage des composants
```

---

## 🚀 Améliorations Futures

### 🔮 Roadmap v2.0

- [ ] **Solénoïde réel** pour lancement physique
- [ ] **Caméra ESP32-CAM** pour vision
- [ ] **Intelligence Artificielle** classification objets
- [ ] **Application mobile** native iOS/Android
- [ ] **Multi-capteurs** avec fusion de données
- [ ] **WiFi/Bluetooth** communication sans fil
- [ ] **Base de données** pour analytics long terme

### 💡 Idées d'Extension

- **Sécurité domestique** : Adaptation pour surveillance maison
- **Agriculture** : Monitoring cultures et ravageurs  
- **Automobile** : Capteur de stationnement avancé
- **Industrie** : Contrôle qualité et sécurité
- **Éducation** : Plateforme d'apprentissage IoT

---

## 🔒 Sécurité

### ⚠️ Considérations Importantes

- **Usage éducatif** : Ce projet est à des fins d'apprentissage uniquement
- **Sécurité électrique** : Respecter les tensions et courants
- **Servomoteurs** : Attention aux parties mobiles
- **Réseau local** : Interface accessible sur le réseau local

### 🛡️ Bonnes Pratiques

- Toujours **débrancher** avant modification du câblage
- **Tester** chaque composant individuellement
- **Sauvegarder** régulièrement votre code
- **Documenter** vos modifications

---

## 🤝 Contribution

### 🔄 Comment Contribuer

1. **Fork** le projet
2. Créer une **branche feature** (`git checkout -b feature/AmazingFeature`)
3. **Commit** vos changements (`git commit -m 'Add AmazingFeature'`)
4. **Push** vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une **Pull Request**

### 🐛 Signaler un Bug

Utilisez les [GitHub Issues](https://github.com/[username]/galsen-dome/issues) avec :
- **Description** détaillée du problème
- **Étapes** pour reproduire
- **Environnement** (OS, versions logicielles)
- **Captures d'écran** si pertinentes

### 💬 Discussion

Rejoignez les discussions sur :
- **GitHub Discussions** pour les questions générales
- **Issues** pour les bugs et améliorations
- **Email** : [contact@galsen-dome.com]

---

## 📄 Licence

Ce projet est sous licence **MIT**. Voir le fichier [LICENSE](LICENSE) pour plus de détails.

```
MIT License

Copyright (c) 2025 GALSEN DOME Project

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
```

---

## 🙏 Remerciements

- **Arduino Community** pour l'écosystème hardware
- **Node.js Foundation** pour l'environnement runtime
- **Groupe SupdeCo Dakar** pour le support académique
- **Open Source Community** pour les outils et bibliothèques
- **Tous les contributeurs** qui amélioreront ce projet

---

## 📞 Contact

**👨‍💻 Développeur Principal :** [Votre Nom]  
**🏫 Institution :** Groupe SupdeCo Dakar  
**📧 Email :** [votre.email@etudiant.com]  
**🌐 LinkedIn :** [Votre profil LinkedIn]  
**📱 GitHub :** [@[votre-username]](https://github.com/[votre-username])

---

## 📊 Statistiques du Projet

![GitHub stars](https://img.shields.io/github/stars/[username]/galsen-dome?style=social)
![GitHub forks](https://img.shields.io/github/forks/[username]/galsen-dome?style=social)
![GitHub issues](https://img.shields.io/github/issues/[username]/galsen-dome)
![GitHub license](https://img.shields.io/github/license/[username]/galsen-dome)

**📅 Dernière mise à jour :** Juillet 2025  
**🏷️ Version :** 1.0.0  
**🔢 Lignes de code :** ~2000  
**⭐ Fonctionnalités :** 15+  

---

<div align="center">

### 🛡️ Développé avec passion pour l'IoT et la défense intelligente

**[⬆ Retour en haut](#-galsen-dome---système-de-défense-radar-iot)**

</div>