/**
 * Testimonials Module
 * Handles the display and cycling of testimonial quotes
 */

/**
 * Testimonials Configuration
 * Controls the rotation of testimonial quotes
 */
const TESTIMONIALS_CONFIG = {
	updateInterval: 7000,
	fadeTransitionMs: 500,
	testimonials: [
		{
			quote: "Newsletters suck. This one sucks the most.",
			author: "John Bender",
			avatar: "assets/img/avatars/bender.webp",
			link: "https://thebreakfastclub.fandom.com/wiki/John_Bender"
		},
		{
			quote: "I ain't got time to read this crap",
			author: "Blain Cooper",
			avatar: "assets/img/avatars/blain.webp",
			link: "https://avp.fandom.com/wiki/Blain_Cooper"
		},
		{
			quote: "My life's been one long, glorious 'sitting on beach earning twenty percent' vibe-fest since becoming a member of You Can't Be Serious.",
			author: "Hans Gruber",
			avatar: "assets/img/avatars/hans.webp",
			link: "https://en.wikipedia.org/wiki/Hans_Gruber"
		},
		{
			quote: "I pity the fool who don't support You Can't Be Serious.",
			author: "Clubber Lang",
			avatar: "assets/img/avatars/clubber.webp",
			link: "https://en.wikipedia.org/wiki/Clubber_Lang"
		},
		{
			quote: "This site was, is, and will always be nada",
			author: "Steff McKee",
			avatar: "assets/img/avatars/steff.webp",
			link: "https://en.wikipedia.org/wiki/Pretty_in_Pink"
		},
		{
			quote: "You're God Damn right I read You Can't Be Serious.",
			author: "Colonel Nathan R. Jessup",
			avatar: "assets/img/avatars/jessup.webp",
			link: "https://villains.fandom.com/wiki/Colonel_Nathan_R._Jessup"
		},
		{
			quote: "These people are a stain on the internet. It's best to go about your daily routine and forget they exist.",
			author: "Mildred Ratched",
			avatar: "assets/img/avatars/mildred.webp",
			link: "https://en.wikipedia.org/wiki/Nurse_Ratched"
		},
		{
			quote: "You Can't Be Serious is 90% bullshit, but it's entertaining. That's why I read it because it entertains me.",
			author: "Alonzo Harris",
			avatar: "assets/img/avatars/alonzo.webp",
			link: "https://villains.fandom.com/wiki/Alonzo_Harris"
		},
		{
			quote: "All I need are some tasty waves, a cool buzz, You Can't Be Serious, and I'm fine.",
			author: "Jeff Spicoli",
			avatar: "assets/img/avatars/spicoli.webp",
			link: "https://www.theringer.com/2020/08/26/movies/spicoli-fast-times-ridgemont-high-teen-movie"
		},
		{
			quote: "Listen, I don't bother nobody and nobody bothers me but these brothers are pretty cool. They see 'em you know.",
			author: "Frank",
			avatar: "assets/img/avatars/frank.webp",
			link: "https://en.wikipedia.org/wiki/They_Live"
		},
		{
			quote: "I won't be back.",
			author: "Cyberdyne Model 101",
			avatar: "assets/img/avatars/t800.avif",
			link: "https://en.wikipedia.org/wiki/Terminator_(character)"
		},
		{
			quote: "My God, it's full of bullshit.",
			author: "David Bowman",
			avatar: "assets/img/avatars/bowman.webp",
			link: "https://2001.fandom.com/wiki/David_Bowman"
		},
		{
			quote: "I'd rather staple my eyelids shut than read this trash.",
			author: "Regina George",
			avatar: "assets/img/avatars/regina.webp",
			link: "https://en.wikipedia.org/wiki/Regina_George_(Mean_Girls)"
		},
		{
			quote: "Hey man, I don't wanna rain on their parade, but these guys won't last seventeen days. Easy. Game over for them man.",
			author: "Private William L. Hudson",
			avatar: "assets/img/avatars/hudson.webp",
			link: "https://en.wikipedia.org/wiki/Hudson_%28Aliens%29"
		},
		{
			quote: "This quitting thing, it's a hard habit to break once you start, but one thing I'll never quit is this website.",
			author: "Morris Buttermaker",
			avatar: "assets/img/avatars/buttermaker.webp",
			link: "https://en.wikipedia.org/wiki/The_Bad_News_Bears"
		},
		{
			quote: "Blogs are teeming petri dishes of malignant mediocrity. Written by mental maggots consuming their own predigested pablum. You Can't Be Serious is the excretion.",
			author: "Lydia Tár",
			avatar: "assets/img/avatars/tar.webp",
			link: "https://en.wikipedia.org/wiki/T%C3%A1r"
		}
	]
};

