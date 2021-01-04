# Joplin Copy Tag Plugin

Plugin to extend the Joplin Tagging menue.

<img src=img/main_tagging.jpg>

## Installation

- Download the latest released JPL package (`com.jackgruber.joplin.copytags.jpl`) from [here](https://github.com/JackGruber/joplin-plugin-copytags/releases/latest)
- Open Joplin
- Go to `Tools > Options > Plugins`
- Click Install plugin and select the downloaded jpl file
- Restart Joplin to enable the plugin

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

## Keyboard Shortcus

Under `Options > Keyboard Shortcus` you can assign a keyboard shortcut for the following commands:

- `Copy all Tags`
- `Tagging list`

## Build

To build your one version of the plugin, install node.js and run the following command `npm run dist`

## Updating the plugin framework

To update the plugin framework, run `yo joplin --update`

Keep in mind that doing so will overwrite all the framework-related files **outside of the "src/" directory** (your source code will not be touched).

## Changelog

### (Not Released)

- Add `Tagging list` command

### v0.2.0

- Add context menue

### v0.1.0

- First version

## Links

- [Joplin - Getting started with plugin development](https://joplinapp.org/api/get_started/plugins/)
- [Joplin - Plugin API reference](https://joplinapp.org/api/references/plugin_api/classes/joplin.html)
- [Joplin - Data API reference](https://joplinapp.org/api/references/rest_api/)
- [Joplin - Plugin examples](https://github.com/laurent22/joplin/tree/dev/packages/app-cli/tests/support/plugins)
