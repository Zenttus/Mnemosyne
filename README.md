# Mnemosyne Plugin for Obsidian

Mnemosyne is an Obsidian plugin that allows iteration through notes sets in your vault based on tags.

## Features

- **Tag-Based Note Selection**: Include or exclude notes based on tags.
- **Timmer**: Timed note reviewign option

## Installation

1. **Manual Installation**:

   - Clone or download this repository.
   - Build the plugin by running `npm install` and `npm run build`.
   - Copy the `main.js`, `manifest.json`, and `styles.css` files to your Obsidian plugins folder:
     - On Windows: `%APPDATA%/Obsidian/Plugins/mnemosyne`
     - On macOS: `~/Library/Application Support/Obsidian/Plugins/mnemosyne`
     - On Linux: `~/.config/obsidian/plugins/mnemosyne`
   - Restart Obsidian and enable the Mnemosyne plugin in the Settings under the "Community Plugins" tab.

2. **Through Obsidian's Community Plugins Browser**:

TODO

## Usage

1. **Open the Mnemosyne Sidebar**:

   - Click on the Mnemosyne icon in the ribbon on the left (looks like a switch).
   - Alternatively, use the command palette (`Ctrl+P` or `Cmd+P`) and search for "Open Mnemosyne Sidebar".

2. **Selecting Tags**:

   - In the sidebar, you'll see a list of tags from your vault.
   - Click on a tag to cycle through its states:
     - **Neutral**: Tag is neither included nor excluded.
     - **Included** (green): Notes with this tag will be included.
     - **Excluded** (red): Notes with this tag will be excluded.

3. **Starting a Session**:

   - Click the "Start Session" button to begin iterating through notes matching your current tag selection.
   - The first note will open automatically.

4. **Navigating Notes**:

   - Use the "Next Note" button to move to the next note in your session.
   - Use the "Remove Note" button to remove the currently viewed note from the session.
