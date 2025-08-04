/**
 * Social Sharing Module
 * Handles clipboard copying, email sharing, WhatsApp, native share, and Mastodon
 */

// Rate limiter utility to prevent abuse
const RateLimiter = {
	getKey(action) {
		// Create a key based on the current minute
		const now = Math.floor(Date.now() / 1000 / 60);
		return `rateLimit_${action}_${now}`;
	},

	increment(action, limit) {
		const key = this.getKey(action);
		// Get current count or start at 0
		let count = parseInt(sessionStorage.getItem(key) || '0');
		count++;
		// Store updated count
		sessionStorage.setItem(key, count.toString());
		return count <= limit;
	},

	checkLimit(action, limit = 60, windowMs = 60000) {
		// Clean up old entries first
		this.cleanup();
		return this.increment(action, limit);
	},

	cleanup() {
		const now = Math.floor(Date.now() / 1000 / 60);
		// Iterate through all storage items
		for (let i = 0; i < sessionStorage.length; i++) {
			const key = sessionStorage.key(i);
			if (key && key.startsWith('rateLimit_')) {
				const timeKey = parseInt(key.split('_')[2]);
				// Remove entries older than 5 minutes
				if (now - timeKey > 5) {
					sessionStorage.removeItem(key);
				}
			}
		}
	}
};

