import joplin from "api";
import { ResultMessage, TagResult, Tag, SearchMessage } from "./type";

export let tagDialog: string;

export namespace tagging {
  export async function processDialogMsg(
    msg: SearchMessage
  ): Promise<ResultMessage> {
    let result = null;
    if (msg.type === "tagSearch") {
      const tags = await searchTag(msg.query);
      result = {
        type: "tagResult",
        result: tags,
      } as TagResult;
    }
    return result;
  }

  export async function searchTag(query: string): Promise<Tag[]> {
    let tagResult = [];
    query = query + "*";
    var result = await joplin.data.get(["search"], {
      query: query,
      type: "tag",
      fields: "id,title",
      limit: 10,
      sort: "title ASC",
    });

    for (const tag of result.items) {
      tagResult.push({ id: tag.id, title: tag.title });
    }
    return tagResult;
  }

  export async function copyAllTags() {
    var noteIds = await joplin.workspace.selectedNoteIds();
    if (noteIds.length > 1) {
      const note = await joplin.data.get(["notes", noteIds[0]], {
        fields: ["id", "title"],
      });
      if (
        (await joplin.views.dialogs.showMessageBox(
          `Copy all tags from ${note["title"]}?`
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

  export async function createDialog() {
    tagDialog = await joplin.views.dialogs.create("TagDialog");
    await joplin.views.dialogs.addScript(tagDialog, "webview.js");
    await joplin.views.dialogs.addScript(tagDialog, "webview.css");
  }
}
