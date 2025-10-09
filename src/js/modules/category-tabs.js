/**
 * Category Tabs - Loads 12 posts per category from Ghost API
 */

export class CategoryTabs {
  constructor() {
    this.tabs = document.querySelectorAll('.category-tab');
    this.grid = document.querySelector('.masonry-grid');
    this.loadingIndicator = document.querySelector('.masonry-loading');
    this.activeFilter = 'all';

    // Cache for fetched posts
    this.postCache = {};

    // Store initial cards
    this.initialCards = [];

    // Your Ghost API details
    this.apiUrl = 'http://localhost:2368/ghost/api/content/posts/';
    this.apiKey = '08e45355000c6891e4c7b41c3a';

    this.init();
  }

  init() {
    if (this.tabs.length === 0) {
      console.warn('No category tabs found');
      return;
    }

    // Store initial cards on page load
    this.storeInitialCards();

    this.bindEvents();
    console.log('📊 Category Tabs initialized with Ghost API');
  }

  storeInitialCards() {
    // Clone the initial cards so we can restore them when clicking "All"
    const cards = this.grid.querySelectorAll('.masonry-card');
    this.initialCards = Array.from(cards).map((card) => card.cloneNode(true));
    console.log(`Stored ${this.initialCards.length} initial cards`);
  }

  bindEvents() {
    this.tabs.forEach((tab) => {
      tab.addEventListener('click', (e) => this.handleTabClick(e));
    });
  }

  async handleTabClick(event) {
    const tab = event.target;
    const filter = tab.getAttribute('data-filter');

    // Don't do anything if already showing this category
    if (filter === this.activeFilter) {
      return;
    }

    // Update active tab styling
    this.setActiveTab(tab);
    this.activeFilter = filter;

    // If "All" is clicked, restore initial cards
    if (filter === 'all') {
      this.restoreInitialCards();
      return;
    }

    // Check if we already have posts for this category
    if (this.postCache[filter]) {
      console.log(`Using cached ${filter} posts`);
      this.displayCachedPosts(filter);
    } else {
      console.log(`Fetching ${filter} posts...`);
      await this.fetchPosts(filter);
    }
  }

  async fetchPosts(category) {
    try {
      this.showLoading();

      // Build Ghost API URL
      const url = `${this.apiUrl}?key=${this.apiKey}&filter=tag:${category}&limit=12&include=authors,tags`;

      console.log('Fetching:', url);

      const response = await fetch(url);
      const data = await response.json();

      if (data.posts && data.posts.length > 0) {
        console.log(`Got ${data.posts.length} ${category} posts!`);

        // Save posts to cache
        this.postCache[category] = data.posts;

        // Clear grid and create new cards
        this.clearGrid();
        this.createCards(data.posts, category);
      } else {
        console.warn(`No ${category} posts found`);
        this.clearGrid();
        this.showEmptyMessage(category);
      }
    } catch (error) {
      console.error(`Error fetching ${category}:`, error);
      alert('Failed to load posts. Check the console for details.');
    } finally {
      this.hideLoading();
    }
  }

  displayCachedPosts(category) {
    // Check if cards already exist in DOM
    const cachedCards = this.grid.querySelectorAll(
      `[data-category="${category}"]`,
    );

    if (cachedCards.length > 0) {
      // Cards exist, just clear and show them
      this.clearGrid();
      cachedCards.forEach((card) => {
        this.grid.appendChild(card);
      });
      this.resetMasonryLayout();
    } else {
      // Create cards from cache
      this.clearGrid();
      this.createCards(this.postCache[category], category);
    }
  }

  restoreInitialCards() {
    console.log('Restoring initial cards');
    this.clearGrid();

    // Clone and add each initial card back
    this.initialCards.forEach((card) => {
      this.grid.appendChild(card.cloneNode(true));
    });

    this.resetMasonryLayout();
  }

  clearGrid() {
    // Remove all cards from grid
    while (this.grid.firstChild) {
      this.grid.removeChild(this.grid.firstChild);
    }
  }

  createCards(posts, category) {
    const fragment = document.createDocumentFragment();

    posts.forEach((post) => {
      const card = this.buildCard(post, category);
      fragment.appendChild(card);
    });

    this.grid.appendChild(fragment);

    // Wait for images to load before recalculating masonry
    this.waitForImagesToLoad(() => {
      this.resetMasonryLayout();
    });
  }

