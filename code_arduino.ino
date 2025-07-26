#include <Servo.h>

// Configuration des pins
const int trigPin = 9;           // Pin Trigger du capteur HC-SR04
const int echoPin = 10;          // Pin Echo du capteur HC-SR04
const int servoRadarPin = 6;     // Pin du servomoteur radar
const int servoLauncherPin = 11; // Pin du servomoteur lanceur
const int buzzerPin = 3;         // Pin PWM du buzzer
const int redLEDPin = 4;         // LED rouge
const int greenLEDPin = 5;       // LED verte

// Objets servo
Servo myServoRadar;
Servo myServoLauncher;

// Variables globales
long duration;
int distance;
int angleRadar = 0;
int sweepDirection = 1; // 1 pour aller vers 180°, -1 pour revenir à 0°
unsigned long lastSweepTime = 0;
const int sweepDelay = 20; // Délai entre chaque mouvement d'angle

// Paramètres de détection (distances réduites pour moins de bruit)
const int MAX_DISTANCE = 200;     // Distance maximale en cm
const int CLOSE_DISTANCE = 5;     // Distance très proche - Rouge + lanceur (réduit de 10 à 5)
const int MEDIUM_DISTANCE = 15;   // Distance moyenne - Orange (réduit de 20 à 15)
const int FAR_DISTANCE = 30;      // Distance éloignée - Jaune (nouveau seuil à 30)
const int BUZZER_MAX_DISTANCE = 40; // Le buzzer ne sonne plus au-delà de 40cm

void setup() {
  // Initialisation des pins
  pinMode(trigPin, OUTPUT);
  pinMode(echoPin, INPUT);
  pinMode(buzzerPin, OUTPUT);
  pinMode(redLEDPin, OUTPUT);
  pinMode(greenLEDPin, OUTPUT);
  
  // Attacher les servos
  myServoRadar.attach(servoRadarPin);
  myServoLauncher.attach(servoLauncherPin);
  
  // Communication série
  Serial.begin(9600);
  
  // Position initiale des servos
  myServoRadar.write(0);
  myServoLauncher.write(0);
  
  // LEDs de démarrage
  digitalWrite(redLEDPin, HIGH);
  digitalWrite(greenLEDPin, HIGH);
  delay(1000);
  digitalWrite(redLEDPin, LOW);
  digitalWrite(greenLEDPin, LOW);
  
  // Signal sonore de démarrage
  tone(buzzerPin, 440, 200);
  delay(300);
  tone(buzzerPin, 880, 200);
  delay(500);
  
  Serial.println("{\"status\":\"ready\",\"message\":\"Radar system initialized\"}");
}

void loop() {
  // Contrôle temporel du balayage
  if (millis() - lastSweepTime >= sweepDelay) {
    lastSweepTime = millis();
    
    // Déplacer le servo radar
    myServoRadar.write(angleRadar);
    
    // Petite pause pour que le servo se positionne
    delay(15);
    
    // Mesurer la distance
    distance = measureDistance();
    
    // Traiter la détection
    processDetection(angleRadar, distance);
    
    // Envoyer les données au serveur
    sendDataToSerial(angleRadar, distance);
    
    // Calculer le prochain angle
    angleRadar += sweepDirection;
    
    // Inverser la direction si on atteint les limites
    if (angleRadar >= 180) {
      sweepDirection = -1;
      angleRadar = 180;
    } else if (angleRadar <= 0) {
      sweepDirection = 1;
      angleRadar = 0;
    }
  }
}

int measureDistance() {
  // Générer une impulsion ultrasonique
  digitalWrite(trigPin, LOW);
  delayMicroseconds(2);
  digitalWrite(trigPin, HIGH);
  delayMicroseconds(10);
  digitalWrite(trigPin, LOW);
  
  // Mesurer le temps de retour
  duration = pulseIn(echoPin, HIGH, 30000); // Timeout de 30ms
  
  // Calculer la distance
  if (duration > 0) {
    int calculatedDistance = duration * 0.034 / 2;
    // Filtrer les distances aberrantes
    if (calculatedDistance > 0 && calculatedDistance <= MAX_DISTANCE) {
      return calculatedDistance;
    }
  }
  
  return 0; // Aucune détection valide
}

