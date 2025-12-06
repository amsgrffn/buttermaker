# The Pile - Scattered Card Layout Feature

## Overview

**The Pile** is an interactive card layout component for the Buttermaker Ghost theme that displays content cards in a scattered, overlapping "messy desk" style. Cards appear randomly positioned and rotated, creating a tactile, physical aesthetic. On hover or focus, cards "lift up" from the pile for better readability.

### Features

- 🃏 **Randomized scatter** - Cards are positioned with random rotation and placement on page load
- 🎯 **Hover interactions** - Cards straighten, scale up, and come to the front when hovered
- 👆 **Touch support** - Mobile-friendly with touch interactions
- ⌨️ **Keyboard accessible** - Full keyboard navigation with Tab and Enter
- 🌓 **Dark mode ready** - Fully integrated with Buttermaker's dark mode
- 📱 **Responsive** - Adaptive scatter range based on device size
- ♿ **Accessible** - Respects `prefers-reduced-motion`

## Files Created

```
buttermaker/
├── src/
│   ├── css/components/the-pile.css          # Card styling and transitions
│   └── js/modules/the-pile.js               # Scatter logic and interactions
├── partials/sections/the-pile.hbs           # Handlebars template with dummy content
├── page-pile-test.hbs                       # Test page template
├── test-the-pile.html                       # Standalone HTML test file
└── THE-PILE-README.md                       # This file
```

## Quick Start

### 1. Test with Standalone HTML

The fastest way to see the feature in action:

```bash
# Open the test file in your browser
open test-the-pile.html
```

This file contains everything self-contained - no build required.

### 2. Test in Ghost Theme

Build the theme and test in your local Ghost instance:

```bash
# Build the assets
npm run build

# Restart Ghost to pick up changes
ghost restart
```

Then create a new page in Ghost Admin with the slug `pile-test` to use the `page-pile-test.hbs` template.

### 3. Add to Any Page

Include the pile section in any Handlebars template:

```handlebars
{{> "sections/the-pile"}}
```

## Integration with Ghost Data

The current implementation uses dummy content. To make it dynamic with your Ghost posts:

### Replace the Partial Content

Edit `partials/sections/the-pile.hbs` and replace the dummy cards with:

```handlebars
<section class="the-pile">
    {{#foreach posts limit="10"}}
    <article class="pile-card pile-card--{{primary_tag.slug}}">
        <h3 class="pile-card__title">
            <a href="{{url}}">{{title}}</a>
        </h3>
        {{#if feature_image}}
        <img src="{{img_url feature_image size="s"}}"
             alt="{{title}}"
             class="pile-card__image">
        {{/if}}
        <p class="pile-card__excerpt">{{excerpt characters="140"}}</p>
        <div class="pile-card__meta">
            {{#if primary_tag}}
            <span class="pile-card__tag">{{primary_tag.name}}</span>
            {{/if}}
            <time datetime="{{date format="YYYY-MM-DD"}}">
                {{date format="MMM DD, YYYY"}}
            </time>
        </div>
    </article>
    {{/foreach}}
</section>
```

### Card Type Styling by Tag

The pile supports different card styles based on type. Map Ghost tags to card types:

- `pile-card--photo` - Photo/Photography tags (blue accent)
- `pile-card--link` - Link/Bookmark tags (orange accent)
- `pile-card--note` - Note/Quick tags (pink accent)
- `pile-card--article` - Article/Essay tags (green accent)
- `pile-card--default` - Everything else (purple accent)

You can add conditional logic to assign card types:

```handlebars
{{!-- Determine card type based on primary tag --}}
{{#match primary_tag.slug "photo|photography"}}
    pile-card--photo
{{else match primary_tag.slug "link|bookmark"}}
    pile-card--link
{{else match primary_tag.slug "note|quick"}}
    pile-card--note
{{else}}
    pile-card--article
{{/match}}
```

## Customization

### Adjust Scatter Range

Edit `src/js/modules/the-pile.js` in the `scatterCards()` method:

```javascript
// Desktop scatter (default)
rotationRange = 15;  // degrees
xRange = 120;        // pixels
yRange = 120;        // pixels

// Make it messier:
rotationRange = 25;
xRange = 200;
yRange = 200;

// Make it neater:
rotationRange = 5;
xRange = 60;
yRange = 60;
```

### Change Card Colors

Edit `src/css/components/the-pile.css` to customize card type colors:

```css
.pile-card--photo {
    border-left: 4px solid var(--color-blue);  /* Change accent color */
}

.pile-card--link {
    border-left: 4px solid var(--color-orange);
}
```

### Modify Hover Behavior

Adjust hover scale and timing in `src/js/modules/the-pile.js`:

```javascript
pickUpCard(card) {
    const scaleAmount = 1.08;  // Increase for more dramatic effect
    // ...
}
```

Or in `src/css/components/the-pile.css`:

```css
.pile-card {
    transition: all 0.35s cubic-bezier(0.4, 0, 0.2, 1);  /* Change timing */
}
```

### Container Styling

Adjust the pile container background and size:

```css
.the-pile {
    min-height: 600px;              /* Container height */
    background: var(--color-background-light);  /* Background color */
    border-radius: var(--radius-lg);
}
```

## Responsive Behavior

The pile automatically adjusts based on screen size:

| Device | Width | Rotation Range | Position Range |
|--------|-------|----------------|----------------|
| Desktop | >1024px | ±15° | ±120px |
| Tablet | 768-1024px | ±12° | ±80px |
| Mobile | <768px | ±8° | ±40px |

Cards also resize:
- Desktop: 280px wide
- Tablet: 260px wide
- Mobile: 240px wide
- Small mobile: 220px wide

## Accessibility Features

### Keyboard Navigation

- **Tab** - Navigate between cards
- **Enter** - Follow card link
- **Focus states** - Mirror hover effects

### Screen Readers

Cards are semantic `<article>` elements with proper heading hierarchy and links.

### Reduced Motion

Users with `prefers-reduced-motion` enabled get:
- No transforms or transitions
- Simpler opacity changes
- No blur effects

## Performance Considerations

### Optimizations Built-In

- Uses CSS transforms (GPU-accelerated)
- `will-change: transform` for smooth animations
- Dynamic imports (only loads when `.the-pile` exists)
- Debounced resize handler

### Recommendations

- **Limit card count** - 8-12 cards works best visually and for performance
- **Lazy load images** - Use `loading="lazy"` on card images
- **Test on mobile** - Ensure smooth scrolling with scatter effects

## Browser Support

- ✅ Modern Chrome/Edge (100+)
- ✅ Firefox (100+)
- ✅ Safari (15+)
- ✅ Mobile Safari
- ✅ Chrome Android

Uses CSS custom properties, transforms, and modern JavaScript. IE11 not supported.

## Troubleshooting

### Cards aren't scattering

**Problem:** Cards appear in a vertical list, not scattered.

**Solution:** 
1. Check that JavaScript loaded: Open console, look for "🃏 The Pile loaded"
2. Verify `.the-pile` class exists on container
3. Run `npm run build` to compile latest changes
4. Clear browser cache

### Cards overlap too much

**Problem:** Can't see/access some cards.

**Solution:**
- Reduce `xRange` and `yRange` in `scatterCards()`
- Increase container `min-height` in CSS
- Reduce number of cards displayed

### Hover effect not working

**Problem:** Cards don't lift on hover.

**Solution:**
1. Check browser console for JavaScript errors
2. Verify the card has `.pile-card` class
3. Check that CSS transitions are enabled
4. Disable any browser extensions blocking JavaScript

### Cards don't re-scatter on resize

**Problem:** Cards keep old positions after window resize.

**Solution:**
- Resize handler has 250ms debounce - wait a moment
- Check console for errors
- Verify device type actually changed (mobile↔tablet↔desktop)

### Dark mode styling issues

**Problem:** Cards look wrong in dark mode.

**Solution:**
- Verify dark mode CSS variables are defined in `variables.css`
- Check that `html.dark-mode` or `body.dark-mode` selectors exist
- Rebuild CSS: `npm run build`

## Examples

### Homepage Feature

Add to `home.hbs` or `index.hbs`:

```handlebars
<div class="home-hero">
    <h1>Latest from the Blog</h1>
    {{> "sections/the-pile"}}
</div>
```

### Dedicated "Archive" Page

Create `page-archive.hbs`:

```handlebars
{{!< default}}

<article class="page-archive">
    <header>
        <h1>The Archive</h1>
        <p>Random thoughts, photos, and links from the past</p>
    </header>
    
    {{> "sections/the-pile"}}
</article>
```

### Filtered by Tag

Show only specific tagged posts:

```handlebars
<section class="the-pile">
    {{#get "posts" limit="10" filter="tag:featured"}}
        {{#foreach posts}}
            {{!-- Card markup here --}}
        {{/foreach}}
    {{/get}}
</section>
```

## Development Workflow

1. **Edit source files** in `src/css/components/` or `src/js/modules/`
2. **Build** with `npm run build` or `npm run dev` (watch mode)
3. **Test** in browser at `localhost:2368` or open `test-the-pile.html`
4. **Iterate** and rebuild

## Future Enhancements

Ideas for extending the pile:

- **Drag and drop** - Let users rearrange cards
- **Flip animation** - Click to flip card and show back side
- **Filter/Sort** - Filter cards by type, sort by date
- **Saved state** - Remember card positions in localStorage
- **Animation on scroll** - Cards fly in when section scrolls into view
- **3D transforms** - Add perspective for depth effect

## Credits

- Concept inspired by physical index card aesthetics
- Built for Buttermaker Ghost theme
- Uses CSS transforms and modern JavaScript
- Images from Unsplash (for demo purposes)

## Support

Questions or issues? Check:
1. Browser console for JavaScript errors
2. Build output for CSS/JS compilation errors
3. Ghost logs for theme errors
4. This README troubleshooting section

---

**Version:** 1.0.0  
**Last Updated:** December 2024  
**Theme:** Buttermaker (riggs)