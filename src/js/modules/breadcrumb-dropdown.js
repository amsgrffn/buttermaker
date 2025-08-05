/**
 * Breadcrumb Dropdown Module
 *
 * Provides keyboard navigation and accessibility enhancements
 * for breadcrumb dropdown menus in Ghost themes.
 *
 * Features:
 * - Keyboard navigation (Enter/Space to open, Arrow keys to navigate)
 * - Click handling for anchor triggers
 * - Escape key to close
 * - Accessibility attributes (ARIA)
 * - Auto-cleanup on page unload
 *
 * Expected HTML structure:
 * <li class="pages-dropdown">
 *   <a href="javascript:void(0)" class="dropdown-trigger">Topics</a>
 *   <div class="breadcrumb-dropdown">
 *     <div class="dropdown-inner">
 *       <ul>
 *         <li><a href="/topic1">Topic 1 <span>(5)</span></a></li>
 *         <li><a href="/topic2">Topic 2 <span>(3)</span></a></li>
 *       </ul>
 *     </div>
 *   </div>
 * </li>
 *
 * Usage:
 * import { BreadcrumbDropdown } from './modules/breadcrumb-dropdown.js';
 * const breadcrumbDropdown = new BreadcrumbDropdown();
 */

export class BreadcrumbDropdown {
	constructor(options = {}) {
		this.options = {
			dropdownSelector: '.pages-dropdown',
			triggerSelector: '.dropdown-trigger',
			dropdownContentSelector: '.breadcrumb-dropdown .dropdown-inner ul li a',
			keyboardHoverClass: 'keyboard-hover',
			...options
		};

		this.dropdowns = [];
		this.boundCleanup = this.cleanup.bind(this);
		this.styleElement = null;

		this.init();
	}

	/**
	 * Initialize the breadcrumb dropdown functionality
	 */
	init() {
		this.findDropdowns();
		this.setupKeyboardSupport();
		this.injectStyles();
		this.bindEvents();

		console.log(`📋 BreadcrumbDropdown: Initialized ${this.dropdowns.length} dropdown(s)`);
	}

	/**
	 * Find all breadcrumb dropdowns on the page
	 */
	findDropdowns() {
		const dropdownElements = document.querySelectorAll(this.options.dropdownSelector);

		dropdownElements.forEach(dropdown => {
			const trigger = dropdown.querySelector(this.options.triggerSelector);
			const links = dropdown.querySelectorAll(this.options.dropdownContentSelector);

			if (trigger && links.length > 0) {
				this.dropdowns.push({
					element: dropdown,
					trigger: trigger,
					links: Array.from(links)
				});
			}
		});
	}

	/**
	 * Setup keyboard support for all dropdowns
	 */
	setupKeyboardSupport() {
		this.dropdowns.forEach(dropdown => {
			this.setupTriggerKeyboard(dropdown);
			this.setupLinksKeyboard(dropdown);
			this.setupAccessibility(dropdown);
		});
	}

	/**
	 * Setup keyboard support for dropdown trigger
	 */
	setupTriggerKeyboard(dropdown) {
		dropdown.trigger.addEventListener('keydown', (e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				e.preventDefault();
				this.openDropdown(dropdown);
			}
		});

