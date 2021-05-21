import { TagSearch, ResultMessage, Tag } from "./type";
import { createTagHTML, htmlToElem } from "./html";

declare const webviewApi: any;

class CopytagsDialog {
  resultMessage: ResultMessage;
  autocompleteCurrentFocus: number = -1;
  searchText: string;
  allTagsIds: string[];

  debounce(func: Function, timeout = 300) {
    let timer: any;
    return (...args: any[]) => {
      clearTimeout(timer);
      timer = setTimeout(() => {
        func.apply(this, args);
      }, timeout);
    };
  }

  constructor() {
    this.setCheckboxIndeterminate();
    this.setOnClickEventTagAllCheckBox();
    this.setSearchBoxEvent();
    this.storeAllTags();
    this.setFocus();
    // Remove autocomplete items on document click
    document.addEventListener("click", (event) => {
      this.removeAutocompleteItems();
    });
  }

  storeAllTags() {
    this.allTagsIds = [];
    const assignedTagsDiv = document.getElementById("assignedTags");
    const inputs = assignedTagsDiv.getElementsByTagName("input");
    for (const input of inputs) {
      if (input.getAttribute("type") == "checkbox") {
        this.allTagsIds.push(input.getAttribute("tagId"));
      }
    }
  }

  setSearchBoxEvent() {
    const queryInput = document.getElementById(
      "query-input"
    ) as HTMLInputElement;

    document.addEventListener(
      "input",
      this.debounce(function (event) {
        if (queryInput.value.trim() === "") {
          this.clearSearchField();
        } else {
          this.searchTag(queryInput.value);
        }
      }, 250)
    );

    queryInput.addEventListener("keydown", (event) => {
      this.navigateAutocompleteList(event);
    });
  }

  navigateAutocompleteList(event: KeyboardEvent) {
    let autocompleteListe = document.getElementById("autocomplete-list");
    if (!autocompleteListe) return;
    let autocompleteItems = autocompleteListe.getElementsByTagName("div");
    switch (event.key) {
      case "Up":
      case "Down":
      case "ArrowUp":
      case "ArrowDown":
        this.autocompleteCurrentFocus =
          event.key === "ArrowUp" || event.key === "Up"
            ? this.autocompleteCurrentFocus - 1
            : this.autocompleteCurrentFocus + 1;
        this.markActive(autocompleteItems);
        break;
      case "Enter":
        event.preventDefault();
        if (this.autocompleteCurrentFocus === -1) {
          autocompleteItems[0].click();
        } else {
          autocompleteItems[this.autocompleteCurrentFocus].click();
        }
        break;
    }
  }

  removeActive(x) {
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }

  markActive(x) {
    if (!x) return false;
    this.removeActive(x);
    if (this.autocompleteCurrentFocus >= x.length)
      this.autocompleteCurrentFocus = 0;
    if (this.autocompleteCurrentFocus < 0)
      this.autocompleteCurrentFocus = x.length - 1;
    x[this.autocompleteCurrentFocus].classList.add("autocomplete-active");
  }

  setCheckboxIndeterminate() {
    const indeterminates = document.getElementsByClassName("indeterminate");
    for (let i = 0; i < indeterminates.length; i++) {
      indeterminates[i]["indeterminate"] = true;
    }
  }

  toggleTagCheckbox(event) {
    const element = event.target;
    const parent = element.parentNode;
    const checkBox = parent.getElementsByClassName("tagcheckbox")[0];
    const tagId = checkBox.getAttribute("tagId");
    const tagElement = document.getElementsByName(tagId)[0];

    // indeterminate checkbox
    if (checkBox.className.indexOf("indeterminate") !== -1) {
      if (checkBox.value == 1) {
        checkBox.indeterminate = true;
        checkBox.checked = false;
        checkBox.value = 2;
        tagElement.setAttribute("value", "2");
      } else if (checkBox.value == 2) {
        checkBox.indeterminate = false;
        checkBox.checked = false;
        checkBox.value = 0;
        tagElement.setAttribute("value", "0");
      } else {
        checkBox.indeterminate = false;
        checkBox.checked = true;
        checkBox.value = 1;
        tagElement.setAttribute("value", "1");
      }
    } else {
      if (checkBox.value == 1) {
        checkBox.checked = false;
        checkBox.value = 0;
        tagElement.setAttribute("value", "0");
      } else {
        checkBox.checked = true;
        checkBox.value = 1;
        tagElement.setAttribute("value", "1");
      }
    }
    return false;
  }

