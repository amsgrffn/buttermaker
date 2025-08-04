/**
 * Knicks Championship Counter Module
 * Counts days since the Knicks last won a championship
 */

/**
 * Initialize Knicks Championship Counter
 * Displays the number of days since May 10, 1973
 */
export function initKnicksCounter() {
	const counterElement = document.getElementById('knicks-counter');

	if (!counterElement) {
		console.log('Knicks counter element not found');
		return;
	}

	function calculateDays() {
		const championship = new Date('1973-05-10T00:00:00-05:00'); // EST timezone
		const now = new Date();
		const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
		const diff = est - championship;
		const daysSince = Math.floor(diff / (1000 * 60 * 60 * 24));
		counterElement.textContent = `${daysSince.toLocaleString()} Days Ago`;
	}

	// Calculate initial days
	calculateDays();

	// Calculate time until next midnight EST
	function setMidnightUpdate() {
		const now = new Date();
		const est = new Date(now.toLocaleString('en-US', { timeZone: 'America/New_York' }));
		const tomorrow = new Date(est);
		tomorrow.setDate(tomorrow.getDate() + 1);
		tomorrow.setHours(0, 0, 0, 0);
		const msUntilMidnight = tomorrow - est;

		// Update at midnight
		setTimeout(() => {
			calculateDays();
			// After first midnight, update every 24 hours
			setInterval(calculateDays, 24 * 60 * 60 * 1000);
		}, msUntilMidnight);
	}

	setMidnightUpdate();

	console.log('✅ Knicks counter initialized');
}