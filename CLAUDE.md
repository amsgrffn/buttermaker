# CLAUDE.md - AI Assistant Guide for Buttermaker Theme

## Project Overview

**Buttermaker** (internal name: "riggs") is a Ghost CMS theme with a Substack-inspired design, featuring masonry layout, dark mode, and modern JavaScript/CSS architecture. This is a creative content-focused theme built for Ghost v5.0+.

**Key Technologies:**
- Ghost CMS v5.0+ (Handlebars templating)
- Rollup (build system)
- PostCSS (CSS processing)
- ES6+ JavaScript with dynamic imports
- Modern CSS with custom properties

## Repository Structure

```
buttermaker/
├── src/                          # Source files (ALWAYS edit these, not built files)
│   ├── css/
│   │   ├── screen.css           # Main CSS entry (imports all others)
│   │   ├── base/                # Core styles (variables, typography, normalize)
│   │   ├── components/          # Reusable UI components
│   │   ├── layout/              # Layout and responsive styles
│   │   └── pages/               # Page-specific styles
│   └── js/
│       ├── index.js             # Main JS entry (dynamic imports)
│       └── modules/             # JavaScript modules (19+ modules)
├── assets/
│   ├── built/                   # Compiled CSS/JS (NEVER edit directly)
│   ├── img/                     # Images
│   └── [fonts/, gifs/]          # Ignored by git
├── partials/
│   ├── components/              # Reusable template components
│   ├── icons/                   # SVG icon partials
│   ├── layout/                  # Layout partials (header, sidebar)
│   ├── sections/                # Page sections
│   ├── utilities/               # Utility partials
│   └── widgets/                 # Widget components
├── *.hbs                        # Handlebars templates (13 templates)
├── package.json                 # Theme metadata & scripts
├── rollup.config.js             # Build configuration
└── README.md, DEVELOPMENT.md    # Documentation
```

## Critical Development Rules

### 1. NEVER Edit Built Files
- **NEVER** edit files in `assets/built/` - they are auto-generated
- **ALWAYS** edit source files in `src/css/` and `src/js/`
- Built files are gitignored and overwritten on every build

### 2. File Editing Workflow
When modifying CSS or JavaScript:
1. Edit files in `src/` directory
2. Run `npm run build` or `npm run dev` (auto-rebuilds)
3. Changes compile to `assets/built/`
4. Ghost loads from `assets/built/`

### 3. Template Structure
- **Main templates** (root *.hbs files): `default.hbs`, `index.hbs`, `post.hbs`, `page.hbs`, `author.hbs`, `tag.hbs`, `error.hbs`, `home.hbs`, `blog.hbs`
- **Custom page templates**: `page-contact.hbs`, `page-memberships.hbs`, `page-office-hours.hbs`, `page-watched-movies.hbs`
- **Partials** (reusable): Located in `partials/` subdirectories

### 4. CSS Architecture
```
src/css/screen.css (main entry)
├── base/
│   ├── animations.css
│   ├── fonts.css
│   ├── normalize.css
│   ├── variables.css        # CSS custom properties (colors, spacing, etc.)
│   └── typography.css
├── components/              # 12 component files
│   ├── blog-article.css
│   ├── masonry.css
│   ├── sidebar.css
│   └── [9 more...]
├── layout/
│   ├── layout.css
│   └── responsive.css
└── pages/                   # Page-specific styles
    ├── contact-page.css
    ├── memberships-page.css
    ├── office-hours.css
    └── watched-movies.css
```

**CSS Conventions:**
- Use CSS custom properties from `variables.css`
- PostCSS nesting is available: `&:hover`, `.child {}`
- Modern features: custom properties, nesting, imports
- Production build minifies with cssnano

### 5. JavaScript Architecture

**Entry Point:** `src/js/index.js`

**Loading Strategy:**
1. **Critical** (loaded immediately): theme.js, dark-mode.js, mobile-navigation.js, touch-improvements.js
2. **Dynamic** (loaded when DOM elements exist): masonry-grid.js, search.js, infinite-scroll.js, etc.
3. **Deferred** (loaded when idle): testimonials.js, weather-display.js, social-sharing.js, etc.

