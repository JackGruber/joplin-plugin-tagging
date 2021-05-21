import joplin from "api";
import { ResultMessage, TagResult, Tag, SearchMessage } from "./type";
import * as naturalCompare from "string-natural-compare";
import { createTagHTML } from "./html"

export let tagDialog: string;

export namespace tagging {
  export async function showTaggingDialog(taggingInfo) {
    const tagList = [];
    const tagListmax = 40;
    for (const key in taggingInfo) {
      tagList.push(await createTagHTML(key, taggingInfo[key]["status"], taggingInfo[key]["title"]));
      if(tagList.length == tagListmax) {
        break;
      }
    }

    const dialogDiv = document.createElement("div");
    dialogDiv.setAttribute("id", "copytags");
    const autocompleteDiv = document.createElement("div");
    autocompleteDiv.setAttribute("id", "autocomplete");
    autocompleteDiv.setAttribute("class", "autocomplete");

    const searchBox = document.createElement("textarea");
    searchBox.setAttribute("id", "query-input");
    searchBox.setAttribute("rows", "1");
    searchBox.setAttribute("name", "addTag");
    searchBox.setAttribute("placeholder", "Tag search");
    autocompleteDiv.appendChild(searchBox);

    const form = document.createElement("form");
    form.setAttribute("name", "tags");

    const assignedTags = document.createElement("div");
    assignedTags.setAttribute("id", "assignedTags");
    assignedTags.innerHTML = tagList.join("\n");
    form.appendChild(assignedTags);

    dialogDiv.appendChild(autocompleteDiv);
    dialogDiv.appendChild(form);

    //${tagList.length == tagListmax? '</br><div style="text-align:center"><b>Too many tags!</b></div>': ''}

    await joplin.views.dialogs.setHtml(tagDialog, dialogDiv.outerHTML);
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
      // new tag
      if(key.substring(0, 4) === "new_") {
          if(tags[key] == 1) {
          const title = key.substring(4);
          const newTag = await joplin.data.post(["tags"], null, {
            title: title,
          });
          for (var i = 0; i < noteIds.length; i++) {
            await joplin.data.post(["tags", newTag.id, "notes"], null, {
              id: noteIds[i],
            });
          }
        }
      } else if (taggingInfo[key] === undefined || tags[key] != taggingInfo[key]['status']) {
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
      const tags = await searchTag(msg.query, msg.exclude);
      result = {
        type: "tagResult",
        result: tags,
      } as TagResult;
    }
    return result;
  }

  export async function searchTag(query: string, exclude: string[]): Promise<Tag[]> {
    const maxTags = 10;
    let tagResult = [];
    let result = await joplin.data.get(["search"], {
      query: query + "*",
      type: "tag",
      fields: "id,title",
      limit: maxTags + exclude.length,
      sort: "title ASC",
    });

    for (const tag of result.items) {
      if(exclude.indexOf(tag.id) === -1) {
        tagResult.push({ id: tag.id, title: tag.title });
      }

      if(tagResult.length == maxTags) break;
    }

    if(tagResult.length < maxTags) {
      let result = await joplin.data.get(["search"], {
        query: "*" + query + "*",
        type: "tag",
        fields: "id,title",
        limit: maxTags*2 + exclude.length,
        sort: "title ASC",
      });

      for (const tag of result.items) {
        if(tagResult.map(t=>t.title).indexOf(tag.title) === -1 && exclude.indexOf(tag.id) === -1) {
          tagResult.push({ id: tag.id, title: tag.title });
        }

        if(tagResult.length >= maxTags) {
          break;
        }
      }  
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
