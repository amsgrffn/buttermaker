/**
 * Simple Sidebar Dropdown Module for Hard-coded HTML Content
 * Just handles open/close animations and icon transformations
 */

import { debounce } from './theme';

export class SidebarDropdown {
	constructor() {
		this.dropdownItems = document.querySelectorAll('.sidebar-nav .has-dropdown');
		this.activeDropdowns = new Set();

		this.init();
	}

	/**
	 * Initialize sidebar dropdowns
	 */
	init() {
		if (this.dropdownItems.length === 0) {
			console.warn('No dropdown items found');
			return;
		}

		this.bindEvents();
		this.setInitialState();

		console.log('📂 Sidebar Dropdowns initialized');
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		this.dropdownItems.forEach(item => {
			const link = item.querySelector('.sidebar-link');
			if (link) {
				link.addEventListener('click', (e) => this.handleDropdownClick(e, item));
			}
		});

		// Close dropdowns when clicking outside sidebar
		document.addEventListener('click', (e) => {
			if (!e.target.closest('.sidebar')) {
				this.closeAllDropdowns();
			}
		});

		// Handle window resize
		window.addEventListener('resize', debounce(() => {
			this.handleResize();
		}, 150));
	}

	/**
	 * Set initial state - all dropdowns closed
	 */
	setInitialState() {
		this.dropdownItems.forEach(item => {
			item.classList.remove('open');
			const submenu = item.querySelector('.dropdown-submenu');
			if (submenu) {
				submenu.style.maxHeight = '0';
			}
		});
	}

	/**
	 * Handle dropdown click
	 */
	handleDropdownClick(event, dropdownItem) {
		event.preventDefault();
		event.stopPropagation();

		const isOpen = dropdownItem.classList.contains('open');

		if (isOpen) {
			this.closeDropdown(dropdownItem);
		} else {
			this.openDropdown(dropdownItem);
		}

		// Track analytics
		this.trackDropdownEvent(dropdownItem, isOpen ? 'closed' : 'opened');
	}

	/**
	 * Open dropdown
	 */
	openDropdown(dropdownItem) {
		const submenu = dropdownItem.querySelector('.dropdown-submenu');
		const icon = dropdownItem.querySelector('.nav-icon svg');

		if (!submenu) return;

		// Add open class
		dropdownItem.classList.add('open');
		this.activeDropdowns.add(dropdownItem);

		// Transform icon from plus to minus
		if (icon) {
			this.transformIcon(icon, 'minus');
		}

		// Animate height
		submenu.style.maxHeight = submenu.scrollHeight + 'px';

		// Add animation class
		submenu.classList.add('expanding');

		// Remove animation class after transition
		setTimeout(() => {
			submenu.classList.remove('expanding');
		}, 300);
	}

	/**
	 * Close dropdown
	 */
	closeDropdown(dropdownItem) {
		const submenu = dropdownItem.querySelector('.dropdown-submenu');
		const icon = dropdownItem.querySelector('.nav-icon svg');

		if (!submenu) return;

		// Remove open class
		dropdownItem.classList.remove('open');
		this.activeDropdowns.delete(dropdownItem);

		// Transform icon from minus to plus
		if (icon) {
			this.transformIcon(icon, 'plus');
		}

		// Animate height
		submenu.style.maxHeight = '0';

		// Add animation class
		submenu.classList.add('collapsing');

		// Remove animation class after transition
		setTimeout(() => {
			submenu.classList.remove('collapsing');
		}, 300);
	}

	/**
	 * Close all dropdowns
	 */
	closeAllDropdowns() {
		this.activeDropdowns.forEach(item => {
			this.closeDropdown(item);
		});
	}

	/**
	 * Transform icon between plus and minus
	 */
	transformIcon(iconSvg, type) {
		if (type === 'minus') {
			// Transform to minus icon (horizontal line only)
			iconSvg.innerHTML = '<path d="M5 12h14"></path>';
		} else {
			// Transform to plus icon (horizontal + vertical lines)
			iconSvg.innerHTML = '<path d="M5 12h14"></path><path d="M12 5v14"></path>';
		}
	}

	/**
	 * Handle window resize
	 */
	handleResize() {
		// Recalculate submenu heights for open dropdowns
		this.activeDropdowns.forEach(item => {
			const submenu = item.querySelector('.dropdown-submenu');
			if (submenu && item.classList.contains('open')) {
				submenu.style.maxHeight = submenu.scrollHeight + 'px';
			}
		});
	}

	/**
	 * Track dropdown events for analytics
	 */
	trackDropdownEvent(dropdownItem, action) {
		const dropdownType = dropdownItem.getAttribute('data-dropdown-type') || 'unknown';

		if (typeof window.trackEvent === 'function') {
			window.trackEvent('Navigation', `Dropdown ${action}`, dropdownType);
		}
	}

	/**
	 * Destroy the sidebar dropdown
	 */
	destroy() {
		// Remove event listeners
		this.dropdownItems.forEach(item => {
			const link = item.querySelector('.sidebar-link');
			if (link) {
				link.removeEventListener('click', this.handleDropdownClick);
			}
		});

		document.removeEventListener('click', this.closeAllDropdowns);

		// Close all dropdowns
		this.closeAllDropdowns();

		console.log('📂 Sidebar Dropdowns destroyed');
	}
}