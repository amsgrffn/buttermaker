/**
 * True Masonry Grid Module - 2 Columns
 * Handles true masonry layout with dynamic card positioning
 */

import { debounce, isInViewport } from './theme';

export class MasonryGrid {
	constructor() {
		this.grid = document.querySelector('.masonry-grid');
		this.cards = document.querySelectorAll('.masonry-card');
		this.observer = null;
		this.columns = [];
		this.columnCount = 2; // Changed from 4 to 2!
		this.gap = 24; // Default gap in pixels
		this.isLayouting = false;

		this.init();
	}

	/**
	 * Initialize masonry grid
	 */
	init() {
		if (!this.grid) {
			console.warn('Masonry grid not found');
			return;
		}

		this.calculateColumns();
		this.bindEvents();
		this.setupIntersectionObserver();

		// Wait for images to load, then layout
		this.waitForImages().then(() => {
			this.layoutMasonry();
			this.handleInitialLayout();
		});

		console.log('🧱 True Masonry Grid initialized (2 columns)');
	}

	/**
	 * Wait for all images in cards to load
	 */
	waitForImages() {
		const images = this.grid.querySelectorAll('img');
		const imagePromises = Array.from(images).map(img => {
			return new Promise(resolve => {
				if (img.complete) {
					resolve();
				} else {
					img.addEventListener('load', resolve);
					img.addEventListener('error', resolve); // Resolve even on error
				}
			});
		});

		return Promise.all(imagePromises);
	}

	/**
	 * Calculate number of columns based on screen size
	 */
	calculateColumns() {
		const screenWidth = window.innerWidth;

		if (screenWidth <= 767) {
			this.columnCount = 1; // Single column on mobile
			this.gap = 16;
		} else {
			this.columnCount = 2; // Always 2 columns on desktop/tablet
			this.gap = 24;
		}

		// Initialize column heights
		this.columns = new Array(this.columnCount).fill(0);
	}

	/**
	 * Main masonry layout function
	 */
	layoutMasonry() {
		if (this.isLayouting) return;
		this.isLayouting = true;

		// Reset column heights
		this.columns = new Array(this.columnCount).fill(0);

		// Calculate card width
		const containerWidth = this.grid.offsetWidth;
		const cardWidth = (containerWidth - (this.gap * (this.columnCount - 1))) / this.columnCount;

		// Position each card
		this.cards.forEach((card, index) => {
			this.positionCard(card, cardWidth, index);
		});

		// Set grid container height
		const maxColumnHeight = Math.max(...this.columns);
		this.grid.style.height = `${maxColumnHeight}px`;

		this.isLayouting = false;
	}

	/**
	 * Position individual card in the shortest column
	 */
	positionCard(card, cardWidth, index) {
		// Skip positioning on mobile (cards stack naturally)
		if (window.innerWidth <= 767) {
			return;
		}

		// Find shortest column
		const shortestColumnIndex = this.columns.indexOf(Math.min(...this.columns));
		const shortestColumnHeight = this.columns[shortestColumnIndex];

		// Calculate position
		const left = shortestColumnIndex * (cardWidth + this.gap);
		const top = shortestColumnHeight;

		// Apply positioning (but don't show yet)
		card.style.left = `${left}px`;
		card.style.top = `${top}px`;
		card.style.width = `${cardWidth}px`;

		// Get card height (including any content that loaded)
		const cardHeight = card.offsetHeight;

		// Update column height
		this.columns[shortestColumnIndex] += cardHeight + this.gap;

		// Add entrance animation with stagger
		setTimeout(() => {
			card.classList.add('positioned');
		}, index * 100);
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		// Card click handlers
		this.cards.forEach(card => {
			card.addEventListener('click', (e) => this.handleCardClick(e));
		});

		// Window resize handler with debounce
		window.addEventListener('resize', debounce(() => {
			this.handleResize();
		}, 150));

		// Custom masonry update event (for filtering)
		window.addEventListener('masonryUpdate', (e) => {
			this.handleMasonryUpdate(e.detail);
		});

		// Images loaded event
		window.addEventListener('load', () => {
			this.layoutMasonry();
		});
	}

	/**
	 * Handle card click
	 */
	handleCardClick(event) {
		const card = event.target.closest('.masonry-card');

		// Don't navigate if clicking on the overlay link
		if (event.target.classList.contains('masonry-link')) {
			return;
		}

		// Don't navigate if clicking on interactive elements
		if (this.isInteractiveElement(event.target)) {
			return;
		}

		const link = card.querySelector('.masonry-link') || card.querySelector('.masonry-title a');
		if (link && link.href) {
			// Add click animation
			this.animateCardClick(card);

			// Small delay for animation, then navigate
			setTimeout(() => {
				window.location.href = link.href;
			}, 150);

			// Track analytics
			this.trackCardClick(card);
		}
	}

