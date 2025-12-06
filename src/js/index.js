/**
 * Substack-Style Ghost Theme JavaScript Entry Point
 * Optimized with dynamic imports for better performance
 */

import { initializeTheme } from './modules/theme';
import { DarkMode } from './modules/dark-mode';
import { MobileNavigation } from './modules/mobile-navigation';
import { TouchImprovements } from './modules/touch-improvements';

import {
  initShortDateFormatter,
  observeNewDates,
} from './modules/short-date-formatter';

/**
 * Initialize theme when DOM is ready
 */
document.addEventListener('DOMContentLoaded', async function () {
  const startTime = performance.now();
  console.log('🎨 Substack-Style Theme Loading...');

  try {
    // ============================================
    // CRITICAL: Load these immediately (always needed)
    // ============================================

    initializeTheme();
    const darkMode = new DarkMode();
    const mobileNav = new MobileNavigation();
    const touchImprovements = new TouchImprovements();
    initShortDateFormatter();

    // Make mobile navigation globally available
    window.toggleSidebar = mobileNav.toggleSidebar.bind(mobileNav);

    // ============================================
    // DYNAMIC: Load only when DOM elements exist
    // ============================================

    // Category Tabs
    if (document.querySelector('.category-tab')) {
      import('./modules/category-tabs').then(({ CategoryTabs }) => {
        new CategoryTabs();
        console.log('📊 Category Tabs loaded');
      });
    }

    // Subscribe & Portal
    if (document.querySelector('.subscribe-btn, [data-portal]')) {
      Promise.all([
        import('./modules/subscribe-buttons'),
        import('./modules/portal-integration'),
      ]).then(([{ SubscribeButtons }, { PortalIntegration }]) => {
        new SubscribeButtons();
        new PortalIntegration();
        console.log('💌 Subscribe & Portal loaded');
      });
    }

    // Post Actions
    if (document.querySelector('.post-action')) {
      import('./modules/post-actions').then(({ PostActions }) => {
        new PostActions();
        console.log('👍 Post Actions loaded');
      });
    }

    // Masonry Grid
    if (document.querySelector('.masonry-grid')) {
      import('./modules/masonry-grid').then(({ MasonryGrid }) => {
        window.MasonryGrid = new MasonryGrid(); // Store globally
        console.log('🧱 Masonry Grid loaded');
      });
    }

    // The Pile
    if (document.querySelector('.the-pile')) {
      import('./modules/the-pile').then(({ ThePile }) => {
        new ThePile();
        console.log('🃏 The Pile loaded');
      });
    }

    // Search Handler
    if (document.querySelector('.search-trigger, .search-container')) {
      import('./modules/search').then(({ SearchHandler }) => {
        new SearchHandler();
        console.log('🔍 Search loaded');
      });
    }

    // Horizontal Scroll
    if (document.querySelector('.horizontal-scroll-section')) {
      import('./modules/horizontal-scroll').then(({ HorizontalScroll }) => {
        new HorizontalScroll();
        console.log('↔️ Horizontal Scroll loaded');
      });
    }

    // Sidebar Dropdown
    if (document.querySelector('.has-dropdown')) {
      import('./modules/sidebar-dropdown').then(({ SidebarDropdown }) => {
        new SidebarDropdown();
        console.log('📂 Sidebar Dropdown loaded');
      });
    }

    // Infinite Scroll - with retry logic for tag pages
    const initInfiniteScroll = () => {
      console.log('🔍 Checking for load-more-btn...');
      const loadMoreBtn = document.querySelector('#load-more-btn');
      console.log('Load more button:', loadMoreBtn);

      if (loadMoreBtn) {
        console.log(
          '🎯 Load more button found! Loading infinite scroll module...',
        );
        import('./modules/infinite-scroll').then(({ InfiniteScroll }) => {
          console.log('📦 Infinite scroll module imported');
          new InfiniteScroll();
          console.log('♾️ Infinite Scroll loaded');
        });
      } else {
        console.log(
          '⏳ Load more button not found yet, will retry in 500ms...',
        );
        // Retry after a short delay for dynamically loaded content
        setTimeout(() => {
          const retryBtn = document.querySelector('#load-more-btn');
          console.log('🔄 Retry - Load more button:', retryBtn);
          if (retryBtn) {
            console.log('🎯 Load more button found on retry!');
            import('./modules/infinite-scroll').then(({ InfiniteScroll }) => {
              console.log('📦 Infinite scroll module imported (retry)');
              new InfiniteScroll();
              console.log('♾️ Infinite Scroll loaded (retry)');
            });
          } else {
            console.log('📄 No load more button found after retry');
          }
        }, 500);
      }
    };

    // Call the function
    initInfiniteScroll();

    // Breadcrumb Dropdown
    if (document.querySelector('.breadcrumb-dropdown')) {
      import('./modules/breadcrumb-dropdown').then(({ BreadcrumbDropdown }) => {
        new BreadcrumbDropdown();
        console.log('🍞 Breadcrumb Dropdown loaded');
      });
    }

    // Blog Post Display
    if (document.querySelector('.post-container, .blog-post')) {
      import('./modules/blog-post-display').then(({ BlogPostDisplay }) => {
        new BlogPostDisplay();
        console.log('📝 Blog Post Display loaded');
      });
    }

    // ============================================
    // DEFERRED: Load after page is idle (not critical)
    // ============================================

    const loadNonCritical = () => {
      // Social Sharing
      import('./modules/social-sharing').then(({ initSocialSharing }) => {
        initSocialSharing();
      });

      // Testimonials
      if (document.querySelector('.testimonials, .testimonial-widget')) {
        import('./modules/testimonials').then(({ initTestimonials }) => {
          initTestimonials();
        });
      }

      // Weather Display
      if (document.querySelector('[data-weather]')) {
        import('./modules/weather-display').then(({ initWeatherDisplay }) => {
          initWeatherDisplay();
        });
      }

      // Knicks Counter
      if (document.querySelector('[data-knicks-counter]')) {
        import('./modules/knicks-counter').then(({ initKnicksCounter }) => {
          initKnicksCounter();
        });
      }

      // Price Toggle
      if (document.querySelector('[data-price-toggle]')) {
        import('./modules/price-toggle').then(({ initPriceToggle }) => {
          initPriceToggle();
        });
      }

      // Current Time
      if (document.querySelector('[data-current-time]')) {
        import('./modules/current-time').then(({ initCurrentTime }) => {
          initCurrentTime();
        });
      }

      // Rotating Quotes
      if (document.querySelector('.end-credits')) {
        import('./modules/rotating-quotes').then(({ initRotatingQuotes }) => {
          initRotatingQuotes();
        });
      }
    };

    // Load non-critical modules when browser is idle
    if ('requestIdleCallback' in window) {
      requestIdleCallback(loadNonCritical, { timeout: 2000 });
    } else {
      setTimeout(loadNonCritical, 1);
    }

    const loadTime = performance.now() - startTime;
    console.log(`✅ Theme Loaded in ${loadTime.toFixed(2)}ms`);
  } catch (error) {
    console.error('❌ Theme initialization error:', error);
  }
});

/**
 * Additional setup after full page load
 */
window.addEventListener('load', function () {
  observeNewDates();
  console.log('🚀 Theme fully loaded');
});

/**
 * Error handling
 */
window.addEventListener('error', function (event) {
  console.error('Theme error:', event.error);
});
