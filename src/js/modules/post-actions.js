/**
 * Post Actions Module
 * Handles like, share, save, and comment interactions
 */

export class PostActions {
	constructor() {
		this.actions = document.querySelectorAll('.post-action');
		this.actionStates = new Map();

		this.init();
	}

	/**
	 * Initialize post actions
	 */
	init() {
		if (this.actions.length === 0) {
			console.warn('No post actions found');
			return;
		}

		this.bindEvents();
		this.loadActionStates();

		console.log('👍 Post Actions initialized');
	}

	/**
	 * Bind event listeners
	 */
	bindEvents() {
		this.actions.forEach(action => {
			action.addEventListener('click', (e) => this.handleActionClick(e));
		});
	}

	/**
	 * Handle action click
	 */
	handleActionClick(event) {
		event.preventDefault();
		event.stopPropagation();

		const action = event.target.closest('.post-action');
		const actionType = action.getAttribute('data-action');
		const postElement = action.closest('.post-card, .post-container');

		if (!actionType) {
			// For actions without data-action, provide visual feedback
			this.provideVisualFeedback(action);
			return;
		}

		switch (actionType) {
			case 'like':
				this.handleLikeAction(action, postElement);
				break;
			case 'share':
				this.handleShareAction(action, postElement);
				break;
			case 'save':
				this.handleSaveAction(action, postElement);
				break;
			case 'comment':
				this.handleCommentAction(action, postElement);
				break;
			default:
				this.provideVisualFeedback(action);
		}
	}

	/**
	 * Handle like action
	 */
	handleLikeAction(action, postElement) {
		const postId = this.getPostId(postElement);
		const isLiked = this.actionStates.get(`like-${postId}`) || false;

		if (isLiked) {
			this.setUnliked(action, postId);
		} else {
			this.setLiked(action, postId);
		}

		this.saveActionStates();
		this.trackAction('like', postId, !isLiked);
	}

	/**
	 * Set liked state
	 */
	setLiked(action, postId) {
		action.innerHTML = '❤️ Liked';
		action.style.color = 'var(--color-error)';
		action.classList.add('liked');

		this.actionStates.set(`like-${postId}`, true);
		this.animateAction(action, 'like');
	}

	/**
	 * Set unliked state
	 */
	setUnliked(action, postId) {
		action.innerHTML = '👍 Like';
		action.style.color = '';
		action.classList.remove('liked');

		this.actionStates.set(`like-${postId}`, false);
	}

	/**
	 * Handle share action
	 */
	async handleShareAction(action, postElement) {
		const postData = this.getPostData(postElement);

		try {
			// Try native Web Share API first
			if (navigator.share && this.isMobile()) {
				await navigator.share({
					title: postData.title,
					text: postData.excerpt,
					url: postData.url
				});

				this.trackAction('share', postData.id, 'native');
				this.showActionFeedback(action, 'Shared!');
				return;
			}

			// Fallback to clipboard
			await this.copyToClipboard(postData.url);
			this.showActionFeedback(action, 'Link copied!');
			this.trackAction('share', postData.id, 'clipboard');

		} catch (error) {
			console.warn('Share failed, trying fallback:', error);
			this.fallbackShare(postData);
			this.trackAction('share', postData.id, 'fallback');
		}
	}

	/**
	 * Handle save action
	 */
	handleSaveAction(action, postElement) {
		const postId = this.getPostId(postElement);
		const isSaved = this.actionStates.get(`save-${postId}`) || false;

		if (isSaved) {
			this.setUnsaved(action, postId);
		} else {
			this.setSaved(action, postId);
		}

		this.saveActionStates();
		this.trackAction('save', postId, !isSaved);
	}

	/**
	 * Set saved state
	 */
	setSaved(action, postId) {
		action.innerHTML = '💾 Saved';
		action.style.color = 'var(--color-warning)';
		action.classList.add('saved');

		this.actionStates.set(`save-${postId}`, true);
		this.animateAction(action, 'save');
	}

