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
      "toolsTabs",
      "CopyAllTags",
      MenuItemLocation.Tools
    );
  },
});
