/**
 * Pill-Style Dark Mode Toggle Module
 * Handles dark mode with smooth sliding animation
 */

export class DarkMode {
  constructor() {
    this.storageKey = 'theme-preference';
    this.toggleContainer = null;
    this.lightButton = null;
    this.darkButton = null;
    this.init();
  }

  /**
   * Initialize dark mode
   */
  init() {
    // IMPORTANT: Set up toggle buttons FIRST before applying theme
    // This ensures the DOM elements exist when we try to update them
    this.setupToggleButtons();

    // Check for saved preference or system preference
    const savedTheme = localStorage.getItem(this.storageKey);
    const systemPrefersDark = window.matchMedia(
      '(prefers-color-scheme: dark)',
    ).matches;

    // Apply theme based on priority: saved preference > system preference > light (default)
    if (savedTheme) {
      this.applyTheme(savedTheme);
    } else if (systemPrefersDark) {
      this.applyTheme('dark');
    } else {
      this.applyTheme('light');
    }

    // Listen for system theme changes
    window
      .matchMedia('(prefers-color-scheme: dark)')
      .addEventListener('change', (e) => {
        // Only auto-switch if user hasn't manually set a preference
        if (!localStorage.getItem(this.storageKey)) {
          this.applyTheme(e.matches ? 'dark' : 'light');
        }
      });
  }

  /**
   * Apply theme to the page
   */
  applyTheme(theme) {
    if (theme === 'dark') {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }

    // Update toggle button states
    this.updateToggleButtons(theme);
  }

  /**
   * Set up the toggle buttons
   */
  setupToggleButtons() {
    this.toggleContainer = document.getElementById('dark-mode-toggle');

    if (!this.toggleContainer) return;

    this.lightButton = this.toggleContainer.querySelector(
      '[data-theme="light"]',
    );
    this.darkButton = this.toggleContainer.querySelector('[data-theme="dark"]');

    if (this.lightButton && this.darkButton) {
      // Add click handlers
      this.lightButton.addEventListener('click', () => {
        this.setTheme('light');
      });

      this.darkButton.addEventListener('click', () => {
        this.setTheme('dark');
      });

      // Keyboard support
      this.lightButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.setTheme('light');
        }
      });

      this.darkButton.addEventListener('keydown', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          this.setTheme('dark');
        }
      });
    }
  }

  /**
   * Set theme and save preference
   */
  setTheme(theme) {
    this.applyTheme(theme);
    localStorage.setItem(this.storageKey, theme);
  }

  /**
   * Update toggle button states
   */
  updateToggleButtons(theme) {
    if (!this.toggleContainer || !this.lightButton || !this.darkButton) return;

    // Update data attribute for CSS slider positioning
    this.toggleContainer.setAttribute('data-active-theme', theme);

    // Update aria-checked states
    if (theme === 'dark') {
      this.lightButton.setAttribute('aria-checked', 'false');
      this.darkButton.setAttribute('aria-checked', 'true');
    } else {
      this.lightButton.setAttribute('aria-checked', 'true');
      this.darkButton.setAttribute('aria-checked', 'false');
    }
  }
}
