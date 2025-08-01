/**
 * Masonry Grid Module
 * Handles masonry grid layout and card interactions
 */

import { debounce, isInViewport } from './theme';

export class MasonryGrid {
	constructor() {
		this.grid = document.querySelector('.masonry-grid');
		this.cards = document.querySelectorAll('.masonry-card');
		this.observer = null;

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

		this.bindEvents();
		this.setupIntersectionObserver();
		this.handleInitialLayout();

		console.log('🧱 Masonry Grid initialized');
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		// Card click handlers
		this.cards.forEach(card => {
			card.addEventListener('click', (e) => this.handleCardClick(e));
		});

		// Window resize handler
		window.addEventListener('resize', debounce(() => {
			this.handleResize();
		}, 150));

		// Custom masonry update event
		window.addEventListener('masonryUpdate', (e) => {
			this.handleMasonryUpdate(e.detail);
		});

		// Theme resize event
		window.addEventListener('themeResize', (e) => {
			this.handleThemeResize(e.detail);
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
	 * Setup intersection observer for lazy loading and animations
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
		// Add entrance animation
		if (!card.classList.contains('animated')) {
			this.animateCardEntrance(card);
			card.classList.add('animated');
		}

		// Lazy load images
		this.lazyLoadImages(card);

		// Stop observing this card
		if (this.observer) {
			this.observer.unobserve(card);
		}
	}

	/**
	 * Animate card entrance
	 */
	animateCardEntrance(card) {
		card.style.opacity = '0';
		card.style.transform = 'translateY(20px)';

		// Trigger animation
		requestAnimationFrame(() => {
			card.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
			card.style.opacity = '1';
			card.style.transform = 'translateY(0)';
		});
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
			});
		});
	}

	/**
	 * Handle window resize
	 */
	handleResize() {
		// Re-calculate grid layout if needed
		this.recalculateLayout();

		// Update card sizes based on new screen size
		this.updateCardSizes();
	}

	/**
	 * Handle theme resize event
	 */
	handleThemeResize(resizeInfo) {
		const { isMobile, isTablet, isDesktop } = resizeInfo;

		// Adjust card behavior based on screen size
		if (isMobile) {
			this.optimizeForMobile();
		} else if (isTablet) {
			this.optimizeForTablet();
		} else if (isDesktop) {
			this.optimizeForDesktop();
		}
	}

	/**
	 * Handle masonry update event (from category filtering)
	 */
	handleMasonryUpdate(detail) {
		const { visibleCards } = detail;

		// Re-animate visible cards
		this.reanimateVisibleCards(visibleCards);

		// Update layout
		this.recalculateLayout();
	}

	/**
	 * Re-animate visible cards after filtering
	 */
	reanimateVisibleCards(visibleCards) {
		visibleCards.forEach((card, index) => {
			// Stagger the animations
			setTimeout(() => {
				card.style.opacity = '0';
				card.style.transform = 'translateY(20px)';

				requestAnimationFrame(() => {
					card.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
					card.style.opacity = '1';
					card.style.transform = 'translateY(0)';
				});
			}, index * 50);
		});
	}

	/**
	 * Optimize grid for mobile
	 */
	optimizeForMobile() {
		// Ensure single column layout
		this.cards.forEach(card => {
			card.classList.remove('wide', 'large');

			// Keep tall class only for poetry/content that benefits
			if (!card.hasAttribute('data-keep-tall')) {
				card.classList.remove('tall');
			}
		});
	}

	/**
	 * Optimize grid for tablet
	 */
	optimizeForTablet() {
		// Remove wide/large classes that don't work well on tablet
		this.cards.forEach(card => {
			card.classList.remove('wide', 'large');
		});
	}

	/**
	 * Optimize grid for desktop
	 */
	optimizeForDesktop() {
		// Restore original card classes
		this.cards.forEach(card => {
			const originalClasses = card.getAttribute('data-original-classes');
			if (originalClasses) {
				card.className = originalClasses;
			}
		});
	}

	/**
	 * Update card sizes based on content
	 */
	updateCardSizes() {
		this.cards.forEach(card => {
			const content = card.querySelector('.masonry-content');
			const image = card.querySelector('.masonry-image');

			if (content && image) {
				// Adjust card height based on content
				const contentHeight = content.offsetHeight;
				const imageHeight = image.offsetHeight;
				const totalHeight = contentHeight + imageHeight;

				// Dynamic sizing based on content amount
				if (totalHeight > 400 && !card.classList.contains('large')) {
					card.style.gridRowEnd = 'span 2';
				}
			}
		});
	}

	/**
	 * Recalculate grid layout
	 */
	recalculateLayout() {
		// Force browser to recalculate grid layout
		if (this.grid) {
			const display = this.grid.style.display;
			this.grid.style.display = 'none';

			// Trigger reflow
			this.grid.offsetHeight;

			this.grid.style.display = display;
		}
	}

	/**
	 * Handle initial layout
	 */
	handleInitialLayout() {
		// Store original classes for responsive behavior
		this.cards.forEach(card => {
			card.setAttribute('data-original-classes', card.className);
		});

		// Add staggered entrance animations for initially visible cards
		this.animateInitialCards();
	}

	/**
	 * Animate initially visible cards
	 */
	animateInitialCards() {
		const visibleCards = Array.from(this.cards).filter(card =>
			isInViewport(card, 100)
		);

		visibleCards.forEach((card, index) => {
			setTimeout(() => {
				this.handleCardVisible(card);
			}, index * 100);
		});
	}

	/**
	 * Add new card to grid
	 */
	addCard(cardElement) {
		if (this.grid && cardElement) {
			this.grid.appendChild(cardElement);

			// Setup observer for new card
			if (this.observer) {
				this.observer.observe(cardElement);
			}

			// Add click handler
			cardElement.addEventListener('click', (e) => this.handleCardClick(e));

			// Update cards collection
			this.cards = document.querySelectorAll('.masonry-card');
		}
	}

	/**
	 * Remove card from grid
	 */
	removeCard(cardElement) {
		if (cardElement) {
			// Stop observing
			if (this.observer) {
				this.observer.unobserve(cardElement);
			}

			// Remove from DOM with animation
			cardElement.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
			cardElement.style.opacity = '0';
			cardElement.style.transform = 'scale(0.8)';

			setTimeout(() => {
				if (cardElement.parentNode) {
					cardElement.parentNode.removeChild(cardElement);
				}

				// Update cards collection
				this.cards = document.querySelectorAll('.masonry-card');
			}, 300);
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

		const cardTypes = {
			standard: 0,
			tall: 0,
			wide: 0,
			large: 0
		};

		this.cards.forEach(card => {
			if (card.classList.contains('large')) {
				cardTypes.large++;
			} else if (card.classList.contains('wide')) {
				cardTypes.wide++;
			} else if (card.classList.contains('tall')) {
				cardTypes.tall++;
			} else {
				cardTypes.standard++;
			}
		});

		return {
			totalCards,
			visibleCards,
			cardTypes,
			gridWidth: this.grid ? this.grid.offsetWidth : 0
		};
	}

	/**
	 * Track analytics
	 */
	trackCardClick(card) {
		const title = card.querySelector('.masonry-title');
		const tags = card.getAttribute('data-tags') || '';

		if (typeof window.trackEvent === 'function') {
			window.trackEvent('Masonry Grid', 'Card Click', title ? title.textContent : 'Unknown');
		}
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