# Joplin Plugin: Tagging <img src=img/icon_32.png>

Plugin to extend the Joplin tagging menu with a copy all tags and a tagging dialog with more control.

<img src=img/main_tagging.gif>

## Installation

### Automatic

- Go to `Tools > Options > Plugins`
- Search for `Tagging`
- Click Install plugin
- Restart Joplin to enable the plugin

### Manual via GUI

- Download the latest released JPL package (`io.github.jackgruber.copytags.jpl`) from [here](https://github.com/JackGruber/joplin-plugin-copytags/releases/latest)
- Go to `Tools > Options > Plugins` in Joplin
- Click on the gear wheel and select `Install from file`
- Select the downloaded JPL file
- Restart Joplin

### Manual via file system

- Download the latest released JPL package (`io.github.jackgruber.copytags.jpl`) from [here](https://github.com/JackGruber/joplin-plugin-copytags/releases/latest)
- Close Joplin
- Got to your Joplin profile folder and place the JPL file in the `plugins` folder
- Start Joplin

## Commands

- `Copy all tags`
- `Show Tagging dialog`

### Copy all tags

Copies all tags of the first marked note to all other marked notes.

- Select multiple notes (The first marked note must be the one from which the tags are to be copied)
- Click on `Tools > Copy all tags` or use the command `Copy all tags` from the context menu

### Tagging dialog

Select on or more notes, click on `Tools > Tagging dialog` or use the command `Tagging dialog` from the context menu.

- Add tags to notes
- Remove tags from notes
- Create new tags

   <img src=img/tagging_dialog.jpg>
   <img src=img/tagging_dialog_search.jpg>

## Keyboard Shortcuts

Under `Options > Keyboard Shortcuts` you can assign a keyboard shortcut for the following commands:

- `Copy all tags`
- `Tagging dialog`

## Build

To build your one version of the plugin, install node.js and run the following command `npm run dist`

## Updating the plugin framework

To update the plugin framework, run `npm run update`

## Changelog

See [CHANGELOG.md](CHANGELOG.md)