  setOnClickEventTagAllCheckBox() {
    const tagClass = document.getElementsByClassName("tag");
    for (let i = 0; i < tagClass.length; i++) {
      this.setOnClickEvenForCheckbox(
        tagClass[i].getElementsByTagName("input")[0]
      );
      this.setOnClickEvenForCheckbox(
        tagClass[i].getElementsByTagName("label")[0]
      );
    }
  }

  setOnClickEvenForCheckbox(checkBox: Element) {
    checkBox.addEventListener("click", (event) => {
      this.toggleTagCheckbox(event);
    });
  }

  async searchTag(query: string) {
    this.searchText = query;
    this.resultMessage = await webviewApi.postMessage({
      type: "tagSearch",
      query: this.searchText,
      exclude: this.allTagsIds,
    } as TagSearch);

    this.showTagSearch();
  }

  showTagSearch() {
    const searchResults = document.getElementById("autocomplete");
    let createTag = true;
    this.removeAutocompleteItems();
    this.autocompleteCurrentFocus = -1;
    if (this.resultMessage) {
      const autocompleteItems = document.createElement("div");
      autocompleteItems.setAttribute("class", "autocomplete-items");
      autocompleteItems.setAttribute("id", "autocomplete-list");
      searchResults.appendChild(autocompleteItems);
      for (const tag of this.resultMessage.result) {
        const item = document.createElement("div");
        const searchEscaped = this.searchText
          .trim()
          .replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
        const regex = new RegExp("(" + searchEscaped + ")", "i");
        const htmlTitle = tag.title.replace(regex, "<b>$1</b>");

        item.setAttribute("tagId", tag.id);
        item.setAttribute("tagTitle", tag.title);
        item.innerHTML = htmlTitle;
        item.addEventListener("click", (event) => {
          this.selectTag(event);
        });
        autocompleteItems.appendChild(item);
        if (tag.title.toLowerCase() === this.searchText.trim().toLowerCase())
          createTag = false;
      }

      const title = this.searchText.trim();
      if (
        createTag === true &&
        this.allTagsIds.indexOf("new_" + title) === -1
      ) {
        const createTag = document.createElement("div");
        createTag.setAttribute("tagId", "new");
        createTag.setAttribute("tagTitle", title);
        createTag.innerHTML = "<strong>Create tag:</strong> " + title;
        createTag.addEventListener("click", (event) => {
          this.selectTag(event);
        });
        autocompleteItems.insertBefore(createTag, autocompleteItems.firstChild);
      }
    }
  }

  selectTag(event) {
    const element = event.target;
    const tagId = element.getAttribute("tagId");
    const tagTitle = element.getAttribute("tagTitle");
    this.clearSearchField();

    this.addTag(tagId, tagTitle);
  }

  clearSearchField() {
    this.removeAutocompleteItems();
    const searchResults = <HTMLInputElement>(
      document.getElementById("query-input")
    );
    searchResults.value = "";
    this.searchText = "";
  }

  removeAutocompleteItems() {
    const items = document.getElementsByClassName("autocomplete-items");
    this.autocompleteCurrentFocus = -1;
    for (const item of items) {
      item.parentNode.removeChild(item);
    }
  }

  setFocus() {
    document.getElementById("query-input").focus();
  }

  addTag(tagId: string, tagTitle: string) {
    const assignedTags = document.getElementById("assignedTags");
    const label = document.createElement("label");
    label.innerHTML = tagTitle;

    if (tagId == "new") {
      tagId = "new_" + tagTitle;
    }
    this.allTagsIds.push(tagId);

    const tag = htmlToElem(createTagHTML(tagId, 1, tagTitle));
    assignedTags.appendChild(tag);

    const tagElement = assignedTags.getElementsByClassName("tag");
    this.setOnClickEvenForCheckbox(
      tagElement[tagElement.length - 1].getElementsByTagName("input")[0]
    );
    this.setOnClickEvenForCheckbox(
      tagElement[tagElement.length - 1].getElementsByTagName("label")[0]
    );
  }
}

new CopytagsDialog();
