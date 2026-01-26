#include <WiFi.h>
#include <HTTPClient.h>
#include <esp_now.h>
#include <esp_wifi.h>

// ================== WiFi (Hotspot) ==================
const char* WIFI_SSID = "OWMS";
const char* WIFI_PASS = "12345678";

// ================== Server PC ==================
const char* SERVER_IP   = "10.121.111.202";
const int   SERVER_PORT = 5000;
const char* SERVER_PATH = "/data";

// ================== Hub Settings ==================
const char* HUB_ID = "hub01";
const uint32_t POST_INTERVAL_MS = 5000;   // send aggregate every 5s
const uint32_t WIFI_RETRY_MS    = 20000;
const int MAX_BINS = 20;

// ================== Packet format from ESP8266 ==================
typedef struct __attribute__((packed)) {
  char bin_id[6];      // "bin01" + '\0'
  uint8_t fill;        // 0..100
  float distance;      // cm
  uint32_t seq;        // counter
} BinPacket;

// ================== Bin state ==================
struct BinState {
  uint8_t fill;
  float distance;
  uint32_t seq;
  uint32_t last_seen_ms;
  String last_src_mac;   // debug-only
};

String binKeys[MAX_BINS];
BinState binVals[MAX_BINS];
int binCount = 0;

uint32_t lastPostMs = 0;
uint32_t lastWifiAttemptMs = 0;

// ---------- Helpers ----------
String macToString(const uint8_t* mac) {
  char buf[18];
  snprintf(buf, sizeof(buf), "%02X:%02X:%02X:%02X:%02X:%02X",
           mac[0], mac[1], mac[2], mac[3], mac[4], mac[5]);
  return String(buf);
}

void printRealMacs() {
  uint8_t mac_sta[6], mac_ap[6];

  // Most reliable on ESP32 Arduino core
  esp_wifi_get_mac(WIFI_IF_STA, mac_sta);
  esp_wifi_get_mac(WIFI_IF_AP,  mac_ap);

  Serial.printf("STA MAC (esp_wifi_get_mac): %02X:%02X:%02X:%02X:%02X:%02X\n",
                mac_sta[0], mac_sta[1], mac_sta[2], mac_sta[3], mac_sta[4], mac_sta[5]);

  Serial.printf("AP  MAC (esp_wifi_get_mac): %02X:%02X:%02X:%02X:%02X:%02X\n",
                mac_ap[0], mac_ap[1], mac_ap[2], mac_ap[3], mac_ap[4], mac_ap[5]);

  Serial.print("STA MAC (WiFi.macAddress): ");
  Serial.println(WiFi.macAddress());
}

int findBinIndex(const String& id) {
  for (int i = 0; i < binCount; i++) {
    if (binKeys[i] == id) return i;
  }
  return -1;
}

int upsertBin(const String& id, const BinState& st) {
  int idx = findBinIndex(id);
  if (idx >= 0) {
    binVals[idx] = st;
    return idx;
  }
  if (binCount >= MAX_BINS) {
    Serial.println("[WARN] MAX_BINS reached; ignoring new bin: " + id);
    return -1;
  }
  binKeys[binCount] = id;
  binVals[binCount] = st;
  binCount++;
  return binCount - 1;
}

void printBinsTable() {
  Serial.println("========== BIN TABLE ==========");
  if (binCount == 0) {
    Serial.println("(no bins yet)");
  }
  for (int i = 0; i < binCount; i++) {
    uint32_t age = millis() - binVals[i].last_seen_ms;
    Serial.printf("%s | fill=%u%% | dist=%.1f cm | seq=%lu | age=%lums | src=%s\n",
                  binKeys[i].c_str(),
                  binVals[i].fill,
                  binVals[i].distance,
                  (unsigned long)binVals[i].seq,
                  (unsigned long)age,
                  binVals[i].last_src_mac.c_str());
  }
  Serial.println("================================");
}

// Build JSON payload manually (no ArduinoJson dependency)
String buildJsonPayload() {
  // {"hub_id":"hub01","bins":{"bin01":{"fill":52,"distance":49.8,"age_ms":900},"bin02":{...}}}
  String json = "{\"hub_id\":\"";
  json += HUB_ID;
  json += "\",\"bins\":{";

  for (int i = 0; i < binCount; i++) {
    if (i > 0) json += ",";

    uint32_t age = millis() - binVals[i].last_seen_ms;

    json += "\"";
    json += binKeys[i];
    json += "\":{";

    json += "\"fill\":";
    json += String(binVals[i].fill);

    json += ",\"distance\":";
    json += String(binVals[i].distance, 1);

    json += ",\"age_ms\":";
    json += String(age);

    // Optional debug fields:
    // json += ",\"seq\":";
    // json += String(binVals[i].seq);

    json += "}";
  }

  json += "}}";
  return json;
}

bool postToServer(const String& payload) {
  if (WiFi.status() != WL_CONNECTED) {
    Serial.println("[HTTP] WiFi not connected; skipping POST");
    return false;
  }

  WiFiClient client;
  HTTPClient http;

  String url = String("http://") + SERVER_IP + ":" + String(SERVER_PORT) + SERVER_PATH;

  Serial.println("[HTTP] POST -> " + url);
  Serial.println("[HTTP] JSON -> " + payload);

  http.begin(client, url);
  http.addHeader("Content-Type", "application/json");
  http.setTimeout(5000);

  int code = http.POST((uint8_t*)payload.c_str(), payload.length());
  Serial.printf("[HTTP] Response code: %d\n", code);

  if (code > 0) {
    String resp = http.getString();
    Serial.println("[HTTP] Response body: " + resp);
    http.end();
    return (code >= 200 && code < 300);
  } else {
    Serial.println("[HTTP] POST failed (code <= 0). Check server IP/firewall/WiFi.");
    http.end();
    return false;
  }
}

