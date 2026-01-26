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
#define LED_PIN  LED_BUILTIN   // built-in LED (active-LOW)

// ===== CHANGE THESE =====
const char* ssid     = "OWMS";
const char* password = "12345678";
const char* serverIP = "10.121.111.202";   // your PC IP
const uint16_t serverPort = 5000;
// =======================

// Calibration: cm when FULL vs EMPTY
const float FULL_DISTANCE  = 4.0f;
const float EMPTY_DISTANCE = 100.0f;

// Timing
const uint32_t SAMPLE_INTERVAL_MS = 5000;
const uint32_t WIFI_RETRY_INTERVAL_MS = 10000;

// Ultrasonic
const uint32_t PULSE_TIMEOUT_US = 30000; // 30ms

TM1637Display display(TM_CLK, TM_DIO);

// 7-seg bitmasks for TM1637Display:
// 0x01 A, 0x02 B, 0x04 C, 0x08 D, 0x10 E, 0x20 F, 0x40 G, 0x80 DP
static const uint8_t SEG_DASHES[4] = {0x40, 0x40, 0x40, 0x40};                 // ----
static const uint8_t SEG_FULL[4]   = {0x71, 0x3E, 0x38, 0x38};                 // F U L L

uint32_t lastSampleMs = 0;
uint32_t lastWiFiAttemptMs = 0;

static inline void blinkReading() {
  digitalWrite(LED_PIN, LOW);   // ON (active-LOW)
  delay(80);
  digitalWrite(LED_PIN, HIGH);  // OFF
}

float getDistanceCM_once() {
  digitalWrite(TRIG_PIN, LOW);
  delayMicroseconds(2);
  digitalWrite(TRIG_PIN, HIGH);
  delayMicroseconds(10);
  digitalWrite(TRIG_PIN, LOW);

  unsigned long duration = pulseIn(ECHO_PIN, HIGH, PULSE_TIMEOUT_US);
  if (duration == 0) return -1.0f;

  return (duration * 0.0343f) / 2.0f;
}

// Median of 3 to reduce spikes (cheap + effective)
float getDistanceCM() {
  float a = getDistanceCM_once();
  delay(40);
  float b = getDistanceCM_once();
  delay(40);
  float c = getDistanceCM_once();

  if (a < 0 || b < 0 || c < 0) return -1.0f;

  // median-of-3
  if (a > b) { float t=a; a=b; b=t; }
  if (b > c) { float t=b; b=c; c=t; }
  if (a > b) { float t=a; a=b; b=t; }
  return b;
}

int getFillPercent(float d) {
  if (d < 0) return -1;
  if (d <= FULL_DISTANCE) return 100;
  if (d >= EMPTY_DISTANCE) return 0;

  float pct = ((EMPTY_DISTANCE - d) / (EMPTY_DISTANCE - FULL_DISTANCE)) * 100.0f;
  int rounded = (int)(pct + 0.5f);
  return constrain(rounded, 0, 100);
}

void showOnDisplay(float distance, int fill) {
  if (distance < 0 || fill < 0) {
    display.setSegments(SEG_DASHES);
    return;
  }

  // Requirement: over 99% -> FULL
  if (fill > 99) {
    display.setSegments(SEG_FULL);
    return;
  }

  // Requirement: remove colon -> use plain showNumberDec
  display.showNumberDec(fill, false); // no leading zeros, no colon
}

void ensureWiFi() {
  if (WiFi.status() == WL_CONNECTED) return;

  uint32_t now = millis();
  if (now - lastWiFiAttemptMs < WIFI_RETRY_INTERVAL_MS) return;
  lastWiFiAttemptMs = now;

  Serial.println(F("[WiFi] Disconnected. Reconnecting..."));
  WiFi.disconnect();
  WiFi.begin(ssid, password);

  // brief connect window, don’t block forever
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < 8000) {
    delay(200);
    yield();
  }

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print(F("[WiFi] Connected. IP: "));
    Serial.println(WiFi.localIP());
  } else {
    Serial.println(F("[WiFi] Reconnect failed (timeout)."));
  }
}

bool postToServer(float distance, int fill) {
  if (WiFi.status() != WL_CONNECTED) return false;

  WiFiClient client;
  HTTPClient http;

  char url[96];
  snprintf(url, sizeof(url), "http://%s:%u/data", serverIP, serverPort);

  char payload[64];
  snprintf(payload, sizeof(payload), "distance=%.1f&fill=%d", distance, fill);

  Serial.print(F("[HTTP] POST -> "));
  Serial.println(url);
  Serial.print(F("[HTTP] Payload: "));
  Serial.println(payload);

  http.begin(client, url);
  http.addHeader("Content-Type", "application/x-www-form-urlencoded");
  http.setTimeout(5000);

  int code = http.POST((uint8_t*)payload, strlen(payload));
  Serial.printf("[HTTP] Response code: %d\n", code);

  if (code > 0) {
    String resp = http.getString();
    Serial.print(F("[HTTP] Response body: "));
    Serial.println(resp);
    http.end();
    return true;
  }

  Serial.println(F("[HTTP] POST failed. Check server IP/firewall/WiFi."));
  http.end();
  return false;
}

void setup() {
  Serial.begin(115200);
  delay(200);

  pinMode(TRIG_PIN, OUTPUT);
  pinMode(ECHO_PIN, INPUT);

  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, HIGH); // LED OFF (active-LOW)

  display.setBrightness(0x0f);
  display.clear();
  display.showNumberDec(0, true);

  WiFi.persistent(false);
  WiFi.mode(WIFI_STA);
  WiFi.setAutoReconnect(true);
  WiFi.begin(ssid, password);

  Serial.print(F("[WiFi] Connecting"));
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < 15000) {
    delay(300);
    Serial.print('.');
    yield();
  }
  Serial
