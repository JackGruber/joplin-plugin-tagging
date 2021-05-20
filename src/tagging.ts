import joplin from "api";
import { ResultMessage, TagResult, Tag, SearchMessage } from "./type";
import * as naturalCompare from "string-natural-compare";

export let tagDialog: string;

export namespace tagging {
  export async function showTaggingDialog(taggingInfo) {
    const tagList = [];
    
    for (const key in taggingInfo) {
      let status = taggingInfo[key]["status"];
      let tag = [];
      tag.push('<div>')
      tag.push(`<input type="hidden" name="${key}" value="${status}">`)
      tag.push(`<input type="checkbox" tagId="${key}" value="${status}"`);
      if (status === 1) {
        tag.push('checked="checked" class="tagCheckBox">')
      } else {
        tag.push('class="tagCheckBox indeterminate">')
      }
      tag.push(`<label>${taggingInfo[key]["title"]}<label>`)
      tag.push(`</div>`)
      tagList.push(tag.join(' '));
    }

    await joplin.views.dialogs.setHtml(
      tagDialog,
      `
    <div id="copytags">
      <div class="autocomplete" id="autocomplete">
          <textarea id="query-input" rows="1" name="addTag" placeholder="Tag search"></textarea>
          <!-- <input id="query-input" type="text" name="addTag" placeholder="Tag search"> -->
        </div>
      <ul id="search-results"></ul>
      <div>
        <form name="tags">
          <div id="assignedTags">
            ${tagList.join("\n")}
          </div>
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

    tagResult.sort((a, b) => {
      return naturalCompare(a.title, b.title, { caseInsensitive: true });
    });

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
