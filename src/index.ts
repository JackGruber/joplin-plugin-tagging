import joplin from "api";
import { MenuItem, MenuItemLocation, SettingItemType } from "api/types";

joplin.plugins.register({
  onStart: async function () {
    console.info("CopyAllTag plugin started");

    await joplin.commands.register({
      name: "CopyAllTags",
      label: "Copy all Tags",
      iconName: "fas fa-music",
      enabledCondition: "noteListHasNotes",
      execute: async () => {
        var Ids = await joplin.workspace.selectedNoteIds();
        if (Ids.length > 1) {
          const note = await joplin.data.get(["notes", Ids[0]], {
            fields: ["id", "title"],
          });
          if (
            (await joplin.views.dialogs.showMessageBox(
              "Copy all tags from " + note["title"] + " ?"
            )) == 0
          ) {
            var pageNum = 1;
            do {
              var tags = await joplin.data.get(["notes", Ids[0], "tags"], {
                fields: "id",
                limit: 10,
                page: pageNum++,
              });
              for (var a = 0; a < tags.items.length; a++) {
                for (var i = 1; i < Ids.length; i++) {
                  await joplin.data.post(
                    ["tags", tags.items[a].id, "notes"],
                    null,
                    { id: Ids[i] }
                  );
                }
              }
            } while (tags.has_more);
          }
        }
      },
    });

    await joplin.views.menuItems.create(
      "myMenuItemToolsCopyAllTags",
      "CopyAllTags",
      MenuItemLocation.Tools
    );
    await joplin.views.menuItems.create(
      'contextMenuItemCopyAllTags', 
      'CopyAllTags', 
      MenuItemLocation.NoteListContextMenu
    );

    const tag_dialog = await joplin.views.dialogs.create('TagDialog');
    await joplin.views.dialogs.addScript(tag_dialog, 'webview.js');
    
    await joplin.commands.register({
      name: "CopyTagList",
      label: "Show Tagging list",
      enabledCondition: "noteListHasNotes",
      execute: async () => {
        const ids = await joplin.workspace.selectedNoteIds();
        if (ids.length > 1) {
          // collect all tags form the notes
          let tags_on_notes = {};
          for (let ids_pos = 0; ids_pos < ids.length; ids_pos++) {
            var pageNum = 1;
            do {
              var tags = await joplin.data.get(["notes", ids[ids_pos], "tags"], {
                fields: "id, title",
                limit: 20,
                page: pageNum++,
              });
              for (var tags_pos = 0; tags_pos < tags.items.length; tags_pos++) {
                var tag_id = tags['items'][tags_pos]['id'];
                if(typeof tags_on_notes[tag_id] === 'undefined'){
                  tags_on_notes[tag_id] = {}
                  tags_on_notes[tag_id]['count'] = 1;
                  tags_on_notes[tag_id]['title'] = tags['items'][tags_pos]['title'];
                } else {
                  tags_on_notes[tag_id]['count'] ++;
                }
              }
            } while (tags.has_more);
          }

          // create tagging list
          let tags_status = [];
          const tag_list = [];
          for(var key in tags_on_notes){
            if(tags_on_notes[key]['count'] == ids.length) {
              tags_status[key] = 1
              tag_list.push(`<input name="${key}" type="checkbox" value="1" onclick="ToggleTagCheckbox(this)" checked="checked" /> ${tags_on_notes[key]['title']} <br>`)
            } else {
              tags_status[key] = 2
              tag_list.push(`<input name="${key}" type="checkbox" value="2" onclick="ToggleTagCheckbox(this)" class="indeterminate" /> ${tags_on_notes[key]['title']} <br>`)
            }
          }

          await joplin.views.dialogs.setHtml(tag_dialog, `
          <div style="overflow-wrap: break-word;">
            <form name="tags">
            ${tag_list.join('\n')}
            </form>
          </div>
          `);
          const result = await joplin.views.dialogs.open(tag_dialog);
          if(result['id'] == 'ok') {
            console.info(result)
          }
        }
      },
    });

    await joplin.views.menuItems.create(
      "myMenuItemToolsCopyTagList",
      "CopyTagList",
      MenuItemLocation.Tools
    );
    await joplin.views.menuItems.create(
      'contextMenuItemCopyTagList', 
      'CopyTagList', 
      MenuItemLocation.NoteListContextMenu
    );
  },
});
