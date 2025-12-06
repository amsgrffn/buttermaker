/**
 * The Pile - Scattered card layout with hover interactions
 * Creates a messy, overlapping pile of cards that can be "picked up" on hover
 */

export class ThePile {
  constructor() {
    this.pile = document.querySelector('.the-pile');
    if (!this.pile) return;

    this.cards = this.pile.querySelectorAll('.pile-card');
    if (this.cards.length === 0) return;

    this.isMobile = window.innerWidth < 768;
    this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

    this.init();
  }

  init() {
    console.log('🃏 The Pile initializing with', this.cards.length, 'cards');

    // Scatter cards on load
    this.scatterCards();

    // Add hover interactions
    this.addHoverInteractions();

    // Add keyboard accessibility
    this.addKeyboardSupport();

    // Handle window resize
    this.handleResize();

    console.log('✅ The Pile initialized');
  }

  scatterCards() {
    // Adjust scatter range based on device
    let rotationRange, xRange, yRange;

    if (this.isMobile) {
      // Minimal scatter on mobile
      rotationRange = 8;
      xRange = 40;
      yRange = 40;
    } else if (this.isTablet) {
      // Medium scatter on tablet
      rotationRange = 12;
      xRange = 150;
      yRange = 120;
    } else {
      // Full scatter on desktop - spread across more of the container
      rotationRange = 15;
      xRange = 290;
      yRange = 200;
    }

    this.cards.forEach((card, index) => {
      // Random rotation
      const rotation = Math.random() * (rotationRange * 2) - rotationRange;

      // Random position offset
      const xOffset = Math.random() * (xRange * 2) - xRange;
      const yOffset = Math.random() * (yRange * 2) - yRange;

      // Random z-index for natural stacking
      const zIndex = Math.floor(Math.random() * this.cards.length);

      // Store original transforms
      card.dataset.originalRotation = rotation;
      card.dataset.originalX = xOffset;
      card.dataset.originalY = yOffset;
      card.dataset.originalZ = zIndex;

      // Apply initial scattered state
      card.style.transform = `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg)`;
      card.style.zIndex = zIndex;
    });
  }

  addHoverInteractions() {
    this.cards.forEach((card) => {
      // Mouse enter - "pick up" the card
      card.addEventListener('mouseenter', () => {
        this.pickUpCard(card);
      });

      // Mouse leave - "put down" the card
      card.addEventListener('mouseleave', () => {
        this.putDownCard(card);
      });

      // Touch support for mobile
      card.addEventListener('touchstart', (e) => {
        // Prevent default to avoid hover issues on mobile
        if (this.isMobile) {
          this.pickUpCard(card);
          // Auto put down after a delay on mobile
          setTimeout(() => {
            this.putDownCard(card);
          }, 2000);
        }
      });
    });
  }

  pickUpCard(card) {
    // Bring to front
    card.style.zIndex = this.cards.length + 10;

    // Straighten and scale up
    const xOffset = card.dataset.originalX;
    const yOffset = card.dataset.originalY;
    const scaleAmount = this.isMobile ? 1.05 : 1.08;

    card.style.transform = `translate(${xOffset}px, ${yOffset}px) rotate(0deg) scale(${scaleAmount})`;
    card.classList.add('pile-card--active');

    // Dim other cards
    this.cards.forEach((otherCard) => {
      if (otherCard !== card) {
        otherCard.classList.add('pile-card--dimmed');
      }
    });
  }

  putDownCard(card) {
    // Return to original z-index
    card.style.zIndex = card.dataset.originalZ;

    // Return to messy state
    const rotation = card.dataset.originalRotation;
    const xOffset = card.dataset.originalX;
    const yOffset = card.dataset.originalY;

    card.style.transform = `translate(${xOffset}px, ${yOffset}px) rotate(${rotation}deg) scale(1)`;
    card.classList.remove('pile-card--active');

    // Remove dimming from all cards
    this.cards.forEach((otherCard) => {
      otherCard.classList.remove('pile-card--dimmed');
    });
  }

  addKeyboardSupport() {
    this.cards.forEach((card) => {
      // Make cards focusable
      if (!card.hasAttribute('tabindex')) {
        card.setAttribute('tabindex', '0');
      }

      // Focus events mirror hover
      card.addEventListener('focus', () => {
        this.pickUpCard(card);
      });

      card.addEventListener('blur', () => {
        this.putDownCard(card);
      });

      // Enter key to follow link
      card.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
          const link = card.querySelector('a');
          if (link) {
            link.click();
          }
        }
      });
    });
  }

  handleResize() {
    let resizeTimer;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        const wasMobile = this.isMobile;
        const wasTablet = this.isTablet;

        this.isMobile = window.innerWidth < 768;
        this.isTablet = window.innerWidth >= 768 && window.innerWidth < 1024;

        // Re-scatter if device type changed
        if (
          wasMobile !== this.isMobile ||
          wasTablet !== this.isTablet
        ) {
          this.scatterCards();
        }
      }, 250);
    });
  }
}
