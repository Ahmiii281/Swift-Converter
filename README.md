# Swift Converter

Fast, privacy-first file conversion tools that run entirely in your browser.

This is a lightweight static web app offering multiple utilities with a clean, responsive UI, accessible markup, and dark/light theme support.

## Features

- **Image to Text (OCR)**: Extract text from images using Tesseract.js
- **PDF to Word**: Convert PDF files to editable `.docx`
- **PPTX to PDF**: Turn PowerPoint presentations into PDFs
- **QR Code Generator**: Generate and download QR codes
- **Privacy-first**: Processing happens locally in the browser
- **Responsive and Accessible**: WCAG-friendly, keyboard navigable
- **Theme Support**: Automatic dark/light mode with manual toggle
- **PWA-ready**: Manifest present; service worker files included

## Pages

- `public/index.html` — Home
- `public/imagetotext.html` — Image to Text (OCR)
- `public/pdftoword.html` — PDF to Word
- `public/pptxtopdf.html` — PPTX to PDF
- `public/qrgenerator.html` — QR Code Generator
- Legal: `Docs/privacy-policy.html`, `Docs/terms-of-services.html`

## Getting started (local)

1) Clone the repo and open the workspace.

2) Serve the `public/` folder with any static server (recommended):

```bash
npx serve public -l 5173 --single --yes
```

3) Or simply open `public/index.html` directly in your browser.

## Project structure

```text
Swift-Converter/
├─ public/
│  ├─ index.html
│  ├─ imagetotext.html
│  ├─ pdftoword.html
│  ├─ pptxtopdf.html
│  ├─ qrgenerator.html
│  ├─ images/
│  └─ style.css
├─ JS/
│  ├─ imagetotext.js
│  ├─ pdftoword.js
│  ├─ pptxtopdf.js
│  ├─ qr-generator.js
│  ├─ nav.js
│  ├─ theme.js
│  ├─ palette.js
│  ├─ service-worker.js
│  └─ sw.js
├─ Docs/
│  ├─ privacy-policy.html
│  └─ terms-of-services.html
├─ netlify.toml
└─ vercel.json
```

## Tech notes

- Semantic HTML with skip links and ARIA attributes
- CSS variables, grid/flex layouts, responsive design
- ES6+ modules with async/await and error handling
- Optional CDN resources (icons, fonts)
- Manifest in `public/manifest.json`; service worker files present

## Deployment

- Netlify/Vercel: configure site root to the `public/` directory
- `netlify.toml` and `vercel.json` are included as simple defaults

## Contributing

PRs are welcome. Keep changes accessible, semantic, and consistent with the existing style (CSS variables, small modular JS).

## License

© 2025 Swift Converter. All Rights Reserved.
