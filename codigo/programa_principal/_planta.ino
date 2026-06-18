#include <WiFi.h>
#include <PubSubClient.h>
#include "DHTesp.h"

/* ── Configuración WiFi ── */
const char* WIFI_SSID     = "OFICINA PRO";
const char* WIFI_PASSWORD = "Oficina?";

/* ── Configuración MQTT ── */
const char* MQTT_BROKER    = "broker.hivemq.com";
const int   MQTT_PUERTO    = 1883;
const char* MQTT_TOPIC     = "planta/datos";
const char* MQTT_CLIENT_ID = "esp32-monitor-plantas";

/* ── Pines ── */
#define PIN_DHT11  4
#define PIN_SUELO  35

/* ── Intervalo de publicación ── */
const unsigned long INTERVALO_MS = 5000;

/* ── Variables y objetos ── */
unsigned long ultimaPublicacion = 0;
DHTesp dht;
WiFiClient clienteWifi;
PubSubClient mqtt(clienteWifi);

/* ── Conectar WiFi ── */
void conectarWiFi() {
  Serial.print("Conectando a WiFi: ");
  Serial.println(WIFI_SSID);
  WiFi.begin(WIFI_SSID, WIFI_PASSWORD);
  int intentos = 0;
  while (WiFi.status() != WL_CONNECTED && intentos < 30) {
    delay(500);
    Serial.print(".");
    intentos++;
  }
  if (WiFi.status() == WL_CONNECTED) {
    Serial.println("\n WiFi conectado");
    Serial.print("  IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("\n No se pudo conectar al WiFi");
  }
}

/* ── Conectar MQTT ── */
void conectarMQTT() {
  while (!mqtt.connected()) {
    Serial.print("Conectando a MQTT...");
    if (mqtt.connect(MQTT_CLIENT_ID)) {
      Serial.println(" Conectado");
    } else {
      Serial.print(" Fallo. Error: ");
      Serial.println(mqtt.state());
      Serial.println("  Reintentando en 5s...");
      delay(5000);
    }
  }
}

/* ── Leer sensor de suelo ── */
int leerHumedadSuelo() {
  int lecturaADC = analogRead(PIN_SUELO);
  int porcentaje = map(lecturaADC, 4095, 0, 0, 100);
  return constrain(porcentaje, 0, 100);
}

/* ── Setup ── */
void setup() {
  Serial.begin(9600);
  delay(1000);
  dht.setup(PIN_DHT11, DHTesp::DHT11);
  conectarWiFi();
  mqtt.setServer(MQTT_BROKER, MQTT_PUERTO);
  conectarMQTT();
  Serial.println("Sistema listo");
}

/* ── Loop ── */
void loop() {
  if (!mqtt.connected()) conectarMQTT();
  mqtt.loop();

  unsigned long ahora = millis();
  if (ahora - ultimaPublicacion >= INTERVALO_MS) {
    ultimaPublicacion = ahora;

    TempAndHumidity datos = dht.getTempAndHumidity();
    int suelo = leerHumedadSuelo();

    if (dht.getStatus() != DHTesp::ERROR_NONE) {
      Serial.print("Error leyendo DHT11: ");
      Serial.println(dht.getStatusString());
      return;
    }

    float temperatura = datos.temperature;
    float humedad      = datos.humidity;

    Serial.println("--- Lectura ---");
    Serial.print("  Temperatura:   "); Serial.print(temperatura, 1); Serial.println(" C");
    Serial.print("  Humedad aire:  "); Serial.print(humedad, 1);     Serial.println(" %");
    Serial.print("  Humedad suelo: "); Serial.print(suelo);          Serial.println(" %");

    char json[80];
    snprintf(json, sizeof(json),
      "{\"temperatura\":%.1f,\"humedad\":%.1f,\"suelo\":%d}",
      temperatura, humedad, suelo
    );

    if (mqtt.publish(MQTT_TOPIC, json)) {
      Serial.print("  Publicado: ");
      Serial.println(json);
    } else {
      Serial.println("  Error al publicar");
    }
  }
}