/**
 * Blog Post Display Module
 * Conditionally shows full content or preview based on word count
 * Only works on /blog index page
 */

export class BlogPostDisplay {
  constructor(options = {}) {
    this.options = {
      wordThreshold: 500,
      blogPagePath: '/blog',
      ...options,
    };

    this.init();
  }

  init() {
    // Only run on blog index page
    if (!this.isBlogIndexPage()) {
      console.log('BlogPostDisplay: Not on blog page, skipping');
      return;
    }

    // Process posts when DOM is ready
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', () =>
        this.processAllPosts(),
      );
    } else {
      this.processAllPosts();
    }

    // Listen for infinite scroll
    document.addEventListener('newPostsLoaded', () => {
      this.processNewPosts();
    });
  }

  isBlogIndexPage() {
    const path = window.location.pathname;
    return (
      path === this.options.blogPagePath ||
      path === this.options.blogPagePath + '/' ||
      path === this.options.blogPagePath + '/index.html'
    );
  }

  processAllPosts() {
    const posts = document.querySelectorAll('.post-container');

    console.log(`BlogPostDisplay: Found ${posts.length} posts to process`);

    posts.forEach((post, index) => {
      // Skip if already processed
      if (post.hasAttribute('data-processed')) {
        return;
      }

      // Skip note posts (they have different structure)
      const article = post.querySelector('article');
      if (!article) {
        console.log(`Post ${index}: No article element, skipping`);
        post.setAttribute('data-processed', 'skipped');
        return;
      }

      // Find the two versions
      const previewVersion = post.querySelector('.post-preview');
      const fullVersion = post.querySelector('.post-full');

      // If either version is missing, skip this post
      if (!previewVersion || !fullVersion) {
        console.log(`Post ${index}: Missing preview or full version, skipping`);
        post.setAttribute('data-processed', 'skipped');
        return;
      }

      // Count words in the full version's content
      const contentElement = fullVersion.querySelector('.post-content');

      if (!contentElement) {
        console.log(`Post ${index}: No .post-content found, skipping`);
        post.setAttribute('data-processed', 'skipped');
        return;
      }

      const wordCount = this.countWords(contentElement);
      console.log(`Post ${index}: ${wordCount} words`);

      // Mark as processed
      post.setAttribute('data-processed', 'true');
      post.setAttribute('data-word-count', wordCount);

      // Show the appropriate version
      if (wordCount > this.options.wordThreshold) {
        // Long post - show preview
        previewVersion.style.display = 'block';
        fullVersion.style.display = 'none';
        console.log(
          `Post ${index}: Showing PREVIEW (${wordCount} words > ${this.options.wordThreshold} threshold)`,
        );
      } else {
        // Short post - show full
        previewVersion.style.display = 'none';
        fullVersion.style.display = 'block';
        console.log(
          `Post ${index}: Showing FULL (${wordCount} words <= ${this.options.wordThreshold} threshold)`,
        );
      }
    });

    console.log('✅ BlogPostDisplay: Processing complete');
  }

  processNewPosts() {
    const unprocessedPosts = document.querySelectorAll(
      '.post-container:not([data-processed])',
    );

    if (unprocessedPosts.length === 0) {
      return;
    }

    console.log(
      `BlogPostDisplay: Processing ${unprocessedPosts.length} new posts`,
    );
    this.processAllPosts();
  }

  countWords(element) {
    const text = element.textContent || element.innerText || '';
    const words = text
      .trim()
      .split(/\s+/)
      .filter((word) => word.length > 0);
    return words.length;
  }
}
