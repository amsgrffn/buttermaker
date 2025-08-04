/**
 * Weather Display Module
 * Fetches and displays weather data with icons
 */

const WEATHER_ICONS = {
	sunny: `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="weather-icon inline-icon" fill="none" stroke="currentColor">
			<path d="M12 17a5 5 0 100-10 5 5 0 000 10zM12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"
				  stroke-width="2" stroke-linecap="round"/>
		</svg>`,
	cloudy: `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="weather-icon inline-icon" fill="none" stroke="currentColor">
			<path d="M18 10h-1.26A8 8 0 109 20h9a5 5 0 000-10z"
				  stroke-width="2" stroke-linecap="round"/>
		</svg>`,
	'partly cloudy': `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="weather-icon inline-icon" fill="none" stroke="currentColor">
			<path d="M12 4a4 4 0 100 8 4 4 0 000-8zM18 10h-1.26A4 4 0 109 20h9a5 5 0 000-10z"
				  stroke-width="2" stroke-linecap="round"/>
		</svg>`,
	rainy: `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="weather-icon inline-icon" fill="none" stroke="currentColor">
			<path d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25M8 13v8M16 13v8M12 15v8"
				  stroke-width="2" stroke-linecap="round"/>
		</svg>`,
	drizzle: `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="weather-icon inline-icon" fill="none" stroke="currentColor">
			<path d="M20 16.58A5 5 0 0018 7h-1.26A8 8 0 104 15.25M8 13v8M16 13v8M12 15v8"
				  stroke-width="2" stroke-linecap="round"/>
		</svg>`,
	snow: `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="weather-icon inline-icon" fill="none" stroke="currentColor">
			<path d="M20 17.58A5 5 0 0018 8h-1.26A8 8 0 104 16.25M8 16h.01M8 20h.01M12 18h.01M12 22h.01M16 16h.01M16 20h.01"
				  stroke-width="2" stroke-linecap="round"/>
		</svg>`,
	foggy: `
		<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" class="weather-icon inline-icon" fill="none" stroke="currentColor">
			<path d="M3 8h18M3 12h18M3 16h18"
				  stroke-width="2" stroke-linecap="round"/>
		</svg>`
};

/**
 * Initialize Weather Display
 * Fetches weather data and displays it with appropriate icons
 */
export function initWeatherDisplay() {
	const tempElement = document.getElementById('current-temp');
	const conditionElement = document.getElementById('current-condition');

	if (!tempElement || !conditionElement) {
		console.log('Weather elements not found');
		return;
	}

	// Map WMO weather codes to simple words
	// https://open-meteo.com/en/docs#weathervariables
	const weatherMap = {
		'sunny': [0, 1],
		'partly cloudy': [2],
		'cloudy': [3],
		'foggy': [45, 48],
		'drizzle': [51, 53, 55],
		'rain': [61, 63, 65, 80, 81, 82],
		'snow': [71, 73, 75, 77, 85, 86],
		'thunderstorm': [95, 96, 99]
	};

	// Capitalize each word in the weather condition
	function capitalizeCondition(condition) {
		return condition
			.split(' ')
			.map(word => word.charAt(0).toUpperCase() + word.slice(1))
			.join(' ');
	}

	function getOneWordWeather(code) {
		for (const [word, codes] of Object.entries(weatherMap)) {
			if (codes.includes(code)) return word;
		}
		return 'cloudy'; // Default fallback
	}

	function updateWeatherIcon(condition) {
		const iconTemplate = WEATHER_ICONS[condition] || WEATHER_ICONS.cloudy;
		const existingIcon = document.querySelector('.weather-icon-container');

		if (existingIcon) {
			existingIcon.remove();
		}

		const iconContainer = document.createElement('span');
		iconContainer.className = 'weather-icon-container';
		iconContainer.innerHTML = iconTemplate;

		// Insert the icon right after the condition text
		conditionElement.parentNode.insertBefore(iconContainer, conditionElement.nextSibling);
	}

	async function getWeatherData() {
		try {
			// Clear existing cache first
			localStorage.removeItem('weather_cache');

			const lat = 43.66147;
			const lon = -70.25533;
			const url = new URL('https://api.open-meteo.com/v1/forecast');
			url.searchParams.set('latitude', lat);
			url.searchParams.set('longitude', lon);
			url.searchParams.set('current', 'temperature_2m,weather_code');
			url.searchParams.set('temperature_unit', 'fahrenheit');
			url.searchParams.set('_cb', Math.random());

			const response = await fetch(url);
			if (!response.ok) throw new Error('Weather API request failed');

			const data = await response.json();

			// Use ISO string for timestamp
			const result = {
				temp: Math.round(data.current.temperature_2m),
				condition: getOneWordWeather(data.current.weather_code),
				lastUpdated: new Date().toISOString()
			};

			console.log('Weather update:', {
				temp: result.temp,
				condition: result.condition,
				lastUpdated: result.lastUpdated,
				localTime: new Date().toLocaleString('en-US', { timeZone: 'America/New_York' })
			});

			localStorage.setItem('weather_cache', JSON.stringify(result));

			return {
				temp: result.temp,
				condition: result.condition
			};

		} catch (error) {
			console.error('Error fetching weather:', error);
			return { temp: '--', condition: 'cloudy' };
		}
	}

	async function updateDisplay() {
		try {
			// Clear any existing interval when we start a new update
			if (window.weatherUpdateInterval) {
				clearInterval(window.weatherUpdateInterval);
			}

			const updateWeatherDisplay = async () => {
				try {
					const weather = await getWeatherData();

					if (!tempElement || !conditionElement) {
						console.error('Weather elements not found');
						return;
					}

					tempElement.textContent = `${weather.temp}°F`;
					// Capitalize the condition properly
					const capitalizedCondition = capitalizeCondition(weather.condition);
					conditionElement.textContent = ` ${capitalizedCondition}`;
					updateWeatherIcon(weather.condition);

					tempElement.setAttribute('aria-label',
						`Current temperature is ${weather.temp} degrees Fahrenheit and ${capitalizedCondition}`
					);
				} catch (error) {
					console.error('Error updating weather display:', error);
				}
			};

			// Initial update
			await updateWeatherDisplay();

			// Set up periodic updates every 3 hours
			const threeHours = 3 * 60 * 60 * 1000; // 3 hours in milliseconds
			window.weatherUpdateInterval = setInterval(updateWeatherDisplay, threeHours);

			// Clean up interval when page is hidden
			document.addEventListener('visibilitychange', () => {
				if (document.hidden && window.weatherUpdateInterval) {
					clearInterval(window.weatherUpdateInterval);
				} else if (!document.hidden && !window.weatherUpdateInterval) {
					// Check when was the last update
					const cached = localStorage.getItem('weather_cache');
					if (cached) {
						const data = JSON.parse(cached);
						const lastUpdate = new Date(data.lastUpdated);
						const threeHoursAgo = new Date(Date.now() - threeHours);

						// Only update if last update was more than 3 hours ago
						if (lastUpdate < threeHoursAgo) {
							updateWeatherDisplay();
							window.weatherUpdateInterval = setInterval(updateWeatherDisplay, threeHours);
						}
					} else {
						// No cache exists, do an update
						updateWeatherDisplay();
						window.weatherUpdateInterval = setInterval(updateWeatherDisplay, threeHours);
					}
				}
			});

		} catch (error) {
			console.error('Error in weather update system:', error);
		}
	}

	// Start the weather display system
	updateDisplay();

	console.log('✅ Weather display initialized');
}