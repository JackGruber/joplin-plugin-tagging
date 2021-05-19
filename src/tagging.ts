import joplin from "api";
import { ResultMessage, TagResult, Tag, SearchMessage } from "./type";

export let tagDialog: string;

export namespace tagging {
  export async function showTaggingDialog(taggingInfo) {
    const tagList = [];
    for (const key in taggingInfo) {
      if (taggingInfo[key]["status"] === 1) {
        tagList.push(
          `<input type="checkbox" tagId="${key}" class="tagCheckBox" value="1" checked="checked" /> ${taggingInfo[key]["title"]} <br>`
        );
        tagList.push(`<input type="hidden" name="${key}" value="1">`);
      } else {
        tagList.push(
          `<input type="checkbox" value="2" tagId="${key}" class="tagCheckBox indeterminate" /> ${taggingInfo[key]["title"]} <br>`
        );
        tagList.push(`<input type="hidden" name="${key}" value="2">`);
      }
    }

    await joplin.views.dialogs.setHtml(
      tagDialog,
      `
    <div id="copytags">
      <form name="tagSearch">
        <div class="autocomplete">
          <input id="query-input" type="text" name="addTag" placeholder="Tag search" autofocus>
        </div>
      </form>
      <ul id="search-results"></ul>
      <div>
        <form name="tags">
        ${tagList.join("\n")}
        </form>
      <div>
    </div>
    `
    );
    joplin.views.panels.onMessage(tagDialog, async (msg) =>
      tagging.processDialogMsg(msg)
    );
    return await joplin.views.dialogs.open(tagDialog);
  }

  export async function getTaggingInfo(noteIds: string[]): Promise<any> {
    let taggingInfo = {};
    for (const noteId of noteIds) {
      var pageNum = 1;
      do {
        var tags = await joplin.data.get(["notes", noteId, "tags"], {
          fields: "id, title",
          limit: 20,
          page: pageNum++,
        });
        for (const tag of tags.items) {
          if (typeof taggingInfo[tag.id] === "undefined") {
            taggingInfo[tag.id] = {};
            taggingInfo[tag.id]["count"] = 1;
            taggingInfo[tag.id]["title"] = tag.title;
          } else {
            taggingInfo[tag.id]["count"]++;
          }
        }
      } while (tags.has_more);
    }

    for (const key in taggingInfo) {
      if (taggingInfo[key]["count"] == noteIds.length) taggingInfo[key]["status"] = 1;
      else taggingInfo[key]["status"] = 2;
    }

    return taggingInfo;
  }

  export async function processTags(noteIds: string[], tags, taggingInfo) {
    for (var key in tags) {
      if (tags[key] != taggingInfo[key]['status']) {
        if (tags[key] == 0) {
          // Remove Tag
          for (var i = 0; i < noteIds.length; i++) {
            await joplin.data.delete(["tags", key, "notes", noteIds[i]]);
          }
        } else if (tags[key] == 1) {
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
