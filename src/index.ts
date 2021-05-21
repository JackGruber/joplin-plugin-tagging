import joplin from "api";
import { MenuItemLocation } from "api/types";
import { tagging } from "./tagging";

joplin.plugins.register({
  onStart: async function () {
    console.info("CopyAllTag plugin started");

    await joplin.commands.register({
      name: "CopyAllTags",
      label: "Copy all tags",
      enabledCondition: "noteListHasNotes",
      execute: async () => tagging.copyAllTags(),
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
      label: "Tagging dialog",
      enabledCondition: "noteListHasNotes",
      execute: async () => {
        const noteIds = await joplin.workspace.selectedNoteIds();
        if (noteIds.length > 0) {
          const taggingInfo = await tagging.getTaggingInfo(noteIds);

          const result = await tagging.showTaggingDialog(taggingInfo);

          if (result["id"] == "ok") {
            await tagging.processTags(
              noteIds,
              result["formData"]["tags"],
              taggingInfo
            );
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
