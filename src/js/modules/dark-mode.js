/**
 * Dark Mode Toggle Module
 * Handles dark mode toggle with system preference detection and localStorage persistence
 */

export class DarkMode {
  constructor() {
    this.storageKey = 'theme-preference';
    this.toggleButton = null;
    this.init();
  }

  /**
   * Initialize dark mode
   */
  init() {
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

    // Set up toggle button
    this.setupToggleButton();
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

    // Update toggle button if it exists
    this.updateToggleButton();
  }

  /**
   * Toggle between light and dark mode
   */
  toggleTheme() {
    const isDark = document.body.classList.contains('dark-mode');
    const newTheme = isDark ? 'light' : 'dark';

    this.applyTheme(newTheme);
    localStorage.setItem(this.storageKey, newTheme);
  }

  /**
   * Set up the toggle button
   */
  setupToggleButton() {
    this.toggleButton = document.getElementById('dark-mode-toggle');

    if (this.toggleButton) {
      this.toggleButton.addEventListener('click', () => {
        this.toggleTheme();
      });

      // Update button state
      this.updateToggleButton();
    }
  }

  /**
   * Update toggle button appearance
   */
  updateToggleButton() {
    if (!this.toggleButton) return;

    const isDark = document.body.classList.contains('dark-mode');
    const icon = this.toggleButton.querySelector('.theme-icon');

    if (icon) {
      // Update aria-label for accessibility
      this.toggleButton.setAttribute(
        'aria-label',
        isDark ? 'Switch to light mode' : 'Switch to dark mode',
      );

      // Update icon (you'll add SVG icons in the next step)
      icon.innerHTML = isDark ? this.getSunIcon() : this.getMoonIcon();
    }
  }

  /**
   * Get moon icon SVG (for light mode - clicking will enable dark)
   */
  getMoonIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
	  <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path>
	</svg>`;
  }

  /**
   * Get sun icon SVG (for dark mode - clicking will enable light)
   */
  getSunIcon() {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
	  <circle cx="12" cy="12" r="5"></circle>
	  <line x1="12" y1="1" x2="12" y2="3"></line>
	  <line x1="12" y1="21" x2="12" y2="23"></line>
	  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line>
	  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line>
	  <line x1="1" y1="12" x2="3" y2="12"></line>
	  <line x1="21" y1="12" x2="23" y2="12"></line>
	  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line>
	  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line>
	</svg>`;
  }
}
