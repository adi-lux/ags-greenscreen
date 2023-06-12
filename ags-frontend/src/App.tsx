import {useEffect, useState} from 'react';
import './App.css';

interface Location {
    longitude: number,
    latitude: number
}

interface LocationInfo {
    local_temperature: number,
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

const kelvinToFahrenheit = (kel: number) => (9/5 * (kel - 273.15) + 32).toFixed(1)
const celsiusToFahrenehit = (cel: number) => ((9/5 * cel  + 32).toFixed(1))
function App() {
    const recentLink = "http://34.216.20.120:3000"
    const averageLink = `${serverLink}/avg`
    const geolocation: Geolocation = navigator.geolocation;
    const [location, setLocation] = useState<Location>({
        longitude: 0,
        latitude: 0,
    });
    const [locationInfo, setLocationInfo] = useState<LocationInfo>({
        local_temperature: 0,
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
                    setLocationInfo({
                        local_temperature: weather.main.temp,
                        city: weather.name
                    })
                })
        }
    }, [location])

    useEffect(() => {
        fetch(recentLink)
            .then((res) => res.json())
            .then((recentInfo) => setRecent(recentInfo))
    }, [])

    useEffect(() => {
        fetch(averageLink)
            .then((res) => res.json())
            .then((averageInfo) )
    })
    return (
        <>
            <header className="title-screen">
                <h1>Anteater GreenScreen</h1>
            </header>
            <p>Current Location: {locationInfo.city}</p>
            <p>Average Temperature: {kelvinToFahrenheit(locationInfo.local_temperature)}° F</p>
            <div className="card">
                <button>
                    temperature is {2}
                </button>
                <button>
                    humidity is {humidity}
                </button>
            </div>

        </>
    );
}

export default App;