  buildCard(post, category) {
    const article = document.createElement('article');
    article.className = 'masonry-card';
    article.setAttribute('data-tags', category);
    article.setAttribute('data-category', category);

    let html = '';

    // Add image if exists
    if (post.feature_image) {
      html += `
				<div class="masonry-image">
					<img src="${post.feature_image}" alt="${this.escapeHtml(post.title)}" loading="lazy">
				</div>
			`;
    }

    // Add content
    html += `
			<div class="masonry-content">
				<h3 class="masonry-title">
					<a href="${post.url}">${this.escapeHtml(post.title)}</a>
				</h3>
				<div class="masonry-excerpt">${post.excerpt || ''}</div>
				<div class="masonry-meta">
		`;

    // Add author
    if (post.primary_author) {
      html += `
				<a class="avatar wiggle" href="${post.primary_author.url}">
					<img src="${post.primary_author.profile_image}"
						 alt="${this.escapeHtml(post.primary_author.name)}'s Avatar"
						 width="40" height="40" loading="lazy">
				</a>
				&middot;
			`;
    }

    // Add date
    html += `
			<time datetime="${post.published_at}">
				${this.timeAgo(post.published_at)}
			</time>
			&middot;
		`;

    // Add tag
    if (post.primary_tag) {
      html += `<span class="masonry-tag">${this.escapeHtml(post.primary_tag.name)}</span>`;
    }

    html += `
				</div>
			</div>
			<a href="${post.url}" class="masonry-link" aria-label="Read ${this.escapeHtml(post.title)}"></a>
		`;

    article.innerHTML = html;
    return article;
  }

  waitForImagesToLoad(callback) {
    const images = this.grid.querySelectorAll('img');

    if (images.length === 0) {
      // No images, run callback immediately
      callback();
      return;
    }

    let loadedCount = 0;
    const totalImages = images.length;

    const imageLoaded = () => {
      loadedCount++;
      if (loadedCount === totalImages) {
        callback();
      }
    };

    images.forEach((img) => {
      if (img.complete) {
        imageLoaded();
      } else {
        img.addEventListener('load', imageLoaded);
        img.addEventListener('error', imageLoaded); // Count errors too
      }
    });
  }

  resetMasonryLayout() {
    // Clear any inline positioning from previous masonry calculations
    const cards = this.grid.querySelectorAll('.masonry-card');
    cards.forEach((card) => {
      card.style.position = '';
      card.style.top = '';
      card.style.left = '';
      card.style.transform = '';
      card.style.opacity = '1';
    });

    // Trigger masonry recalculation
    // This dispatches a custom event that your masonry.js should listen for
    window.dispatchEvent(
      new CustomEvent('masonryReset', {
        detail: { grid: this.grid },
      }),
    );

    // Also try calling the masonry directly if it's available globally
    if (window.MasonryGrid) {
      console.log('Triggering MasonryGrid.layout()');
      window.MasonryGrid.layout();
    }

    console.log('✅ Masonry layout reset');
  }

  showEmptyMessage(category) {
    const message = document.createElement('div');
    message.className = 'empty-message';
    message.style.cssText =
      'grid-column: 1 / -1; text-align: center; padding: 60px 20px;';
    message.innerHTML = `
			<p style="font-size: 1.2em; color: #666;">
				No posts found in the "${category}" category yet!
			</p>
		`;
    this.grid.appendChild(message);
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  timeAgo(dateString) {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now - date) / 1000);

    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} minutes ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)} days ago`;
    if (seconds < 2592000) return `${Math.floor(seconds / 604800)} weeks ago`;
    if (seconds < 31536000)
      return `${Math.floor(seconds / 2592000)} months ago`;
    return `${Math.floor(seconds / 31536000)} years ago`;
  }

  setActiveTab(activeTab) {
    this.tabs.forEach((tab) => tab.classList.remove('active'));
    activeTab.classList.add('active');
  }

  showLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'block';
    }
  }

  hideLoading() {
    if (this.loadingIndicator) {
      this.loadingIndicator.style.display = 'none';
    }
  }
}
