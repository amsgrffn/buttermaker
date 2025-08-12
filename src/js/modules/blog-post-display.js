/**
 * Blog Post Display Module
 * Conditionally shows full content or preview based on word count
 * Only works on /blog index page
 * Compatible with infinite scroll - processes new posts automatically
 */

export class BlogPostDisplay {
    constructor(options = {}) {
        this.options = {
            wordThreshold: 500,
            blogPagePath: '/blog',
            postSelector: '.post-container',
            previewSelector: '.post-preview',
            fullSelector: '.post-full',
            contentSelector: '.post-full .post-content', // Use the existing content div
            ignoredPrimaryTags: ['notes'], // Posts with these primary tags will be ignored
            ...options
        };
        
        this.init();
    }

    /**
     * Check if post should be ignored based on primary tag
     * @param {Element} post - The post container element
     * @returns {boolean} True if post should be ignored
     */
    shouldIgnorePost(post) {
        // Method 1: Check for CSS class (e.g., .tag-notes, .primary-tag-notes)
        for (const tag of this.options.ignoredPrimaryTags) {
            if (post.classList.contains(`tag-${tag.toLowerCase()}`) || 
                post.classList.contains(`primary-tag-${tag.toLowerCase()}`)) {
                return true;
            }
        }

        // Method 2: Check for data attribute
        const primaryTag = post.getAttribute('data-primary-tag');
        if (primaryTag && this.options.ignoredPrimaryTags.includes(primaryTag.toLowerCase())) {
            return true;
        }

        // Method 3: Check for tag link in post meta (common Ghost pattern)
        const tagLinks = post.querySelectorAll('.post-tags a, .post-meta a[href*="/tag/"]');
        for (const tagLink of tagLinks) {
            const href = tagLink.getAttribute('href');
            if (href) {
                for (const tag of this.options.ignoredPrimaryTags) {
                    if (href.includes(`/tag/${tag.toLowerCase()}/`) || 
                        href.includes(`/tag/${tag.toLowerCase()}`)) {
                        // Check if this is the first/primary tag (usually the first one in the list)
                        const allTagLinks = post.querySelectorAll('.post-tags a, .post-meta a[href*="/tag/"]');
                        if (allTagLinks[0] === tagLink) {
                            return true;
                        }
                    }
                }
            }
        }

        return false;
    }