// Sanitize text to prevent XSS attacks
function sanitizeText(text, maxLength = 150) {
	if (!text) return '';
	const div = document.createElement('div');
	div.textContent = text;
	return div.textContent
		.slice(0, maxLength)
		.replace(/javascript:|data:|vbscript:|file:|blob:|ftp:|ws:|wss:/i, '')
		.replace(/[<>'"`{}()\[\]]/g, '');
}

// Add to Clipboard functionality
async function handleClipboardClick(e) {
	e.preventDefault();
	e.stopPropagation();

	if (!RateLimiter.checkLimit('clipboardCopy', 10)) {
		console.warn('Too many clipboard attempts');
		return;
	}

	const article = e.target.closest('article');
	if (!article) return;

	const articleLink = article.querySelector('h2 a');
	const url = articleLink ? articleLink.href : window.location.href;

	try {
		await navigator.clipboard.writeText(url);
		const target = e.target.closest('.copy-url');
		showCopyAlert(target, true);
	} catch (err) {
		console.error('Failed to copy URL:', err);
		showCopyAlert(e.target, false);
	}
}

// Show copy confirmation alert
function showCopyAlert(target, success = true) {
	if (!target) return;

	const dropdown = target.closest('.dropdown');
	if (!dropdown) return;

	// Close the dropdown
	const dropdownContent = dropdown.querySelector('.dropdown-content');
	if (dropdownContent) {
		dropdownContent.style.display = 'none';
	}

	const rect = dropdown.getBoundingClientRect();
	const alertBox = document.createElement('div');
	alertBox.className = 'copy-alert';
	alertBox.setAttribute('role', 'alert');
	alertBox.setAttribute('aria-live', 'polite');

	Object.assign(alertBox.style, {
		position: 'fixed',
		left: `${rect.left + (rect.width / 2)}px`,
		bottom: `${window.innerHeight - rect.top + 10}px`,
		backgroundColor: success ? '#ffe680' : '#dc3545',
		boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1), 0 0 0 1px rgb(17 24 39 / 0.1)',
		color: '#403e38',
		padding: '12px 24px',
		borderRadius: '0.5rem',
		zIndex: '1000',
		fontSize: '16px',
		fontWeight: '700',
		opacity: '0',
		transition: 'opacity 0.3s ease-in-out',
		whiteSpace: 'nowrap',
		transform: 'translateX(-50%)'
	});

	// Update the alert message to include an SVG thumbs up icon with a class for styling
	alertBox.innerHTML = success ?
	  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon success-icon"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg> URL copied to clipboard' :
	  '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon error-icon"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg> Failed to copy URL';
	document.body.appendChild(alertBox);

	requestAnimationFrame(() => {
		alertBox.style.opacity = '1';
		setTimeout(() => {
			alertBox.style.opacity = '0';
			setTimeout(() => alertBox.remove(), 350);
		}, 2000);
	});
}

// Get WhatsApp share URL
function getWhatsAppShareUrl(url, title) {
	const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
	const whatsappBase = isMobile ? 'whatsapp://send' : 'https://web.whatsapp.com/send';
	const shareText = `${title}\n\n${url}`;
	return `${whatsappBase}?text=${encodeURIComponent(shareText)}`;
}

// Email sharing handler
function handleEmailShare(e) {
	e.preventDefault();
	e.stopPropagation();

	if (!RateLimiter.checkLimit('emailShare', 10)) {
		console.warn('Too many email share attempts');
		return;
	}

	const article = e.target.closest('article');
	if (!article) return;

	const articleLink = article.querySelector('h2 a');
	const url = articleLink ? articleLink.href : window.location.href;
	const rawTitle = articleLink ? articleLink.textContent : document.title;
	const sanitizedTitle = sanitizeText(rawTitle);

	const emailSubject = `Check out this article: ${sanitizedTitle}`;
	const emailBody = `I thought you might enjoy this article:\n\n${sanitizedTitle}\n\n${url}`;
	const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

	// Create and click a temporary link
	const tempLink = document.createElement('a');
	tempLink.href = mailtoUrl;
	tempLink.style.display = 'none';
	document.body.appendChild(tempLink);
	tempLink.click();
	document.body.removeChild(tempLink);
}

/**
 * Initialize social sharing functionality
 */
export function initSocialSharing() {
	// Add click event listeners for all sharing buttons
	document.addEventListener('click', (e) => {
		// Prevent too many clicks
		if (!RateLimiter.checkLimit('globalClicks', 100, 60000)) {
			console.warn('Too many clicks detected');
			return;
		}

		// Target is the clicked element OR its closest parent matching the selector
		const copyUrlButton = e.target.closest('.copy-url');
		const emailShareButton = e.target.closest('.email-share');
		const nativeShareButton = e.target.closest('.native-share');
		const whatsappShareButton = e.target.closest('.whatsapp-share');
		const mastodonShareButton = e.target.closest('.mastodon-share');

		// Handle clipboard clicks
		if (copyUrlButton) {
			handleClipboardClick(e);
		}

		// Handle email shares
		if (emailShareButton) {
			handleEmailShare(e);
		}

		// Handle native share
		if (nativeShareButton) {
			e.preventDefault();
			e.stopPropagation();

			const article = e.target.closest('article');
			if (!article) return;

			const articleLink = article.querySelector('h2 a');
			const url = articleLink ? articleLink.href : window.location.href;
			const rawTitle = articleLink ? articleLink.textContent : document.title;
			const sanitizedTitle = sanitizeText(rawTitle);

			const shareData = {
				title: sanitizedTitle,
				text: sanitizedTitle,
				url: url
			};

			// First check if we can share this specific data
			if (navigator.canShare && navigator.canShare(shareData)) {
				navigator.share(shareData)
					.then(() => console.log('Shared successfully'))
					.catch((err) => {
						if (err.name !== 'AbortError') {
							console.error('Share failed:', err);
						}
					});
			} else if (navigator.share) {
				// Fallback to just checking share API availability
				navigator.share(shareData)
					.then(() => console.log('Shared successfully'))
					.catch((err) => {
						if (err.name !== 'AbortError') {
							console.error('Share failed:', err);
						}
					});
			} else {
				console.log('Web Share API not supported');
			}
		}

		// Handle WhatsApp shares
		if (whatsappShareButton) {
			e.preventDefault();
			e.stopPropagation();

			const article = e.target.closest('article');
			if (!article) return;

			const articleLink = article.querySelector('h2 a');
			const url = articleLink ? articleLink.href : window.location.href;
			const rawTitle = articleLink ? articleLink.textContent : document.title;
			const sanitizedTitle = sanitizeText(rawTitle);

			window.open(getWhatsAppShareUrl(url, sanitizedTitle), '_blank', 'noopener,noreferrer');
		}

		// Handle Mastodon shares
		if (mastodonShareButton) {
			e.preventDefault();
			e.stopPropagation();

			if (!RateLimiter.checkLimit('mastodonShare', 10)) {
				console.warn('Too many share attempts');
				return;
			}

			const article = e.target.closest('article');
			if (!article) return;

			const articleLink = article.querySelector('h2 a');
			const url = articleLink ? articleLink.href : window.location.href;
			const rawTitle = articleLink ? articleLink.textContent : document.title;
			const sanitizedTitle = sanitizeText(rawTitle);

			let instance = window.prompt('Enter your Mastodon instance URL:', localStorage.getItem('mastodon-instance') || 'mastodon.social');

			if (instance) {
				const cleanInstance = instance
					.replace(/^https?:\/\//, '')
					.replace(/\/$/, '')
					.replace(/[<>'"`{}()\[\]]/g, '');
				const shareText = `${sanitizedTitle}\n\n${url}`;
				const shareUrl = `https://${cleanInstance}/share?text=${encodeURIComponent(shareText)}`;
				window.open(shareUrl, '_blank', 'noopener,noreferrer');
				localStorage.setItem('mastodon-instance', cleanInstance);
			}
		}
	});

	// Show native share buttons if supported
	if (navigator.share) {
		const nativeShareButtons = document.querySelectorAll('.native-share');
		nativeShareButtons.forEach(btn => {
			btn.style.display = 'block';
		});
	}

	console.log('✅ Social sharing initialized');
}