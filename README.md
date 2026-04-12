# Photo Selector

Live: **https://photo-selector.y3z.ai**

A local-first web app for browsing a folder of photos and marking favorites. Favorited images are copied into a `favorites/` subfolder on disk, so your selections persist as real files — no database, no upload, nothing leaves your machine.

## Features

- Pick any local folder and view all images (JPG, PNG, WEBP, GIF) in a responsive grid
- Toggle favorites with one click — files are copied into a `favorites/` subfolder you can open in Finder/Explorer
- Immersive full-screen viewer with keyboard navigation:
  - `←` / `→` — previous / next photo
  - `Space` — toggle favorite
  - `Esc` — exit
- Filter between all photos and favorites

## Requirements

Requires a Chromium-based desktop browser (Chrome, Edge, Arc, Brave) for the [File System Access API](https://developer.mozilla.org/en-US/docs/Web/API/File_System_Access_API). Firefox and Safari are not supported.

## Getting started

```bash
npm install
npm run dev
```

Open http://localhost:3000 and click **Select Folder**.

## Scripts

- `npm run dev` — start the Vite dev server on port 3000
- `npm run build` — production build
- `npm run preview` — preview the production build
- `npm run lint` — type-check with `tsc --noEmit`

## Stack

React 19, TypeScript, Vite, Tailwind CSS v4, lucide-react.
