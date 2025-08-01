/**
 * Touch Improvements Module
 * Enhances touch interactions for mobile devices
 */

export class TouchImprovements {
	constructor() {
		this.isTouchDevice = this.detectTouchDevice();
		this.scrollElements = [];
		this.touchStartTime = 0;
		this.lastTouchEnd = 0;

		this.init();
	}

	/**
	 * Initialize touch improvements
	 */
	init() {
		if (!this.isTouchDevice) {
			console.log('👆 Touch device not detected, skipping touch improvements');
			return;
		}

		this.setupTouchImprovements();
		this.preventDoubleTapZoom();
		this.improveScrolling();
		this.enhanceTouchTargets();
		this.setupSwipeGestures();

		console.log('👆 Touch Improvements initialized');
	}

	/**
	 * Detect if device supports touch
	 */
	detectTouchDevice() {
		return (
			'ontouchstart' in window ||
			navigator.maxTouchPoints > 0 ||
			navigator.msMaxTouchPoints > 0
		);
	}

	/**
	 * Setup general touch improvements
	 */
	setupTouchImprovements() {
		// Add touch-device class for CSS targeting
		document.documentElement.classList.add('touch-device');

		// Improve touch scrolling
		document.body.style.webkitOverflowScrolling = 'touch';

		// Disable text selection on touch for UI elements
		this.disableTextSelectionForUI();

		// Improve button touch feedback
		this.improveTouchFeedback();
	}

	/**
	 * Prevent double-tap zoom on iOS
	 */
	preventDoubleTapZoom() {
		document.addEventListener('touchend', (event) => {
			const now = new Date().getTime();

			if (now - this.lastTouchEnd <= 300) {
				event.preventDefault();
			}

			this.lastTouchEnd = now;
		}, { passive: false });
	}

	/**
	 * Improve scrolling for horizontal elements
	 */
	improveScrolling() {
		const scrollableElements = document.querySelectorAll(
			'.category-tabs, .featured-carousel, .horizontal-scroll'
		);

		scrollableElements.forEach(element => {
			this.enhanceHorizontalScrolling(element);
		});

		// Store for later reference
		this.scrollElements = Array.from(scrollableElements);
	}

	/**
	 * Enhance horizontal scrolling
	 */
	enhanceHorizontalScrolling(element) {
		let isScrolling = false;
		let startX = 0;
		let scrollLeft = 0;

		element.addEventListener('touchstart', (e) => {
			isScrolling = false;
			startX = e.touches[0].pageX - element.offsetLeft;
			scrollLeft = element.scrollLeft;
			this.touchStartTime = Date.now();
		}, { passive: true });

		element.addEventListener('touchmove', (e) => {
			if (!isScrolling) {
				isScrolling = true;
				element.classList.add('scrolling');
			}

			const x = e.touches[0].pageX - element.offsetLeft;
			const walk = (x - startX) * 2; // Adjust scroll speed
			element.scrollLeft = scrollLeft - walk;
		}, { passive: true });

		element.addEventListener('touchend', () => {
			const touchDuration = Date.now() - this.touchStartTime;

			setTimeout(() => {
				isScrolling = false;
				element.classList.remove('scrolling');
			}, touchDuration < 150 ? 100 : 0);
		}, { passive: true });

		// Add momentum scrolling
		this.addMomentumScrolling(element);
	}

	/**
	 * Add momentum scrolling
	 */
	addMomentumScrolling(element) {
		let velocity = 0;
		let lastScrollLeft = element.scrollLeft;
		let lastTime = Date.now();

		element.addEventListener('scroll', () => {
			const now = Date.now();
			const timeDiff = now - lastTime;
			const scrollDiff = element.scrollLeft - lastScrollLeft;

			velocity = scrollDiff / timeDiff;
			lastScrollLeft = element.scrollLeft;
			lastTime = now;
		}, { passive: true });

		element.addEventListener('touchend', () => {
			if (Math.abs(velocity) > 0.5) {
				this.animateMomentum(element, velocity);
			}
		}, { passive: true });
	}

	/**
	 * Animate momentum scrolling
	 */
	animateMomentum(element, initialVelocity) {
		let velocity = initialVelocity;
		const deceleration = 0.95;

		const animate = () => {
			velocity *= deceleration;
			element.scrollLeft += velocity * 16; // 16ms frame time

			if (Math.abs(velocity) > 0.1) {
				requestAnimationFrame(animate);
			}
		};

		requestAnimationFrame(animate);
	}

