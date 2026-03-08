# Swift Converter

> **Fast, private, browser-based file conversion tools.** Everything runs locally — no data ever leaves your device.

[![Netlify](https://img.shields.io/badge/Deploy-Netlify-00C7B7?logo=netlify)](#deployment)
[![Vercel](https://img.shields.io/badge/Deploy-Vercel-000?logo=vercel)](#deployment)

---

## Overview

Swift Converter is a static web application that bundles five productivity tools into a clean, accessible, mobile-responsive UI with dark/light mode support.

All processing happens **in the browser** using open-source JavaScript libraries — no server is involved and no files are uploaded anywhere.

---

## Tools

| Tool | Description | Library Used |
|------|-------------|--------------|
| **Image to Text** | OCR — extract text from images | [Tesseract.js v4.1.1](https://github.com/naptha/tesseract.js) |
| **PDF to Word** | Extract text from PDF and export as `.docx` | [PDF.js 2.16.105](https://mozilla.github.io/pdf.js/) + [docx 8.5.0](https://docx.js.org/) |
| **PPTX to PDF** | Parse PPTX slides and render as PDF | [JSZip 3.10.1](https://stuk.github.io/jszip/) + [jsPDF 2.5.1](https://github.com/parallax/jsPDF) |
| **QR Generator** | Create customisable QR codes and download as PNG | [qr-code-styling 1.6.0](https://github.com/kozakdenys/qr-code-styling) |
| **URL Shortener** | Shorten URLs via TinyURL's public API | Native `fetch` |

---

## Features

- 🔒 **Privacy-first** — zero server uploads; files never leave the browser
- ⚡ **Lightning-fast** — no round-trip to a backend
- 📱 **Responsive** — works on all screen sizes
- ♿ **Accessible** — ARIA attributes, skip-links, keyboard navigation
- 🌙 **Dark/Light mode** — persists preference in `localStorage`; respects OS preference
- 📦 **PWA-ready** — Web App Manifest + Service Worker for offline-capable caching

---

## Project Structure

```
Swift-Converter/
├── public/
│   ├── index.html            ← Home / landing page
│   ├── imagetotext.html      ← Image to Text (OCR)
│   ├── pdftoword.html        ← PDF to Word converter
│   ├── pptxtopdf.html        ← PPTX to PDF converter
│   ├── qrgenerator.html      ← QR Code Generator
│   ├── urlshortener.html     ← URL Shortener
│   ├── style.css             ← Single shared stylesheet (CSS variables, dark/light)
│   ├── manifest.json         ← PWA Web App Manifest
│   └── images/               ← Icons, favicon, OG images
├── JS/
│   ├── imagetotext.js        ← ImageToTextConverter class (Tesseract OCR)
│   ├── pdftoword.js          ← PdfToWordConverter class (PDF.js + docx)
│   ├── pptxtopdf.js          ← PptxToPdfConverter class (JSZip + jsPDF)
│   ├── qr-generator.js       ← QR code generation (qr-code-styling)
│   ├── urlshortener.js       ← UrlShortener class (TinyURL API)
│   ├── nav.js                ← Mobile hamburger menu toggle
│   ├── theme.js              ← ThemeManager class (dark/light, localStorage)
│   ├── service-worker.js     ← Full-featured Service Worker (cache-first / network-first)
│   └── sw.js                 ← Minimal legacy Service Worker fallback
├── Docs/
│   ├── privacy-policy.html
│   └── terms-of-services.html
├── netlify.toml              ← Netlify: publish dir = public/
└── vercel.json               ← Vercel: rewrites for all pages
```

---

## Getting Started (Local Development)

### Option 1 — Serve with `npx serve` (recommended)

```bash
npx serve public -l 5173 --yes
```

Then open **http://localhost:5173** in your browser.

### Option 2 — Open directly in browser

Double-click `public/index.html`. Most features work fine, but the Service Worker and some browser APIs (clipboard, etc.) require a served origin.

---

## How Each Tool Works

### Image to Text
1. User selects an image (JPG, PNG, GIF, BMP, TIFF — up to 10 MB).
2. The image is read via `FileReader`, then pre-processed on a `<canvas>` (greyscale + contrast boost) to improve OCR accuracy.
3. [Tesseract.js](https://github.com/naptha/tesseract.js) performs OCR in a web worker.
4. Extracted text is displayed and can be copied or downloaded as `.txt`.

### PDF to Word
1. User selects a PDF file (up to 25 MB).
2. [PDF.js](https://mozilla.github.io/pdf.js/) parses the document page-by-page, extracting text items and their (x, y) positions.
3. Items are sorted top-to-bottom / left-to-right so reading order is preserved.
4. The extracted text is packaged into a `.docx` file using the [docx](https://docx.js.org/) library.
5. User downloads the generated `.docx` directly from the browser.

### PPTX to PDF
1. User selects a `.pptx` file (up to 50 MB).
2. [JSZip](https://stuk.github.io/jszip/) opens the PPTX (which is a ZIP archive) and extracts each slide's XML.
3. Text nodes (`<a:t>`) are parsed from the XMLs.
4. [jsPDF](https://github.com/parallax/jsPDF) renders the text onto landscape PDF pages (960×540 pt — standard 16:9 slide).
5. User downloads the PDF.

> **Note:** This is a text-only conversion. Images, shapes, and rich formatting from the PPTX are not rendered.

### QR Generator
1. User enters text or a URL.
2. [qr-code-styling](https://github.com/kozakdenys/qr-code-styling) generates a styled QR code (configurable dot styles, colours, size).
3. User can download the QR code as a PNG.

### URL Shortener
1. User enters a URL starting with `http://` or `https://`.
2. A GET request is made to `https://tinyurl.com/api-create.php?url=<encoded-URL>`.
3. The shortened URL is displayed and can be copied.

> **Note:** The TinyURL API is a third-party service. Shortening may fail due to CORS restrictions in some browser environments or network conditions.

---

## Architecture Notes

- **CSS Variables** drive the entire design system. Dark/light mode is achieved by toggling `data-theme` on `<html>`.
- **`ThemeManager`** (in `theme.js`) applies the theme immediately (before DOM ready) to prevent flash of wrong theme.
- **Class-based JS** — each tool is a single ES6 class handling UI state, file validation, conversion, and download.
- **File validation** (MIME type + size) runs on every file input `change` event before enabling the convert button.
- **Progress UI** provides user feedback during long-running OCR or multi-page PDF extractions.

---

## Deployment

### Netlify
`netlify.toml` sets `publish = "public"`. Push to your repo and connect it to Netlify — the `public/` folder is served as the site root automatically.

### Vercel
`vercel.json` includes rewrites for all pages (index, imagetotext, pdftoword, pptxtopdf, qrgenerator, urlshortener) so direct navigation and deep links work correctly.

---

## Browser Compatibility

| Feature | Chrome | Firefox | Safari | Edge |
|---------|--------|---------|--------|------|
| Core tools | ✅ | ✅ | ✅ | ✅ |
| Clipboard API | ✅ | ✅ | ✅ 13.1+ | ✅ |
| Service Worker | ✅ | ✅ | ✅ 11.1+ | ✅ |
| PWA Install | ✅ | ❌ | ✅ 16.4+ | ✅ |

---

## Contributing

PRs are welcome. Please keep changes:
- **Accessible** — ARIA attributes, keyboard navigable
- **Semantic** — use appropriate HTML5 elements
- **Consistent** — follow the existing CSS variable system and class-based JS pattern

---

## License

© 2025 Swift Converter. All Rights Reserved.