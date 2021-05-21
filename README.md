# Joplin Copy Tag Plugin

Plugin to extend the Joplin tagging menu with a coppy all tags and tagging list with more control.

<img src=img/main_tagging.gif>

## Installation

### Automatic

- Go to `Tools > Options > Plugins`
- Search for `Copy Tags`
- Click Install plugin
- Restart Joplin to enable the plugin

### Manual

- Download the latest released JPL package (`io.github.jackgruber.copytags.jpl`) from [here](https://github.com/JackGruber/joplin-plugin-copytags/releases/latest)
- Close Joplin
- Copy the downloaded JPL package in your profile `plugins` folder
- Start Joplin

## Commands

- `Copy all Tags`
- `Show Tagging list`

### Copy all Tags

Copies all tags of the first marked note to all other marked notes.

- Select multiple notes (The first marked note must be the one from which the tags are to be copied)
- Click on `Tools > Copy all Tags` or use the command `Copy all Tags` from the context menu

### Tagging list

- Select multiple notes
- Click on `Tools > Tagging list` or use the command `Tagging lists` from the context menu
- Now you can remove a tag from all notes or add a tag to all notes, when the tag is not applied to all notes.

   <img src=img/tagging_dialog.jpg>
   <img src=img/tagging_dialog_search.jpg>

## Keyboard Shortcuts

Under `Options > Keyboard Shortcuts` you can assign a keyboard shortcut for the following commands:

- `Copy all Tags`
- `Tagging list`

## Build

To build your one version of the plugin, install node.js and run the following command `npm run dist`

## Updating the plugin framework

To update the plugin framework, run `npm run update`

## Changelog

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