    /**
     * Initialize the module
     */
    init() {
        // Only run on blog index page
        if (!this.isBlogIndexPage()) {
            return;
        }

        // Process initial posts
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.processAllPosts());
        } else {
            this.processAllPosts();
        }

        // Listen for infinite scroll new posts
        this.setupInfiniteScrollListener();
    }

    /**
     * Set up listener for infinite scroll new posts
     */
    setupInfiniteScrollListener() {
        document.addEventListener('newPostsLoaded', (event) => {
            console.log('BlogPostDisplay: New posts loaded via infinite scroll');
            
            // Process only the newly loaded posts
            this.processNewlyLoadedPosts();
        });
    }

    /**
     * Process newly loaded posts from infinite scroll
     */
    processNewlyLoadedPosts() {
        // Find posts that haven't been processed yet (no data-word-count attribute)
        const unprocessedPosts = document.querySelectorAll(`${this.options.postSelector}:not([data-word-count])`);
        
        if (unprocessedPosts.length === 0) {
            console.log('BlogPostDisplay: No unprocessed posts found');
            return;
        }

        console.log(`BlogPostDisplay: Processing ${unprocessedPosts.length} newly loaded posts`);
        
        unprocessedPosts.forEach((post, index) => {
            try {
                this.processPost(post, `new-${index}`);
            } catch (error) {
                console.error(`BlogPostDisplay: Error processing new post ${index}:`, error);
            }
        });
    }

    /**
     * Check if current page is the blog index
     * @returns {boolean}
     */
    isBlogIndexPage() {
        const currentPath = window.location.pathname;
        
        // Check for exact match or with trailing slash
        return currentPath === this.options.blogPagePath || 
               currentPath === this.options.blogPagePath + '/' ||
               currentPath === this.options.blogPagePath + '/index.html';
    }

    /**
     * Process all posts on the page (initial load)
     */
    processAllPosts() {
        const posts = document.querySelectorAll(this.options.postSelector);
        
        if (posts.length === 0) {
            console.warn('BlogPostDisplay: No posts found with selector:', this.options.postSelector);
            return;
        }

        posts.forEach((post, index) => {
            try {
                this.processPost(post, index);
            } catch (error) {
                console.error(`BlogPostDisplay: Error processing post ${index}:`, error);
            }
        });

        console.log(`BlogPostDisplay: Processed ${posts.length} posts on blog index`);
    }

    /**
     * Process individual post
     * @param {Element} post - The post container element
     * @param {number|string} index - Post index for debugging
     */
    processPost(post, index) {
        // Skip if already processed
        if (post.hasAttribute('data-word-count')) {
            return;
        }

        // Skip if post should be ignored based on primary tag
        if (this.shouldIgnorePost(post)) {
            console.log(`Post ${index}: Ignoring post with primary tag in ignore list`);
            post.setAttribute('data-word-count', 'ignored');
            return;
        }

        const contentElement = post.querySelector(this.options.contentSelector) || 
                               post.querySelector('.post-content') ||
                               post.querySelector('.content-body');
        const previewElement = post.querySelector(this.options.previewSelector);
        const fullElement = post.querySelector(this.options.fullSelector);

        // Validate required elements exist
        if (!contentElement) {
            console.warn(`BlogPostDisplay: No content element found in post ${index}. Tried selectors:`, 
                        [this.options.contentSelector, '.post-content', '.content-body']);
            return;
        }

        if (!previewElement || !fullElement) {
            console.warn(`BlogPostDisplay: Missing preview or full element in post ${index}:`, {
                hasPreview: !!previewElement,
                hasFull: !!fullElement
            });
            return;
        }

        // Count words in the content
        const wordCount = this.countWords(contentElement);
        
        // Debug: Log the first 100 characters of content being counted
        const contentPreview = (contentElement.textContent || '').substring(0, 100);
        console.log(`Post ${index} content preview: "${contentPreview}..."`);
        
        // Add word count as data attribute for debugging and to mark as processed
        post.setAttribute('data-word-count', wordCount);

        // Show appropriate version based on word count
        if (wordCount > this.options.wordThreshold) {
            this.showPreview(previewElement, fullElement);
            console.log(`Post ${index}: ${wordCount} words - showing preview`);
        } else {
            this.showFull(previewElement, fullElement);
            console.log(`Post ${index}: ${wordCount} words - showing full content`);
        }
    }

    /**
     * Count words in text content
     * @param {Element} element - Element containing text
     * @returns {number} Word count
     */
    countWords(element) {
        // Get text content and remove extra whitespace
        const text = element.textContent || element.innerText || '';
        
        // Remove HTML tags if any leaked through
        const cleanText = text.replace(/<[^>]*>/g, '');
        
        // Split by whitespace and filter out empty strings
        const words = cleanText.trim().split(/\s+/).filter(word => word.length > 0);
        
        return words.length;
    }

    /**
     * Show preview version of post
     * @param {Element} previewElement 
     * @param {Element} fullElement 
     */
    showPreview(previewElement, fullElement) {
        previewElement.style.display = 'block';
        fullElement.style.display = 'none';
        
        // Add classes for potential CSS styling
        previewElement.classList.add('active');
        fullElement.classList.remove('active');
    }

    /**
     * Show full version of post
     * @param {Element} previewElement 
     * @param {Element} fullElement 
     */
    showFull(previewElement, fullElement) {
        previewElement.style.display = 'none';
        fullElement.style.display = 'block';
        
        // Add classes for potential CSS styling
        previewElement.classList.remove('active');
        fullElement.classList.add('active');
    }

    /**
     * Manually process new posts (for other integrations)
     * @param {NodeList|Array} posts - Posts to process
     */
    processSpecificPosts(posts) {
        if (!this.isBlogIndexPage()) {
            return;
        }

        posts.forEach((post, index) => {
            try {
                this.processPost(post, `manual-${index}`);
            } catch (error) {
                console.error(`BlogPostDisplay: Error processing manual post ${index}:`, error);
            }
        });
    }

    /**
     * Update word threshold dynamically and reprocess all posts
     * @param {number} newThreshold 
     */
    updateThreshold(newThreshold) {
        this.options.wordThreshold = newThreshold;
        
        // Remove processing markers and reprocess all posts
        const allPosts = document.querySelectorAll(this.options.postSelector);
        allPosts.forEach(post => post.removeAttribute('data-word-count'));
        
        this.processAllPosts();
    }

    /**
     * Get current word threshold
     * @returns {number}
     */
    getThreshold() {
        return this.options.wordThreshold;
    }

    /**
     * Update ignored primary tags and reprocess all posts
     * @param {Array} newIgnoredTags - Array of tag names to ignore
     */
    updateIgnoredTags(newIgnoredTags) {
        this.options.ignoredPrimaryTags = newIgnoredTags.map(tag => tag.toLowerCase());
        
        // Remove processing markers and reprocess all posts
        const allPosts = document.querySelectorAll(this.options.postSelector);
        allPosts.forEach(post => post.removeAttribute('data-word-count'));
        
        this.processAllPosts();
    }

    /**
     * Add a tag to the ignored list
     * @param {string} tag - Tag name to ignore
     */
    addIgnoredTag(tag) {
        if (!this.options.ignoredPrimaryTags.includes(tag.toLowerCase())) {
            this.options.ignoredPrimaryTags.push(tag.toLowerCase());
            
            // Reprocess all posts
            const allPosts = document.querySelectorAll(this.options.postSelector);
            allPosts.forEach(post => post.removeAttribute('data-word-count'));
            this.processAllPosts();
        }
    }

    /**
     * Remove a tag from the ignored list
     * @param {string} tag - Tag name to stop ignoring
     */
    removeIgnoredTag(tag) {
        const index = this.options.ignoredPrimaryTags.indexOf(tag.toLowerCase());
        if (index > -1) {
            this.options.ignoredPrimaryTags.splice(index, 1);
            
            // Reprocess all posts
            const allPosts = document.querySelectorAll(this.options.postSelector);
            allPosts.forEach(post => post.removeAttribute('data-word-count'));
            this.processAllPosts();
        }
    }

    /**
     * Get stats about processed posts
     * @returns {Object}
     */
    getStats() {
        const allPosts = document.querySelectorAll(`${this.options.postSelector}[data-word-count]`);
        const ignoredPosts = Array.from(allPosts).filter(post => 
            post.getAttribute('data-word-count') === 'ignored'
        );
        const processedPosts = Array.from(allPosts).filter(post => 
            post.getAttribute('data-word-count') !== 'ignored'
        );
        const previewPosts = processedPosts.filter(post => {
            const wordCount = parseInt(post.getAttribute('data-word-count'));
            return wordCount > this.options.wordThreshold;
        });
        const fullPosts = processedPosts.length - previewPosts.length;

        return {
            total: allPosts.length,
            processed: processedPosts.length,
            ignored: ignoredPosts.length,
            showingPreviews: previewPosts.length,
            showingFull: fullPosts,
            threshold: this.options.wordThreshold,
            ignoredTags: this.options.ignoredPrimaryTags
        };
    }
}