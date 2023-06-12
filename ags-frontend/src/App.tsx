import {useEffect, useState} from 'react';
import './App.css';

interface Location {
    longitude: number,
    latitude: number
}

interface LocationInfo {
    average_temperature: number,
    city: string
}
const kelvinToFahrenheit = (kel: number) => (9/5 * (kel - 273.15) + 32).toFixed(1)
const celsiusToFahrenehit = (cel: number) => ((9/5 * cel  + 32).toFixed(1))
function App() {
    const geolocation: Geolocation = navigator.geolocation;
    const [location, setLocation] = useState<Location>({
        longitude: 0,
        latitude: 0,
    });
    const [temp, setTemp] = useState(0);
    const [humidity, setHumidity] = useState(0);
    const [locationInfo, setLocationInfo] = useState<LocationInfo>({
        average_temperature: 0,
        city: "Irvine",
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
                        average_temperature: weather.main.temp,
                        city: weather.name
                    })
                })
        }
    }, [location])

    return (
        <>
            <h1>Anteater Green Screen</h1>
            <p>
                Current Location: {locationInfo.city}</p>
            <p>Average Temperature: {kelvinToFahrenheit(locationInfo.average_temperature)}° F</p>
            <div className="card">
                <button>
                    temperature is {celsiusToFahrenehit(locationInfo.average_temperature)}
                </button>
                <button>
                    humidity is {humidity}
                </button>
            </div>

        </>
    );
}

export default App;