void processDetection(int angle, int dist) {
  if (dist > 0 && dist <= MAX_DISTANCE) {
    // Objet détecté - traitement selon la distance
    if (dist <= CLOSE_DISTANCE) {
      // Objet très proche (0-5cm) - alerte rouge + lanceur
      handleCloseObject(dist);
    } else if (dist <= MEDIUM_DISTANCE) {
      // Objet proche (5-15cm) - alerte orange
      handleMediumObject(dist);
    } else if (dist <= FAR_DISTANCE) {
      // Objet à distance moyenne (15-30cm) - alerte jaune
      handleFarObject(dist);
    } else if (dist <= BUZZER_MAX_DISTANCE) {
      // Objet éloigné (30-40cm) - buzzer très faible
      handleDistantObject(dist);
    } else {
      // Objet au-delà de 40cm - pas de buzzer, juste LED verte
      handleVeryFarObject(dist);
    }
  } else {
    // Aucun objet détecté - état normal
    handleNoObject();
  }
}

void handleCloseObject(int dist) {
  // LED rouge allumée
  digitalWrite(redLEDPin, HIGH);
  digitalWrite(greenLEDPin, LOW);
  
  // Buzzer fort mais pas trop agressif
  tone(buzzerPin, 800, 100); // Réduit de 1000 à 800Hz, durée limitée
  
  // Activer le lanceur de missile
  myServoLauncher.write(90);
  delay(200); // Réduit de 500 à 200ms
  myServoLauncher.write(0);
  
  Serial.println("{\"alert\":\"close\",\"action\":\"missile_launched\"}");
}

void handleMediumObject(int dist) {
  // LED rouge clignotante
  digitalWrite(redLEDPin, HIGH);
  digitalWrite(greenLEDPin, LOW);
  
  // Buzzer moyen
  tone(buzzerPin, 400, 50); // Durée réduite
  
  Serial.println("{\"alert\":\"medium\",\"action\":\"warning\"}");
}

void handleFarObject(int dist) {
  // LED jaune (rouge + verte)
  digitalWrite(redLEDPin, HIGH);
  digitalWrite(greenLEDPin, HIGH);
  
  // Buzzer faible
  tone(buzzerPin, 200, 30); // Très court
}

void handleDistantObject(int dist) {
  // LED verte avec clignotement occasionnel
  digitalWrite(redLEDPin, LOW);
  digitalWrite(greenLEDPin, HIGH);
  
  // Buzzer très faible et occasionnel
  if (millis() % 2000 < 100) { // Seulement 100ms toutes les 2 secondes
    tone(buzzerPin, 100, 20);
  }
}

void handleVeryFarObject(int dist) {
  // LED verte stable - pas de buzzer
  digitalWrite(redLEDPin, LOW);
  digitalWrite(greenLEDPin, HIGH);
  
  // Pas de buzzer pour les objets au-delà de 40cm
  noTone(buzzerPin);
}

void handleNoObject() {
  // LED verte stable
  digitalWrite(redLEDPin, LOW);
  digitalWrite(greenLEDPin, HIGH);
  
  // Pas de buzzer
  noTone(buzzerPin);
}

void sendDataToSerial(int angle, int dist) {
  // Créer le JSON avec toutes les informations
  Serial.print("{\"angle\":");
  Serial.print(angle);
  Serial.print(",\"distance\":");
  Serial.print(dist);
  Serial.print(",\"timestamp\":");
  Serial.print(millis());
  Serial.print(",\"sweep_direction\":");
  Serial.print(sweepDirection);
  
  // Ajouter le statut basé sur la distance (nouvelles catégories)
  Serial.print(",\"status\":\"");
  if (dist == 0) {
    Serial.print("clear");
  } else if (dist <= CLOSE_DISTANCE) {
    Serial.print("danger");
  } else if (dist <= MEDIUM_DISTANCE) {
    Serial.print("warning");
  } else if (dist <= FAR_DISTANCE) {
    Serial.print("caution");
  } else if (dist <= BUZZER_MAX_DISTANCE) {
    Serial.print("distant");
  } else {
    Serial.print("detected");
  }
  Serial.println("\"}");
}