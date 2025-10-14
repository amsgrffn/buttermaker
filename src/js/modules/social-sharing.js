/**
 * Social Sharing Module
 * Handles dropdown toggle, sharing functionality, and accessibility
 * Supports: Clipboard, Email, WhatsApp, Native Share, Mastodon, and more
 */

// Rate limiter utility to prevent abuse
const RateLimiter = {
  getKey(action) {
    const now = Math.floor(Date.now() / 1000 / 60);
    return `rateLimit_${action}_${now}`;
  },

  increment(action, limit) {
    const key = this.getKey(action);
    let count = parseInt(sessionStorage.getItem(key) || '0');
    count++;
    sessionStorage.setItem(key, count.toString());
    return count <= limit;
  },

  checkLimit(action, limit = 60) {
    this.cleanup();
    return this.increment(action, limit);
  },

  cleanup() {
    const now = Math.floor(Date.now() / 1000 / 60);
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && key.startsWith('rateLimit_')) {
        const timeKey = parseInt(key.split('_')[2]);
        if (now - timeKey > 5) {
          sessionStorage.removeItem(key);
        }
      }
    }
  },
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

// Show copy confirmation alert
function showCopyAlert(target, success = true) {
  if (!target) return;

  const dropdown = target.closest('.share-dropdown');
  if (!dropdown) return;

  // Close the dropdown
  hideDropdown(dropdown);

  const rect = dropdown.getBoundingClientRect();
  const alertBox = document.createElement('div');
  alertBox.className = 'copy-alert';
  alertBox.setAttribute('role', 'alert');
  alertBox.setAttribute('aria-live', 'polite');

  Object.assign(alertBox.style, {
    position: 'fixed',
    left: `${rect.left + rect.width / 2}px`,
    bottom: `${window.innerHeight - rect.top + 10}px`,
    backgroundColor: success ? '#ffe680' : '#dc3545',
    boxShadow:
      '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
    color: '#403e38',
    padding: '12px 24px',
    borderRadius: '0.5rem',
    zIndex: '1000',
    fontSize: '16px',
    fontWeight: '700',
    opacity: '0',
    transition: 'opacity 0.3s ease-in-out',
    whiteSpace: 'nowrap',
    transform: 'translateX(-50%)',
  });

  alertBox.innerHTML = success
    ? '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon success-icon"><path d="M14 9V5a3 3 0 0 0-3-3l-4 9v11h11.28a2 2 0 0 0 2-1.7l1.38-9a2 2 0 0 0-2-2.3zM7 22H4a2 2 0 0 1-2-2v-7a2 2 0 0 1 2-2h3"></path></svg> URL copied to clipboard'
    : '<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="alert-icon error-icon"><path d="M10 15v4a3 3 0 0 0 3 3l4-9V2H5.72a2 2 0 0 0-2 1.7l-1.38 9a2 2 0 0 0 2 2.3zm7-13h2.67A2.31 2.31 0 0 1 22 4v7a2.31 2.31 0 0 1-2.33 2H17"></path></svg> Failed to copy URL';

  document.body.appendChild(alertBox);

  requestAnimationFrame(() => {
    alertBox.style.opacity = '1';
    setTimeout(() => {
      alertBox.style.opacity = '0';
      setTimeout(() => alertBox.remove(), 350);
    }, 2000);
  });
}

// DROPDOWN TOGGLE FUNCTIONALITY
function showDropdown(dropdown) {
  const dropdownContent = dropdown.querySelector('.share-dropdown-content');
  if (!dropdownContent) return;

  // Hide all other share dropdowns first
  hideAllDropdowns();

  dropdownContent.classList.add('show');
  dropdown.classList.add('dropdown-active');

  // Set ARIA attributes for accessibility
  const button = dropdown.querySelector('.share-dropbtn');
  if (button) {
    button.setAttribute('aria-expanded', 'true');
  }

  // Focus first share link for keyboard navigation
  const firstLink = dropdownContent.querySelector('a');
  if (firstLink) {
    setTimeout(() => firstLink.focus(), 100);
  }
}

