/**
 * Portal Integration Module
 * Handles Ghost member portal integration and authentication
 */

export class PortalIntegration {
	constructor() {
		this.portalButtons = document.querySelectorAll('[data-portal]');
		this.isPortalReady = false;
		this.memberData = null;
		this.portalInstance = null;

		this.init();
	}

	/**
	 * Initialize portal integration
	 */
	init() {
		this.bindEvents();
		this.waitForPortal();
		this.checkMemberStatus();

		console.log('👤 Portal Integration initialized');
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		// Portal button clicks
		this.portalButtons.forEach(button => {
			button.addEventListener('click', (e) => this.handlePortalButtonClick(e));
		});

		// Custom email submit events
		window.addEventListener('email-submit', (e) => this.handleEmailSubmit(e));

		// Listen for member updates
		window.addEventListener('storage', (e) => this.handleStorageChange(e));

		// Portal ready event
		window.addEventListener('message', (e) => this.handlePortalMessage(e));
	}

	/**
	 * Wait for Ghost portal to be ready
	 */
	waitForPortal() {
		const checkPortal = () => {
			if (window.ghost && window.ghost.portal) {
				this.isPortalReady = true;
				this.portalInstance = window.ghost.portal;
				this.setupPortalListeners();
				window.dispatchEvent(new CustomEvent('portal-ready'));
				console.log('👤 Ghost Portal ready');
			} else {
				setTimeout(checkPortal, 100);
			}
		};

		checkPortal();
	}

	/**
	 * Setup portal event listeners
	 */
	setupPortalListeners() {
		if (!this.portalInstance) return;

		// Listen for portal events
		this.portalInstance.on('signin', (member) => {
			this.handlePortalSignin(member);
		});

		this.portalInstance.on('signup', (member) => {
			this.handlePortalSignup(member);
		});

		this.portalInstance.on('signout', () => {
			this.handlePortalSignout();
		});

		this.portalInstance.on('subscription', (subscription) => {
			this.handleSubscriptionChange(subscription);
		});
	}

	/**
	 * Handle portal button clicks
	 */
	handlePortalButtonClick(event) {
		event.preventDefault();

		const button = event.target;
		const action = button.getAttribute('data-portal');

		if (!this.isPortalReady) {
			this.showPortalNotReady();
			return;
		}

		// Show loading state
		this.showButtonLoading(button);

		// Open portal with specified action
		this.openPortal(action);

		// Track analytics
		this.trackPortalAction('Button Click', action);
	}

	/**
	 * Open portal with specific action
	 */
	openPortal(action = 'signup') {
		if (!this.isPortalReady) {
			console.warn('Portal not ready');
			return;
		}

		try {
			this.portalInstance.open(action);
		} catch (error) {
			console.error('Failed to open portal:', error);
			this.showPortalError('Unable to open subscription portal');
		}
	}

	/**
	 * Handle email submission
	 */
	handleEmailSubmit(event) {
		const { email, button } = event.detail;

		if (!this.isPortalReady) {
			this.showPortalNotReady();
			return;
		}

		// Use portal to handle email subscription
		try {
			this.portalInstance.open('signup', { email });
			this.trackPortalAction('Email Submit', email);
		} catch (error) {
			console.error('Failed to submit email:', error);
			this.showPortalError('Unable to process subscription');
		} finally {
			if (button) {
				this.hideButtonLoading(button);
			}
		}
	}

	/**
	 * Handle portal signin
	 */
	handlePortalSignin(member) {
		this.memberData = member;
		this.updateUIForSignedInMember(member);
		this.hideAllButtonLoading();

		// Dispatch custom event
		window.dispatchEvent(new CustomEvent('portal-signin', {
			detail: { member }
		}));

		this.trackPortalAction('Signin', 'Success');
		console.log('👤 Member signed in:', member);
	}

	/**
	 * Handle portal signup
	 */
	handlePortalSignup(member) {
		this.memberData = member;
		this.updateUIForSignedInMember(member);
		this.hideAllButtonLoading();
		this.showWelcomeMessage(member);

		// Dispatch custom event
		window.dispatchEvent(new CustomEvent('portal-signup', {
			detail: { member }
		}));

		this.trackPortalAction('Signup', 'Success');
		console.log('👤 Member signed up:', member);
	}

