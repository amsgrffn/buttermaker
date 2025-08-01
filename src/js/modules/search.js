/**
 * Search Handler Module
 * Handles search functionality and navigation
 */

import { debounce } from './theme';

export class SearchHandler {
	constructor() {
		this.searchInput = document.querySelector('.search-input');
		this.searchIcon = document.querySelector('.search-icon');
		this.searchForm = document.querySelector('.search-form');
		this.searchHistory = this.loadSearchHistory();
		this.currentQuery = '';

		this.init();
	}

	/**
	 * Initialize search handler
	 */
	init() {
		if (!this.searchInput) {
			console.warn('Search input not found');
			return;
		}

		this.bindEvents();
		this.setupSearchBehavior();

		console.log('🔍 Search Handler initialized');
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		// Search input events
		this.searchInput.addEventListener('keypress', (e) => this.handleKeypress(e));
		this.searchInput.addEventListener('input', debounce((e) => this.handleInput(e), 300));
		this.searchInput.addEventListener('focus', (e) => this.handleFocus(e));
		this.searchInput.addEventListener('blur', (e) => this.handleBlur(e));

		// Search icon click
		if (this.searchIcon) {
			this.searchIcon.addEventListener('click', () => this.handleSearchIconClick());
		}

		// Form submission
		if (this.searchForm) {
			this.searchForm.addEventListener('submit', (e) => this.handleFormSubmit(e));
		}

		// Keyboard shortcuts
		document.addEventListener('keydown', (e) => this.handleKeyboardShortcuts(e));
	}

	/**
	 * Handle keypress events
	 */
	handleKeypress(event) {
		if (event.key === 'Enter') {
			event.preventDefault();
			this.performSearch();
		}
	}

	/**
	 * Handle input changes
	 */
	handleInput(event) {
		const query = event.target.value.trim();
		this.currentQuery = query;

		if (query.length > 0) {
			this.showSearchSuggestions(query);
		} else {
			this.hideSearchSuggestions();
		}

		// Update search icon state
		this.updateSearchIcon(query.length > 0);
	}

	/**
	 * Handle focus events
	 */
	handleFocus(event) {
		this.searchInput.parentElement.classList.add('focused');

		// Show recent searches if no current query
		if (!this.currentQuery && this.searchHistory.length > 0) {
			this.showRecentSearches();
		}
	}

	/**
	 * Handle blur events
	 */
	handleBlur(event) {
		// Delay hiding suggestions to allow for clicks
		setTimeout(() => {
			this.searchInput.parentElement.classList.remove('focused');
			this.hideSearchSuggestions();
		}, 200);
	}

	/**
	 * Handle search icon click
	 */
	handleSearchIconClick() {
		if (this.currentQuery.trim()) {
			this.performSearch();
		} else {
			this.searchInput.focus();
		}
	}

	/**
	 * Handle form submission
	 */
	handleFormSubmit(event) {
		event.preventDefault();
		this.performSearch();
	}

	/**
	 * Handle keyboard shortcuts
	 */
	handleKeyboardShortcuts(event) {
		// Ctrl/Cmd + K to focus search
		if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
			event.preventDefault();
			this.focusSearch();
		}