function hideDropdown(dropdown) {
  const dropdownContent = dropdown.querySelector('.share-dropdown-content');
  if (!dropdownContent) return;

  dropdownContent.classList.remove('show');
  dropdown.classList.remove('dropdown-active');

  // Update ARIA attributes
  const button = dropdown.querySelector('.share-dropbtn');
  if (button) {
    button.setAttribute('aria-expanded', 'false');
  }
}

function hideAllDropdowns() {
  // Only target SHARE dropdowns to avoid conflicts with other dropdown systems
  const allShareDropdowns = document.querySelectorAll('.share-dropdown');
  allShareDropdowns.forEach((dropdown) => {
    hideDropdown(dropdown);
  });
}

// Handle dropdown button clicks
function handleDropdownToggle(e) {
  e.preventDefault();
  e.stopPropagation();

  const dropdown = e.target.closest('.share-dropdown');
  if (!dropdown) return;

  const dropdownContent = dropdown.querySelector('.share-dropdown-content');
  const isVisible = dropdownContent.classList.contains('show');

  if (isVisible) {
    hideDropdown(dropdown);
  } else {
    showDropdown(dropdown);
  }
}

// Enhanced keyboard navigation for share dropdowns
function setupShareDropdownKeyboard() {
  // Add keyboard support to all share dropdown buttons
  const shareDropdownButtons = document.querySelectorAll(
    '.share-dropdown .share-dropbtn',
  );

  shareDropdownButtons.forEach((button) => {
    // Set ARIA attributes for screen readers
    button.setAttribute('role', 'button');
    button.setAttribute('aria-haspopup', 'true');
    button.setAttribute('aria-expanded', 'false');
    button.setAttribute('tabindex', '0');

    // Handle keyboard events on dropdown button
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        handleDropdownToggle(e);
      } else if (e.key === 'Escape') {
        const dropdown = button.closest('.share-dropdown');
        hideDropdown(dropdown);
      }
    });
  });

  // Add keyboard navigation to share links within dropdowns
  const shareDropdowns = document.querySelectorAll('.share-dropdown');

  shareDropdowns.forEach((dropdown) => {
    const links = dropdown.querySelectorAll('.share-dropdown-content a');

    links.forEach((link, index) => {
      link.addEventListener('keydown', (e) => {
        switch (e.key) {
          case 'Escape':
            e.preventDefault();
            hideDropdown(dropdown);
            // Return focus to the dropdown button
            const button = dropdown.querySelector('.share-dropbtn');
            if (button) button.focus();
            break;

          case 'ArrowDown':
            e.preventDefault();
            const nextLink = links[index + 1];
            if (nextLink) {
              nextLink.focus();
            } else {
              links[0].focus(); // Loop to first
            }
            break;

          case 'ArrowUp':
            e.preventDefault();
            const prevLink = links[index - 1];
            if (prevLink) {
              prevLink.focus();
            } else {
              links[links.length - 1].focus(); // Loop to last
            }
            break;

          case 'Tab':
            // Close dropdown when tabbing out of last link
            if (e.shiftKey && index === 0) {
              hideDropdown(dropdown);
            } else if (!e.shiftKey && index === links.length - 1) {
              hideDropdown(dropdown);
            }
            break;
        }
      });

      // Close dropdown when a share action is taken
      link.addEventListener('click', () => {
        setTimeout(() => {
          hideDropdown(dropdown);
        }, 100);
      });
    });
  });
}

// Add to Clipboard functionality
async function handleClipboardClick(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!RateLimiter.checkLimit('clipboardCopy', 10)) {
    console.warn('Too many clipboard attempts');
    return;
  }

  // Find the article - works for both note cards and regular posts
  const noteItem = e.target.closest('.note-item');
  const article = e.target.closest('article');
  const container = noteItem || article;

  if (!container) return;

  // Get the URL from different possible link structures
  let url;
  if (noteItem) {
    // For notes, look for the note title link
    const noteLink = noteItem.querySelector('.note-title a, .note-date a');
    url = noteLink ? noteLink.href : window.location.href;
  } else {
    // For regular articles, look for the main article link
    const articleLink = container.querySelector('h2 a, .post-title a');
    url = articleLink ? articleLink.href : window.location.href;
  }

  try {
    await navigator.clipboard.writeText(url);
    showCopyAlert(e.target, true);
  } catch (err) {
    console.error('Failed to copy URL:', err);
    showCopyAlert(e.target, false);
  }
}