	/**
	 * Set unsaved state
	 */
	setUnsaved(action, postId) {
		action.innerHTML = '⭐ Save';
		action.style.color = '';
		action.classList.remove('saved');

		this.actionStates.set(`save-${postId}`, false);
	}

	/**
	 * Handle comment action
	 */
	handleCommentAction(action, postElement) {
		const postData = this.getPostData(postElement);

		// Scroll to comments section if on individual post page
		const commentsSection = document.querySelector('#comments, .comments-section');
		if (commentsSection) {
			this.scrollToComments(commentsSection);
		} else {
			// Navigate to post with comments hash
			window.location.href = `${postData.url}#comments`;
		}

		this.trackAction('comment', postData.id, 'navigate');
	}

	/**
	 * Provide visual feedback for generic actions
	 */
	provideVisualFeedback(action) {
		const originalColor = action.style.color;
		action.style.color = 'var(--color-primary)';

		setTimeout(() => {
			action.style.color = originalColor;
		}, 200);

		this.animateAction(action, 'generic');
	}

	/**
	 * Animate action
	 */
	animateAction(action, type) {
		switch (type) {
			case 'like':
				this.animateLike(action);
				break;
			case 'save':
				this.animateSave(action);
				break;
			default:
				this.animateGeneric(action);
		}
	}

	/**
	 * Animate like action
	 */
	animateLike(action) {
		action.style.transform = 'scale(1.2)';
		action.style.transition = 'transform 0.2s ease';

		setTimeout(() => {
			action.style.transform = 'scale(1)';
		}, 200);

		// Add heart animation
		this.createHeartBurst(action);
	}

	/**
	 * Animate save action
	 */
	animateSave(action) {
		action.style.transform = 'translateY(-2px)';
		action.style.transition = 'transform 0.2s ease';

		setTimeout(() => {
			action.style.transform = 'translateY(0)';
		}, 200);
	}

	/**
	 * Animate generic action
	 */
	animateGeneric(action) {
		action.style.transform = 'scale(1.05)';
		action.style.transition = 'transform 0.15s ease';

		setTimeout(() => {
			action.style.transform = 'scale(1)';
		}, 150);
	}

	/**
	 * Create heart burst animation
	 */
	createHeartBurst(action) {
		const hearts = ['❤️', '💖', '💕'];
		const rect = action.getBoundingClientRect();

		for (let i = 0; i < 3; i++) {
			setTimeout(() => {
				const heart = document.createElement('div');
				heart.textContent = hearts[i % hearts.length];
				heart.style.position = 'fixed';
				heart.style.left = `${rect.left + rect.width / 2}px`;
				heart.style.top = `${rect.top}px`;
				heart.style.fontSize = '14px';
				heart.style.pointerEvents = 'none';
				heart.style.zIndex = '9999';
				heart.style.animation = `heartFloat 1s ease-out forwards`;

				document.body.appendChild(heart);

				setTimeout(() => {
					document.body.removeChild(heart);
				}, 1000);
			}, i * 100);
		}
	}

	/**
	 * Show action feedback
	 */
	showActionFeedback(action, message) {
		const originalText = action.textContent;
		action.textContent = message;
		action.style.color = 'var(--color-success)';

		setTimeout(() => {
			action.textContent = originalText;
			action.style.color = '';
		}, 2000);
	}

	/**
	 * Copy to clipboard
	 */
	async copyToClipboard(text) {
		if (navigator.clipboard) {
			await navigator.clipboard.writeText(text);
		} else {
			// Fallback for older browsers
			const textArea = document.createElement('textarea');
			textArea.value = text;
			textArea.style.position = 'fixed';
			textArea.style.left = '-999999px';
			textArea.style.top = '-999999px';
			document.body.appendChild(textArea);
			textArea.focus();
			textArea.select();
			document.execCommand('copy');
			document.body.removeChild(textArea);
		}
	}

