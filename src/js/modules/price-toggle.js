/**
 * Price Toggle Module
 * Handles toggling between yearly and monthly pricing displays
 */

// ARIA attributes for accessibility
const ARIA_ATTRS = {
	CHECKED: 'aria-checked',
	HIDDEN: 'aria-hidden'
};

// Keyboard keys
const KEYS = {
	ENTER: 'Enter',
	SPACE: ' '
};

/**
 * Initialize Price Toggle
 * Handles switching between yearly and monthly pricing options
 */
export function initPriceToggle() {
	const toggle = document.querySelector('.membership-toggle');

	if (!toggle) {
		console.log('Price toggle element not found');
		return;
	}

	const toggleButtons = document.querySelectorAll('.toggle button');
	const yearlyElements = document.querySelectorAll('[data-yearly]');
	const monthlyElements = document.querySelectorAll('[data-monthly]');

	if (toggleButtons.length === 0) {
		console.log('No toggle buttons found');
		return;
	}

	toggleButtons.forEach(button => {
		// Add ARIA attributes
		button.setAttribute('role', 'switch');
		button.setAttribute(ARIA_ATTRS.CHECKED, 'false');

		button.addEventListener('click', () => {
			const priceType = button.getAttribute('data-price');
			if (!['yearly', 'monthly'].includes(priceType)) return;

			// Update ARIA states
			toggleButtons.forEach(btn => {
				btn.classList.remove('active');
				btn.setAttribute(ARIA_ATTRS.CHECKED, 'false');
			});
			button.classList.add('active');
			button.setAttribute(ARIA_ATTRS.CHECKED, 'true');

			toggle.setAttribute('data-active-price', priceType);

			const isYearly = priceType === 'yearly';
			yearlyElements.forEach(el => {
				el.style.display = isYearly ? 'block' : 'none';
				el.setAttribute(ARIA_ATTRS.HIDDEN, (!isYearly).toString());
			});
			monthlyElements.forEach(el => {
				el.style.display = isYearly ? 'none' : 'block';
				el.setAttribute(ARIA_ATTRS.HIDDEN, isYearly.toString());
			});
		});

		// Add keyboard support
		button.addEventListener('keydown', (e) => {
			if (e.key === KEYS.ENTER || e.key === KEYS.SPACE) {
				e.preventDefault();
				button.click();
			}
		});
	});

	console.log('✅ Price toggle initialized');
}