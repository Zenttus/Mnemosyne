# Mnemosyne Plugin for Obsidian

Mnemosyne is an Obsidian plugin that allows you to create personalized note reviewing sessions by iterating through notes in your vault based on tag inclusion and exclusion. It provides a sidebar interface to select tags and control sessions.

## Features

- **Tag-Based Note Selection**: Include or exclude notes based on tags.
- **Wildcard (`*`) Support**: Quickly select all notes or reset your tag selections.
- **Dynamic Note Count**: Displays the number of notes matching your current tag selection.
- **Three-State Tag Buttons**: Tags can be neutral, included, or excluded.
- **Remove Notes from Session**: Remove the currently viewed note from the active session.

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
   - Use the `*` button to select all notes or reset your tag selections.

3. **Starting a Session**:

   - Click the "Start Session" button to begin iterating through notes matching your current tag selection.
   - The first note will open automatically.

4. **Navigating Notes**:

   - Use the "Next Note" button to move to the next note in your session.
   - Use the "Remove Note" button to remove the currently viewed note from the session.

5. **Viewing Note Count**:

   - The sidebar displays the number of notes matching your current tag selection.
   - This count updates dynamically as you select or deselect tags.

## Development

### Prerequisites

- [Node.js](https://nodejs.org/) (v14 or later)
- [npm](https://www.npmjs.com/)

### Setup

1. **Clone the Repository**:

   ```bash
   git clone TODO
   cd mnemosyne-obsidian-plugin
   ```

2. **Install Dependencies**:

   ```bash
   npm install
   ```

3. **Linking the Plugin to Obsidian**:

   - Create a symbolic link from your plugin's folder to your Obsidian plugins folder.

     ```bash
     ln -s /path/to/your/plugin/folder ~/.obsidian/plugins/mnemosyne
     ```

     - Replace `/path/to/your/plugin/folder` with the actual path.
     - The location of the Obsidian plugins folder may vary based on your operating system and vault location.

4. **Reload Obsidian**:

   - In Obsidian, go to Settings → Community Plugins.
   - Disable and then re-enable the Mnemosyne plugin to reload it.
   - Alternatively, use the "Reload Plugins" command in the command palette.

### Scripts

- **Build the Plugin**:

  ```bash
  npm run build
  ```
  
- **Lint the Code**:

  ```bash
  npm run lint
  ```

## License

This project is licensed under the [MIT License](LICENSE).