	/**
	 * Fallback share methods
	 */
	fallbackShare(postData) {
		const shareUrl = `https://twitter.com/intent/tweet?url=${encodeURIComponent(postData.url)}&text=${encodeURIComponent(postData.title)}`;
		window.open(shareUrl, '_blank', 'width=600,height=400');
	}

	/**
	 * Scroll to comments
	 */
	scrollToComments(commentsSection) {
		commentsSection.scrollIntoView({
			behavior: 'smooth',
			block: 'start'
		});

		// Highlight comments section briefly
		commentsSection.style.outline = '2px solid var(--color-primary)';
		setTimeout(() => {
			commentsSection.style.outline = '';
		}, 2000);
	}

	/**
	 * Get post data from DOM
	 */
	getPostData(postElement) {
		const titleElement = postElement.querySelector('.post-title a, .masonry-title a');
		const url = titleElement ? titleElement.href : window.location.href;
		const title = titleElement ? titleElement.textContent : document.title;
		const excerpt = postElement.querySelector('.post-excerpt, .masonry-excerpt');

		return {
			id: this.getPostId(postElement),
			url,
			title,
			excerpt: excerpt ? excerpt.textContent : ''
		};
	}

	/**
	 * Get post ID from element
	 */
	getPostId(postElement) {
		// Try to get from data attribute or generate from URL/title
		const dataId = postElement.getAttribute('data-post-id');
		if (dataId) return dataId;

		const titleElement = postElement.querySelector('.post-title a, .masonry-title a');
		if (titleElement) {
			const url = titleElement.href;
			const urlParts = url.split('/');
			return urlParts[urlParts.length - 2] || titleElement.textContent.substring(0, 20);
		}

		return 'unknown';
	}

	/**
	 * Check if device is mobile
	 */
	isMobile() {
		return window.innerWidth <= 767 || /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
	}

	/**
	 * Load action states from localStorage
	 */
	loadActionStates() {
		try {
			const stored = localStorage.getItem('postActionStates');
			if (stored) {
				const states = JSON.parse(stored);
				this.actionStates = new Map(Object.entries(states));
				this.applyStoredStates();
			}
		} catch (error) {
			console.warn('Could not load action states:', error);
		}
	}

	/**
	 * Save action states to localStorage
	 */
	saveActionStates() {
		try {
			const states = Object.fromEntries(this.actionStates);
			localStorage.setItem('postActionStates', JSON.stringify(states));
		} catch (error) {
			console.warn('Could not save action states:', error);
		}
	}

	/**
	 * Apply stored states to actions
	 */
	applyStoredStates() {
		document.querySelectorAll('.post-card, .post-container').forEach(postElement => {
			const postId = this.getPostId(postElement);

			// Apply like state
			const likeAction = postElement.querySelector('[data-action="like"]');
			if (likeAction && this.actionStates.get(`like-${postId}`)) {
				this.setLiked(likeAction, postId);
			}

			// Apply save state
			const saveAction = postElement.querySelector('[data-action="save"]');
			if (saveAction && this.actionStates.get(`save-${postId}`)) {
				this.setSaved(saveAction, postId);
			}
		});
	}

	/**
	 * Track analytics events
	 */
	trackAction(action, postId, value) {
		if (typeof window.trackEvent === 'function') {
			window.trackEvent('Post Actions', action, postId, value);
		}
	}

	/**
	 * Destroy post actions
	 */
	destroy() {
		this.actions.forEach(action => {
			action.removeEventListener('click', this.handleActionClick);
		});

		console.log('👍 Post Actions destroyed');
	}
}

// Add CSS for heart float animation
const style = document.createElement('style');
style.textContent = `
@keyframes heartFloat {
	0% {
		transform: translateY(0) scale(1);
		opacity: 1;
	}
	100% {
		transform: translateY(-50px) scale(0.5);
		opacity: 0;
	}
}
`;
document.head.appendChild(style);