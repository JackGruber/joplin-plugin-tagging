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
          const taggingInfo = await tagging.getTaggingInfo(noteIds);

          // create tagging list
          const tag_list = [];
          for (const key in taggingInfo) {
            if (taggingInfo[key]["status"] === 1) {
              tag_list.push(
                `<input type="checkbox" tagId="${key}" class="tagCheckBox" value="1" checked="checked" /> ${taggingInfo[key]["title"]} <br>`
              );
              tag_list.push(`<input type="hidden" name="${key}" value="1">`);
            } else {
              tag_list.push(
                `<input type="checkbox" value="2" tagId="${key}" class="tagCheckBox indeterminate" /> ${taggingInfo[key]["title"]} <br>`
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
            await tagging.processTags(noteIds, result["formData"]["tags"], taggingInfo);
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