	/**
	 * Enhance touch targets
	 */
	enhanceTouchTargets() {
		const touchTargets = document.querySelectorAll(
			'button, .post-action, .category-tab, .sidebar-link, .header-btn, .subscribe-btn-small'
		);

		touchTargets.forEach(target => {
			this.ensureMinimumTouchTarget(target);
			this.addTouchFeedback(target);
		});
	}

	/**
	 * Ensure minimum touch target size
	 */
	ensureMinimumTouchTarget(element) {
		const minSize = 44; // iOS recommended minimum
		const rect = element.getBoundingClientRect();

		if (rect.width < minSize || rect.height < minSize) {
			element.style.minWidth = `${minSize}px`;
			element.style.minHeight = `${minSize}px`;
			element.style.display = 'flex';
			element.style.alignItems = 'center';
			element.style.justifyContent = 'center';
		}
	}

	/**
	 * Add touch feedback
	 */
	addTouchFeedback(element) {
		element.addEventListener('touchstart', () => {
			element.classList.add('touch-active');
		}, { passive: true });

		element.addEventListener('touchend', () => {
			setTimeout(() => {
				element.classList.remove('touch-active');
			}, 150);
		}, { passive: true });

		element.addEventListener('touchcancel', () => {
			element.classList.remove('touch-active');
		}, { passive: true });
	}

	/**
	 * Disable text selection for UI elements
	 */
	disableTextSelectionForUI() {
		const uiElements = document.querySelectorAll(
			'.header, .sidebar, .category-tabs, .post-actions, .pagination'
		);

		uiElements.forEach(element => {
			element.style.userSelect = 'none';
			element.style.webkitUserSelect = 'none';
			element.style.webkitTouchCallout = 'none';
		});
	}

	/**
	 * Improve touch feedback for all interactive elements
	 */
	improveTouchFeedback() {
		// Add CSS for touch states
		const style = document.createElement('style');
		style.textContent = `
			.touch-device .touch-active {
				opacity: 0.7 !important;
				transform: scale(0.98) !important;
				transition: opacity 0.1s ease, transform 0.1s ease !important;
			}

			.touch-device .scrolling {
				pointer-events: none;
			}

			.touch-device .category-tabs {
				scrollbar-width: none;
				-ms-overflow-style: none;
			}

			.touch-device .category-tabs::-webkit-scrollbar {
				display: none;
			}

			.touch-device .masonry-card {
				-webkit-tap-highlight-color: rgba(0, 0, 0, 0.1);
				tap-highlight-color: rgba(0, 0, 0, 0.1);
			}
		`;

		document.head.appendChild(style);
	}

	/**
	 * Setup swipe gestures
	 */
	setupSwipeGestures() {
		this.setupSidebarSwipe();
		this.setupCardSwipes();
	}

	/**
	 * Setup sidebar swipe gesture
	 */
	setupSidebarSwipe() {
		let startX = 0;
		let startY = 0;
		let isSwipeGesture = false;

		document.addEventListener('touchstart', (e) => {
			startX = e.touches[0].clientX;
			startY = e.touches[0].clientY;
			isSwipeGesture = false;
		}, { passive: true });

		document.addEventListener('touchmove', (e) => {
			if (!isSwipeGesture) {
				const currentX = e.touches[0].clientX;
				const currentY = e.touches[0].clientY;
				const diffX = Math.abs(currentX - startX);
				const diffY = Math.abs(currentY - startY);

				// Check if it's a horizontal swipe
				if (diffX > diffY && diffX > 30) {
					isSwipeGesture = true;
				}
			}
		}, { passive: true });

		document.addEventListener('touchend', (e) => {
			if (isSwipeGesture) {
				const endX = e.changedTouches[0].clientX;
				const diffX = endX - startX;

				// Only handle swipes on mobile
				if (window.innerWidth <= 767) {
					// Swipe right from left edge to open sidebar
					if (startX < 50 && diffX > 100) {
						this.triggerSidebarOpen();
					}
					// Swipe left to close sidebar
					else if (diffX < -100) {
						this.triggerSidebarClose();
					}
				}
			}
		}, { passive: true });
	}

	/**
	 * Setup card swipe gestures
	 */
	setupCardSwipes() {
		const cards = document.querySelectorAll('.masonry-card, .post-card');

		cards.forEach(card => {
			this.addCardSwipeGesture(card);
		});
	}

