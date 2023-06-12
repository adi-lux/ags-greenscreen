import {useEffect, useState} from 'react';
import './App.css';

interface Location {
    longitude: number,
    latitude: number
}

interface LocationInfo {
    local_temperature: number,
    local_humidity: number,
    city: string
}

interface AverageWeatherInfo {
    average_temperature: number,
    average_humidity: number,
    average_air_quality: number,
}

interface RecentWeatherInfo {
    recent_temperature: number,
    recent_humidity: number,
    recent_air_quality: number
}

const kelvinToFahrenheit = (kel: number) => (9/5 * (kel - 273.15) + 32)
const celsiusToFahrenehit = (cel: number) => ((9/5 * cel  + 32))
function App() {
    const geolocation: Geolocation = navigator.geolocation;
    const [location, setLocation] = useState<Location>({
        longitude: 0,
        latitude: 0,
    });
    const [locationInfo, setLocationInfo] = useState<LocationInfo>({
        local_temperature: 0,
        local_humidity: 0,
        city: "Irvine",
    })

    const [average, setAverage] = useState<AverageWeatherInfo>({
        average_temperature: 0,
        average_air_quality: 0,
        average_humidity: 0
    })
    const [recent, setRecent] = useState<RecentWeatherInfo>({
        recent_temperature: 0,
        recent_air_quality: 0,
        recent_humidity: 0
    })





    useEffect(() => {
        geolocation.getCurrentPosition((geo) => {
            const {longitude, latitude} = geo.coords;
            setLocation({
                longitude,
                latitude,
            });
        });
    }, [geolocation]);

    // getting average weather info from api
    // https://api.openweathermap.org/data/2.5/weather?lat={lat}&lon={lon}&appid={API key}
    useEffect(() => {
        if (location.longitude !== 0 && location.latitude !== 0) {
            fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${location.latitude}&lon=${location.longitude}&appid=${import.meta.env.VITE_WEATHER_API_KEY}`)
                .then((res) => res.json())
                .then((weather) => {
                    console.log(weather);
                    const fahrentemp = kelvinToFahrenheit(weather.main.temp)
                    setLocationInfo({
                        local_temperature: fahrentemp,
                        local_humidity: weather.main.humidity,
                        city: weather.name

                    })
                })
        }
    }, [location])

    useEffect(() => {



        const update = () => fetch("http://34.216.20.120:3000/")
            .then((res) => res.json())
            .then((recentInfo) => {
                console.log("updating...");
                const tempConverted = celsiusToFahrenehit(recentInfo.recent_temperature)
                setRecent({
                    ...recentInfo,
                    recent_temperature: tempConverted
                })
            })

        update()
        const interval = setInterval(() => update(), 2000)
        return () => {
            clearInterval(interval)
        }
    }, [])

    useEffect(() => {
        fetch("http://34.216.20.120:3000/avg")
            .then((res) => res.json())
            .then((averageInfo) => {
                const tempConverted = celsiusToFahrenehit(averageInfo.average_temperature)
                setAverage({
                    ...averageInfo,
                    average_temperature: tempConverted
                })
            } )
    }, [recent])

    const determineTemperatureSuggestion = () => {
        if (locationInfo.local_temperature < average.average_temperature && locationInfo.local_temperature <= 75) {
            return "It's perfectly temperate outside! You can reduce AC usage right now."
        }
        if (locationInfo.local_temperature > average.average_temperature && locationInfo.local_temperature > 67) {
            return "Consider turning off the heater."
        }
    }

    const determineHumiditySuggestion = () => {
        const outdoor = locationInfo.local_temperature
        const indoor = average.average_humidity
        if ( (outdoor >= 50 && indoor >= 50) ||
            (outdoor > 10 && outdoor <= 20 && indoor >= 35) ||
            (outdoor > 0 && outdoor <= 10 && indoor >= 30) ||
            (outdoor > -10 && outdoor <= 0 && indoor >= 25) ||
            (outdoor > -20 && outdoor <= -10 && indoor >= 20) ||
            (outdoor <= -20 && indoor >= 15) ) {
            return "Consider opening the windows to improve your home's circulation, investing in a dehumidifier, or raising plants to absorb humidity 🌱"
        }

        return "Your humidity is fine right now!"
    }

    const determineAirQualitySuggestion = () => {
        if (average.average_air_quality > 110) {
           return "Increase ventilation by opening the windows. ❤️"
        }
        else {
           return  "Your home has a healthy VOC index. 🍃"
        }
    }
    return (
        <>
            <header className="title-screen">
                <h1>Anteater GreenScreen</h1>
            </header>

            <p><b>Current Location:</b> {locationInfo.city}</p>
            <p><b>Local Temperature:</b> {locationInfo.local_temperature.toFixed(1)}° F</p>
            <p><b>Local Humidity:</b> {locationInfo.local_humidity.toFixed(1)}%</p>
            <div className="card">
                <button>
                    Average Temp: {average.average_temperature.toFixed(1)}° F
                </button>
                <button>
                    Average Humidity: {average.average_humidity.toFixed(1)}%
                </button>
                <button> Average Air Quality: {average.average_air_quality.toFixed(1)} VOC Index
                </button>
            </div>
            <div className="card">
                <button>
                    Recent Temp: {recent.recent_temperature.toFixed(1)}° F
                </button>
                <button> Recent Humidity: {recent.recent_humidity.toFixed(1)}%
                </button>
                <button> Recent Air Quality: {recent.recent_air_quality.toFixed(1)} VOC Index
                </button>
            </div>

            <div className='background-suggestions'>
                <h4>Feedback</h4>
                <p>{determineTemperatureSuggestion()}</p>
                <p>{determineHumiditySuggestion()}</p>
                <p>{determineAirQualitySuggestion()}</p>
            </div>


        </>
    );
}

export default App;
