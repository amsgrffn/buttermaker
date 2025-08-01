/**
 * Subscribe Buttons Module
 * Handles subscription button interactions and Ghost portal integration
 */

export class SubscribeButtons {
	constructor() {
		this.buttons = document.querySelectorAll('.subscribe-btn-small, .subscribe-btn, .cta-btn[data-portal]');
		this.emailInputs = document.querySelectorAll('.cta-email-input, .email-input');
		this.subscriptionStates = new Map();

		this.init();
	}

	/**
	 * Initialize subscribe buttons
	 */
	init() {
		if (this.buttons.length === 0) {
			console.warn('No subscribe buttons found');
			return;
		}

		this.bindEvents();
		this.loadSubscriptionStates();

		console.log('📧 Subscribe Buttons initialized');
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		this.buttons.forEach(button => {
			button.addEventListener('click', (e) => this.handleButtonClick(e));
		});

		this.emailInputs.forEach(input => {
			input.addEventListener('keypress', (e) => this.handleEmailKeypress(e));
			input.addEventListener('input', (e) => this.handleEmailInput(e));
		});

		// Listen for Ghost portal events
		window.addEventListener('portal-ready', () => this.handlePortalReady());
		window.addEventListener('portal-signup', (e) => this.handlePortalSignup(e));
		window.addEventListener('portal-signin', (e) => this.handlePortalSignin(e));
	}

	/**
	 * Handle button click
	 */
	handleButtonClick(event) {
		const button = event.target;
		const portalAction = button.getAttribute('data-portal');

		// If it's a Ghost portal button, let the portal handle it
		if (portalAction) {
			this.handlePortalButton(button, portalAction);
			return;
		}

		// Otherwise handle as demo functionality
		event.preventDefault();
		event.stopPropagation();

		this.toggleSubscriptionState(button);
	}

	/**
	 * Handle Ghost portal button
	 */
	handlePortalButton(button, action) {
		// Track analytics
		this.trackSubscriptionEvent('Portal Button Clicked', action);

		// The actual portal opening is handled by the portal integration module
		// This just provides visual feedback
		this.showButtonLoading(button);

		setTimeout(() => {
			this.hideButtonLoading(button);
		}, 2000);
	}

	/**
	 * Toggle subscription state for demo buttons
	 */
	toggleSubscriptionState(button) {
		const buttonId = this.getButtonId(button);
		const isSubscribed = this.subscriptionStates.get(buttonId) || false;

		if (isSubscribed) {
			this.setUnsubscribed(button, buttonId);
		} else {
			this.setSubscribed(button, buttonId);
		}

		this.saveSubscriptionStates();
	}

	/**
	 * Set button to subscribed state
	 */
	setSubscribed(button, buttonId) {
		button.textContent = 'Subscribed';
		button.style.background = 'var(--color-success)';
		button.style.borderColor = 'var(--color-success)';
		button.classList.add('subscribed');

		this.subscriptionStates.set(buttonId, true);

		// Add success animation
		this.animateSuccess(button);

		// Track analytics
		this.trackSubscriptionEvent('Demo Subscribe', 'Success');
	}

	/**
	 * Set button to unsubscribed state
	 */
	setUnsubscribed(button, buttonId) {
		const originalText = button.getAttribute('data-original-text') || 'Subscribe';

		button.textContent = originalText;
		button.style.background = 'var(--color-primary)';
		button.style.borderColor = 'var(--color-primary)';
		button.classList.remove('subscribed');

		this.subscriptionStates.set(buttonId, false);

		// Track analytics
		this.trackSubscriptionEvent('Demo Unsubscribe', 'Success');
	}

	/**
	 * Show button loading state
	 */
	showButtonLoading(button) {
		const originalText = button.textContent;
		button.setAttribute('data-original-text', originalText);
		button.textContent = 'Loading...';
		button.disabled = true;
		button.classList.add('loading');
	}

	/**
	 * Hide button loading state
	 */
	hideButtonLoading(button) {
		const originalText = button.getAttribute('data-original-text');
		if (originalText) {
			button.textContent = originalText;
		}
		button.disabled = false;
		button.classList.remove('loading');
	}

	/**
	 * Animate success state
	 */
	animateSuccess(button) {
		button.style.transform = 'scale(1.05)';
		button.style.transition = 'transform 0.2s ease';

		setTimeout(() => {
			button.style.transform = 'scale(1)';
		}, 200);

		// Add a subtle bounce effect
		setTimeout(() => {
			button.style.animation = 'pulse 0.6s ease-in-out';
		}, 300);
	}

