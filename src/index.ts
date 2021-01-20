import joplin from "api";
import { MenuItem, MenuItemLocation, SettingItemType } from "api/types";

joplin.plugins.register({
  onStart: async function () {
    console.info("CopyAllTag plugin started");

    await joplin.commands.register({
      name: "CopyAllTags",
      label: "Copy all Tags",
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
      name: "TaggingDialog",
      label: "Tagging list",
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
              tag_list.push(`<input type="checkbox" value="1" onclick="ToggleTagCheckbox(this, '${key}')" checked="checked" /> ${tags_on_notes[key]['title']} <br>`)
              tag_list.push(`<input type="hidden" name="${key}" value="1">`)
            } else {
              tags_status[key] = 2
              tag_list.push(`<input type="checkbox" value="2" onclick="ToggleTagCheckbox(this, '${key}')" class="indeterminate" /> ${tags_on_notes[key]['title']} <br>`)
              tag_list.push(`<input type="hidden" name="${key}" value="2">`)
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

          // process with tagging 
          if(result['id'] == 'ok') {
            for(var key in result['formData']['tags']){
              if(result['formData']['tags'][key] != tags_status[key]) {
                if(result['formData']['tags'][key] == 0){
                  // Remove Tag
                  for (var i = 0; i < ids.length; i++) {
                    await joplin.data.delete(
                      ["tags", key, "notes", ids[i]]
                    );
                  }
                } else if(result['formData']['tags'][key] == 1){
                  // Add Tag
                  for (var i = 0; i < ids.length; i++) {
                    await joplin.data.post(
                      ["tags", key, "notes"],
                      null,
                      { id: ids[i] }
                    );
                  }
                }
              }
            }
          }
        }
      },
    });

    await joplin.views.menuItems.create(
      "MenuItemToolsTaggingDialog",
      "TaggingDialog",
      MenuItemLocation.Tools
    );
    await joplin.views.menuItems.create(
      'contextMenuItemTaggingDialog', 
      'TaggingDialog', 
      MenuItemLocation.NoteListContextMenu
    );
  },
});
