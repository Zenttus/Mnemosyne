# Obsidian Mnemosyne Plugin

This plugin brings the concept of a Mnemosyne session to Obsidian, allowing you to review your notes in a randomized order.

## What is a Mnemosyne Session?

A Mnemosyne session is a set of notes that you want to review. The plugin helps you go through these notes in a random order, making it easier to recall and reinforce your knowledge.

## Features

- Start a Mnemosyne session with a set of notes
- Get the next note in the session
- Skip a note and move to a random note
- Configure tags and paths to include or exclude in the session
- Sidebar view for easy access to session controls and settings
- Status bar item showing the progress of the session
- Ribbon icon to quickly open the sidebar view

## Installation

1. Clone this repository into your vault's `.obsidian/plugins` directory.
2. Make sure you have Community Plugins enabled in Obsidian's settings.
3. In Obsidian, go to Settings -> Community Plugins and enable the "Mnemosyne" plugin.

## Usage

1. Open the Mnemosyne sidebar view by clicking on the ribbon icon or using the "Mnemosyne: Open Sidebar View" command.
2. Configure the tags and paths you want to include or exclude in the session using the settings in the sidebar or the plugin's settings tab.
3. Start a new Mnemosyne session by clicking the "Start Session" button in the sidebar or using the "Mnemosyne: Start Session" command.
4. Review the notes in the session by clicking the "Next Note" button in the sidebar or using the "Mnemosyne: Get Next Note" command.
5. If you want to skip the current note and move to a random one, click the "Skip Note" button in the sidebar or use the "Mnemosyne: Skip Note" command.
6. The status bar will show the progress of the session, indicating the number of notes left to review.

## Configuration

You can configure the following settings for the Mnemosyne plugin:

- Tags to include: Specify the tags you want to include in the session. If left empty, all tags will be included.
- Tags to exclude: Specify the tags you want to exclude from the session.
- Paths to include: Specify the paths you want to include in the session. If left empty, all paths will be included.
- Paths to exclude: Specify the paths you want to exclude from the session.

You can configure these settings in the plugin's settings tab or directly in the Mnemosyne sidebar view.