	/**
	 * Handle portal signout
	 */
	handlePortalSignout() {
		this.memberData = null;
		this.updateUIForSignedOutMember();

		// Dispatch custom event
		window.dispatchEvent(new CustomEvent('portal-signout'));

		this.trackPortalAction('Signout', 'Success');
		console.log('👤 Member signed out');
	}

	/**
	 * Handle subscription changes
	 */
	handleSubscriptionChange(subscription) {
		if (this.memberData) {
			this.memberData.subscription = subscription;
			this.updateSubscriptionUI(subscription);
		}

		this.trackPortalAction('Subscription Change', subscription.status);
		console.log('👤 Subscription updated:', subscription);
	}

	/**
	 * Update UI for signed in member
	 */
	updateUIForSignedInMember(member) {
		// Update subscribe buttons
		const subscribeButtons = document.querySelectorAll('[data-portal="signup"]');
		subscribeButtons.forEach(button => {
			button.textContent = 'Manage Subscription';
			button.setAttribute('data-portal', 'account');
		});

		// Update header buttons
		const signinButtons = document.querySelectorAll('[data-portal="signin"]');
		signinButtons.forEach(button => {
			button.textContent = 'Account';
			button.setAttribute('data-portal', 'account');
		});

		// Hide CTAs for members
		this.hideMemberCTAs();

		// Show member-specific content
		this.showMemberContent(member);
	}

	/**
	 * Update UI for signed out member
	 */
	updateUIForSignedOutMember() {
		// Restore subscribe buttons
		const accountButtons = document.querySelectorAll('[data-portal="account"]');
		accountButtons.forEach(button => {
			if (button.classList.contains('subscribe-btn-small')) {
				button.textContent = 'Subscribe';
				button.setAttribute('data-portal', 'signup');
			} else {
				button.textContent = 'Sign in';
				button.setAttribute('data-portal', 'signin');
			}
		});

		// Show CTAs
		this.showMemberCTAs();

		// Hide member-specific content
		this.hideMemberContent();
	}

	/**
	 * Update subscription UI
	 */
	updateSubscriptionUI(subscription) {
		const subscriptionElements = document.querySelectorAll('.subscription-status');

		subscriptionElements.forEach(element => {
			element.textContent = subscription.status;
			element.className = `subscription-status status-${subscription.status}`;
		});
	}

	/**
	 * Check current member status
	 */
	checkMemberStatus() {
		// Check if there's member data in localStorage or cookies
		this.memberData = this.getMemberFromStorage();

		if (this.memberData) {
			this.updateUIForSignedInMember(this.memberData);
		}
	}

	/**
	 * Get member data from storage
	 */
	getMemberFromStorage() {
		try {
			// Check for Ghost member data
			const ghostMember = localStorage.getItem('ghost-members-ssr');
			if (ghostMember) {
				return JSON.parse(ghostMember);
			}

			// Check cookies as fallback
			const memberCookie = this.getCookie('ghost-members-ssr');
			if (memberCookie) {
				return JSON.parse(decodeURIComponent(memberCookie));
			}
		} catch (error) {
			console.warn('Could not parse member data:', error);
		}

		return null;
	}

	/**
	 * Get cookie value
	 */
	getCookie(name) {
		const value = `; ${document.cookie}`;
		const parts = value.split(`; ${name}=`);
		if (parts.length === 2) {
			return parts.pop().split(';').shift();
		}
		return null;
	}

	/**
	 * Handle storage changes
	 */
	handleStorageChange(event) {
		if (event.key === 'ghost-members-ssr') {
			const newMemberData = event.newValue ? JSON.parse(event.newValue) : null;

			if (newMemberData && !this.memberData) {
				// Member signed in
				this.handlePortalSignin(newMemberData);
			} else if (!newMemberData && this.memberData) {
				// Member signed out
				this.handlePortalSignout();
			}
		}
	}