**19 JavaScript Modules:**
- `theme.js` - Core theme utilities
- `dark-mode.js` - Dark/light mode toggle
- `mobile-navigation.js` - Mobile sidebar navigation
- `masonry-grid.js` - Masonry layout for posts
- `infinite-scroll.js` - Load more posts
- `search.js` - Search functionality
- `category-tabs.js` - Category filtering
- `portal-integration.js` - Ghost membership portal
- `subscribe-buttons.js` - Newsletter subscription
- `post-actions.js` - Post like/share actions
- `blog-post-display.js` - Post rendering enhancements
- `horizontal-scroll.js` - Horizontal scroll sections
- `breadcrumb-dropdown.js` - Breadcrumb navigation
- `short-date-formatter.js` - Date formatting
- `touch-improvements.js` - Mobile touch enhancements
- `testimonials.js` - Testimonial widget
- `weather-display.js` - Weather widget
- `knicks-counter.js` - Custom counter widget
- `current-time.js` - Time display widget

**Module Pattern:**
```javascript
// Export class or function
export class MyFeature {
  constructor() {
    this.init();
  }
  init() { /* ... */ }
}

// Import in index.js
import { MyFeature } from './modules/my-feature';
new MyFeature();
```

### 6. Build System (Rollup)

**Commands:**
- `npm run dev` - Development mode with live reload (watches files)
- `npm run build` - Production build (minified, no sourcemaps)
- `npm run zip` - Create theme package for Ghost upload
- `npm test` - Run GScan theme validator
- `npm run clean` - Remove built assets

**Build Process:**
1. JavaScript: `src/js/index.js` → `assets/built/script.js` (ES modules, code-splitting enabled)
2. CSS: `src/css/screen.css` → `assets/built/screen.css` (PostCSS processing)
3. Live reload: Watches `assets/built/`, `*.hbs`, `partials/**/*.hbs`

**Rollup Features:**
- ES modules with dynamic imports (code-splitting)
- Babel transpilation for older browsers
- Terser minification (production)
- PostCSS with autoprefixer, nesting, cssnano
- Live reload server (port 35729)

## Development Workflows

### Adding a New Feature

1. **For CSS changes:**
   ```bash
   # Edit component
   vim src/css/components/my-component.css

   # Import in screen.css
   echo '@import "components/my-component.css";' >> src/css/screen.css

   # Build
   npm run build
   ```

2. **For JavaScript features:**
   ```bash
   # Create module
   vim src/js/modules/my-feature.js

   # Import in index.js (add conditional loading)
   # Edit src/js/index.js to import and initialize

   # Build
   npm run build
   ```

3. **For template changes:**
   ```bash
   # Edit Handlebars template
   vim post.hbs
   # OR create/edit partial
   vim partials/components/my-component.hbs

   # No build needed for templates (Ghost loads them directly)
   # But live reload will trigger if npm run dev is running
   ```

### Adding a New Page Template

1. Create `page-{slug}.hbs` in root (e.g., `page-about.hbs`)
2. Add corresponding CSS in `src/css/pages/{slug}.css`
3. Import CSS in `src/css/screen.css`
4. Build and test
5. In Ghost Admin, create page with matching slug

### Modifying Styles

**IMPORTANT:** Always edit `src/css/` files, never `assets/built/screen.css`

1. Find the relevant CSS file:
   - Variables: `src/css/base/variables.css`
   - Typography: `src/css/base/typography.css`
   - Components: `src/css/components/{component}.css`
   - Layout: `src/css/layout/{layout}.css`
2. Make changes
3. Run `npm run dev` for live updates OR `npm run build`

### Performance Optimization