	/**
	 * Add swipe gesture to card
	 */
	addCardSwipeGesture(card) {
		let startX = 0;
		let startTime = 0;

		card.addEventListener('touchstart', (e) => {
			startX = e.touches[0].clientX;
			startTime = Date.now();
		}, { passive: true });

		card.addEventListener('touchend', (e) => {
			const endX = e.changedTouches[0].clientX;
			const endTime = Date.now();
			const diffX = endX - startX;
			const duration = endTime - startTime;

			// Quick swipe right on card (share action)
			if (diffX > 100 && duration < 300) {
				this.triggerCardShare(card);
			}
			// Quick swipe left on card (save action)
			else if (diffX < -100 && duration < 300) {
				this.triggerCardSave(card);
			}
		}, { passive: true });
	}

	/**
	 * Trigger sidebar open
	 */
	triggerSidebarOpen() {
		if (typeof window.toggleSidebar === 'function') {
			const sidebar = document.querySelector('.sidebar');
			if (sidebar && !sidebar.classList.contains('open')) {
				window.toggleSidebar();
				this.provideTactileFeedback();
			}
		}
	}

	/**
	 * Trigger sidebar close
	 */
	triggerSidebarClose() {
		if (typeof window.toggleSidebar === 'function') {
			const sidebar = document.querySelector('.sidebar');
			if (sidebar && sidebar.classList.contains('open')) {
				window.toggleSidebar();
				this.provideTactileFeedback();
			}
		}
	}

	/**
	 * Trigger card share
	 */
	triggerCardShare(card) {
		const shareAction = card.querySelector('[data-action="share"]');
		if (shareAction) {
			shareAction.click();
			this.provideTactileFeedback();
			this.showSwipeHint(card, 'Shared!');
		}
	}

	/**
	 * Trigger card save
	 */
	triggerCardSave(card) {
		const saveAction = card.querySelector('[data-action="save"]');
		if (saveAction) {
			saveAction.click();
			this.provideTactileFeedback();
			this.showSwipeHint(card, 'Saved!');
		}
	}

	/**
	 * Provide tactile feedback
	 */
	provideTactileFeedback() {
		if (navigator.vibrate) {
			navigator.vibrate(50); // Short vibration
		}
	}

	/**
	 * Show swipe hint
	 */
	showSwipeHint(element, message) {
		const hint = document.createElement('div');
		hint.textContent = message;
		hint.style.cssText = `
			position: fixed;
			top: 50%;
			left: 50%;
			transform: translate(-50%, -50%);
			background: var(--color-primary);
			color: white;
			padding: var(--space-md) var(--space-lg);
			border-radius: var(--radius-base);
			font-size: var(--font-size-base);
			font-weight: var(--font-weight-medium);
			z-index: 9999;
			pointer-events: none;
			opacity: 0;
			transition: opacity 0.3s ease;
		`;

		document.body.appendChild(hint);

		// Animate in
		requestAnimationFrame(() => {
			hint.style.opacity = '1';
		});

		// Remove after delay
		setTimeout(() => {
			hint.style.opacity = '0';
			setTimeout(() => {
				document.body.removeChild(hint);
			}, 300);
		}, 1500);
	}

	/**
	 * Add touch improvements to new elements
	 */
	addTouchImprovementsToElement(element) {
		if (!this.isTouchDevice) return;

		// Check if it's a touch target
		const isTouchTarget = element.matches(
			'button, .post-action, .category-tab, .sidebar-link, .header-btn, .subscribe-btn-small'
		);

		if (isTouchTarget) {
			this.ensureMinimumTouchTarget(element);
			this.addTouchFeedback(element);
		}

		// Check if it's a scrollable element
		const isScrollable = element.matches(
			'.category-tabs, .featured-carousel, .horizontal-scroll'
		);

		if (isScrollable) {
			this.enhanceHorizontalScrolling(element);
		}

		// Check if it's a card
		const isCard = element.matches('.masonry-card, .post-card');

		if (isCard) {
			this.addCardSwipeGesture(element);
		}
	}

	/**
	 * Get touch capabilities
	 */
	getTouchCapabilities() {
		return {
			hasTouch: this.isTouchDevice,
			maxTouchPoints: navigator.maxTouchPoints || 0,
			hasVibration: !!navigator.vibrate,
			scrollElements: this.scrollElements.length
		};
	}

	/**
	 * Destroy touch improvements
	 */
	destroy() {
		// Remove touch-device class
		document.documentElement.classList.remove('touch-device');

		// Remove event listeners (these are mostly passive, so cleanup is minimal)
		console.log('👆 Touch Improvements destroyed');
	}
}