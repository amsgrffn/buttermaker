/**
 * Substack-Style Ghost Theme JavaScript Entry Point
 */

import { initializeTheme } from './modules/theme';
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

/**
 * Initialize theme when DOM is ready
 */
document.addEventListener('DOMContentLoaded', function() {
	console.log('🎨 Substack-Style Theme Loading...');

	try {
		// Initialize core theme functionality
		initializeTheme();

		// Initialize individual modules
		const mobileNav = new MobileNavigation();
		const categoryTabs = new CategoryTabs();
		const subscribeButtons = new SubscribeButtons();
		const postActions = new PostActions();
		const masonryGrid = new MasonryGrid();
		const searchHandler = new SearchHandler();
		const touchImprovements = new TouchImprovements();
		const portalIntegration = new PortalIntegration();
		const horizontalScroll = new HorizontalScroll();
		const sidebarDropdown = new SidebarDropdown();
		const infiniteScroll = new InfiniteScroll();

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
window.addEventListener('load', function() {
	// Add any post-load functionality here
	console.log('🚀 Theme fully loaded');
});

/**
 * Handle errors gracefully
 */
window.addEventListener('error', function(event) {
	console.error('Theme error:', event.error);
});