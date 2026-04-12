Desktop build of the app at <https://photo-selector.y3z.ai>. Uses the File System Access API to browse and favorite photos from any folder on your disk. Nothing leaves your computer.

## Install

### macOS (Apple Silicon)

1. Download **`Photo-Selector-{{VERSION}}-arm64.dmg`** below.
2. Open the dmg and drag **Photo Selector** into your Applications folder.
3. First launch will show *"Photo Selector is damaged and can't be opened."* This is macOS Gatekeeper blocking unsigned apps. Run this once in Terminal to unblock:
   ```
   xattr -cr "/Applications/Photo Selector.app"
   ```
   Then double-click the app normally — it will open cleanly on every subsequent launch.

### macOS (Intel)

1. Download **`Photo-Selector-{{VERSION}}-x64.dmg`** below.
2. Same install steps as above.

### Windows

1. Download **`Photo-Selector-Setup-{{VERSION}}.exe`** below.
2. Run the installer. Windows SmartScreen may warn that the publisher is unknown — click **More info → Run anyway**.

### Linux

1. Download **`Photo-Selector-{{VERSION}}.AppImage`** below.
2. `chmod +x Photo-Selector-{{VERSION}}.AppImage`
3. Run it.

## Usage

Click **Select Folder**, pick a folder of photos, and use the heart icon to favorite. Favorites are copied to a `favorites/` subfolder on disk. In the full-screen viewer: `←` / `→` to navigate, `Space` to toggle favorite, `Esc` to exit.

## Requirements

macOS 11+ · Windows 10+ · Linux with AppImage support.
