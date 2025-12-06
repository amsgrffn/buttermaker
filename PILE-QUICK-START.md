# The Pile - Quick Start Guide

Get up and running with the scattered card layout in 2 minutes.

## 🚀 Fastest Way to Test

### Option 1: Standalone HTML (No Build Required)

```bash
# Just open the test file in your browser
open buttermaker/test-the-pile.html
```

**What you'll see:**
- 10 scattered cards in a messy pile
- Hover over cards to "pick them up"
- Try dark mode toggle
- Test keyboard navigation (Tab + Enter)

### Option 2: In Your Ghost Theme

```bash
# 1. Build the theme
cd buttermaker
npm run build

# 2. Restart Ghost
ghost restart

# 3. In Ghost Admin, create a new page:
#    - Title: "The Pile Test"
#    - Slug: "pile-test"
#    - Publish it

# 4. Visit: http://localhost:2368/pile-test/
```

## 📝 Add to Your Homepage

Edit your `home.hbs` or `index.hbs`:

```handlebars
{{!-- Add anywhere in your page --}}
{{> "sections/the-pile"}}
```

Then rebuild:
```bash
npm run build
```

## 🎨 Quick Customizations

### Make it Messier/Neater

Edit `src/js/modules/the-pile.js` line 53:

```javascript
// Messier (more chaos)
rotationRange = 25;
xRange = 200;
yRange = 200;

// Neater (less chaos)
rotationRange = 5;
xRange = 50;
yRange = 50;
```

### Change Colors

Edit `src/css/components/the-pile.css` around line 65:

```css
.pile-card--photo {
    border-left: 4px solid #FF0000;  /* Change to any color */
}
```

### Limit Number of Cards

In your template, change the limit:

```handlebars
{{#foreach posts limit="8"}}  {{!-- Show only 8 cards --}}
```

## ✅ Checklist: Is It Working?

Open browser console and look for:
```
🃏 The Pile initializing with 10 cards
✅ The Pile initialized
```

**Test these interactions:**
- [ ] Cards are scattered randomly on page load
- [ ] Hover a card → it straightens and scales up
- [ ] Other cards dim when one is hovered
- [ ] Card returns to messy position on mouse leave
- [ ] Tab key navigates between cards
- [ ] Enter key follows card links
- [ ] Works in dark mode
- [ ] Responsive on mobile (reduced scatter)

## 🐛 Quick Fixes

**Cards not scattering?**
```bash
# Clear cache and rebuild
npm run clean
npm run build
```

**JavaScript not loading?**
- Check console for errors
- Verify `.the-pile` class exists in HTML
- Make sure `npm run build` completed successfully

**Cards too overlapped?**
- Reduce number of cards to 8-10
- Increase container height in CSS
- Reduce scatter range (see customizations above)

## 🎯 Next Steps

1. **Test with dummy content first** (already done ✓)
2. **Replace with Ghost data** - See `THE-PILE-README.md` section "Integration with Ghost Data"
3. **Customize colors** to match your brand
4. **Adjust scatter range** to your taste
5. **Add to your favorite page template**

## 📚 Full Documentation

See `THE-PILE-README.md` for:
- Complete Ghost integration examples
- Advanced customization options
- Accessibility features
- Troubleshooting guide
- Performance tips

---

**Need help?** Check browser console for errors or review the full README.