// ---------- ESP-NOW: ensure peer exists ----------
bool ensurePeer(const uint8_t* mac) {
  if (esp_now_is_peer_exist(mac)) return true;

  esp_now_peer_info_t peerInfo = {};
  memcpy(peerInfo.peer_addr, mac, 6);
  peerInfo.channel = WiFi.channel();   // must match current channel
  peerInfo.encrypt = false;

  esp_err_t r = esp_now_add_peer(&peerInfo);
  if (r == ESP_OK) {
    Serial.print("[ESP-NOW] Added peer: ");
    Serial.println(macToString(mac));
    return true;
  } else {
    Serial.printf("[ESP-NOW] Failed to add peer (%d)\n", (int)r);
    return false;
  }
}

// ---------- ESP-NOW receive callback ----------
void onEspNowRecv(const esp_now_recv_info_t* info, const uint8_t* data, int len) {
  const uint8_t* src = info->src_addr;
  String srcMac = macToString(src);

  Serial.println("\n📩 [ESP-NOW] Packet received");
  Serial.println("From MAC: " + srcMac);
  Serial.printf("Len: %d bytes\n", len);

  // Auto-add sender as peer (helps unicast ACK stability)
  ensurePeer(src);

  if (len != (int)sizeof(BinPacket)) {
    Serial.printf("[ESP-NOW] Invalid packet size. Expected %u got %d\n",
                  (unsigned)sizeof(BinPacket), len);
    return;
  }

  BinPacket pkt;
  memcpy(&pkt, data, sizeof(pkt));
  pkt.bin_id[5] = '\0'; // force null-termination

  String binId = String(pkt.bin_id);

  Serial.printf("Bin ID   : %s\n", binId.c_str());
  Serial.printf("Fill     : %u %%\n", pkt.fill);
  Serial.printf("Distance : %.1f cm\n", pkt.distance);
  Serial.printf("Seq      : %lu\n", (unsigned long)pkt.seq);

  BinState st;
  st.fill = pkt.fill;
  st.distance = pkt.distance;
  st.seq = pkt.seq;
  st.last_seen_ms = millis();
  st.last_src_mac = srcMac;

  int idx = upsertBin(binId, st);
  if (idx >= 0) {
    Serial.printf("[ESP-NOW] Stored/updated '%s' at index %d\n", binId.c_str(), idx);
  }

  // Print table on every packet (debug)
  printBinsTable();
}

// ---------- WiFi connection + ESP-NOW init ----------
void connectWiFi() {
  WiFi.mode(WIFI_STA);
  WiFi.begin(WIFI_SSID, WIFI_PASS);

  Serial.print("[WiFi] Connecting");
  uint32_t start = millis();
  while (WiFi.status() != WL_CONNECTED && (millis() - start) < WIFI_RETRY_MS) {
    delay(500);
    Serial.print(".");
  }
  Serial.println();

  if (WiFi.status() == WL_CONNECTED) {
    Serial.print("[WiFi] Connected. IP: ");
    Serial.println(WiFi.localIP());
    Serial.print("[WiFi] RSSI: ");
    Serial.println(WiFi.RSSI());
    Serial.print("[WiFi] Channel: ");
    Serial.println(WiFi.channel());
  } else {
    Serial.println("[WiFi] Failed to connect (timeout).");
  }
}

void initEspNow() {
  if (esp_now_init() != ESP_OK) {
    Serial.println("[ESP-NOW] Init failed!");
    return;
  }

  // ✅ For debugging, KEEP THIS OFF (not needed unless you use encryption)
  // esp_now_set_pmk((uint8_t*)"pmk1234567890123");

  Serial.println("[ESP-NOW] Initialized");
  esp_now_register_recv_cb(onEspNowRecv);

  Serial.println("[ESP32 HUB] Ready (ESP-NOW receive + WiFi gateway)");
}

// ---------- Main ----------
void setup() {
  Serial.begin(115200);
  delay(200);

  WiFi.mode(WIFI_STA);
  WiFi.setSleep(false);

  Serial.println("\n=== ESP32 HUB START ===");
  Serial.printf("Hub ID: %s\n", HUB_ID);

  connectWiFi();

  Serial.printf("[WiFi] Channel: %d\n", WiFi.channel());

  // ✅ Print real MAC AFTER WiFi init/connect
  printRealMacs();

  initEspNow();
}

void loop() {
  // Reconnect WiFi if needed (keeps server posting alive)
  if (WiFi.status() != WL_CONNECTED) {
    uint32_t now = millis();
    if (now - lastWifiAttemptMs > 3000) {
      lastWifiAttemptMs = now;
      Serial.println("[WiFi] Disconnected. Reconnecting...");
      WiFi.disconnect();
      WiFi.begin(WIFI_SSID, WIFI_PASS);
    }
  }

  // Periodic POST
  uint32_t now = millis();
  if (now - lastPostMs >= POST_INTERVAL_MS) {
    lastPostMs = now;

    if (binCount == 0) {
      Serial.println("[HTTP] No bins yet; not posting.");
    } else {
      String payload = buildJsonPayload();
      bool ok = postToServer(payload);
      Serial.println(ok ? "[HTTP] POST OK ✅" : "[HTTP] POST FAIL ❌");
    }
  }

  delay(10);
}
