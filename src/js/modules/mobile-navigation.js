/**
 * Mobile Navigation Module
 */

import { debounce } from './theme';

export class MobileNavigation {
	constructor() {
		this.sidebar = document.querySelector('.sidebar');
		this.overlay = document.querySelector('.sidebar-overlay');
		this.menuBtn = document.querySelector('.mobile-menu-btn');
		this.sidebarLinks = document.querySelectorAll('.sidebar-link');

		this.isOpen = false;
		this.breakpoint = 767;

		this.init();
	}

	/**
	 * Initialize mobile navigation
	 */
	init() {
		if (!this.sidebar) {
			console.warn('Sidebar element not found');
			return;
		}

		this.bindEvents();
		this.handleInitialState();

		console.log('📱 Mobile Navigation initialized');
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		// Overlay click to close
		if (this.overlay) {
			this.overlay.addEventListener('click', () => this.closeSidebar());
		}

		// Sidebar links click to close on mobile
		this.sidebarLinks.forEach(link => {
			link.addEventListener('click', () => {
				if (window.innerWidth <= this.breakpoint) {
					this.closeSidebar();
				}
			});
		});

		// Window resize handler
		window.addEventListener('resize', debounce(() => {
			this.handleResize();
		}, 150));

		// Escape key to close
		document.addEventListener('keydown', (e) => {
			if (e.key === 'Escape' && this.isOpen) {
				this.closeSidebar();
			}
		});

		// Custom theme resize event
		window.addEventListener('themeResize', (e) => {
			const { isMobile } = e.detail;
			if (!isMobile && this.isOpen) {
				this.closeSidebar();
			}
		});
	}

	/**
	 * Handle initial state
	 */
	handleInitialState() {
		// Ensure sidebar is closed on mobile initially
		if (window.innerWidth <= this.breakpoint) {
			this.closeSidebar();
		}
	}

	/**
	 * Toggle sidebar
	 */
	toggleSidebar() {
		if (this.isOpen) {
			this.closeSidebar();
		} else {
			this.openSidebar();
		}
	}

	/**
	 * Open sidebar
	 */
	openSidebar() {
		if (!this.sidebar) return;

		this.sidebar.classList.add('open');
		if (this.overlay) {
			this.overlay.style.display = 'block';
		}

		this.isOpen = true;

		// Prevent body scroll when sidebar is open
		document.body.style.overflow = 'hidden';

		// Focus management for accessibility
		this.trapFocus();

		// Analytics
		this.trackEvent('Navigation', 'Sidebar Opened');
	}

	/**
	 * Close sidebar
	 */
	closeSidebar() {
		if (!this.sidebar) return;

		this.sidebar.classList.remove('open');
		if (this.overlay) {
			this.overlay.style.display = 'none';
		}

		this.isOpen = false;

		// Restore body scroll
		document.body.style.overflow = '';

		// Remove focus trap
		this.removeFocusTrap();

		// Analytics
		this.trackEvent('Navigation', 'Sidebar Closed');
	}

	/**
	 * Handle window resize
	 */
	handleResize() {
		const isNowMobile = window.innerWidth <= this.breakpoint;

		// Close sidebar if resizing to desktop
		if (!isNowMobile && this.isOpen) {
			this.closeSidebar();
		}
	}

	/**
	 * Trap focus within sidebar for accessibility
	 */
	trapFocus() {
		if (!this.sidebar) return;

		const focusableElements = this.sidebar.querySelectorAll(
			'a[href], button, input, textarea, select, [tabindex]:not([tabindex="-1"])'
		);

		if (focusableElements.length === 0) return;

		const firstElement = focusableElements[0];
		const lastElement = focusableElements[focusableElements.length - 1];

		// Focus first element
		firstElement.focus();

		this.focusTrapHandler = (e) => {
			if (e.key === 'Tab') {
				if (e.shiftKey) {
					// Shift + Tab
					if (document.activeElement === firstElement) {
						e.preventDefault();
						lastElement.focus();
					}
				} else {
					// Tab
					if (document.activeElement === lastElement) {
						e.preventDefault();
						firstElement.focus();
					}
				}
			}
		};

		document.addEventListener('keydown', this.focusTrapHandler);
	}

	/**
	 * Remove focus trap
	 */
	removeFocusTrap() {
		if (this.focusTrapHandler) {
			document.removeEventListener('keydown', this.focusTrapHandler);
			this.focusTrapHandler = null;
		}
	}

	/**
	 * Track analytics events
	 */
	trackEvent(category, action, label = '') {
		if (typeof window.trackEvent === 'function') {
			window.trackEvent(category, action, label);
		}
	}

	/**
	 * Get current state
	 */
	getState() {
		return {
			isOpen: this.isOpen,
			isMobile: window.innerWidth <= this.breakpoint
		};
	}

	/**
	 * Destroy the mobile navigation
	 */
	destroy() {
		// Remove event listeners
		if (this.overlay) {
			this.overlay.removeEventListener('click', this.closeSidebar);
		}

		this.sidebarLinks.forEach(link => {
			link.removeEventListener('click', this.closeSidebar);
		});

		this.removeFocusTrap();

		// Clean up global reference
		if (window.toggleSidebar === this.toggleSidebar) {
			delete window.toggleSidebar;
		}

		console.log('📱 Mobile Navigation destroyed');
	}
}