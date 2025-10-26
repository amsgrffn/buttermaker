/**
 * Simple Ghost-Friendly Infinite Scroll Module
 * Uses Ghost's built-in link[rel="next"] pagination (more reliable)
 */

export class InfiniteScroll {
  constructor() {
    console.log('🏗️ INFINITE SCROLL CONSTRUCTOR CALLED');
    console.log('🏗️ Starting initialization...');

    this.postFeed = null;
    this.loadMoreBtn = null;
    this.isLoading = false;
    this.hasMorePosts = true;
    this.nextDom = document;
    this.currentPage = 1;
    this.totalPages = 1;

    console.log('🏗️ About to call init()...');
    this.init();
    console.log('🏗️ Init() completed');
  }

  init() {
    console.log('=================================');
    console.log('🚀 INFINITE SCROLL INIT CALLED');
    console.log('=================================');

    // Find the post feed container and load more button
    this.postFeed =
      document.querySelector('.article-loop') ||
      document.querySelector('.post-feed') ||
      document.querySelector('.masonry-grid');

    console.log('📦 Post feed found:', !!this.postFeed);
    if (this.postFeed) {
      console.log('📦 Post feed class:', this.postFeed.className);
    }

    this.loadMoreBtn = document.getElementById('load-more-btn');
    console.log('🔘 Load more button found:', !!this.loadMoreBtn);
    console.log('🔘 Load more button element:', this.loadMoreBtn);

    if (!this.postFeed || !this.loadMoreBtn) {
      console.error('❌ INFINITE SCROLL: Required elements not found');
      console.log('Missing:', {
        postFeed: !this.postFeed,
        loadMoreBtn: !this.loadMoreBtn,
      });
      return;
    }

    console.log('✅ Both elements found, continuing initialization...');

    // Get initial pagination data from Ghost
    this.readPaginationData();

    // Check if we have a next page initially
    this.checkForNextPage();

    // Set up event listeners
    console.log('🎯 Adding click event listener to button');
    this.loadMoreBtn.addEventListener('click', () => {
      console.log('🖱️ BUTTON CLICKED!');
      this.loadMorePosts();
    });

    // Initialize button state
    this.updateButtonState();

    console.log(
      '♾️ Infinite scroll initialized - Page',
      this.currentPage,
      'of',
      this.totalPages,
    );
    console.log('Has more posts:', this.hasMorePosts);
    console.log('=================================');
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

      // Extract posts from the response - support blog, homepage, and tag pages
      let newPosts = doc.querySelectorAll('.article-loop .post-container');

      // Fallback to homepage post-feed if article-loop not found
      if (newPosts.length === 0) {
        newPosts = doc.querySelectorAll('.post-feed article.post-card');
      }

      // Fallback to masonry grid for tag pages
      if (newPosts.length === 0) {
        newPosts = doc.querySelectorAll('.masonry-grid article.masonry-card');
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

    // Check if we're in a masonry grid context
    const isMasonryGrid = this.postFeed.classList.contains('masonry-grid');

    if (isMasonryGrid) {
      console.log('🧱 Masonry grid detected - appending posts directly');

      // For masonry grids, append directly to the grid
      const fragment = document.createDocumentFragment();
      newPosts.forEach((post) => {
        const clonedPost = post.cloneNode(true);
        // Remove the 'positioned' class and reset styles so masonry can position it
        clonedPost.classList.remove('positioned');
        clonedPost.style.position = '';
        clonedPost.style.top = '';
        clonedPost.style.left = '';
        clonedPost.style.width = '';
        fragment.appendChild(clonedPost);
      });

      // Insert new posts INSIDE the masonry grid (at the end)
      this.postFeed.appendChild(fragment);

      console.log('⏳ Waiting for images to load...');

      // Wait for new images to load
      await this.waitForImages(this.postFeed);

      console.log('🔄 Calling masonry layoutMasonry (NOT reset)');

      // Give the DOM a moment to settle
      await new Promise((resolve) => setTimeout(resolve, 100));

      // DON'T call reset - just call layoutMasonry to position everything
      if (
        window.MasonryGrid &&
        typeof window.MasonryGrid.layoutMasonry === 'function'
      ) {
        console.log('📞 Calling MasonryGrid.layoutMasonry()');
        window.MasonryGrid.layoutMasonry();
      } else {
        console.warn('⚠️ MasonryGrid.layoutMasonry not available');
      }

      console.log('✅ New posts added and masonry recalculated');
    } else {
      // For regular feeds (blog page), use animation wrapper
      const loadMoreContainer = this.loadMoreBtn.closest('.load-more');
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
        // Remove the empty container
        newPostsContainer.remove();
      }, 650);
    }

    // Reinitialize any post-specific functionality
    this.reinitializePostFeatures();
  }

  /**
   * Wait for all images in a container to load
   */
  waitForImages(container) {
    const images = container.querySelectorAll('img');

    if (images.length === 0) {
      return Promise.resolve();
    }

    const imagePromises = Array.from(images)
      .filter((img) => !img.complete) // Only wait for images that haven't loaded
      .map((img) => {
        return new Promise((resolve) => {
          img.addEventListener('load', resolve, { once: true });
          img.addEventListener('error', resolve, { once: true });
          // Set a timeout in case image fails silently
          setTimeout(resolve, 3000);
        });
      });

    return Promise.all(imagePromises);
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
