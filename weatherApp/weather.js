const apiKey = "aa639baaaf47f1feb617385d2489a9d8"; // Replace with your actual API key

// DOM elements
const input = document.getElementById('input');
const searchBtn = document.getElementById('search');

// Load weather for current location on page load
window.addEventListener("load", () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
            (position) => {
                const { longitude: lon, latitude: lat } = position.coords;
                getWeatherByCoords(lat, lon);
            },
            (error) => {
                console.error("Geolocation error:", error);
                // Default to Delhi if geolocation fails
                getWeatherByCity("Delhi");
            }
        );
    } else {
        // Default to Delhi if geolocation not supported
        getWeatherByCity("Delhi");
    }
});

// Search by city function
function searchByCity() {
    const place = input.value.trim();
    if (place) {
        getWeatherByCity(place);
        input.value = '';
    } else {
        alert("Please enter a city name");
    }
}

// Get weather by coordinates
function getWeatherByCoords(lat, lon) {
    const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}`;
    fetchWeather(url);
}

// Get weather by city name
function getWeatherByCity(city) {
    const url = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}`;
    fetchWeather(url);
}

// Fetch weather data
function fetchWeather(url) {
    fetch(url)
        .then(response => {
            if (!response.ok) throw new Error('City not found');
            return response.json();
        })
        .then(data => {
            weatherReport(data);
        })
        .catch(error => {
            console.error('Error fetching weather:', error);
            alert('Error: ' + error.message);
        });
}

// Main weather report function
function weatherReport(data) {
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${data.name}&appid=${apiKey}`;
    
    // Update current weather
    document.getElementById('city').innerText = `${data.name}, ${data.sys.country}`;
    document.getElementById('temperature').innerText = `${Math.floor(data.main.temp - 273)} °C`;
    document.getElementById('clouds').innerText = data.weather[0].description;
    
    const iconUrl = `https://openweathermap.org/img/w/${data.weather[0].icon}.png`;
    document.getElementById('img').src = iconUrl;

    // Fetch forecast data
    fetch(forecastUrl)
        .then(response => response.json())
        .then(forecast => {
            hourForecast(forecast);
            dayForecast(forecast);
        })
        .catch(error => {
            console.error('Error fetching forecast:', error);
        });
}

// Hourly forecast
function hourForecast(forecast) {
    const templist = document.querySelector('.templist');
    templist.innerHTML = '';
    
    for (let i = 0; i < 5; i++) {
        const item = forecast.list[i];
        const date = new Date(item.dt * 1000);
        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
        
        const hourlyItem = document.createElement('div');
        hourlyItem.className = 'next';
        
        hourlyItem.innerHTML = `
            <div>
                <p class="time">${timeStr}</p>
                <p>${Math.floor(item.main.temp_max - 273)}°C / ${Math.floor(item.main.temp_min - 273)}°C</p>
            </div>
            <p class="desc">${item.weather[0].description}</p>
        `;
        
        templist.appendChild(hourlyItem);
    }
}

// Daily forecast
function dayForecast(forecast) {
    const weekF = document.querySelector('.weekF');
    weekF.innerHTML = '';
    
    for (let i = 7; i < forecast.list.length; i += 8) {
        const item = forecast.list[i];
        const date = new Date(item.dt * 1000);
        const dayStr = date.toLocaleDateString([], { weekday: 'long', month: 'short', day: 'numeric' });
        
        const dayItem = document.createElement('div');
        dayItem.className = 'dayF';
        
        dayItem.innerHTML = `
            <p class="date">${dayStr}</p>
            <p>${Math.floor(item.main.temp_max - 273)}°C / ${Math.floor(item.main.temp_min - 273)}°C</p>
            <p class="desc">${item.weather[0].description}</p>
        `;
        
        weekF.appendChild(dayItem);
    }
}

// Add event listener for Enter key
input.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
        searchByCity();
    }
});