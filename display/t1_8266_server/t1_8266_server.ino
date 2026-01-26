#include <ESP8266WiFi.h>
#include <ESP8266HTTPClient.h>
#include <TM1637Display.h>

// TM1637 pins (GPIO numbers)
#define TM_CLK 12   // D6
#define TM_DIO 13   // D7

// NodeMCU v3 pin mapping:
// D2 = GPIO4, D1 = GPIO5, D4 = GPIO2 (built-in LED, active-LOW)
#define TRIG_PIN 4
#define ECHO_PIN 5
#define LED_PIN  LED_BUILTIN   // built-in LED

// ===== CHANGE THESE =====
const char* ssid     = "OWMS";
const char* password = "12345678";
const char* serverIP = "10.121.111.202";   // your PC IP
const int   serverPort = 5000;
// =======================

const float FULL_DISTANCE  = 4.0;
const float EMPTY_DISTANCE = 100.0;

TM1637Display display(TM_CLK, TM_DIO);

void blinkReading() {
  // NodeMCU LED is active-LOW
  digitalWrite(LED_PIN, LOW);   // ON
  delay(120);
  digitalWrite(LED_PIN, HIGH);  // OFF
}

float getDistanceCM() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  long duration = pulseIn(ECHO_PIN, HIGH, 30000); // 30ms timeout
  if (duration == 0) return -1;

  return (duration * 0.0343f) / 2.0f;
}

int getFillPercent(float d) {
  if (d < 0) return -1;
  if (d <= FULL_DISTANCE) return 100;
  if (d >= EMPTY_DISTANCE) return 0;

  float pct = ((EMPTY_DISTANCE - d) / (EMPTY_DISTANCE - FULL_DISTANCE)) * 100.0f;
  return constrain((int)(pct + 0.5f), 0, 100);
}

void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  Serial.println("[WiFi] Disconnected. Reconnecting...");
  WiFi.disconnect();
  WiFi.begin(ssid, password);

  unsigned long start = millis();
  while (WiFi.status() != WL_CONNECTED && millis() - start < 20000) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("[WiFi] Connected. IP: ");
    Serial.println(WiFi.localIP());
  } else {
    Serial.println("[WiFi] Reconnect failed (timeout).");
  }
}

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH); // LED OFF

  display.setBrightness(0x0f); // 0x00..0x0f
  display.clear();
  display.showNumberDec(0, true); // show 0000 at boot

  WiFi.mode(WIFI_STA);
  WiFi.begin(ssid, password);

  Serial.print("[WiFi] Connecting");
  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  Serial.print("[WiFi] Connected. IP: ");
  Serial.println(WiFi.localIP());
  Serial.print("[WiFi] RSSI: ");
  Serial.println(WiFi.RSSI());
}

void loop() {
  ensureWiFi();

  // Take reading
  float distance = getDistanceCM();
  int fill = getFillPercent(distance);

  // Update 4-digit display
  if (distance < 0) {
    // Show ---- on sensor error
    uint8_t dashes[] = {0x40, 0x40, 0x40, 0x40};
    display.setSegments(dashes);
  } else {
    // Show fill % with colon ON
    display.showNumberDecEx(fill, 0b01000000, false);
  }


  // Blink once per reading cycle
  blinkReading();

  Serial.println("--------------------------------------------------");
  Serial.printf("[Reading] millis=%lu\n", millis());
  Serial.printf("[WiFi] %s | RSSI=%d dBm | IP=%s\n",
                (WiFi.status() == WL_CONNECTED ? "CONNECTED" : "DISCONNECTED"),
                WiFi.RSSI(),
                WiFi.localIP().toString().c_str());

  if (distance < 0) {
    Serial.println("[Sensor] No echo / timeout. Skipping POST.");
    delay(5000);
    return;
  }

  Serial.printf("[Sensor] Distance: %.1f cm\n", distance);
  Serial.printf("[Sensor] Fill: %d %%\n", fill);

  // Send to Flask
  if (WiFi.status() == WL_CONNECTED) {
    WiFiClient client;
    HTTPClient http;

    String url = String("http://") + serverIP + ":" + serverPort + "/data";
    String payload = "distance=" + String(distance, 1) + "&fill=" + String(fill);

    Serial.println("[HTTP] POST -> " + url);
    Serial.println("[HTTP] Payload: " + payload);

    http.begin(client, url);
    http.addHeader("Content-Type", "application/x-www-form-urlencoded");
    http.setTimeout(5000);

    int code = http.POST(payload);
    Serial.printf("[HTTP] Response code: %d\n", code);

    if (code > 0) {
      String resp = http.getString();
      Serial.println("[HTTP] Response body: " + resp);
    } else {
      Serial.println("[HTTP] POST failed. Check server IP/firewall/WiFi.");
    }

    http.end();
  } else {
    Serial.println("[WiFi] Not connected, POST skipped.");
  }

  delay(5000);
}
