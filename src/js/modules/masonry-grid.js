/**
 * True Masonry Grid Module - 2 Columns
 * Handles true masonry layout with dynamic card positioning
 */

import { debounce, isInViewport } from './theme';

export class MasonryGrid {
  constructor() {
    this.grid = document.querySelector('.masonry-grid');
    this.cards = null; // Don't cache cards initially
    this.observer = null;
    this.columns = [];
    this.columnCount = 2;
    this.gap = 24;
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

    this.refreshCards(); // Get cards dynamically
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
   * Refresh cards collection - get current cards from DOM
   */
  refreshCards() {
    this.cards = this.grid.querySelectorAll('.masonry-card');
    console.log(`📦 Found ${this.cards.length} cards in grid`);
    return this.cards;
  }

  /**
   * Reset and re-layout masonry grid (called by category tabs)
   */
  reset() {
    console.log('🔄 Resetting masonry layout...');

    // Get fresh cards from DOM
    this.refreshCards();

    // Clear all positioning from cards
    this.cards.forEach((card) => {
      card.style.position = '';
      card.style.top = '';
      card.style.left = '';
      card.style.width = '';
      card.style.transform = '';
      card.classList.remove('positioned');
    });

    // Reset grid height
    this.grid.style.height = '';

    // Disconnect existing observer
    if (this.observer) {
      this.observer.disconnect();
    }

    // Setup new observer for new cards
    this.setupIntersectionObserver();

    // Wait for images then layout
    this.waitForImages().then(() => {
      this.layoutMasonry();
    });
  }

  /**
   * Wait for all images in cards to load
   */
  waitForImages() {
    const images = this.grid.querySelectorAll('img');
    const imagePromises = Array.from(images).map((img) => {
      return new Promise((resolve) => {
        if (img.complete) {
          resolve();
        } else {
          img.addEventListener('load', resolve);
          img.addEventListener('error', resolve);
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
      this.columnCount = 1;
      this.gap = 16;
    } else {
      this.columnCount = 2;
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

    // Refresh cards in case they changed
    this.refreshCards();

    // Reset column heights
    this.columns = new Array(this.columnCount).fill(0);

    // Calculate card width
    const containerWidth = this.grid.offsetWidth;
    const cardWidth =
      (containerWidth - this.gap * (this.columnCount - 1)) / this.columnCount;

    // Position each card
    this.cards.forEach((card, index) => {
      this.positionCard(card, cardWidth, index);
    });

    // Set grid container height
    const maxColumnHeight = Math.max(...this.columns);
    this.grid.style.height = `${maxColumnHeight}px`;

    this.isLayouting = false;
    console.log('✅ Masonry layout complete');
  }

  /**
   * Position individual card in the shortest column
   */
  positionCard(card, cardWidth, index) {
    // Skip positioning on mobile (cards stack naturally)
    if (window.innerWidth <= 767) {
      card.style.position = '';
      card.style.top = '';
      card.style.left = '';
      card.style.width = '';
      card.classList.add('positioned');
      return;
    }

    // Find shortest column
    const shortestColumnIndex = this.columns.indexOf(Math.min(...this.columns));
    const shortestColumnHeight = this.columns[shortestColumnIndex];

    // Calculate position
    const left = shortestColumnIndex * (cardWidth + this.gap);
    const top = shortestColumnHeight;

    // Apply positioning
    card.style.position = 'absolute';
    card.style.left = `${left}px`;
    card.style.top = `${top}px`;
    card.style.width = `${cardWidth}px`;

    // Get card height
    const cardHeight = card.offsetHeight;

    // Update column height
    this.columns[shortestColumnIndex] += cardHeight + this.gap;

    // Add entrance animation with stagger
    setTimeout(() => {
      card.classList.add('positioned');
    }, index * 50); // Reduced from 100ms for faster animation
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Card click handlers
    this.grid.addEventListener('click', (e) => {
      const card = e.target.closest('.masonry-card');
      if (card) {
        this.handleCardClick(e);
      }
    });

    // Window resize handler with debounce
    window.addEventListener(
      'resize',
      debounce(() => {
        this.handleResize();
      }, 150),
    );

    // Custom masonry reset event (from category tabs)
    window.addEventListener('masonryReset', () => {
      console.log('📡 Received masonryReset event');
      this.reset();
    });

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

    const link =
      card.querySelector('.masonry-link') ||
      card.querySelector('.masonry-title a');
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
      interactiveClasses.some((className) =>
        element.classList.contains(className),
      ) ||
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

    this.observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            this.handleCardVisible(entry.target);
          }
        });
      },
      {
        threshold: 0.1,
        rootMargin: '50px',
      },
    );

    // Observe all cards
    this.cards.forEach((card) => {
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

    images.forEach((img) => {
      img.src = img.dataset.src;
      img.removeAttribute('data-src');

      img.addEventListener('load', () => {
        img.style.opacity = '1';
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

    if (oldColumnCount !== this.columnCount) {
      this.cards.forEach((card) => {
        card.classList.remove('positioned');
      });

      setTimeout(() => {
        this.layoutMasonry();
      }, 100);
    } else {
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
    this.refreshCards();

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
      window.trackEvent(
        'Masonry Grid',
        'Card Click',
        title ? title.textContent : 'Unknown',
      );
    }
  }

  /**
   * Get grid statistics
   */
  getGridStats() {
    this.refreshCards();
    const totalCards = this.cards.length;
    const visibleCards = Array.from(this.cards).filter(
      (card) => card.style.display !== 'none',
    ).length;

    return {
      totalCards,
      visibleCards,
      columnCount: this.columnCount,
      gridWidth: this.grid ? this.grid.offsetWidth : 0,
      gridHeight: this.grid ? this.grid.offsetHeight : 0,
    };
  }

  /**
   * Destroy masonry grid
   */
  destroy() {
    // Disconnect observer
    if (this.observer) {
      this.observer.disconnect();
    }

    console.log('🧱 Masonry Grid destroyed');
  }
}