	/**
	 * Check if element is interactive
	 */
	isInteractiveElement(element) {
		const interactiveElements = ['A', 'BUTTON', 'INPUT', 'TEXTAREA', 'SELECT'];
		const interactiveClasses = ['post-action', 'subscribe-btn', 'tag-link'];

		return (
			interactiveElements.includes(element.tagName) ||
			interactiveClasses.some(className => element.classList.contains(className)) ||
			element.closest('a, button, .post-action, .subscribe-btn')
		);
	}

	/**
	 * Animate card click
	 */
	animateCardClick(card) {
		card.style.transform = 'scale(0.98)';
		card.style.transition = 'transform 0.15s ease';

		setTimeout(() => {
			card.style.transform = '';
		}, 150);
	}

	/**
	 * Setup intersection observer for lazy loading
	 */
	setupIntersectionObserver() {
		if (!('IntersectionObserver' in window)) {
			return;
		}

		this.observer = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					this.handleCardVisible(entry.target);
				}
			});
		}, {
			threshold: 0.1,
			rootMargin: '50px'
		});

		// Observe all cards
		this.cards.forEach(card => {
			this.observer.observe(card);
		});
	}

	/**
	 * Handle card becoming visible
	 */
	handleCardVisible(card) {
		// Lazy load images
		this.lazyLoadImages(card);

		// Stop observing this card
		if (this.observer) {
			this.observer.unobserve(card);
		}
	}

	/**
	 * Lazy load images in card
	 */
	lazyLoadImages(card) {
		const images = card.querySelectorAll('img[data-src]');

		images.forEach(img => {
			img.src = img.dataset.src;
			img.removeAttribute('data-src');

			img.addEventListener('load', () => {
				img.style.opacity = '1';
				// Re-layout if image changes card height significantly
				this.layoutMasonry();
			});
		});
	}

	/**
	 * Handle window resize
	 */
	handleResize() {
		const oldColumnCount = this.columnCount;
		this.calculateColumns();

		// Re-layout if column count changed or screen size changed significantly
		if (oldColumnCount !== this.columnCount) {
			// Hide cards temporarily for smooth transition
			this.cards.forEach(card => {
				card.classList.remove('positioned');
			});

			// Re-layout after brief delay
			setTimeout(() => {
				this.layoutMasonry();
			}, 100);
		} else {
			// Just re-layout with current settings
			this.layoutMasonry();
		}
	}

	/**
	 * Handle initial layout
	 */
	handleInitialLayout() {
		console.log('🎯 2-Column Masonry layout complete');
	}

	/**
	 * Handle masonry update event (from category filtering)
	 */
	handleMasonryUpdate(detail) {
		const { visibleCards } = detail;

		// Update cards collection to only visible ones
		this.cards = document.querySelectorAll('.masonry-card:not([style*="display: none"])');

		// Re-layout with visible cards
		setTimeout(() => {
			this.layoutMasonry();
		}, 50);
	}

	/**
	 * Track analytics
	 */
	trackCardClick(card) {
		const title = card.querySelector('.masonry-title');

		if (typeof window.trackEvent === 'function') {
			window.trackEvent('Masonry Grid', 'Card Click', title ? title.textContent : 'Unknown');
		}
	}

	/**
	 * Get grid statistics
	 */
	getGridStats() {
		const totalCards = this.cards.length;
		const visibleCards = Array.from(this.cards).filter(card =>
			card.style.display !== 'none'
		).length;

		return {
			totalCards,
			visibleCards,
			columnCount: this.columnCount,
			gridWidth: this.grid ? this.grid.offsetWidth : 0,
			gridHeight: this.grid ? this.grid.offsetHeight : 0
		};
	}

	/**
	 * Destroy masonry grid
	 */
	destroy() {
		// Remove event listeners
		this.cards.forEach(card => {
			card.removeEventListener('click', this.handleCardClick);
		});

		// Disconnect observer
		if (this.observer) {
			this.observer.disconnect();
		}

		// Remove custom event listeners
		window.removeEventListener('masonryUpdate', this.handleMasonryUpdate);

		console.log('🧱 Masonry Grid destroyed');
	}
}