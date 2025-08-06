/**
 * Weather Display Module
 * Fetches and displays weather data with icons and day/night support
 */

const WEATHER_ICONS = {
	sunny: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-sun weather-icon inline-icon">
			<circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41-1.41"/><path d="m19.07 4.93-1.41 1.41"/>
		</svg>`,
	clear: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-moon weather-icon inline-icon">
			<path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/>
		</svg>`,
	cloudy: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud weather-icon inline-icon">
			<path d="M17.5 19H9a7 7 0 1 1 6.71-9h1.79a4.5 4.5 0 1 1 0 9Z"/>
		</svg>`,
	'partly cloudy': `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-sun weather-icon inline-icon">
			<path d="M12 2v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="M20 12h2"/><path d="m19.07 4.93-1.41 1.41"/><path d="M15.947 12.65a4 4 0 0 0-5.925-4.128"/><path d="M3 20a5 5 0 1 1 8.9-4H13a3 3 0 0 1 2 5.24z"/>
		</svg>`,
	rainy: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-rain weather-icon inline-icon">
			<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m16 14-3 5"/><path d="m8 14-3 5"/><path d="m12 16-3 5"/>
		</svg>`,
	drizzly: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-drizzle weather-icon inline-icon">
			<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 19 2-3"/><path d="m8 14 2-3"/><path d="m16 19 2-3"/><path d="m16 14 2-3"/><path d="m12 21 2-3"/><path d="m12 16 2-3"/>
		</svg>`,
	snowy: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-snow weather-icon inline-icon">
			<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="m8 21 .5-1.5"/><path d="M7.5 16.5 9 15"/><path d="m17 21-.5-1.5"/><path d="M16.5 16.5 15 15"/><path d="m10 19 1-1"/><path d="m13 22 1-1"/>
		</svg>`,
	stormy: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-lightning weather-icon inline-icon">
			<path d="M6 16.326A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 .5 8.973"/><path d="m13 12-3 5h4l-3 5"/>
		</svg>`,
	icy: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-cloud-hail weather-icon inline-icon">
			<path d="M4 14.899A7 7 0 1 1 15.71 8h1.79a4.5 4.5 0 0 1 2.5 8.242"/><path d="M16 14v2"/><path d="M8 14v2"/><path d="M16 20h.01"/><path d="M8 20h.01"/><path d="M12 16v2"/><path d="M12 22h.01"/>
		</svg>`,
	foggy: `
		<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-waves weather-icon inline-icon">
			<path d="M2 6c.6.5 1.2 1 2.5 1C7 7 7 5 9.5 5c2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 12c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/><path d="M2 18c.6.5 1.2 1 2.5 1 2.5 0 2.5-2 5-2 2.6 0 2.4 2 5 2 2.5 0 2.5-2 5-2 1.3 0 1.9.5 2.5 1"/>
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

	// Map WMO weather codes to conditions with day/night support
	// https://open-meteo.com/en/docs#weathervariables
	const weatherMap = {
		'sunny': { day: [0, 1], night: [] },
		'clear': { day: [], night: [0, 1] },
		'partly cloudy': { day: [2], night: [2] },
		'cloudy': { day: [3], night: [3] },
		'foggy': { day: [45, 48], night: [45, 48] },
		'drizzly': { day: [51, 53, 55], night: [51, 53, 55] },
		'icy': { day: [56, 57, 66, 67], night: [56, 57, 66, 67] },
		'rainy': { day: [61, 63, 65, 80, 81, 82], night: [61, 63, 65, 80, 81, 82] },
		'snowy': { day: [71, 73, 75, 77, 85, 86], night: [71, 73, 75, 77, 85, 86] },
		'stormy': { day: [95, 96, 99], night: [95, 96, 99] }
	};

	// Keep condition lowercase for news-style formatting
	function capitalizeCondition(condition) {
		return condition; // Returns "sunny", "partly cloudy", etc.
	}

	function getOneWordWeather(code, isDay) {
		const timeOfDay = isDay ? 'day' : 'night';

		for (const [condition, times] of Object.entries(weatherMap)) {
			if (times[timeOfDay] && times[timeOfDay].includes(code)) {
				return condition;
			}
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
			url.searchParams.set('current', 'temperature_2m,weather_code,is_day');
			url.searchParams.set('temperature_unit', 'fahrenheit');
			url.searchParams.set('_cb', Math.random());

			const response = await fetch(url);
			if (!response.ok) throw new Error('Weather API request failed');

			const data = await response.json();

			// Use ISO string for timestamp
			const result = {
				temp: Math.round(data.current.temperature_2m),
				condition: getOneWordWeather(data.current.weather_code, data.current.is_day),
				lastUpdated: new Date().toISOString()
			};

			console.log('Weather update:', {
				temp: result.temp,
				condition: result.condition,
				isDay: data.current.is_day,
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

					tempElement.textContent = `${weather.temp}°F and`;
					// Keep condition lowercase for news-style formatting
					const formattedCondition = capitalizeCondition(weather.condition);
					conditionElement.textContent = ` ${formattedCondition}`;
					updateWeatherIcon(weather.condition);

					tempElement.setAttribute('aria-label',
						`Current temperature is ${weather.temp} degrees Fahrenheit and ${formattedCondition}`
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