**The theme already implements:**
- Dynamic JavaScript imports (only load what's needed)
- CSS minification in production
- Modern image formats (WebP, AVIF) configured
- Resource hints (preconnect, dns-prefetch)
- Non-blocking font loading
- ES modules for code-splitting
- Idle callback for non-critical features

**When adding features:**
- Use dynamic imports for non-critical features
- Add features to appropriate loading category (critical/dynamic/deferred)
- Test with slow network throttling
- Keep bundle sizes small

## Ghost Theme Specifics

### Handlebars Templates

**Template Hierarchy:**
- `default.hbs` - Base template (all pages use this)
- `index.hbs` - Home page (post list)
- `home.hbs` - Custom home page alternative
- `post.hbs` - Single post view
- `page.hbs` - Static page view
- `page-{slug}.hbs` - Custom page templates
- `author.hbs` - Author archive
- `tag.hbs` - Tag archive
- `error.hbs` - 404 and error pages

**Key Helpers:**
- `{{body_class}}` - Context-aware body classes
- `{{meta_title}}`, `{{meta_description}}` - SEO meta
- `{{asset "path"}}` - Asset URL helper
- `{{ghost_head}}`, `{{ghost_foot}}` - Ghost injected code
- `{{> "partial-name"}}` - Include partial
- `{{#is "context"}}...{{/is}}` - Context conditionals

### Theme Configuration

**package.json config:**
- `card_assets: true` - Enable card assets
- `posts_per_page: 30` - Posts per page
- `image_sizes` - Responsive image sizes (xxs to xl)
- `image_formats` - WebP and AVIF quality settings

### Ghost Membership/Portal

The theme integrates with Ghost's built-in membership system:
- `portal-integration.js` handles member portal
- `subscribe-buttons.js` handles newsletter signup
- Custom membership page: `page-memberships.hbs`

## Common Tasks for AI Assistants

### 1. Styling Changes
```bash
# Find relevant CSS file
# Edit src/css/components/[component].css or src/css/base/variables.css
# Run build
npm run build
```

### 2. Adding JavaScript Functionality
```bash
# Create new module in src/js/modules/my-feature.js
# Import in src/js/index.js with appropriate loading strategy
# Build
npm run build
```

### 3. Template Modifications
```bash
# Edit *.hbs file directly (no build needed for templates)
# If creating new partial, place in partials/[category]/
# Reference with {{> "category/partial-name"}}
```

### 4. Theme Testing
```bash
# Validate theme with GScan
npm test

# Manual testing checklist:
# - Test on mobile, tablet, desktop
# - Test dark/light mode toggle
# - Test all interactive features (search, infinite scroll, etc.)
# - Check console for errors
# - Test membership/subscription flows
```

### 5. Deployment
```bash
# Build production assets
npm run build

# Create theme package
npm run zip

# Upload to Ghost Admin > Design > Change theme
```

## Troubleshooting Guide

### Build Failures
- **Module not found**: Check import paths in JS files
- **CSS syntax error**: Check for unclosed braces, invalid nesting
- **PostCSS error**: Verify CSS syntax, especially modern features

### Styling Issues
- **Styles not applying**: Did you edit `src/css/` and run build?
- **Built file missing**: Run `npm run build`
- **Variables not working**: Check `src/css/base/variables.css` for custom property definitions

### JavaScript Issues
- **Module not loading**: Check conditional logic in `src/js/index.js`
- **Console errors**: Check browser console, verify module exports
- **Dynamic import failing**: Ensure module exists and exports correctly

### Ghost Integration
- **Theme validation errors**: Run `npm test` for detailed errors
- **Assets not loading**: Check `assets/built/` files exist
- **Handlebars errors**: Check template syntax, matching opening/closing tags
- **Portal not working**: Check `portal-integration.js` module is loaded

## Git Workflow

**Current Branch:** `claude/claude-md-misonw53v3bx4uxo-01EiyVzJVbXcnnfA21SZyr4v`

**Ignored Files:**
- `node_modules/`
- `assets/built/` (auto-generated)
- `*.zip` (theme packages)
- `assets/fonts/`, `assets/gifs/`, `assets/img/` (asset files)
- `.env*` (environment files)

**When Committing:**
1. Never commit `assets/built/` files
2. Always commit source files in `src/`
3. Commit template changes (*.hbs, partials/)
4. Commit configuration (package.json, rollup.config.js)

## Key Conventions

1. **Always edit source files** (`src/`), never built files (`assets/built/`)
2. **Run builds** after CSS/JS changes
3. **Use dynamic imports** for non-critical JavaScript
4. **Follow CSS organization**: base → components → layout → pages
5. **Test with GScan** before deploying (`npm test`)
6. **Use custom properties** for values that might change
7. **Keep bundles small** - only import what's needed
8. **Mobile-first responsive** design approach
9. **Accessibility matters** - maintain ARIA labels, semantic HTML
10. **Performance first** - lazy load, code-split, optimize images

## Quick Reference

**File Paths:**
- CSS source: `/home/user/buttermaker/src/css/`
- JS source: `/home/user/buttermaker/src/js/`
- Templates: `/home/user/buttermaker/*.hbs`
- Partials: `/home/user/buttermaker/partials/`
- Built assets: `/home/user/buttermaker/assets/built/`
- Config: `/home/user/buttermaker/rollup.config.js`

**Important Files:**
- `src/css/screen.css` - Main CSS entry point
- `src/css/base/variables.css` - CSS custom properties
- `src/js/index.js` - Main JavaScript entry point
- `default.hbs` - Base template layout
- `package.json` - Theme metadata and scripts
- `rollup.config.js` - Build configuration

**External Dependencies:**
- Adobe Fonts (Typekit): `https://use.typekit.net/unt3hxg.css`
- Lite YouTube: `@justinribeiro/lite-youtube` (CDN)

## Local Testing Workflow

**Development Environment:**
- Primary development machine: iMac
- Local Ghost instance: `http://localhost:2368/`
- Ghost admin interface: `http://localhost:2368/ghost/`
- Live reload enabled via `npm run dev`

**Testing Checklist:**
- Verify changes render correctly at `localhost:2368`
- Test dark mode toggle functionality after CSS/JS changes
- Check mobile responsiveness at viewport breakpoints: 320px, 768px, 1024px
- Confirm infinite scroll functionality works
- Review all changes in both light and dark modes
- Test custom page templates (contact, memberships, office hours, watched movies)
- Check browser console for JavaScript errors
- Verify masonry layout on homepage

**Responsive Testing:**
- Mobile-first approach (design for 320px first)
- Tablet breakpoint: 768px
- Desktop breakpoint: 1024px
- Use browser dev tools for viewport testing

## Design Philosophy

The Buttermaker theme prioritizes:
- **Privacy-focused**: No tracking, minimal external dependencies (only Adobe Fonts)
- **Content-first**: Clean, minimal design that puts writing front and center
- **Performance**: Fast loading times, optimized assets, code-splitting
- **Accessibility**: Semantic HTML, ARIA labels, keyboard navigation
- **Modern web standards**: CSS custom properties, ES6+ JavaScript, responsive design

## Quick Ghost Helper Reference

**Most commonly used Ghost helpers:**
- `{{#foreach posts}}...{{/foreach}}` - Loop through posts collection
- `{{content}}` - Render post content
- `{{excerpt}}` - Post excerpt
- `{{@blog.title}}`, `{{@blog.url}}` - Site-wide settings
- `{{#is "home"}}...{{/is}}` - Context-based conditionals (home, post, page, tag, author)
- `{{asset "built/screen.css"}}` - Generate asset URL
- `{{img_url}}` - Generate responsive image URLs
- `{{tags}}`, `{{primary_tag}}` - Post tags
- `{{authors}}`, `{{primary_author}}` - Post authors
- `{{reading_time}}` - Estimated reading time

**Template contexts:**
- `home` - Homepage
- `post` - Single post
- `page` - Static page
- `tag` - Tag archive
- `author` - Author archive
- `error` - 404/error pages

---

**Last Updated:** 2025-12-05
**Ghost Version:** 5.0+
**Theme Name:** riggs (Buttermaker)
**Author:** Amos Moses Griffin