		// Handle click events for anchor triggers to prevent navigation
		dropdown.trigger.addEventListener('click', (e) => {
			e.preventDefault();
			this.openDropdown(dropdown);
		});
	}

	/**
	 * Setup keyboard navigation for dropdown links
	 */
	setupLinksKeyboard(dropdown) {
		dropdown.links.forEach((link, index) => {
			link.addEventListener('keydown', (e) => {
				switch (e.key) {
					case 'Escape':
						e.preventDefault();
						this.closeDropdown(dropdown);
						break;

					case 'ArrowDown':
						e.preventDefault();
						this.focusNextLink(dropdown, index);
						break;

					case 'ArrowUp':
						e.preventDefault();
						this.focusPreviousLink(dropdown, index);
						break;
				}
			});

			// Close dropdown when link is clicked
			link.addEventListener('click', () => {
				this.closeDropdown(dropdown);
			});
		});

		// Handle tab out of last link
		const lastLink = dropdown.links[dropdown.links.length - 1];
		if (lastLink) {
			lastLink.addEventListener('keydown', (e) => {
				if (e.key === 'Tab' && !e.shiftKey) {
					this.closeDropdown(dropdown);
				}
			});
		}
	}

	/**
	 * Setup accessibility attributes
	 */
	setupAccessibility(dropdown) {
		dropdown.trigger.setAttribute('role', 'button');
		dropdown.trigger.setAttribute('aria-haspopup', 'true');
		dropdown.trigger.setAttribute('aria-expanded', 'false');
		dropdown.trigger.setAttribute('tabindex', '0');
	}

	/**
	 * Open dropdown with keyboard
	 */
	openDropdown(dropdown) {
		// Close all other dropdowns first
		this.dropdowns.forEach(other => {
			if (other !== dropdown) {
				this.closeDropdown(other);
			}
		});

		dropdown.element.classList.add(this.options.keyboardHoverClass);
		dropdown.trigger.setAttribute('aria-expanded', 'true');

		// Focus first link
		if (dropdown.links[0]) {
			setTimeout(() => dropdown.links[0].focus(), 50);
		}
	}

	/**
	 * Close dropdown
	 */
	closeDropdown(dropdown) {
		dropdown.element.classList.remove(this.options.keyboardHoverClass);
		dropdown.trigger.setAttribute('aria-expanded', 'false');
		dropdown.trigger.focus();
	}

	/**
	 * Focus next link in dropdown
	 */
	focusNextLink(dropdown, currentIndex) {
		if (currentIndex < dropdown.links.length - 1) {
			dropdown.links[currentIndex + 1].focus();
		}
	}

	/**
	 * Focus previous link or trigger
	 */
	focusPreviousLink(dropdown, currentIndex) {
		if (currentIndex > 0) {
			dropdown.links[currentIndex - 1].focus();
		} else {
			this.closeDropdown(dropdown);
		}
	}

	/**
	 * Inject required CSS styles
	 */
	injectStyles() {
		if (this.styleElement) return; // Already injected

		this.styleElement = document.createElement('style');
		this.styleElement.setAttribute('data-breadcrumb-dropdown', 'styles');
		this.styleElement.textContent = `
			.${this.options.dropdownSelector.slice(1)}.${this.options.keyboardHoverClass} .breadcrumb-dropdown {
				visibility: visible !important;
				opacity: 1 !important;
				transform: translateY(0) !important;
				pointer-events: auto !important;
			}

			.${this.options.dropdownSelector.slice(1)}.${this.options.keyboardHoverClass} .dropdown-trigger:after {
				transform: rotate(180deg) !important;
			}

			/* Focus styles for better accessibility */
			.${this.options.dropdownSelector.slice(1)} .dropdown-trigger:focus {
				outline: 2px solid var(--color-primary, #007cba);
				outline-offset: 2px;
			}

			.breadcrumb-dropdown .dropdown-inner ul li a:focus {
				outline: 2px solid var(--color-primary, #007cba);
				outline-offset: -2px;
				background-color: var(--color-primary-10, rgba(0, 124, 186, 0.1));
			}
		`;

		document.head.appendChild(this.styleElement);
	}

	/**
	 * Bind cleanup events
	 */
	bindEvents() {
		// Cleanup when page unloads
		window.addEventListener('beforeunload', this.boundCleanup);
	}

	/**
	 * Cleanup function
	 */
	cleanup() {
		// Remove event listeners
		this.dropdowns.forEach(dropdown => {
			dropdown.element.classList.remove(this.options.keyboardHoverClass);
		});

		// Remove injected styles
		if (this.styleElement && this.styleElement.parentNode) {
			this.styleElement.parentNode.removeChild(this.styleElement);
		}

		// Remove global event listeners
		window.removeEventListener('beforeunload', this.boundCleanup);

		console.log('📋 BreadcrumbDropdown: Cleaned up');
	}

	/**
	 * Destroy the instance and cleanup
	 */
	destroy() {
		this.cleanup();
		this.dropdowns = [];
		this.styleElement = null;
	}

	/**
	 * Get current state of dropdowns
	 */
	getState() {
		return {
			dropdownCount: this.dropdowns.length,
			openDropdowns: this.dropdowns.filter(d =>
				d.element.classList.contains(this.options.keyboardHoverClass)
			).length
		};
	}
}

/**
 * Simple initialization function for direct use
 * (alternative to class instantiation)
 */
export function initBreadcrumbDropdown(options = {}) {
	return new BreadcrumbDropdown(options);
}

/**
 * Default export for convenience
 */
export default BreadcrumbDropdown;