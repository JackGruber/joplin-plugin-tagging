import joplin from "api";
import { MenuItemLocation } from "api/types";
import { tagging, tagDialog } from "./tagging";

joplin.plugins.register({
  onStart: async function () {
    console.info("CopyAllTag plugin started");

    await joplin.commands.register({
      name: "CopyAllTags",
      label: "Copy all tags",
      enabledCondition: "noteListHasNotes",
      execute: async () => tagging.copyAllTags() ,
    });

    await joplin.views.menuItems.create(
      "myMenuItemToolsCopyAllTags",
      "CopyAllTags",
      MenuItemLocation.Tools
    );
    await joplin.views.menuItems.create(
      "contextMenuItemCopyAllTags",
      "CopyAllTags",
      MenuItemLocation.NoteListContextMenu
    );

    await tagging.createDialog();

    await joplin.commands.register({
      name: "TaggingDialog",
      label: "Tagging list",
      enabledCondition: "noteListHasNotes",
      execute: async () => {
        const noteIds = await joplin.workspace.selectedNoteIds();
        if (noteIds.length > 1) {
          // collect all tags form the notes
          let tags_on_notes = {};
          for (let ids_pos = 0; ids_pos < noteIds.length; ids_pos++) {
            var pageNum = 1;
            do {
              var tags = await joplin.data.get(
                ["notes", noteIds[ids_pos], "tags"],
                {
                  fields: "id, title",
                  limit: 20,
                  page: pageNum++,
                }
              );
              for (var tags_pos = 0; tags_pos < tags.items.length; tags_pos++) {
                var tag_id = tags["items"][tags_pos]["id"];
                if (typeof tags_on_notes[tag_id] === "undefined") {
                  tags_on_notes[tag_id] = {};
                  tags_on_notes[tag_id]["count"] = 1;
                  tags_on_notes[tag_id]["title"] =
                    tags["items"][tags_pos]["title"];
                } else {
                  tags_on_notes[tag_id]["count"]++;
                }
              }
            } while (tags.has_more);
          }

          // create tagging list
          let tags_status = [];
          const tag_list = [];
          for (var key in tags_on_notes) {
            if (tags_on_notes[key]["count"] == noteIds.length) {
              tags_status[key] = 1;
              tag_list.push(
                `<input type="checkbox" tagId="${key}" class="tagCheckBox" value="1" checked="checked" /> ${tags_on_notes[key]["title"]} <br>`
              );
              tag_list.push(`<input type="hidden" name="${key}" value="1">`);
            } else {
              tags_status[key] = 2;
              tag_list.push(
                `<input type="checkbox" value="2" tagId="${key}" class="tagCheckBox indeterminate" /> ${tags_on_notes[key]["title"]} <br>`
              );
              tag_list.push(`<input type="hidden" name="${key}" value="2">`);
            }
          }

          await joplin.views.dialogs.setHtml(
            tagDialog,
            `
          <div id="copytags">
            <input id="query-input" type="text" autofocus>
            <ul id="search-results"></ul>
            <div>
              <form name="tags">
              ${tag_list.join("\n")}
              </form>
            <div>
          </div>
          `
          );
          joplin.views.panels.onMessage(tagDialog, async (msg) => tagging.processDialogMsg(msg));
          const result = await joplin.views.dialogs.open(tagDialog);

          // process with tagging
          if (result["id"] == "ok") {
            for (var key in result["formData"]["tags"]) {
              if (result["formData"]["tags"][key] != tags_status[key]) {
                if (result["formData"]["tags"][key] == 0) {
                  // Remove Tag
                  for (var i = 0; i < noteIds.length; i++) {
                    await joplin.data.delete(["tags", key, "notes", noteIds[i]]);
                  }
                } else if (result["formData"]["tags"][key] == 1) {
                  // Add Tag
                  for (var i = 0; i < noteIds.length; i++) {
                    await joplin.data.post(["tags", key, "notes"], null, {
                      id: noteIds[i],
                    });
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
      "contextMenuItemTaggingDialog",
      "TaggingDialog",
      MenuItemLocation.NoteListContextMenu
    );
  },
});