	/**
	 * Handle email input keypress
	 */
	handleEmailKeypress(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			this.handleEmailSubmit(event.target);
		}
	}

	/**
	 * Handle email input changes
	 */
	handleEmailInput(event) {
		const input = event.target;
		const email = input.value.trim();

		// Validate email format
		this.validateEmail(input, email);
	}

	/**
	 * Handle email submission
	 */
	handleEmailSubmit(input) {
		const email = input.value.trim();

		if (!this.isValidEmail(email)) {
			this.showEmailError(input, 'Please enter a valid email address');
			return;
		}

		// Find associated submit button
		const form = input.closest('form') || input.closest('.cta-form') || input.closest('.email-form');
		const submitButton = form ? form.querySelector('button[type="submit"], .cta-submit-btn, .subscribe-btn-large') : null;

		if (submitButton) {
			// Trigger Ghost portal if it's a portal form
			if (submitButton.hasAttribute('data-portal')) {
				this.handlePortalEmailSubmit(email, submitButton);
			} else {
				this.handleDemoEmailSubmit(email, input, submitButton);
			}
		}
	}

	/**
	 * Handle Ghost portal email submission
	 */
	handlePortalEmailSubmit(email, button) {
		this.showButtonLoading(button);

		// The portal integration module will handle the actual submission
		window.dispatchEvent(new CustomEvent('email-submit', {
			detail: { email, button }
		}));

		this.trackSubscriptionEvent('Email Submit', 'Portal');
	}

	/**
	 * Handle demo email submission
	 */
	handleDemoEmailSubmit(email, input, button) {
		this.showButtonLoading(button);

		// Simulate submission delay
		setTimeout(() => {
			this.hideButtonLoading(button);
			this.showEmailSuccess(input);
			this.trackSubscriptionEvent('Email Submit', 'Demo');
		}, 1500);
	}

	/**
	 * Validate email format
	 */
	validateEmail(input, email) {
		const isValid = this.isValidEmail(email);

		if (email.length > 0) {
			if (isValid) {
				this.showEmailValid(input);
			} else {
				this.showEmailInvalid(input);
			}
		} else {
			this.clearEmailValidation(input);
		}

		return isValid;
	}

	/**
	 * Check if email is valid
	 */
	isValidEmail(email) {
		const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
		return emailRegex.test(email);
	}

	/**
	 * Show email validation states
	 */
	showEmailValid(input) {
		input.style.borderColor = 'var(--color-success)';
		input.classList.remove('invalid');
		input.classList.add('valid');
		this.clearEmailError(input);
	}

	showEmailInvalid(input) {
		input.style.borderColor = 'var(--color-error)';
		input.classList.remove('valid');
		input.classList.add('invalid');
	}

	clearEmailValidation(input) {
		input.style.borderColor = '';
		input.classList.remove('valid', 'invalid');
		this.clearEmailError(input);
	}

	showEmailError(input, message) {
		this.clearEmailError(input);

		const errorElement = document.createElement('div');
		errorElement.className = 'email-error';
		errorElement.textContent = message;
		errorElement.style.color = 'var(--color-error)';
		errorElement.style.fontSize = 'var(--font-size-sm)';
		errorElement.style.marginTop = 'var(--space-xs)';

		input.parentNode.insertBefore(errorElement, input.nextSibling);
		input.setAttribute('aria-describedby', 'email-error');
	}

	clearEmailError(input) {
		const errorElement = input.parentNode.querySelector('.email-error');
		if (errorElement) {
			errorElement.remove();
		}
		input.removeAttribute('aria-describedby');
	}

	showEmailSuccess(input) {
		input.value = '';
		input.placeholder = 'Success! Check your email.';
		input.style.borderColor = 'var(--color-success)';

		setTimeout(() => {
			input.placeholder = 'Enter your email';
			input.style.borderColor = '';
		}, 3000);
	}

	/**
	 * Handle Ghost portal events
	 */
	handlePortalReady() {
		console.log('📧 Ghost Portal ready');
	}

	handlePortalSignup(event) {
		console.log('📧 Portal signup:', event.detail);
		this.trackSubscriptionEvent('Portal Signup', 'Success');
	}

	handlePortalSignin(event) {
		console.log('📧 Portal signin:', event.detail);
		this.trackSubscriptionEvent('Portal Signin', 'Success');
	}

	/**
	 * Get unique button identifier
	 */
	getButtonId(button) {
		return button.id || `btn-${Array.from(this.buttons).indexOf(button)}`;
	}

	/**
	 * Load subscription states from sessionStorage
	 */
	loadSubscriptionStates() {
		try {
			const stored = sessionStorage.getItem('subscriptionStates');
			if (stored) {
				const states = JSON.parse(stored);
				this.subscriptionStates = new Map(Object.entries(states));

				// Apply stored states to buttons
				this.applyStoredStates();
			}
		} catch (error) {
			console.warn('Could not load subscription states:', error);
		}
	}

	/**
	 * Save subscription states to sessionStorage
	 */
	saveSubscriptionStates() {
		try {
			const states = Object.fromEntries(this.subscriptionStates);
			sessionStorage.setItem('subscriptionStates', JSON.stringify(states));
		} catch (error) {
			console.warn('Could not save subscription states:', error);
		}
	}

	/**
	 * Apply stored states to buttons
	 */
	applyStoredStates() {
		this.buttons.forEach(button => {
			const buttonId = this.getButtonId(button);
			const isSubscribed = this.subscriptionStates.get(buttonId);

			if (isSubscribed && !button.hasAttribute('data-portal')) {
				this.setSubscribed(button, buttonId);
			}
		});
	}

	/**
	 * Track analytics events
	 */
	trackSubscriptionEvent(action, label) {
		if (typeof window.trackEvent === 'function') {
			window.trackEvent('Subscription', action, label);
		}
	}

	/**
	 * Destroy the subscribe buttons
	 */
	destroy() {
		this.buttons.forEach(button => {
			button.removeEventListener('click', this.handleButtonClick);
		});

		this.emailInputs.forEach(input => {
			input.removeEventListener('keypress', this.handleEmailKeypress);
			input.removeEventListener('input', this.handleEmailInput);
		});

		console.log('📧 Subscribe Buttons destroyed');
	}
}