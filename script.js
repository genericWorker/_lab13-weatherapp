let units = "metric";
let userCity = "Denver";  // default
const unsplashKey = "3aec8sTVyLBtqALtmIS3PAZlPpcTqD7SVl1OcUp7b9M"; // Your Unsplash Key

const DegreeUnits = { Celsius: "°C", Fahrenheit: "°F" };
const SpeedUnits = { MPH: " mph", KPH: " km/h" };

let degreesLabel = DegreeUnits.Celsius;
let speedLabel = SpeedUnits.KPH;

function getLocalDate(dt) {
    return new Date(dt * 1000).toLocaleString();
}

let weather = {
    apiKey: "82005d27a116c2880c8f0fcb866998a0",
    
    fetchWeather: function (city) {
        fetch(`https://api.openweathermap.org/data/2.5/weather?q=${city}&units=${units}&appid=${this.apiKey}`)
            .then((response) => {
                if (!response.ok) {
                    alert("No weather found.");
                    throw new Error("No weather found.");
                }
                userCity = city;
                return response.json();
            })
            .then((data) => this.displayWeather(data));
    },

    displayWeather: function (data) {
    const { name } = data;
    const { country } = data.sys;
    const { icon, description } = data.weather[0];
    const { temp, temp_min, temp_max, feels_like, humidity } = data.main;
    const { speed, deg } = data.wind;
    const { dt } = data;

    // 1. Update Text Content
    document.querySelector(".city").innerText = country ? `${name}, ${country}` : name;
    document.querySelector(".icon").src = `https://openweathermap.org/img/wn/${icon}.png`;
    document.querySelector(".time").innerText = getLocalDate(dt);
    document.querySelector(".description").innerText = description;
    document.querySelector(".temp").innerText = temp + degreesLabel;
    document.querySelector(".temp_min").innerText = `Low ${temp_min}${degreesLabel}`;
    document.querySelector(".temp_max").innerText = `Hi ${temp_max}${degreesLabel}`;
    document.querySelector(".feels_like").innerText = `Feels like ${feels_like}${degreesLabel}`;
    document.querySelector(".humidity").innerText = `Humidity: ${humidity}%`;
    document.querySelector(".wind").innerText = `Wind speed: ${speed}${speedLabel}`;
    document.querySelector(".deg").innerText = `Direction: ${deg}° ${getCardinalDirection(deg)}`;
    
    // 2. Reveal the weather container
    document.querySelector(".weather").classList.remove("loading");

    // 3. Fetch New Background from Unsplash
    fetch(`https://api.unsplash.com/search/photos?query=${name}&orientation=landscape&client_id=${unsplashKey}`)
        .then(res => {
            if (!res.ok) throw new Error("Unsplash limit reached or error");
            return res.json();
        })
        .then(imageData => {
            if (imageData.results.length > 0) {
                const imageUrl = imageData.results[0].urls.regular;
                
                // 4. Smooth Fade-In Logic (Pre-loading)
                const tempImg = new Image();
                tempImg.src = imageUrl;
                tempImg.onload = () => {
                    // Only updates once the image is fully downloaded to memory
                    document.body.style.backgroundImage = `url('${imageUrl}')`;
                };
            }
        })
        .catch(err => console.error("Unsplash Error:", err));
    },

    search: function () {
        this.fetchWeather(document.querySelector(".search-bar").value);
    },
};

/* --- Event Listeners --- */

document.querySelector(".temp").addEventListener("click", function () {
    if (units === "metric") {
        units = "imperial";
        degreesLabel = DegreeUnits.Fahrenheit;
        speedLabel = SpeedUnits.MPH;
    } else {
        units = "metric";
        degreesLabel = DegreeUnits.Celsius;
        speedLabel = SpeedUnits.KPH;
    }
    weather.fetchWeather(userCity);
});

document.querySelector(".search button").addEventListener("click", () => weather.search());

document.querySelector(".search-bar").addEventListener("keyup", (event) => {
    if (event.key == "Enter") weather.search();
});

/* --- Helpers --- */

function getCardinalDirection(angle) {
    const directions = ['N', 'NE', 'E', 'SE', 'S', 'SW', 'W', 'NW'];
    return directions[Math.round(angle / 45) % 8];
}

function fetchUserCity() {
    let geoApiKey = "841afa96ceb940da8f6157a7f16cc527";
    fetch(`https://api.geoapify.com/v1/ipinfo?apiKey=${geoApiKey}`)
        .then((response) => response.json())
        .then((data) => {
            if (data.city && data.city.name) {
                userCity = data.city.name;
            }
            weather.fetchWeather(userCity);
        })
        .catch(() => weather.fetchWeather(userCity)); // Fallback to Denver if IP fetch fails
}

window.onload = fetchUserCity;