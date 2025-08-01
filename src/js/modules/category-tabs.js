/**
 * Category Tabs Module
 * Handles filtering of masonry cards by category
 */

import { debounce } from './theme';

export class CategoryTabs {
	constructor() {
		this.tabs = document.querySelectorAll('.category-tab');
		this.cards = document.querySelectorAll('.masonry-card');
		this.activeFilter = 'all';

		this.init();
	}

	/**
	 * Initialize category tabs
	 */
	init() {
		if (this.tabs.length === 0) {
			console.warn('No category tabs found');
			return;
		}

		this.bindEvents();
		this.setInitialState();

		console.log('📊 Category Tabs initialized');
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		this.tabs.forEach(tab => {
			tab.addEventListener('click', (e) => this.handleTabClick(e));
		});

		// Listen for theme resize events
		window.addEventListener('themeResize', debounce((e) => {
			this.handleResize(e.detail);
		}, 150));
	}

	/**
	 * Set initial state
	 */
	setInitialState() {
		// Set first tab as active if none are active
		const activeTab = document.querySelector('.category-tab.active');
		if (!activeTab && this.tabs.length > 0) {
			this.tabs[0].classList.add('active');
			this.activeFilter = this.tabs[0].getAttribute('data-filter') || 'all';
		}
	}

	/**
	 * Handle tab click
	 */
	handleTabClick(event) {
		const tab = event.target;
		const filter = tab.getAttribute('data-filter') || 'all';

		// Update active tab
		this.setActiveTab(tab);

		// Filter cards
		this.filterCards(filter);

		// Scroll tab into view on mobile
		this.scrollTabIntoView(tab);

		// Track analytics
		this.trackTabClick(filter);

		// Store active filter
		this.activeFilter = filter;
	}

	/**
	 * Set active tab
	 */
	setActiveTab(activeTab) {
		this.tabs.forEach(tab => tab.classList.remove('active'));
		activeTab.classList.add('active');
	}

	/**
	 * Filter masonry cards
	 */
	filterCards(filter) {
		const visibleCards = [];

		this.cards.forEach(card => {
			const shouldShow = this.shouldShowCard(card, filter);

			if (shouldShow) {
				this.showCard(card);
				visibleCards.push(card);
			} else {
				this.hideCard(card);
			}
		});

		// Trigger masonry layout update if needed
		this.updateMasonryLayout(visibleCards);

		console.log(`Filtered to ${filter}: ${visibleCards.length} cards visible`);
	}

	/**
	 * Determine if card should be shown for filter
	 */
	shouldShowCard(card, filter) {
		if (filter === 'all') return true;

		const tags = card.getAttribute('data-tags') || '';
		const tagArray = tags.toLowerCase().split(' ').filter(tag => tag.length > 0);

		return tagArray.includes(filter.toLowerCase());
	}

	/**
	 * Show card with animation
	 */
	showCard(card) {
		card.style.display = 'block';

		// Trigger reflow for animation
		card.offsetHeight;

		// Add entrance animation class if supported
		if (card.classList.contains('hidden')) {
			card.classList.remove('hidden');
		}

		// Fade in animation
		card.style.opacity = '0';
		card.style.transform = 'translateY(20px)';

		requestAnimationFrame(() => {
			card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
			card.style.opacity = '1';
			card.style.transform = 'translateY(0)';
		});
	}

	/**
	 * Hide card with animation
	 */
	hideCard(card) {
		card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
		card.style.opacity = '0';
		card.style.transform = 'translateY(-20px)';

		setTimeout(() => {
			card.style.display = 'none';
			card.classList.add('hidden');
		}, 300);
	}

	/**
	 * Update masonry layout after filtering
	 */
	updateMasonryLayout(visibleCards) {
		// Dispatch custom event for masonry grid to handle layout updates
		window.dispatchEvent(new CustomEvent('masonryUpdate', {
			detail: { visibleCards }
		}));
	}

	/**
	 * Scroll tab into view on mobile
	 */
	scrollTabIntoView(tab) {
		if (window.innerWidth <= 767) {
			tab.scrollIntoView({
				behavior: 'smooth',
				inline: 'center',
				block: 'nearest'
			});
		}
	}

	/**
	 * Handle window resize
	 */
	handleResize(resizeInfo) {
		const { isMobile } = resizeInfo;

		// Update tab scrolling behavior based on screen size
		if (isMobile) {
			this.enableMobileScrolling();
		} else {
			this.disableMobileScrolling();
		}
	}

	/**
	 * Enable mobile scrolling for tabs
	 */
	enableMobileScrolling() {
		const tabsContainer = document.querySelector('.category-tabs');
		if (tabsContainer) {
			tabsContainer.style.overflowX = 'auto';
			tabsContainer.style.scrollbarWidth = 'none';
			tabsContainer.style.msOverflowStyle = 'none';
		}
	}

	/**
	 * Disable mobile scrolling for tabs
	 */
	disableMobileScrolling() {
		const tabsContainer = document.querySelector('.category-tabs');
		if (tabsContainer) {
			tabsContainer.style.overflowX = 'visible';
		}
	}

	/**
	 * Get all available filters from cards
	 */
	getAvailableFilters() {
		const filters = new Set(['all']);

		this.cards.forEach(card => {
			const tags = card.getAttribute('data-tags') || '';
			const tagArray = tags.toLowerCase().split(' ').filter(tag => tag.length > 0);
			tagArray.forEach(tag => filters.add(tag));
		});

		return Array.from(filters);
	}

	/**
	 * Get count of cards for each filter
	 */
	getFilterCounts() {
		const counts = { all: this.cards.length };

		this.cards.forEach(card => {
			const tags = card.getAttribute('data-tags') || '';
			const tagArray = tags.toLowerCase().split(' ').filter(tag => tag.length > 0);

			tagArray.forEach(tag => {
				counts[tag] = (counts[tag] || 0) + 1;
			});
		});

		return counts;
	}

	/**
	 * Track analytics
	 */
	trackTabClick(filter) {
		if (typeof window.trackEvent === 'function') {
			window.trackEvent('Category Tabs', 'Filter Changed', filter);
		}
	}

	/**
	 * Get current active filter
	 */
	getActiveFilter() {
		return this.activeFilter;
	}

	/**
	 * Set filter programmatically
	 */
	setFilter(filter) {
		const targetTab = Array.from(this.tabs).find(tab =>
			tab.getAttribute('data-filter') === filter
		);

		if (targetTab) {
			this.handleTabClick({ target: targetTab });
		} else {
			console.warn(`Filter "${filter}" not found`);
		}
	}

	/**
	 * Reset to show all cards
	 */
	reset() {
		this.setFilter('all');
	}

	/**
	 * Destroy the category tabs
	 */
	destroy() {
		this.tabs.forEach(tab => {
			tab.removeEventListener('click', this.handleTabClick);
		});

		// Show all cards
		this.cards.forEach(card => {
			card.style.display = 'block';
			card.style.opacity = '1';
			card.style.transform = 'none';
			card.classList.remove('hidden');
		});

		console.log('📊 Category Tabs destroyed');
	}
}