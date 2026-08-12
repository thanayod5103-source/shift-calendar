# Shift Calendar 2026 — PWA V2

PWA version of the Shift Calendar.

## Home Screen
### iPhone / iPad
1. Host these files on HTTPS.
2. Open the URL in Safari.
3. Share → Add to Home Screen → Add.
4. Launch from the new Home Screen icon.

### Android
1. Host on HTTPS.
2. Open in Chrome.
3. Install app / Add to Home screen.

## Important
- A PWA cannot be fully installed from the ChatGPT file Preview.
- Service Worker and PWA install require a web origin, normally HTTPS (localhost is also allowed for development).
- The app keeps the existing Excel Import, Annual/Month views, Shift A/B/C/D, Notes and local Overrides.
- Data remains local in the browser/local device unless a backend is added later.
- Excel Import currently uses the existing SheetJS CDN path from the demo. For a truly offline-first production build, bundle the parser locally rather than loading it from a CDN.
