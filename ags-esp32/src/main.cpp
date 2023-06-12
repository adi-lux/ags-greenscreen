#include <sstream>
#include <Arduino.h>
#include <Wire.h>
#include <DHT20.h>
#include <HTTPClient.h>
#include <WiFi.h>
#include <SparkFun_SGP40_Arduino_Library.h>
#include <inttypes.h>
#include <stdio.h>
#include "esp_system.h"
#include "freertos/FreeRTOS.h"
#include "freertos/task.h"
#include "nvs.h"
#include "nvs_flash.h"

// IDK something.
const int PUSH_PIN = 37;

const char* IP_ADDR = "34.216.20.120";
const char* ENDPOINT = "34.216.20.120:3000/";

char ssid[50]; // your network SSID (name)
char pass[50]; // your network password (use for WPA, or use
// as key for WEP)

struct RoomMetrics {
  double temperature;
  double humidity;
  double airQuality;
};

DHT20 DHT;
SGP40 SGP;
uint8_t count = 0;

void printStatusErr(int status) {
  switch (status)
  {
      case DHT20_OK:
        Serial.print("OK");
        break;
      case DHT20_ERROR_CHECKSUM:
        Serial.print("Checksum error");
        break;
      case DHT20_ERROR_CONNECT:
        Serial.print("Connect error");
        break;
      case DHT20_MISSING_BYTES:
        Serial.print("Missing bytes");
        break;
      case DHT20_ERROR_BYTES_ALL_ZERO:
        Serial.print("All bytes read zero");
        break;
      case DHT20_ERROR_READ_TIMEOUT:
        Serial.print("Read time out");
        break;
      case DHT20_ERROR_LASTREAD:
        Serial.print("Error read too fast");
        break;
      default:
        Serial.print("Unknown error");
        break;
  }
  Serial.print("\n");
}

RoomMetrics readAndCalibrateMetrics() {
  uint64_t start = millis();
  Serial.println(start);

  RoomMetrics aggMetrics { .temperature = .0, .humidity = .0, .airQuality = .0 };
  uint32_t calibrations = 0;
  while ((millis() - start) <= 30 * 1000) {
    if (millis() - DHT.lastRead() >= 1000) {
      int status = DHT.read();
      if (status == DHT20_OK) {
        float temperature = DHT.getTemperature();
        float humidity = DHT.getHumidity();
        RoomMetrics metrics {
          .temperature = temperature,
          .humidity = humidity,
          .airQuality = static_cast<double>(SGP.getVOCindex(humidity, temperature))
        };

        aggMetrics.temperature += metrics.temperature;
        aggMetrics.humidity += metrics.humidity;
        aggMetrics.airQuality += metrics.airQuality;

        calibrations++;

        Serial.println();
        Serial.println("Humidity (%)\tTemp (°C)\tAir Quality (VOC)");

        Serial.print(metrics.humidity, 1);
        Serial.print("\t\t");
        Serial.print(metrics.temperature, 1);
        Serial.print("\t\t");
        Serial.print(metrics.airQuality, 1);
        Serial.println();

      } else {
        printStatusErr(status);
      }
    }
  }

  aggMetrics.temperature /= calibrations;
  aggMetrics.humidity /= calibrations;
  aggMetrics.airQuality /= calibrations;
  return aggMetrics;
}

void nvs_access() {
  // Initialize NVS
  esp_err_t err = nvs_flash_init();
  if (err == ESP_ERR_NVS_NO_FREE_PAGES || 
      err == ESP_ERR_NVS_NEW_VERSION_FOUND) {
    // NVS partition was truncated and needs to be erased
    // Retry nvs_flash_init
    ESP_ERROR_CHECK(nvs_flash_erase());
    err = nvs_flash_init();
  }
  ESP_ERROR_CHECK(err);
  // Open
  Serial.printf("\n");
  Serial.printf("Opening Non-Volatile Storage (NVS) handle... ");
  nvs_handle_t my_handle;
  err = nvs_open("storage", NVS_READWRITE, &my_handle);

  if (err != ESP_OK) {
    Serial.printf("Error (%s) opening NVS handle!\n", esp_err_to_name(err));
  } else {
    Serial.printf("Done\n");
    Serial.printf("Retrieving SSID/PASSWD\n");
    size_t ssid_len;
    size_t pass_len;
    err = nvs_get_str(my_handle, "ssid", ssid, &ssid_len);
    err |= nvs_get_str(my_handle, "pass", pass, &pass_len);
    switch (err) {
      case ESP_OK:
        Serial.printf("Done\n");
        break;
      case ESP_ERR_NVS_NOT_FOUND:
        Serial.printf("The value is not initialized yet!\n");
        break;
      default:
        Serial.printf("Error (%s) reading!\n", esp_err_to_name(err));
    }
  }
  // Close
  nvs_close(my_handle);
}

std::string constructRequest(const RoomMetrics& metrics) {
  std::ostringstream request;
  request << "{";
  request << "\"hum\":" << metrics.humidity << ",";
  request << "\"temp\":" << metrics.temperature << ",";
  request << "\"aq\":" << metrics.airQuality;
  request << "}";

  return request.str();
}

int sendRequestToEndpoint(std::string request) {
  // Number of milliseconds to wait without receiving any data before we give up
  constexpr int K_NETWORK_TIMEOUT = 30 * 1000;
  // Number of milliseconds to wait if no data is available before trying again
  constexpr int K_NETWORK_DELAY = 1000;

  WiFiClient c;
  HTTPClient http{};
  http.begin(c, IP_ADDR, 3000);
  http.addHeader("Content-Type", "application/json");
  int code = http.POST(request.c_str());

  String payload = http.getString();
  Serial.printf("Received code: %d\n", code);
  Serial.printf("Received payload: %s\n", payload);

  http.end();
  return code;
}

void sendMetricsToEndpoint(RoomMetrics metrics) {
  sendRequestToEndpoint(constructRequest(metrics));
}

void setup() {
  Serial.begin(9600);
  pinMode(PUSH_PIN, INPUT_PULLUP);

  DHT.begin();
  Wire.setClock(400000);

  // Retrieve SSID/PASSWD from flash before anything else
  nvs_access();

  // We start by connecting to a WiFi network.
  delay(1000);
  Serial.print("Connecting to ");
  Serial.println(ssid);

  WiFi.begin(ssid, pass);

  while (WiFi.status() != WL_CONNECTED) {
    delay(500);
    Serial.print(".");
  }

  Serial.println("");
  Serial.println("WiFi connected");
  Serial.println("IP address: ");
  Serial.println(WiFi.localIP());
  Serial.println("MAC address: ");
  Serial.println(WiFi.macAddress());

  if (!SGP.begin()) {
    Serial.println("SGP40 not detected. Check connections. Freezing...");
    while (1)
      ; // Do nothing more
  }

  int i;
  for (i = 0; i < 5; ++i) {
    readAndCalibrateMetrics();
  }
}


void loop() {
  if (digitalRead(PUSH_PIN) == LOW) {

    RoomMetrics metrics = readAndCalibrateMetrics();
    Serial.println("Humidity (%)\tTemp (°C)\tAir Quality (VOC)");
    Serial.print(metrics.humidity, 1);
    Serial.print("\t\t");
    Serial.print(metrics.temperature, 1);
    Serial.print("\t\t");
    Serial.print(metrics.airQuality, 1);
    Serial.println();

    sendMetricsToEndpoint(metrics);
  }
  delay(3000);
}
