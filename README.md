# Swift Converter - Professional File Conversion Tool

A modern, professional web application for converting files between different formats. Built with accessibility, performance, and user experience in mind.

## 🚀 Features

### Core Conversion Tools
- **Image to Text (OCR)**: Extract text from images using advanced Tesseract.js
- **PDF to Word**: Convert PDF documents to editable Word format
- **PPTX to PDF**: Transform PowerPoint presentations to PDF (with alternative solutions)

### Professional Features
- ✨ **Modern Design**: Clean, professional UI with dark/light theme support
- 📱 **Responsive**: Optimized for desktop, tablet, and mobile devices
- ♿ **Accessible**: WCAG compliant with screen reader support
- 🔒 **Privacy-First**: All processing happens locally in your browser
- ⚡ **Fast**: Optimized performance with lazy loading and efficient algorithms
- 🎨 **PWA Ready**: Installable as a Progressive Web App
- 🌙 **Theme Support**: Automatic dark/light mode detection

## 🛠️ Technical Improvements

### HTML Structure
- Semantic HTML5 elements (`<main>`, `<section>`, `<nav>`, `<header>`, `<footer>`)
- Comprehensive meta tags for SEO and social sharing
- ARIA labels and accessibility attributes
- Skip links for keyboard navigation

### CSS Architecture
- CSS Custom Properties (CSS Variables) for consistent theming
- Modern CSS Grid and Flexbox layouts
- Mobile-first responsive design
- Professional color palette with dark mode support
- Smooth animations and transitions
- Print-friendly styles

### JavaScript Enhancements
- ES6+ class-based architecture
- Comprehensive error handling
- File validation and size limits
- Progress indicators and loading states
- Modern async/await patterns
- Service Worker for offline functionality

### Performance Optimizations
- Preconnect to external domains
- Lazy loading of resources
- Efficient caching strategies
- Optimized bundle sizes
- CDN integration for external libraries

### Accessibility Features
- WCAG 2.1 AA compliance
- Keyboard navigation support
- Screen reader compatibility
- High contrast mode support
- Focus management
- ARIA live regions for dynamic content

## 📁 Project Structure

# Swift Converter

A lightweight, privacy-first static web app for converting files in the browser. It provides multiple conversion tools and is designed for accessibility, performance and a consistent, responsive UI.

Summary of features
- Image to Text (OCR) — client-side Tesseract.js-based OCR.
- PDF to Word — client-side PDF processing and export to .docx.
- PPTX to PDF — convert presentations to PDF (client-side helpers).
- QR Generator — generate and download QR codes (added).
- Theme support (light/dark) with a polished, responsive design.
- Mobile-friendly navigation with a collapsible hamburger menu.
- Privacy-first: processing happens locally in the browser.
```

3. Visit the site and test:
- Homepage: `public/index.html`
- Image to Text: `public/imagetotext.html`
- PDF to Word: `public/pdftoword.html`
- PPTX to PDF: `public/pptxtopdf.html`
- QR Generator: `public/qrgenerator.html` (enter text/URL, generate, download)

Changes since last update
- Added QR generator page and `JS/qr-generator.js` (uses qrcodejs CDN).
- Added mobile navigation (hamburger) with `JS/nav.js` and CSS rules.
- Harmonized `style.css` for consistent inputs/buttons and QR preview.
- Header navigation updated across pages so every page includes links to all tools.

Project structure (important files)

```
Swift-Converter/
├── public/
│   ├── index.html
│   ├── imagetotext.html
│   ├── pdftoword.html
│   ├── pptxtopdf.html
│   ├── qrgenerator.html       # New: QR generator UI
│   └── style.css
├── JS/
│   ├── imagetotext.js
│   ├── pdftoword.js
│   ├── pptxtopdf.js
│   ├── qr-generator.js       # New: QR generator logic
│   ├── nav.js                # New: mobile nav toggle
│   └── theme.js
└── Docs/
    ├── privacy-policy.html
    └── terms-of-services.html
```

Notes & tips
- The app is static and requires no server-side components — everything runs client-side in the browser.
- If you prefer to avoid CDN dependencies for qrcodejs or fonts, you can vendor the files into the repo and update the HTML to point to local copies.
- For deployment, Netlify or Vercel work well — point the platform to serve the `public/` folder as the site root.

Accessibility & mobile friendliness
- All pages include skip links, ARIA attributes, and keyboard-accessible controls.
- Mobile nav collapses into a hamburger; the menu is accessible and closes on outside clicks.

Next suggested improvements
- SVG download option for QR codes.
- Drawer-style mobile nav (slide-in) with a keyboard trap when open.
- Optional branding/logo overlay in QR (with scannability warnings).
- Automated visual tests (Puppeteer) to verify conversion flows and theme toggling.

License

© 2025 Swift Converter. All Rights Reserved.

Contributing

PRs are welcome — please follow the repo conventions: semantic HTML, CSS variables, small modular JS, and accessibility-first changes.
