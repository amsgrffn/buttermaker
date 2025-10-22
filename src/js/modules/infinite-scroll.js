/**
 * Simple Ghost-Friendly Infinite Scroll Module
 * Uses Ghost's built-in link[rel="next"] pagination (more reliable)
 */

export class InfiniteScroll {
  constructor() {
    this.postFeed = null;
    this.loadMoreBtn = null;
    this.isLoading = false;
    this.hasMorePosts = true;
    this.nextDom = document; // Current document to search for next link
    this.currentPage = 1;
    this.totalPages = 1;

    this.init();
  }

  init() {
    // Find the post feed container and load more button
    // Support both .post-feed (homepage) and .article-loop (blog page)
    this.postFeed =
      document.querySelector('.article-loop') ||
      document.querySelector('.post-feed');
    this.loadMoreBtn = document.getElementById('load-more-btn');

    if (!this.postFeed || !this.loadMoreBtn) {
      console.log('📄 Infinite scroll: Required elements not found');
      return;
    }

    // Get initial pagination data from Ghost
    this.readPaginationData();

    // Check if we have a next page initially
    this.checkForNextPage();

    // Set up event listeners
    this.loadMoreBtn.addEventListener('click', () => this.loadMorePosts());

    // Initialize button state
    this.updateButtonState();

    console.log(
      '♾️ Infinite scroll initialized - Page',
      this.currentPage,
      'of',
      this.totalPages,
    );
  }

  readPaginationData(doc = document) {
    const paginationScript = doc.getElementById('pagination-data');
    if (paginationScript) {
      try {
        const data = JSON.parse(paginationScript.textContent);
        this.currentPage = data.currentPage || 1;
        this.totalPages = data.totalPages || 1;
        this.hasMorePosts = data.hasNext || false;

        console.log('📊 Pagination data:', {
          currentPage: this.currentPage,
          totalPages: this.totalPages,
          hasMore: this.hasMorePosts,
        });
      } catch (error) {
        console.error('❌ Error parsing pagination data:', error);
        this.hasMorePosts = false;
      }
    } else {
      console.warn('⚠️ No pagination data found');
    }
  }

  checkForNextPage() {
    // Use Ghost's built-in next page link
    const nextLink = this.nextDom.querySelector('link[rel="next"]');
    this.hasMorePosts = !!nextLink;

    console.log('🔗 Next page link found:', nextLink?.href || 'None');
    return nextLink;
  }

  async loadMorePosts() {
    if (this.isLoading || !this.hasMorePosts) {
      console.log(
        '⏸️ Load more skipped - Loading:',
        this.isLoading,
        'Has more:',
        this.hasMorePosts,
      );
      return;
    }

    this.isLoading = true;
    this.updateButtonState();

    try {
      // Get Ghost's next page link
      const nextLink = this.checkForNextPage();

      if (!nextLink) {
        console.log('🏁 No more pages to load');
        this.hasMorePosts = false;
        this.updateButtonState();
        return;
      }

      console.log('🔄 Loading next page:', nextLink.href);

      // Fetch the next page
      const response = await fetch(nextLink.href, {
        credentials: 'same-origin',
        headers: {
          'X-Requested-With': 'XMLHttpRequest',
        },
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const html = await response.text();

      // Parse the HTML to extract posts
      const parser = new DOMParser();
      const doc = parser.parseFromString(html, 'text/html');

      // Extract posts from the response - support both blog and homepage
      let newPosts = doc.querySelectorAll('.article-loop .post-container');

      // Fallback to homepage post-feed if article-loop not found
      if (newPosts.length === 0) {
        newPosts = doc.querySelectorAll('.post-feed article.post-card');
      }

      if (newPosts.length > 0) {
        console.log('✅ Found', newPosts.length, 'new posts');

        await this.appendPosts(Array.from(newPosts));

        // IMPORTANT: Update the nextDom reference to the new document
        // This ensures the next call will find the correct next page link
        this.nextDom = doc;

        // Read pagination data from the new page
        this.readPaginationData(doc);

        // Check if there are more pages after this one
        this.checkForNextPage();

        console.log('📄 Now on page', this.currentPage, 'of', this.totalPages);
      } else {
        console.log('🚫 No posts found in response');
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

  async appendPosts(newPosts) {
    console.log('📝 Appending', newPosts.length, 'posts to feed');

    // Create a container for new posts with animation
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

    // Get the load more button container
    const loadMoreContainer = this.loadMoreBtn.closest('.load-more');

    // Insert new posts before the load more button
    loadMoreContainer.parentNode.insertBefore(
      newPostsContainer,
      loadMoreContainer,
    );

    // Animate in the new posts
    requestAnimationFrame(() => {
      newPostsContainer.style.transition = 'all 0.6s ease-out';
      newPostsContainer.style.opacity = '1';
      newPostsContainer.style.transform = 'translateY(0)';
    });

    // After animation, unwrap posts but keep them BEFORE the button
    setTimeout(() => {
      // Move each post out of the wrapper, placing them before the load-more button
      while (newPostsContainer.firstChild) {
        loadMoreContainer.parentNode.insertBefore(
          newPostsContainer.firstChild,
          loadMoreContainer,
        );
      }
      // Remove the empty wrapper
      newPostsContainer.remove();
    }, 600);

    // Reinitialize any post-specific functionality
    this.reinitializePostFeatures();
  }

  reinitializePostFeatures() {
    // Reinitialize post actions for new posts
    if (
      window.postActions &&
      typeof window.postActions.initializeNewPosts === 'function'
    ) {
      window.postActions.initializeNewPosts();
    }

    // Dispatch custom event for other modules to reinitialize
    document.dispatchEvent(
      new CustomEvent('newPostsLoaded', {
        detail: {
          source: 'infinite-scroll',
          hasMorePosts: this.hasMorePosts,
        },
      }),
    );
  }

  updateButtonState() {
    if (!this.loadMoreBtn) return;

    if (this.isLoading) {
      this.loadMoreBtn.disabled = true;
      this.loadMoreBtn.classList.add('loading');
      this.loadMoreBtn.classList.remove('no-more', 'error');
      this.loadMoreBtn.innerHTML = `
		<span class="loading-spinner"></span>
		Loading...
	  `;
    } else if (!this.hasMorePosts) {
      this.loadMoreBtn.disabled = true;
      this.loadMoreBtn.classList.add('no-more');
      this.loadMoreBtn.classList.remove('loading', 'error');
      this.loadMoreBtn.innerHTML = `No more posts (${this.currentPage}/${this.totalPages})`;
    } else {
      this.loadMoreBtn.disabled = false;
      this.loadMoreBtn.classList.remove('loading', 'no-more', 'error');
      const nextPage = this.currentPage + 1;
      this.loadMoreBtn.innerHTML = `Load more posts (${nextPage}/${this.totalPages})`;
    }
  }

  showError() {
    if (!this.loadMoreBtn) return;

    this.loadMoreBtn.classList.add('error');
    this.loadMoreBtn.classList.remove('loading', 'no-more');
    this.loadMoreBtn.innerHTML = 'Failed to load posts. Try again?';
    this.loadMoreBtn.disabled = false;

    // Add click handler to retry
    this.loadMoreBtn.onclick = () => {
      this.loadMoreBtn.classList.remove('error');
      this.loadMorePosts();
    };
  }
}