	/**
	 * Handle portal messages
	 */
	handlePortalMessage(event) {
		if (event.origin !== window.location.origin) return;

		const { type, data } = event.data;

		switch (type) {
			case 'portal-ready':
				this.isPortalReady = true;
				break;
			case 'portal-close':
				this.hideAllButtonLoading();
				break;
			case 'portal-error':
				this.showPortalError(data.message);
				break;
		}
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
			button.removeAttribute('data-original-text');
		}
		button.disabled = false;
		button.classList.remove('loading');
	}

	/**
	 * Hide loading state for all buttons
	 */
	hideAllButtonLoading() {
		this.portalButtons.forEach(button => {
			if (button.classList.contains('loading')) {
				this.hideButtonLoading(button);
			}
		});
	}

	/**
	 * Show portal not ready message
	 */
	showPortalNotReady() {
		this.showNotification('Subscription portal is loading...', 'info');
	}

	/**
	 * Show portal error
	 */
	showPortalError(message) {
		this.showNotification(message || 'An error occurred', 'error');
		this.hideAllButtonLoading();
	}

	/**
	 * Show welcome message
	 */
	showWelcomeMessage(member) {
		const name = member.name || member.email.split('@')[0];
		this.showNotification(`Welcome, ${name}! 🎉`, 'success');
	}

	/**
	 * Show notification
	 */
	showNotification(message, type = 'info') {
		const notification = document.createElement('div');
		notification.className = `portal-notification notification-${type}`;
		notification.textContent = message;

		notification.style.cssText = `
			position: fixed;
			top: 20px;
			right: 20px;
			background: ${type === 'error' ? 'var(--color-error)' : type === 'success' ? 'var(--color-success)' : 'var(--color-primary)'};
			color: white;
			padding: var(--space-lg);
			border-radius: var(--radius-base);
			font-size: var(--font-size-base);
			font-weight: var(--font-weight-medium);
			z-index: 9999;
			max-width: 300px;
			box-shadow: var(--shadow-md);
			transform: translateX(100%);
			transition: transform 0.3s ease;
		`;

		document.body.appendChild(notification);

		// Animate in
		requestAnimationFrame(() => {
			notification.style.transform = 'translateX(0)';
		});

		// Auto-remove
		setTimeout(() => {
			notification.style.transform = 'translateX(100%)';
			setTimeout(() => {
				if (notification.parentNode) {
					document.body.removeChild(notification);
				}
			}, 300);
		}, 5000);
	}

	/**
	 * Hide member CTAs
	 */
	hideMemberCTAs() {
		const ctas = document.querySelectorAll('.cta-banner, .member-cta');
		ctas.forEach(cta => {
			cta.style.display = 'none';
		});
	}

	/**
	 * Show member CTAs
	 */
	showMemberCTAs() {
		const ctas = document.querySelectorAll('.cta-banner, .member-cta');
		ctas.forEach(cta => {
			cta.style.display = '';
		});
	}

	/**
	 * Show member content
	 */
	showMemberContent(member) {
		const memberContent = document.querySelectorAll('.member-only');
		memberContent.forEach(content => {
			content.style.display = '';
		});

		// Update member info displays
		const memberNames = document.querySelectorAll('.member-name');
		memberNames.forEach(nameEl => {
			nameEl.textContent = member.name || member.email.split('@')[0];
		});
	}

	/**
	 * Hide member content
	 */
	hideMemberContent() {
		const memberContent = document.querySelectorAll('.member-only');
		memberContent.forEach(content => {
			content.style.display = 'none';
		});
	}

	/**
	 * Track portal analytics
	 */
	trackPortalAction(action, label, value) {
		if (typeof window.trackEvent === 'function') {
			window.trackEvent('Portal', action, label, value);
		}
	}

	/**
	 * Get member status
	 */
	getMemberStatus() {
		return {
			isSignedIn: !!this.memberData,
			member: this.memberData,
			isPortalReady: this.isPortalReady,
			hasSubscription: this.memberData?.subscription?.status === 'active'
		};
	}

	/**
	 * Force portal refresh
	 */
	refreshPortal() {
		if (this.isPortalReady && this.portalInstance) {
			try {
				this.portalInstance.refresh();
			} catch (error) {
				console.warn('Could not refresh portal:', error);
			}
		}
	}

	/**
	 * Destroy portal integration
	 */
	destroy() {
		// Remove event listeners
		this.portalButtons.forEach(button => {
			button.removeEventListener('click', this.handlePortalButtonClick);
		});

		window.removeEventListener('email-submit', this.handleEmailSubmit);
		window.removeEventListener('storage', this.handleStorageChange);
		window.removeEventListener('message', this.handlePortalMessage);

		// Clean up portal listeners
		if (this.portalInstance) {
			try {
				this.portalInstance.off('signin');
				this.portalInstance.off('signup');
				this.portalInstance.off('signout');
				this.portalInstance.off('subscription');
			} catch (error) {
				console.warn('Could not clean up portal listeners:', error);
			}
		}

		console.log('👤 Portal Integration destroyed');
	}
}