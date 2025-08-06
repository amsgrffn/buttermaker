/**
 * Current Time Display Module
 * Simple time display that doesn't interfere with weather
 */

export function initCurrentTime() {
	const timeElement = document.getElementById('current-time');

	if (!timeElement) {
		console.log('Time element not found - add <span id="current-time"></span> to your template');
		return;
	}

	function updateTimeDisplay() {
		// Get the current time in EST
		const now = new Date();
		const timeString = now.toLocaleString('en-US', {
			timeZone: 'America/New_York',
			hour: 'numeric',
			minute: '2-digit',
			timeZoneName: 'short'
		});

		// Update just the time element
		timeElement.textContent = timeString;
	}

	// Update immediately
	updateTimeDisplay();

	// Update every minute
	setInterval(updateTimeDisplay, 60000);

	console.log('✅ Current time display initialized');
}