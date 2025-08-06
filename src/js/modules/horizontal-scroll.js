/**
 * Horizontal Scroll Component
 * Handles smooth scrolling and touch interactions for horizontal content sections
 */

export class HorizontalScroll {
	constructor() {
		this.containers = [];
		this.init();
	}

	init() {
		// Find all horizontal scroll sections
		const sections = document.querySelectorAll('.horizontal-scroll-section');

		sections.forEach(section => {
			this.setupSection(section);
		});

		console.log(`📜 Initialized ${sections.length} horizontal scroll sections`);
	}

	setupSection(section) {
		const track = section.querySelector('.horizontal-scroll-track');
		const prevBtn = section.querySelector('.scroll-btn-prev');
		const nextBtn = section.querySelector('.scroll-btn-next');

		if (!track) return;

		const container = {
			section,
			track,
			prevBtn,
			nextBtn,
			scrollAmount: 295 + 16, // Card width + gap
			isScrolling: false
		};

		// Set up button event listeners
		if (prevBtn) {
			prevBtn.addEventListener('click', () => this.scrollPrev(container));
		}

		if (nextBtn) {
			nextBtn.addEventListener('click', () => this.scrollNext(container));
		}

		// Set up scroll event listener to update button states
		track.addEventListener('scroll', () => this.updateButtonStates(container));

		// Set up touch/mouse drag scrolling
		this.setupDragScrolling(container);

		// Set up keyboard navigation
		this.setupKeyboardNavigation(container);

		// Initial button state update
		this.updateButtonStates(container);

		// Store container reference
		this.containers.push(container);
	}

	scrollPrev(container) {
		if (container.isScrolling) return;

		container.isScrolling = true;
		const currentScroll = container.track.scrollLeft;
		const targetScroll = Math.max(0, currentScroll - container.scrollAmount);

		this.smoothScrollTo(container.track, targetScroll, () => {
			container.isScrolling = false;
			this.updateButtonStates(container);
		});
	}

	scrollNext(container) {
		if (container.isScrolling) return;

		container.isScrolling = true;
		const currentScroll = container.track.scrollLeft;
		const maxScroll = container.track.scrollWidth - container.track.clientWidth;
		const targetScroll = Math.min(maxScroll, currentScroll + container.scrollAmount);

		this.smoothScrollTo(container.track, targetScroll, () => {
			container.isScrolling = false;
			this.updateButtonStates(container);
		});
	}

	smoothScrollTo(element, targetPosition, callback) {
		const startPosition = element.scrollLeft;
		const distance = targetPosition - startPosition;
		const duration = 300;
		let startTime = null;

		const animation = (currentTime) => {
			if (startTime === null) startTime = currentTime;
			const timeElapsed = currentTime - startTime;
			const progress = Math.min(timeElapsed / duration, 1);

			// Easing function (ease-out)
			const easeOut = 1 - Math.pow(1 - progress, 3);

			element.scrollLeft = startPosition + (distance * easeOut);

			if (progress < 1) {
				requestAnimationFrame(animation);
			} else if (callback) {
				callback();
			}
		};

		requestAnimationFrame(animation);
	}

	updateButtonStates(container) {
		if (!container.prevBtn || !container.nextBtn) return;

		const { track } = container;
		const isAtStart = track.scrollLeft <= 0;
		const isAtEnd = track.scrollLeft >= track.scrollWidth - track.clientWidth - 1;

		// Update button states
		container.prevBtn.disabled = isAtStart;
		container.nextBtn.disabled = isAtEnd;

		// Update button styling
		container.prevBtn.style.opacity = isAtStart ? '0.5' : '1';
		container.nextBtn.style.opacity = isAtEnd ? '0.5' : '1';
	}

	setupDragScrolling(container) {
		const { track } = container;
		let isDown = false;
		let startX;
		let scrollLeft;

		// Mouse events
		track.addEventListener('mousedown', (e) => {
			isDown = true;
			track.style.cursor = 'grabbing';
			startX = e.pageX - track.offsetLeft;
			scrollLeft = track.scrollLeft;
			e.preventDefault();
		});

		track.addEventListener('mouseleave', () => {
			isDown = false;
			track.style.cursor = 'grab';
		});

		track.addEventListener('mouseup', () => {
			isDown = false;
			track.style.cursor = 'grab';
		});

		track.addEventListener('mousemove', (e) => {
			if (!isDown) return;
			e.preventDefault();
			const x = e.pageX - track.offsetLeft;
			const walk = (x - startX) * 2;
			track.scrollLeft = scrollLeft - walk;
		});

		// Touch events for mobile
		let touchStartX = 0;
		let touchScrollLeft = 0;

		track.addEventListener('touchstart', (e) => {
			touchStartX = e.touches[0].pageX;
			touchScrollLeft = track.scrollLeft;
		}, { passive: true });

		track.addEventListener('touchmove', (e) => {
			if (!touchStartX) return;
			const touchX = e.touches[0].pageX;
			const walk = touchStartX - touchX;
			track.scrollLeft = touchScrollLeft + walk;
		}, { passive: true });

		track.addEventListener('touchend', () => {
			touchStartX = 0;
		}, { passive: true });

		// Set initial cursor
		track.style.cursor = 'grab';
	}

	setupKeyboardNavigation(container) {
		const { section } = container;

		section.addEventListener('keydown', (e) => {
			// Only handle if focus is within the section
			if (!section.contains(document.activeElement)) return;

			switch (e.key) {
				case 'ArrowLeft':
					e.preventDefault();
					this.scrollPrev(container);
					break;
				case 'ArrowRight':
					e.preventDefault();
					this.scrollNext(container);
					break;
				case 'Home':
					e.preventDefault();
					this.scrollToStart(container);
					break;
				case 'End':
					e.preventDefault();
					this.scrollToEnd(container);
					break;
			}
		});
	}

	scrollToStart(container) {
		container.track.scrollLeft = 0;
		this.updateButtonStates(container);
	}

	scrollToEnd(container) {
		const maxScroll = container.track.scrollWidth - container.track.clientWidth;
		container.track.scrollLeft = maxScroll;
		this.updateButtonStates(container);
	}

	// Public methods for external control
	scrollToIndex(sectionIndex, cardIndex) {
		if (!this.containers[sectionIndex]) return;

		const container = this.containers[sectionIndex];
		const targetPosition = cardIndex * container.scrollAmount;
		const maxScroll = container.track.scrollWidth - container.track.clientWidth;

		this.smoothScrollTo(
			container.track,
			Math.min(targetPosition, maxScroll),
			() => this.updateButtonStates(container)
		);
	}

	refresh() {
		// Refresh all containers (useful after content changes)
		this.containers.forEach(container => {
			this.updateButtonStates(container);
		});
	}

	destroy() {
		// Clean up event listeners
		this.containers.forEach(container => {
			const { section, track, prevBtn, nextBtn } = container;

			if (prevBtn) {
				prevBtn.replaceWith(prevBtn.cloneNode(true));
			}
			if (nextBtn) {
				nextBtn.replaceWith(nextBtn.cloneNode(true));
			}

			track.replaceWith(track.cloneNode(true));
		});

		this.containers = [];
		console.log('📜 Horizontal scroll destroyed');
	}
}