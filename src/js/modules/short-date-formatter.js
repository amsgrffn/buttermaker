/**
 * Short Date Formatter Module
 * Converts Ghost's "5 hours ago" format to "5h" format
 */

export function initShortDateFormatter() {
	console.log('📅 Initializing Short Date Formatter...');

	// Find all elements that might contain timeago dates
	const dateSelectors = [
		'time[datetime]',           // Standard time elements
		'.post-meta time',          // Post metadata dates
		'.related-meta time',       // Related posts dates
		'[data-timeago]',          // Custom timeago elements
		'.timeago'                 // Generic timeago class
	];

	// Combine all selectors
	const allDateElements = document.querySelectorAll(dateSelectors.join(', '));

	if (allDateElements.length === 0) {
		console.log('📅 No date elements found');
		return;
	}

	allDateElements.forEach(element => {
		shortenTimeagoText(element);
	});

	console.log(`📅 Processed ${allDateElements.length} date elements`);
}

/**
 * Convert long timeago format to short format
 */
function shortenTimeagoText(element) {
	const originalText = element.textContent.trim();
	const shortenedText = convertToShortFormat(originalText);

	if (shortenedText !== originalText) {
		element.textContent = shortenedText;
		// Create formatted date tooltip from datetime attribute
		const tooltip = createDateTooltip(element);
		if (tooltip) {
			element.title = tooltip;
		} else {
			// Fallback to original text if no datetime available
			element.title = originalText;
		}
	}
}

/**
 * Create formatted date tooltip from datetime attribute
 */
function createDateTooltip(element) {
	// Get the datetime attribute (Ghost provides this)
	const datetimeAttr = element.getAttribute('datetime');
	if (!datetimeAttr) {
		return null;
	}

	const date = new Date(datetimeAttr);
	const now = new Date();

	// Check if date is valid
	if (isNaN(date.getTime())) {
		return null;
	}

	const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
	const diffInDays = diffInHours / 24;

	// Format options
	const timeOptions = {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	};

	const dateOptions = {
		month: 'long',
		day: 'numeric'
	};

	const fullDateOptions = {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	};

	// Determine format based on age
	if (diffInHours < 24) {
		// Less than 24 hours: "August 9, 2025, 6:27 AM"
		return date.toLocaleDateString('en-US', {
			...fullDateOptions,
			...timeOptions
		});
	} else if (diffInDays < 365) {
		// Less than a year: "March 15, 6:27 AM" or just "March 15" for older posts
		if (diffInDays < 7) {
			// Less than a week, show time too
			return date.toLocaleDateString('en-US', {
				...dateOptions,
				...timeOptions
			});
		} else {
			// More than a week but less than a year, just date
			return date.toLocaleDateString('en-US', dateOptions);
		}
	} else {
		// More than a year: "March 15, 2022"
		return date.toLocaleDateString('en-US', fullDateOptions);
	}
}

/**
 * Convert text like "5 hours ago" to "5h"
 */
function convertToShortFormat(text) {
	// Define conversion patterns
	const patterns = [
		// Seconds
		{ regex: /(\d+)\s+seconds?\s+ago/i, suffix: 's' },
		{ regex: /a\s+few\s+seconds?\s+ago/i, replacement: '1s' },

		// Minutes
		{ regex: /(\d+)\s+minutes?\s+ago/i, suffix: 'm' },
		{ regex: /a\s+minute\s+ago/i, replacement: '1m' },

		// Hours
		{ regex: /(\d+)\s+hours?\s+ago/i, suffix: 'h' },
		{ regex: /an?\s+hour\s+ago/i, replacement: '1h' },

		// Days
		{ regex: /(\d+)\s+days?\s+ago/i, suffix: 'd' },
		{ regex: /a\s+day\s+ago/i, replacement: '1d' },
		{ regex: /yesterday/i, replacement: '1d' },

		// Weeks
		{ regex: /(\d+)\s+weeks?\s+ago/i, suffix: 'w' },
		{ regex: /a\s+week\s+ago/i, replacement: '1w' },

		// Months
		{ regex: /(\d+)\s+months?\s+ago/i, suffix: 'mo' },
		{ regex: /a\s+month\s+ago/i, replacement: '1mo' },

		// Years
		{ regex: /(\d+)\s+years?\s+ago/i, suffix: 'y' },
		{ regex: /a\s+year\s+ago/i, replacement: '1y' }
	];

	// Try each pattern
	for (const pattern of patterns) {
		if (pattern.replacement) {
			// Direct replacement (like "a minute ago" -> "1m")
			if (pattern.regex.test(text)) {
				return pattern.replacement;
			}
		} else {
			// Extract number and add suffix
			const match = text.match(pattern.regex);
			if (match) {
				return match[1] + pattern.suffix;
			}
		}
	}

	// If no pattern matches, return original text
	return text;
}