// Email sharing handler
function handleEmailShare(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!RateLimiter.checkLimit('emailShare', 10)) {
    console.warn('Too many email share attempts');
    return;
  }

  // Find the container and get post data
  const noteItem = e.target.closest('.note-item');
  const article = e.target.closest('article');
  const container = noteItem || article;

  if (!container) return;

  let url, title;
  if (noteItem) {
    const noteLink = noteItem.querySelector('.note-title a, .note-date a');
    const noteTitle = noteItem.querySelector('.note-title a');
    url = noteLink ? noteLink.href : window.location.href;
    title = noteTitle ? noteTitle.textContent : document.title;
  } else {
    const articleLink = container.querySelector('h2 a, .post-title a');
    url = articleLink ? articleLink.href : window.location.href;
    title = articleLink ? articleLink.textContent : document.title;
  }

  const sanitizedTitle = sanitizeText(title);
  const emailSubject = `Check out this post: ${sanitizedTitle}`;
  const emailBody = `I thought you might enjoy this:\n\n${sanitizedTitle}\n\n${url}`;
  const mailtoUrl = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(emailBody)}`;

  // Create and click a temporary link
  const tempLink = document.createElement('a');
  tempLink.href = mailtoUrl;
  tempLink.style.display = 'none';
  document.body.appendChild(tempLink);
  tempLink.click();
  document.body.removeChild(tempLink);
}

// Get WhatsApp share URL
function getWhatsAppShareUrl(url, title) {
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
  const whatsappBase = isMobile
    ? 'whatsapp://send'
    : 'https://web.whatsapp.com/send';
  const shareText = `${title}\n\n${url}`;
  return `${whatsappBase}?text=${encodeURIComponent(shareText)}`;
}

// Native share handler
function handleNativeShare(e) {
  e.preventDefault();
  e.stopPropagation();

  const noteItem = e.target.closest('.note-item');
  const article = e.target.closest('article');
  const container = noteItem || article;

  if (!container) return;

  let url, title;
  if (noteItem) {
    const noteLink = noteItem.querySelector('.note-title a, .note-date a');
    const noteTitle = noteItem.querySelector('.note-title a');
    url = noteLink ? noteLink.href : window.location.href;
    title = noteTitle ? noteTitle.textContent : document.title;
  } else {
    const articleLink = container.querySelector('h2 a, .post-title a');
    url = articleLink ? articleLink.href : window.location.href;
    title = articleLink ? articleLink.textContent : document.title;
  }

  const sanitizedTitle = sanitizeText(title);
  const shareData = { title: sanitizedTitle, text: sanitizedTitle, url: url };

  if (navigator.share) {
    navigator
      .share(shareData)
      .then(() => console.log('Shared successfully'))
      .catch((err) => {
        if (err.name !== 'AbortError') {
          console.error('Share failed:', err);
        }
      });
  }
}

// WhatsApp share handler
function handleWhatsAppShare(e) {
  e.preventDefault();
  e.stopPropagation();

  const noteItem = e.target.closest('.note-item');
  const article = e.target.closest('article');
  const container = noteItem || article;

  if (!container) return;

  let url, title;
  if (noteItem) {
    const noteLink = noteItem.querySelector('.note-title a, .note-date a');
    const noteTitle = noteItem.querySelector('.note-title a');
    url = noteLink ? noteLink.href : window.location.href;
    title = noteTitle ? noteTitle.textContent : document.title;
  } else {
    const articleLink = container.querySelector('h2 a, .post-title a');
    url = articleLink ? articleLink.href : window.location.href;
    title = articleLink ? articleLink.textContent : document.title;
  }

  const sanitizedTitle = sanitizeText(title);
  window.open(
    getWhatsAppShareUrl(url, sanitizedTitle),
    '_blank',
    'noopener,noreferrer',
  );
}

// Mastodon share handler
function handleMastodonShare(e) {
  e.preventDefault();
  e.stopPropagation();

  if (!RateLimiter.checkLimit('mastodonShare', 10)) {
    console.warn('Too many share attempts');
    return;
  }

  const noteItem = e.target.closest('.note-item');
  const article = e.target.closest('article');
  const container = noteItem || article;

  if (!container) return;

  let url, title;
  if (noteItem) {
    const noteLink = noteItem.querySelector('.note-title a, .note-date a');
    const noteTitle = noteItem.querySelector('.note-title a');
    url = noteLink ? noteLink.href : window.location.href;
    title = noteTitle ? noteTitle.textContent : document.title;
  } else {
    const articleLink = container.querySelector('h2 a, .post-title a');
    url = articleLink ? articleLink.href : window.location.href;
    title = articleLink ? articleLink.textContent : document.title;
  }

  const sanitizedTitle = sanitizeText(title);
  let instance = window.prompt(
    'Enter your Mastodon instance URL:',
    localStorage.getItem('mastodon-instance') || 'mastodon.social',
  );

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

/**
 * Initialize social sharing functionality
 * Main export function that sets up all sharing and accessibility features
 */
export function initSocialSharing() {
  // Set up accessible keyboard navigation for share dropdowns
  setupShareDropdownKeyboard();

  // Handle dropdown toggle and sharing clicks
  document.addEventListener('click', (e) => {
    // Check if share dropdown button was clicked (specific targeting to avoid conflicts)
    if (e.target.closest('.share-dropdown .share-dropbtn')) {
      handleDropdownToggle(e);
      return;
    }

    // Check if footer share trigger was clicked
    if (e.target.closest('.trigger-share-footer')) {
      e.preventDefault();

      const triggerLink = e.target.closest('.trigger-share-footer');
      const postFooter = triggerLink.closest('.post-footer');

      if (postFooter) {
        const dropdown = postFooter.querySelector('.share-dropdown');
        const dropdownContent = postFooter.querySelector(
          '.share-dropdown-content',
        );

        if (dropdown && dropdownContent) {
          // Close other dropdowns first
          hideAllDropdowns();

          // Get the position of the trigger link
          const linkRect = triggerLink.getBoundingClientRect();

          // Position the dropdown centered below the link
          dropdownContent.style.left = `${linkRect.left + linkRect.width / 2}px`;
          dropdownContent.style.top = `${linkRect.bottom + 10}px`; // 10px gap below link
          dropdownContent.style.transform = 'translateX(-50%)'; // Center it

          // Toggle the dropdown
          dropdown.classList.toggle('active');
        }
      }
      return;
    }

    // Check for sharing buttons
    const copyUrlButton = e.target.closest('.copy-url');
    const emailShareButton = e.target.closest('.email-share');
    const nativeShareButton = e.target.closest('.native-share');
    const whatsappShareButton = e.target.closest('.whatsapp-share');
    const mastodonShareButton = e.target.closest('.mastodon-share');

    // Handle different sharing actions
    if (copyUrlButton) {
      handleClipboardClick(e);
    } else if (emailShareButton) {
      handleEmailShare(e);
    } else if (nativeShareButton) {
      handleNativeShare(e);
    } else if (whatsappShareButton) {
      handleWhatsAppShare(e);
    } else if (mastodonShareButton) {
      handleMastodonShare(e);
    } else {
      // Click outside share dropdown - close all share dropdowns
      if (!e.target.closest('.share-dropdown')) {
        hideAllDropdowns();
      }
    }
  });

  // Global ESC key handler for share dropdowns
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      hideAllDropdowns();
    }
  });

  // Show native share buttons if supported
  if (navigator.share) {
    const nativeShareButtons = document.querySelectorAll('.native-share');
    nativeShareButtons.forEach((btn) => {
      btn.style.display = 'block';
    });
  }

  console.log('✅ Accessible social sharing initialized');
}
