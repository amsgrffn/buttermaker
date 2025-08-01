/**
 * Core theme initialization and utilities
 */

/**
 * Initialize core theme functionality
 */
export function initializeTheme() {
	// Set theme version for debugging
	window.THEME_VERSION = '1.0.0';

	// Initialize CSS custom properties for dynamic theming
	initializeCSSCustomProperties();

	// Handle initial responsive behavior
	handleResponsiveInit();

	// Initialize performance optimizations
	initializePerformanceOptimizations();
}

/**
 * Initialize CSS custom properties for dynamic theming
 */
function initializeCSSCustomProperties() {
	const root = document.documentElement;

	// Set dynamic viewport units for mobile
	const setVH = () => {
		const vh = window.innerHeight * 0.01;
		root.style.setProperty('--vh', `${vh}px`);
	};

	setVH();
	window.addEventListener('resize', debounce(setVH, 100));

	// Set header height based on mobile/desktop
	const updateHeaderHeight = () => {
		const isMobile = window.innerWidth <= 767;
		const headerHeight = isMobile ? '56px' : '60px';
		root.style.setProperty('--current-header-height', headerHeight);
	};

	updateHeaderHeight();
	window.addEventListener('resize', debounce(updateHeaderHeight, 100));
}

/**
 * Handle responsive behavior initialization
 */
function handleResponsiveInit() {
	// Add resize event listener with debouncing
	let resizeTimer;

	window.addEventListener('resize', function() {
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function() {
			// Dispatch custom resize event for modules to listen to
			window.dispatchEvent(new CustomEvent('themeResize', {
				detail: {
					width: window.innerWidth,
					height: window.innerHeight,
					isMobile: window.innerWidth <= 767,
					isTablet: window.innerWidth > 767 && window.innerWidth <= 1199,
					isDesktop: window.innerWidth >= 1200
				}
			}));
		}, 150);
	});
}

/**
 * Initialize performance optimizations
 */
function initializePerformanceOptimizations() {
	// Lazy load images
	if ('IntersectionObserver' in window) {
		const imageObserver = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					const img = entry.target;
					img.src = img.dataset.src || img.src;
					img.classList.remove('lazy');
					observer.unobserve(img);
				}
			});
		});

		document.querySelectorAll('img[loading="lazy"]').forEach(img => {
			imageObserver.observe(img);
		});
	}

	// Preload critical fonts
	preloadCriticalResources();
}

/**
 * Preload critical resources
 */
function preloadCriticalResources() {
	// This would typically preload web fonts or critical CSS
	// For system fonts, we don't need this, but keeping for future use
}

/**
 * Utility functions
 */

/**
 * Debounce function for performance
 */
export function debounce(func, wait, immediate) {
	let timeout;
	return function executedFunction(...args) {
		const later = () => {
			timeout = null;
			if (!immediate) func(...args);
		};
		const callNow = immediate && !timeout;
		clearTimeout(timeout);
		timeout = setTimeout(later, wait);
		if (callNow) func(...args);
	};
}

/**
 * Throttle function for performance
 */
export function throttle(func, limit) {
	let inThrottle;
	return function() {
		const args = arguments;
		const context = this;
		if (!inThrottle) {
			func.apply(context, args);
			inThrottle = true;
			setTimeout(() => inThrottle = false, limit);
		}
	};
}

/**
 * Check if element is in viewport
 */
export function isInViewport(element, offset = 0) {
	const rect = element.getBoundingClientRect();
	return (
		rect.top >= -offset &&
		rect.left >= -offset &&
		rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) + offset &&
		rect.right <= (window.innerWidth || document.documentElement.clientWidth) + offset
	);
}

/**
 * Smooth scroll to element
 */
export function smoothScrollTo(element, offset = 0) {
	if (!element) return;

	const elementPosition = element.getBoundingClientRect().top + window.pageYOffset;
	const offsetPosition = elementPosition - offset;

	window.scrollTo({
		top: offsetPosition,
		behavior: 'smooth'
	});
}

/**
 * Get breakpoint information
 */
export function getBreakpoint() {
	const width = window.innerWidth;

	if (width <= 375) return 'xs';
	if (width <= 767) return 'sm';
	if (width <= 1199) return 'md';
	if (width <= 1399) return 'lg';
	return 'xl';
}

/**
 * Analytics tracking helper
 */
export function trackEvent(category, action, label, value) {
	// Google Analytics 4
	if (typeof gtag !== 'undefined') {
		gtag('event', action, {
			event_category: category,
			event_label: label,
			value: value
		});
	}

	// Custom analytics
	if (window.analytics && typeof window.analytics.track === 'function') {
		window.analytics.track(action, {
			category,
			label,
			value
		});
	}

	// Console log for development
	if (process.env.NODE_ENV === 'development') {
		console.log('📊 Analytics Event:', { category, action, label, value });
	}
}