/**
 * Format dates that are rendered client-side (for dynamic content)
 * Returns object with short text and tooltip
 */
export function formatShortTimeago(dateString) {
	const date = new Date(dateString);
	const now = new Date();
	const diffInSeconds = Math.floor((now - date) / 1000);

	// Calculate time differences
	const minute = 60;
	const hour = minute * 60;
	const day = hour * 24;
	const week = day * 7;
	const month = day * 30;
	const year = day * 365;

	let shortText;
	if (diffInSeconds < minute) {
		shortText = `${diffInSeconds}s`;
	} else if (diffInSeconds < hour) {
		shortText = `${Math.floor(diffInSeconds / minute)}m`;
	} else if (diffInSeconds < day) {
		shortText = `${Math.floor(diffInSeconds / hour)}h`;
	} else if (diffInSeconds < week) {
		shortText = `${Math.floor(diffInSeconds / day)}d`;
	} else if (diffInSeconds < month) {
		shortText = `${Math.floor(diffInSeconds / week)}w`;
	} else if (diffInSeconds < year) {
		shortText = `${Math.floor(diffInSeconds / month)}mo`;
	} else {
		shortText = `${Math.floor(diffInSeconds / year)}y`;
	}

	// Create tooltip using same logic as createDateTooltip
	const tooltip = createTooltipFromDate(date);

	return {
		text: shortText,
		tooltip: tooltip
	};
}

/**
 * Create tooltip from date object (helper for dynamic content)
 */
function createTooltipFromDate(date) {
	const now = new Date();
	const diffInHours = Math.abs(now - date) / (1000 * 60 * 60);
	const diffInDays = diffInHours / 24;

	const timeOptions = {
		hour: 'numeric',
		minute: '2-digit',
		hour12: true
	};

	const dateOptions = {
		month: 'long',
		day: 'numeric'
	};

	const fullDateOptions = {
		month: 'long',
		day: 'numeric',
		year: 'numeric'
	};

	if (diffInHours < 24) {
		return date.toLocaleDateString('en-US', {
			...fullDateOptions,
			...timeOptions
		});
	} else if (diffInDays < 365) {
		if (diffInDays < 7) {
			return date.toLocaleDateString('en-US', {
				...dateOptions,
				...timeOptions
			});
		} else {
			return date.toLocaleDateString('en-US', dateOptions);
		}
	} else {
		return date.toLocaleDateString('en-US', fullDateOptions);
	}
}

/**
 * Observe for dynamically added content and format dates
 */
export function observeNewDates() {
	// Create observer for dynamically loaded content
	const observer = new MutationObserver((mutations) => {
		mutations.forEach((mutation) => {
			mutation.addedNodes.forEach((node) => {
				if (node.nodeType === Node.ELEMENT_NODE) {
					// Find date elements in newly added content
					const dateElements = node.querySelectorAll('time[datetime], .timeago, [data-timeago]');
					dateElements.forEach(element => {
						shortenTimeagoText(element);
					});

					// Also check if the node itself is a date element
					if (node.matches && node.matches('time[datetime], .timeago, [data-timeago]')) {
						shortenTimeagoText(node);
					}
				}
			});
		});
	});

	// Start observing
	observer.observe(document.body, {
		childList: true,
		subtree: true
	});

	console.log('📅 Date observer started for dynamic content');
}