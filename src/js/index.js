/**
 * Substack-Style Ghost Theme JavaScript Entry Point
 */

import { initializeTheme } from './modules/theme';
import { DarkMode } from './modules/dark-mode';
import { MobileNavigation } from './modules/mobile-navigation';
import { CategoryTabs } from './modules/category-tabs';
import { SubscribeButtons } from './modules/subscribe-buttons';
import { PostActions } from './modules/post-actions';
import { MasonryGrid } from './modules/masonry-grid';
import { SearchHandler } from './modules/search';
import { TouchImprovements } from './modules/touch-improvements';
import { PortalIntegration } from './modules/portal-integration';
import { HorizontalScroll } from './modules/horizontal-scroll';
import { SidebarDropdown } from './modules/sidebar-dropdown';
import { InfiniteScroll } from './modules/infinite-scroll';
import { initSocialSharing } from './modules/social-sharing';
import { initTestimonials } from './modules/testimonials';
import { initWeatherDisplay } from './modules/weather-display';
import { initKnicksCounter } from './modules/knicks-counter';
import { initPriceToggle } from './modules/price-toggle';
import { BreadcrumbDropdown } from './modules/breadcrumb-dropdown';
import { initCurrentTime } from './modules/current-time';
import { BlogPostDisplay } from './modules/blog-post-display';
import { initRotatingQuotes } from './modules/rotating-quotes';

import {
  initShortDateFormatter,
  observeNewDates,
} from './modules/short-date-formatter';

/**
 * Initialize theme when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function () {
  console.log('🎨 Substack-Style Theme Loading...');

  try {
    // Initialize core theme functionality
    initializeTheme();

    // Initialize dark mode (should be early in the initialization)
    const darkMode = new DarkMode();

    // Initialize mobile navigation (needed on all pages)
    const mobileNav = new MobileNavigation();

    // Only initialize if elements exist on the page
    if (document.querySelector('.category-tab')) {
      const categoryTabs = new CategoryTabs();
    }

    if (document.querySelector('.subscribe-btn, [data-portal]')) {
      const subscribeButtons = new SubscribeButtons();
    }

    if (document.querySelector('.post-action')) {
      const postActions = new PostActions();
    }

    if (document.querySelector('.masonry-grid')) {
      const masonryGrid = new MasonryGrid();
    }

    if (document.querySelector('.search-trigger, .search-container')) {
      const searchHandler = new SearchHandler();
    }

    // Initialize touch improvements (needed on all pages)
    const touchImprovements = new TouchImprovements();

    if (document.querySelector('[data-portal]')) {
      const portalIntegration = new PortalIntegration();
    }

    if (document.querySelector('.horizontal-scroll-section')) {
      const horizontalScroll = new HorizontalScroll();
    }

    if (document.querySelector('.has-dropdown')) {
      const sidebarDropdown = new SidebarDropdown();
    }

    if (document.querySelector('#load-more-btn')) {
      const infiniteScroll = new InfiniteScroll();
    }

    if (document.querySelector('.breadcrumb-dropdown')) {
      const breadcrumbDropdown = new BreadcrumbDropdown();
    }
    // Initialize rotating quotes if element exists
    if (document.querySelector('.end-credits')) {
      initRotatingQuotes();
    }

    const blogPostDisplay = new BlogPostDisplay();

    // Initialize utility functions
    initSocialSharing();
    initTestimonials();
    initWeatherDisplay();
    initKnicksCounter();
    initPriceToggle();
    initCurrentTime();
    initShortDateFormatter();

    // Make mobile navigation globally available
    window.toggleSidebar = mobileNav.toggleSidebar.bind(mobileNav);

    console.log('✅ Substack-Style Theme Loaded Successfully');
  } catch (error) {
    console.error('❌ Theme initialization error:', error);
  }
});

/**
 * Handle window load for additional functionality
 */
window.addEventListener('load', function () {
  // Add any post-load functionality here
  observeNewDates();
  console.log('🚀 Theme fully loaded');
});

/**
 * Handle errors gracefully
 */
window.addEventListener('error', function (event) {
  console.error('Theme error:', event.error);
});
