# Development Guide

This Ghost theme includes a modern development workflow with Rollup, PostCSS, and live reload functionality.

## 🚀 Quick Start

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Start development server**
   ```bash
   npm run dev
   ```
   This will:
   - Watch for changes in `src/` files
   - Compile CSS and JavaScript automatically
   - Provide live reload in your browser

3. **Build for production**
   ```bash
   npm run build
   ```

4. **Create theme package**
   ```bash
   npm run zip
   ```

## 📁 Project Structure

```
substack-style/
├── src/                          # Source files (edit these)
│   ├── css/
│   │   ├── screen.css           # Main CSS file (imports others)
│   │   ├── base/
│   │   │   ├── variables.css    # CSS custom properties
│   │   │   ├── normalize.css    # Reset styles
│   │   │   └── typography.css   # Typography styles
│   │   ├── components/          # Component-specific styles
│   │   └── layout/              # Layout and responsive styles
│   └── js/
│       ├── index.js             # Main JavaScript entry point
│       └── modules/             # JavaScript modules
│           ├── theme.js         # Core theme utilities
│           ├── mobile-navigation.js
│           ├── category-tabs.js
│           └── ...
├── assets/
│   └── built/                   # Compiled files (auto-generated)
│       ├── screen.css
│       └── script.js
├── *.hbs                        # Handlebars templates
├── package.json
├── rollup.config.js             # Build configuration
└── README.md
```

## 🛠️ Development Workflow

### CSS Development

- **Edit files in `src/css/`** - these get compiled to `assets/built/screen.css`
- **Use CSS custom properties** defined in `src/css/base/variables.css`
- **Modular structure** - create new component files in `src/css/components/`
- **PostCSS features** available:
  - CSS nesting
  - Custom properties
  - Autoprefixer
  - CSS imports

Example CSS structure:
```css
/* src/css/components/my-component.css */
.my-component {
	background: var(--color-primary);

	&:hover {
		background: var(--color-primary-hover);
	}

	.my-component__title {
		font-size: var(--font-size-xl);
	}
}
```

### JavaScript Development

- **Edit files in `src/js/`** - these get compiled to `assets/built/script.js`
- **Modular structure** - create new modules in `src/js/modules/`
- **ES6+ features** supported with Babel
- **Import/export** between modules

Example JavaScript module:
```javascript
// src/js/modules/my-feature.js
export class MyFeature {
	constructor() {
		this.init();
	}

	init() {
		// Your code here
	}
}

// src/js/index.js
import { MyFeature } from './modules/my-feature';

document.addEventListener('DOMContentLoaded', () => {
	new MyFeature();
});
```

### Live Reload

When running `npm run dev`:
- **CSS changes** trigger automatic compilation and browser refresh
- **JavaScript changes** trigger automatic compilation and browser refresh
- **Handlebars template changes** trigger browser refresh
- **Browser automatically refreshes** when changes are detected

## 🎨 Customization

### Colors

Edit `src/css/base/variables.css`:
```css
:root {
	--color-primary: #your-color;
	--color-primary-hover: #your-hover-color;
	/* etc. */
}
```

### Typography

Edit `src/css/base/typography.css` and variables in `variables.css`:
```css
:root {
	--font-size-base: 16px;
	--font-family-base: your-font-stack;
}
```

### Components

Create new component files in `src/css/components/` and import them in `src/css/screen.css`:
```css
@import "components/my-new-component.css";
```

### JavaScript Features

Add new modules in `src/js/modules/` and import them in `src/js/index.js`:
```javascript
import { MyNewFeature } from './modules/my-new-feature';
```

## 🔧 Build Configuration

### Rollup Configuration

Edit `rollup.config.js` to modify:
- Input/output paths
- PostCSS plugins
- Babel configuration
- Minification settings

### Package Configuration

Edit `package.json` to modify:
- Theme metadata
- Build scripts
- Dependencies

## 📦 Deployment

1. **Build production assets**
   ```bash
   npm run build
   ```

2. **Create theme package**
   ```bash
   npm run zip
   ```

3. **Upload to Ghost**
   - Go to Ghost Admin → Design → Change theme
   - Upload the generated `.zip` file

## 🧪 Testing

- **Test theme structure**
  ```bash
  npm test
  ```
  This runs GScan to check for Ghost compatibility issues.

- **Manual testing**
  - Test on different screen sizes
  - Test all interactive features
  - Verify responsive behavior
  - Check console for errors

## 🐛 Troubleshooting

### Build Issues

- **"Module not found"** - Check import paths in your JavaScript files
- **CSS not compiling** - Check syntax in your CSS files, especially nesting
- **Live reload not working** - Ensure you're running `npm run dev` and browser is open to correct URL

### Development Setup

- **Node.js version** - Ensure you're using Node.js 16+
- **Port conflicts** - Live reload uses default ports, check for conflicts
- **File permissions** - Ensure npm can write to `assets/built/` directory

### Ghost Integration

- **Assets not loading** - Check that `assets/built/` files exist
- **Theme validation errors** - Run `npm test` to check for issues
- **Handlebars errors** - Check template syntax in `.hbs` files

## 📚 Resources

- [Ghost Theme Documentation](https://ghost.org/docs/themes/)
- [Rollup Documentation](https://rollupjs.org/)
- [PostCSS Documentation](https://postcss.org/)
- [Ghost Handlebars Helpers](https://ghost.org/docs/themes/helpers/)

---

Happy theming! 🎨