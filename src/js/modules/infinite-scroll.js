/**
 * Simplified Infinite Scroll Module
 * Uses page-based navigation instead of Content API (more reliable)
 */

export class InfiniteScroll {
	constructor() {
		this.postFeed = null;
		this.loadMoreBtn = null;
		this.isLoading = false;
		this.hasMorePosts = true;
		this.paginationData = null;

		this.init();
	}

	init() {
		// Find the post feed container and load more button
		this.postFeed = document.querySelector('.post-feed');
		this.loadMoreBtn = document.getElementById('load-more-btn');

		if (!this.postFeed || !this.loadMoreBtn) {
			console.log('📄 Infinite scroll: Required elements not found');
			return;
		}

		// Get pagination data from the JSON script tag
		this.getPaginationData();

		// Set up event listeners
		this.loadMoreBtn.addEventListener('click', () => this.loadMorePosts());

		// Initialize button state
		this.updateButtonState();

		console.log('♾️ Infinite scroll initialized (page-based)');
	}

	getPaginationData() {
		const paginationScript = document.getElementById('pagination-data');
		if (paginationScript) {
			try {
				this.paginationData = JSON.parse(paginationScript.textContent);
				this.hasMorePosts = this.paginationData.hasNext;
			} catch (error) {
				console.error('❌ Error parsing pagination data:', error);
				this.hasMorePosts = false;
			}
		} else {
			// Fallback: check for next page link
			const nextLink = document.querySelector('.pagination .page-next:not(.disabled)');
			this.hasMorePosts = !!nextLink;
		}
	}

	async loadMorePosts() {
		if (this.isLoading || !this.hasMorePosts) {
			return;
		}

		this.isLoading = true;
		this.updateButtonState();

		try {
			// Calculate next page URL
			const nextPageUrl = this.getNextPageUrl();

			if (!nextPageUrl) {
				this.hasMorePosts = false;
				this.updateButtonState();
				return;
			}

			// Fetch the next page
			const response = await fetch(nextPageUrl);

			if (!response.ok) {
				throw new Error(`HTTP ${response.status}: ${response.statusText}`);
			}

			const html = await response.text();

			// Parse the HTML to extract posts
			const parser = new DOMParser();
			const doc = parser.parseFromString(html, 'text/html');

			// Extract posts from the response
			const newPosts = doc.querySelectorAll('.post-feed .post-card');

			if (newPosts.length > 0) {
				await this.appendPosts(Array.from(newPosts));

				// Update pagination data
				this.updatePaginationFromResponse(doc);
			} else {
				this.hasMorePosts = false;
			}

		} catch (error) {
			console.error('❌ Error loading more posts:', error);
			this.showError();
		} finally {
			this.isLoading = false;
			this.updateButtonState();
		}
	}

	getNextPageUrl() {
		if (this.paginationData && this.paginationData.hasNext) {
			const nextPage = this.paginationData.currentPage + 1;
			const currentUrl = new URL(window.location);
			currentUrl.searchParams.set('page', nextPage);
			return currentUrl.toString();
		}

		// Fallback: try to find next page link
		const nextLink = document.querySelector('.pagination .page-next:not(.disabled)');
		return nextLink ? nextLink.href : null;
	}

	updatePaginationFromResponse(doc) {
		const paginationScript = doc.getElementById('pagination-data');
		if (paginationScript) {
			try {
				this.paginationData = JSON.parse(paginationScript.textContent);
				this.hasMorePosts = this.paginationData.hasNext;
			} catch (error) {
				console.error('❌ Error parsing new pagination data:', error);
				this.hasMorePosts = false;
			}
		} else {
			// Fallback: check for next page link in response
			const nextLink = doc.querySelector('.pagination .page-next:not(.disabled)');
			this.hasMorePosts = !!nextLink;
		}
	}

	async appendPosts(newPosts) {
		// Create a container for new posts
		const newPostsContainer = document.createElement('div');
		newPostsContainer.className = 'new-posts-container';
		newPostsContainer.style.opacity = '0';
		newPostsContainer.style.transform = 'translateY(20px)';

		// Clone and append new posts
		newPosts.forEach((post, index) => {
			const clonedPost = post.cloneNode(true);
			clonedPost.style.animationDelay = `${(index + 1) * 0.1}s`;
			newPostsContainer.appendChild(clonedPost);
		});

		// Insert before the load more button
		this.loadMoreBtn.parentNode.insertBefore(newPostsContainer, this.loadMoreBtn.parentNode);

		// Animate in
		requestAnimationFrame(() => {
			newPostsContainer.style.transition = 'all 0.6s ease-out';
			newPostsContainer.style.opacity = '1';
			newPostsContainer.style.transform = 'translateY(0)';
		});

		// After animation, move posts to main container and remove wrapper
		setTimeout(() => {
			while (newPostsContainer.firstChild) {
				this.postFeed.appendChild(newPostsContainer.firstChild);
			}
			newPostsContainer.remove();
		}, 600);

		// Reinitialize any post-specific functionality
		this.reinitializePostFeatures();
	}

	reinitializePostFeatures() {
		// Reinitialize post actions for new posts
		if (window.postActions && typeof window.postActions.initializeNewPosts === 'function') {
			window.postActions.initializeNewPosts();
		}

		// Dispatch custom event for other modules to reinitialize
		document.dispatchEvent(new CustomEvent('newPostsLoaded', {
			detail: { source: 'infinite-scroll' }
		}));
	}

	updateButtonState() {
		if (!this.loadMoreBtn) return;

		if (this.isLoading) {
			this.loadMoreBtn.disabled = true;
			this.loadMoreBtn.classList.add('loading');
			this.loadMoreBtn.innerHTML = `
				<span class="loading-spinner"></span>
				Loading...
			`;
		} else if (!this.hasMorePosts) {
			this.loadMoreBtn.disabled = true;
			this.loadMoreBtn.classList.add('no-more');
			this.loadMoreBtn.classList.remove('loading', 'error');
			this.loadMoreBtn.innerHTML = 'No more posts';
		} else {
			this.loadMoreBtn.disabled = false;
			this.loadMoreBtn.classList.remove('loading', 'no-more', 'error');
			this.loadMoreBtn.innerHTML = 'Read More';
		}
	}

	showError() {
		if (!this.loadMoreBtn) return;

		this.loadMoreBtn.innerHTML = 'Failed to load posts. Try again?';
		this.loadMoreBtn.classList.add('error');
		this.loadMoreBtn.classList.remove('loading');

		// Reset after 3 seconds
		setTimeout(() => {
			this.loadMoreBtn.classList.remove('error');
			this.updateButtonState();
		}, 3000);
	}
}