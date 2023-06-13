# Anteater GreenScreen
A project by Adithya Anandsaikrishnan and Fiona Zhao

This project was for UC Irvine's CS147 course, and the intention was to develop an IoT system that communicated with
a cloud platform and contained a frontend to display the information.

We decided on a project that tracked a person's household temperature, air quality, and
humidity, and then generated a recommendation based on the tracked values. This project intends to increase
a user's accountability in terms of their personal environmental impact.


## Setup Instructions

### Frontend

Get an API key from [OpenWeatherMap](https://openweathermap.org/api).

`git clone` the repo, cd to the frontend folder, and `npm install`.
Then, add your API key to the .env folder, setting it to the variable `VITE_WEATHER_API_KEY`. Launch the frontend.


### Backend
Create a DynamoDB table with the following schema
```
SensorMetrics (
    Partition Key: Temperature (Number),
    Sort Key: Timestamp (Number),
    AirQuality (Number),
    Humidity (Number),
)
```

Create an EC2 instance, ```git clone``` the repo, `cd` to the backend,
and `npm install`. Then, set up your own credentials for AWS DynamoDB using
[this guide](https://docs.aws.amazon.com/sdk-for-javascript/v3/developer-guide/setting-credentials-node.html). Run the backend.

### IoT
Device-specific, but the software aspect used PlatformIO on Visual Studio Code to run the application.

We used [this specific ESP32](https://www.amazon.com/LILYGO-T-Display-Arduino-Development-CH9102F/dp/B0B3RF87VG/ref=sr_1_3?crid=2GDD0P880ZO53&keywords=esp32%2Bttgo&qid=1683917691&sprefix=esp32%2Bttgo%2Caps%2C139&sr=8-3&th=1)
device to run the program.

The hardware we used for the sensors is as follows: 

[Humidity and Temperature Sensor - DHT20](https://www.sparkfun.com/products/18364)

[SparkFun Air Quality Sensor - SGP40 (Qwiic)](https://www.sparkfun.com/products/18345)

[SparkFun Momentary Button](https://www.sparkfun.com/products/14460)


