# Obsidian Mnemosyne Plugin

This plugin brings the concept of a Mnemosyne session.

- What is a Mnemosyne Session? (Another stupid abstract term?(yes))
 - A set of notes.

### What are the commands?
Next note: Provides a note from the set, if is not the first time used it will remove the previous note from the set. 

### How do I use this?
1. Go to the settings and define tags/paths that you want or don't want. Recomend not messing with this until you run the thing to get an idea of what's going on.
2. Start session calling the "Start Mnemosyne session" command: Which just creates the set of all the notes in the vault, it will then use the stuff set on the settings to filter it out.
3. Call the "Get next note" command. This will open a random note from the set. Do your edits/review on the note that you want do.
4. Repeat step 3 until the set is empty.

That's it, use it how you like. Tune the filters for your workflow.

TODO:
- Fix skip
- Check the filters are working
- Make pretty? (lazy)