		// Escape to clear search
		if (event.key === 'Escape' && this.searchInput === document.activeElement) {
			this.clearSearch();
		}
	}

	/**
	 * Perform search
	 */
	performSearch() {
		const query = this.currentQuery.trim();

		if (!query) {
			this.showSearchError('Please enter a search term');
			return;
		}

		// Add to search history
		this.addToSearchHistory(query);

		// Construct search URL
		const searchUrl = this.buildSearchUrl(query);

		// Track search analytics
		this.trackSearch(query);

		// Navigate to search results
		window.location.href = searchUrl;
	}

	/**
	 * Build search URL
	 */
	buildSearchUrl(query) {
		const baseUrl = window.location.origin;

		// Check if Ghost has built-in search
		if (this.hasGhostSearch()) {
			return `${baseUrl}/search/?q=${encodeURIComponent(query)}`;
		}

		// Fallback to tag-based search or Google site search
		return this.buildFallbackSearchUrl(query);
	}

	/**
	 * Check if Ghost has built-in search
	 */
	hasGhostSearch() {
		// This would be configured based on Ghost setup
		return true; // Assume Ghost search is available
	}

	/**
	 * Build fallback search URL
	 */
	buildFallbackSearchUrl(query) {
		const baseUrl = window.location.origin;

		// Try tag-based search first
		const tagQuery = query.toLowerCase().replace(/\s+/g, '-');
		return `${baseUrl}/tag/${tagQuery}/`;
	}

	/**
	 * Show search suggestions
	 */
	showSearchSuggestions(query) {
		// Remove existing suggestions
		this.hideSearchSuggestions();

		const suggestions = this.generateSuggestions(query);

		if (suggestions.length > 0) {
			const suggestionContainer = this.createSuggestionContainer(suggestions);
			this.searchInput.parentElement.appendChild(suggestionContainer);
		}
	}

	/**
	 * Generate search suggestions
	 */
	generateSuggestions(query) {
		const suggestions = [];

		// Add matching history items
		const historyMatches = this.searchHistory.filter(item =>
			item.toLowerCase().includes(query.toLowerCase())
		).slice(0, 3);

		suggestions.push(...historyMatches.map(item => ({
			type: 'history',
			text: item,
			icon: '🕐'
		})));

		// Add tag suggestions (if available)
		const tagSuggestions = this.getTagSuggestions(query);
		suggestions.push(...tagSuggestions.slice(0, 3));

		return suggestions.slice(0, 5);
	}

	/**
	 * Get tag suggestions
	 */
	getTagSuggestions(query) {
		// This would ideally come from Ghost API or be pre-loaded
		const commonTags = ['poetry', 'fiction', 'art', 'cartoon', 'essay', 'journal', 'story'];

		return commonTags
			.filter(tag => tag.toLowerCase().includes(query.toLowerCase()))
			.map(tag => ({
				type: 'tag',
				text: tag,
				icon: '🏷️'
			}));
	}

	/**
	 * Create suggestion container
	 */
	createSuggestionContainer(suggestions) {
		const container = document.createElement('div');
		container.className = 'search-suggestions';
		container.style.cssText = `
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			background: white;
			border: 1px solid var(--color-border);
			border-radius: var(--radius-base);
			margin-top: 4px;
			box-shadow: var(--shadow-md);
			z-index: 1000;
			max-height: 300px;
			overflow-y: auto;
		`;

		suggestions.forEach((suggestion, index) => {
			const item = this.createSuggestionItem(suggestion, index);
			container.appendChild(item);
		});

		return container;
	}

	/**
	 * Create suggestion item
	 */
	createSuggestionItem(suggestion, index) {
		const item = document.createElement('div');
		item.className = 'search-suggestion-item';
		item.style.cssText = `
			padding: var(--space-md);
			cursor: pointer;
			display: flex;
			align-items: center;
			gap: var(--space-sm);
			font-size: var(--font-size-base);
			border-bottom: 1px solid var(--color-border-light);
			transition: background-color var(--transition-base);
		`;

		item.innerHTML = `
			<span class="suggestion-icon">${suggestion.icon}</span>
			<span class="suggestion-text">${suggestion.text}</span>
			<span class="suggestion-type" style="margin-left: auto; font-size: var(--font-size-sm); color: var(--color-text-medium);">
				${suggestion.type}
			</span>
		`;

		// Hover effects
		item.addEventListener('mouseenter', () => {
			item.style.backgroundColor = 'var(--color-background-light)';
		});

		item.addEventListener('mouseleave', () => {
			item.style.backgroundColor = '';
		});

		// Click handler
		item.addEventListener('click', () => {
			this.selectSuggestion(suggestion);
		});

		// Remove border from last item
		if (index === 0) {
			item.style.borderBottom = 'none';
		}

		return item;
	}

	/**
	 * Select suggestion
	 */
	selectSuggestion(suggestion) {
		this.searchInput.value = suggestion.text;
		this.currentQuery = suggestion.text;
		this.hideSearchSuggestions();
		this.performSearch();
	}

	/**
	 * Show recent searches
	 */
	showRecentSearches() {
		if (this.searchHistory.length === 0) return;

		const suggestions = this.searchHistory.slice(0, 5).map(item => ({
			type: 'recent',
			text: item,
			icon: '🕐'
		}));

		const suggestionContainer = this.createSuggestionContainer(suggestions);
		this.searchInput.parentElement.appendChild(suggestionContainer);
	}

	/**
	 * Hide search suggestions
	 */
	hideSearchSuggestions() {
		const existing = this.searchInput.parentElement.querySelector('.search-suggestions');
		if (existing) {
			existing.remove();
		}
	}

	/**
	 * Update search icon state
	 */
	updateSearchIcon(hasQuery) {
		if (!this.searchIcon) return;

		if (hasQuery) {
			this.searchIcon.style.color = 'var(--color-primary)';
			this.searchIcon.style.cursor = 'pointer';
		} else {
			this.searchIcon.style.color = '';
			this.searchIcon.style.cursor = 'default';
		}
	}

	/**
	 * Focus search input
	 */
	focusSearch() {
		this.searchInput.focus();
		this.searchInput.select();
	}

	/**
	 * Clear search
	 */
	clearSearch() {
		this.searchInput.value = '';
		this.currentQuery = '';
		this.hideSearchSuggestions();
		this.updateSearchIcon(false);
		this.searchInput.blur();
	}

	/**
	 * Show search error
	 */
	showSearchError(message) {
		// Create temporary error message
		const error = document.createElement('div');
		error.textContent = message;
		error.style.cssText = `
			position: absolute;
			top: 100%;
			left: 0;
			right: 0;
			background: var(--color-error);
			color: white;
			padding: var(--space-sm);
			border-radius: var(--radius-base);
			margin-top: 4px;
			font-size: var(--font-size-sm);
			z-index: 1000;
		`;

		this.searchInput.parentElement.appendChild(error);

		setTimeout(() => {
			error.remove();
		}, 3000);
	}

	/**
	 * Add to search history
	 */
	addToSearchHistory(query) {
		// Remove if already exists
		const index = this.searchHistory.indexOf(query);
		if (index > -1) {
			this.searchHistory.splice(index, 1);
		}

		// Add to beginning
		this.searchHistory.unshift(query);

		// Limit to 10 items
		this.searchHistory = this.searchHistory.slice(0, 10);

		// Save to localStorage
		this.saveSearchHistory();
	}

	/**
	 * Load search history
	 */
	loadSearchHistory() {
		try {
			const stored = localStorage.getItem('searchHistory');
			return stored ? JSON.parse(stored) : [];
		} catch (error) {
			console.warn('Could not load search history:', error);
			return [];
		}
	}

	/**
	 * Save search history
	 */
	saveSearchHistory() {
		try {
			localStorage.setItem('searchHistory', JSON.stringify(this.searchHistory));
		} catch (error) {
			console.warn('Could not save search history:', error);
		}
	}

	/**
	 * Clear search history
	 */
	clearSearchHistory() {
		this.searchHistory = [];
		this.saveSearchHistory();
	}

	/**
	 * Track search analytics
	 */
	trackSearch(query) {
		if (typeof window.trackEvent === 'function') {
			window.trackEvent('Search', 'Query', query);
		}
	}

	/**
	 * Setup search behavior
	 */
	setupSearchBehavior() {
		// Add search container styles
		if (this.searchInput.parentElement) {
			this.searchInput.parentElement.style.position = 'relative';
		}

		// Pre-load common search data if available
		this.preloadSearchData();
	}

	/**
	 * Preload search data
	 */
	preloadSearchData() {
		// This could fetch available tags, recent posts, etc.
		// For now, just set up the basic structure
	}

	/**
	 * Get search statistics
	 */
	getSearchStats() {
		return {
			historyCount: this.searchHistory.length,
			currentQuery: this.currentQuery,
			hasActiveSearch: this.currentQuery.length > 0
		};
	}

	/**
	 * Destroy search handler
	 */
	destroy() {
		// Remove event listeners
		if (this.searchInput) {
			this.searchInput.removeEventListener('keypress', this.handleKeypress);
			this.searchInput.removeEventListener('input', this.handleInput);
			this.searchInput.removeEventListener('focus', this.handleFocus);
			this.searchInput.removeEventListener('blur', this.handleBlur);
		}

		if (this.searchIcon) {
			this.searchIcon.removeEventListener('click', this.handleSearchIconClick);
		}

		if (this.searchForm) {
			this.searchForm.removeEventListener('submit', this.handleFormSubmit);
		}

		document.removeEventListener('keydown', this.handleKeyboardShortcuts);

		// Clean up suggestions
		this.hideSearchSuggestions();

		console.log('🔍 Search Handler destroyed');
	}
}