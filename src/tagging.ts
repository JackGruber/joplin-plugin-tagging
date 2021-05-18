import joplin from "api";

export namespace tagging {
  export async function processDialogMsg(msg) {
    console.log(`on message: ${JSON.stringify(msg)}`);
  }

  export async function copyAllTags() {
    var noteIds = await joplin.workspace.selectedNoteIds();
    if (noteIds.length > 1) {
      const note = await joplin.data.get(["notes", noteIds[0]], {
        fields: ["id", "title"],
      });
      if (
        (await joplin.views.dialogs.showMessageBox(
          "Copy all tags from " + note["title"] + " ?"
        )) == 0
      ) {
        var pageNum = 1;
        do {
          var tags = await joplin.data.get(["notes", noteIds[0], "tags"], {
            fields: "id",
            limit: 10,
            page: pageNum++,
          });
          for (var a = 0; a < tags.items.length; a++) {
            for (var i = 1; i < noteIds.length; i++) {
              await joplin.data.post(
                ["tags", tags.items[a].id, "notes"],
                null,
                { id: noteIds[i] }
              );
            }
          }
        } while (tags.has_more);
      }
    }
  }
}
