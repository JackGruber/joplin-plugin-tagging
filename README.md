# Joplin Tagging Plugin

Plugin to extend the Joplin tagging menu with a coppy all tags and a tagging dialog with more control.

<img src=img/main.jpg>

## Installation

### Automatic

- Go to `Tools > Options > Plugins`
- Search for `Tagging`
- Click Install plugin
- Restart Joplin to enable the plugin

### Manual

- Download the latest released JPL package (`io.github.jackgruber.copytags.jpl`) from [here](https://github.com/JackGruber/joplin-plugin-copytags/releases/latest)
- Close Joplin
- Copy the downloaded JPL package in your profile `plugins` folder
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

### v1.0.0 (2021-05-21)

- Rename Plugin to `Tagging`
- Rename `Tagging list` command to `Tagging dialog`
- Add: Tag search on tagging dialog
- Add: Tag creation on tagging dialog

### v0.3.3 (2021-01-20)

- Add processing message

### v0.3.2 (2021-01-08)

- Fix: Missing js File in JPL

### v0.3.1 (2021-01-06)

- Change of the Plugin ID for Joplin

### v0.3.0 (2021-01-05)

❗ Requires at least Joplin v1.6.2 ❗

- Add `Tagging list` command

### v0.2.0 (2020-12-21)

- Add context menue

### v0.1.0 (2020-12-17)

- First version

## Links

- [Joplin - Getting started with plugin development](https://joplinapp.org/api/get_started/plugins/)
- [Joplin - Plugin API reference](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)
- [Joplin - Data API reference](https://joplinapp.org/api/references/rest_api/)
- [Joplin - Plugin examples](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins)