// Sanitize HTML to prevent XSS
function sanitizeHTML(html) {
	if (!html) return '';
	// Create a temporary div element
	const div = document.createElement('div');
	// Safely convert HTML to text
	div.textContent = html;
	// Get the sanitized HTML
	return div.innerHTML
		.replace(/<script[^>]*>.*?<\/script>/gi, '') // Remove script tags
		.replace(/on\w+="[^"]*"/g, '') // Remove event handlers
		.replace(/href="javascript:[^"]*"/g, '') // Remove javascript: URLs
		.replace(/javascript:/gi, '') // Remove javascript: protocol
		.replace(/data:/gi, '') // Remove data: URLs
		.replace(/vbscript:/gi, ''); // Remove vbscript: protocol
}

/**
 * Initialize Testimonials Rotation
 * Handles the display and cycling of testimonial quotes
 */
export function initTestimonials() {
	const testimonialElement = document.getElementById('testimonal');
	if (!testimonialElement) {
		console.log('No testimonial element found');
		return;
	}

	// Create a shuffled array of indices
	let indices = Array.from({ length: TESTIMONIALS_CONFIG.testimonials.length }, (_, i) => i);
	let currentIndex = 0;

	// Fisher-Yates shuffle algorithm
	function shuffleArray(array) {
		for (let i = array.length - 1; i > 0; i--) {
			const j = Math.floor(Math.random() * (i + 1));
			[array[i], array[j]] = [array[j], array[i]];
		}
		return array;
	}

	// Initial shuffle
	indices = shuffleArray(indices);

	// Create testimonial HTML with proper sanitization
	function createTestimonialHTML(testimonial) {
		// Sanitize the input data
		const sanitizedQuote = sanitizeHTML(testimonial.quote);
		const sanitizedAuthor = sanitizeHTML(testimonial.author);
		const sanitizedLink = sanitizeHTML(testimonial.link);
		const sanitizedAvatar = sanitizeHTML(testimonial.avatar);

		// Replace straight apostrophes with curly ones
		const withCurlyApostrophes = sanitizedQuote.replaceAll("'", "\u2019");

		return `<div class="testimonial-content">
			<q>${withCurlyApostrophes}</q>
			<cite><img class="avatar"
				 src="${sanitizedAvatar}"
				 alt="${sanitizedAuthor}'s avatar"
				 onerror="this.style.display='none'">
				 <a href="${sanitizedLink}">${sanitizedAuthor} <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-arrow-up-right-icon lucide-arrow-up-right"><path d="M7 7h10v10"/><path d="M7 17 17 7"/></svg></a>
			</cite>
		</div>`;
	}

	function updateTestimonial() {
		if (!testimonialElement) return;

		const content = testimonialElement.querySelector('.testimonial-content');
		if (content) {
			// Add fade-out class to start the exit animation
			content.classList.add('fade-out');

			setTimeout(() => {
				// Get testimonial using shuffled index
				const testimonial = TESTIMONIALS_CONFIG.testimonials[indices[currentIndex]];

				testimonialElement.innerHTML = createTestimonialHTML(testimonial);
				const newContent = testimonialElement.querySelector('.testimonial-content');

				if (newContent) {
					// Set initial state for entrance animation
					newContent.classList.add('fade-in');

					// Force a reflow before starting the entrance animation
					newContent.offsetHeight;

					// Start entrance animation after a small delay
					requestAnimationFrame(() => {
						requestAnimationFrame(() => {
							newContent.classList.remove('fade-in');
						});
					});
				}

				// Increment index and reshuffle if we've shown all quotes
				currentIndex = (currentIndex + 1) % indices.length;
				if (currentIndex === 0) {
					indices = shuffleArray(indices);
				}
			}, TESTIMONIALS_CONFIG.fadeTransitionMs * 1);
		}
	}

	// Add CSS for testimonial transitions
	const style = document.createElement('style');
	style.textContent = `
		.testimonial-content {
			opacity: 1;
			transform: translateY(0);
			transition: opacity ${TESTIMONIALS_CONFIG.fadeTransitionMs * 1.0}ms ease-in-out,
						transform ${TESTIMONIALS_CONFIG.fadeTransitionMs * 1.0}ms cubic-bezier(0.16, 1, 0.3, 1);
		}
		.testimonial-content.fade-out {
			opacity: 0;
			transform: translateY(20px);
		}
		.testimonial-content.fade-in {
			opacity: 1;
			transform: translateY(-20px);
		}
	`;
	document.head.appendChild(style);

	// Initialize with first testimonial
	updateTestimonial();

	// Set up interval for testimonial rotation
	setInterval(updateTestimonial, TESTIMONIALS_CONFIG.updateInterval);

	console.log('✅ Testimonials initialized');
}