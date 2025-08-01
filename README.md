# Substack-Style Ghost Theme

A modern, responsive Ghost theme inspired by Substack's clean design and discovery interface. Perfect for creative writers, artists, and content creators who want a newsletter-style blog with masonry layouts for showcasing poetry, fiction, artwork, and cartoons.

## ✨ Features

- **Substack-inspired design** with discovery homepage layout
- **Masonry grid layout** for creative content showcase
- **Smart content categorization** based on Ghost tags
- **Fully responsive** - optimized for mobile, tablet, and desktop
- **Newsletter-focused** with integrated Ghost member portal
- **Tag-based auto-sizing** for different content types
- **Clean typography** optimized for reading
- **Mobile-first navigation** with slide-out sidebar

## 🎨 Content Types

The theme automatically recognizes and styles different content types based on your Ghost tags:

- **Poetry/Poems** (`poetry`, `poem`) → Tall cards with ✍️ badge
- **Cartoons/Art** (`cartoon`, `drawing`, `art`) → Wide cards with 🎨 badge
- **Fiction/Stories** (`fiction`, `story`, `short-story`) → Large cards with 📖 badge
- **Essays** (`essay`, `opinion`, `thoughts`) → Standard cards with 💭 badge

## 📁 Theme Structure

```
substack-style/
├── package.json           # Theme configuration
├── default.hbs           # Base layout template
├── index.hbs             # Homepage template
├── post.hbs              # Individual post template
├── assets/
│   ├── css/
│   │   └── screen.css    # Main stylesheet
│   └── js/
│       └── script.js     # Interactive functionality
└── README.md             # This file
```

## 🚀 Installation

### Method 1: Upload Theme (Recommended)

1. **Download the theme files** and create a folder structure as shown above
2. **Zip the theme folder** (make sure the files are in the root of the zip, not in a subfolder)
3. **Go to your Ghost Admin** → Design → Change theme
4. **Upload the zip file** and activate the theme

### Method 2: Ghost CLI (for developers)

```bash
# Navigate to your Ghost content/themes directory
cd content/themes/

# Create theme directory
mkdir substack-style
cd substack-style

# Copy all theme files to this directory
# Then restart Ghost
ghost restart
```

## ⚙️ Configuration

### Required Ghost Settings

1. **Enable Members** in Ghost Admin → Settings → Members
2. **Configure your site details** in Settings → General
3. **Set up your navigation** in Settings → Design

### Recommended Tags

Create these tags in Ghost Admin for optimal theme functionality:

- `poetry` - For poems and poetry content
- `fiction` - For short stories and fiction
- `cartoon` - For cartoons and illustrations
- `art` - For artwork and drawings
- `essay` - For essays and opinion pieces
- `journal` - For personal journal entries

### Featured Content

- **Mark posts as "Featured"** to display them in the sidebar widget
- **Add feature images** to posts for better visual impact in the masonry grid
- **Use excerpts** to control preview text in the feed

## 🎛️ Customization

### Colors

The theme uses these main colors (defined in `screen.css`):

- **Primary Orange**: `#ff6719` (Substack's signature color)
- **Text Dark**: `#1a1a1a`
- **Text Light**: `#6b6b6b`
- **Background**: `#ffffff`
- **Border**: `#e6e6e6`

To customize colors, edit the CSS variables in `assets/css/screen.css`.

### Sidebar Navigation

Customize the sidebar links in `default.hbs` around line 45:

```handlebars
<li><a href="{{@site.url}}/tag/poetry/" class="sidebar-link">
	<span class="sidebar-icon">✍️</span>
	Poetry
</a></li>
```

### Typography

The theme uses system fonts for optimal performance:
```css
font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen', 'Ubuntu', 'Cantarell', sans-serif;
```

## 📱 Mobile Optimization

- **Hamburger menu** for mobile navigation
- **Touch-friendly buttons** with 44px minimum touch targets
- **Horizontal scrolling** category tabs
- **Responsive masonry grid** that adapts to screen size
- **Optimized images** with Ghost's responsive images

## 🔧 Development

### Local Development

1. **Set up Ghost locally** following the [Ghost documentation](https://ghost.org/docs/install/local/)
2. **Clone this theme** into `content/themes/substack-style/`
3. **Restart Ghost** and activate the theme
4. **Make changes** to templates, CSS, or JavaScript
5. **Test on multiple devices** and screen sizes

### File Structure

- **`default.hbs`** - Base template with header, sidebar, and footer
- **`index.hbs`** - Homepage with masonry grid and post feed
- **`post.hbs`** - Individual post template
- **`screen.css`** - All styles with responsive design
- **`script.js`** - Interactive functionality and mobile navigation

## 🎯 Usage Tips

### For Best Results

1. **Use high-quality feature images** (recommended: 1200x600px)
2. **Write compelling excerpts** for better preview cards
3. **Tag your content consistently** for proper categorization
4. **Mark your best content as "Featured"** for sidebar display
5. **Write engaging titles** - they're prominently displayed

### Content Strategy

- **Mix content types** for visual variety in the masonry grid
- **Use feature images** for visual posts (art, photos)
- **Write excerpts** for text-heavy posts without images
- **Organize with tags** for easy navigation and filtering

## 🐛 Troubleshooting

### Common Issues

**Masonry cards not sizing correctly:**
- Check that your posts have the correct tags (`poetry`, `cartoon`, etc.)
- Ensure tags are exactly as specified (case-sensitive)

**Mobile menu not working:**
- Verify `script.js` is loading properly
- Check browser console for JavaScript errors

**Images not displaying:**
- Ensure Ghost image upload is working
- Check image file sizes (Ghost has upload limits)

**Styling issues:**
- Clear browser cache
- Check that `screen.css` is loading
- Verify theme file structure

### Support

For theme-related issues:
1. Check the [Ghost documentation](https://ghost.org/docs/)
2. Verify all theme files are properly uploaded
3. Test with Ghost's default theme to isolate issues

## 📄 License

This theme is released under the MIT License. Feel free to modify and distribute as needed.

## 🙏 Credits

- Design inspired by [Substack](https://substack.com)
- Built for [Ghost](https://ghost.org)
- Uses Ghost's Handlebars templating system

---

**Enjoy your new Substack-style Ghost theme! Perfect for showcasing creative writing, poetry, art, and building a newsletter-style blog.**