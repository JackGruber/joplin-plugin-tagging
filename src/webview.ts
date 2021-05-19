import { TagSearch, ResultMessage } from "./type";

declare const webviewApi: any;

class CopytagsDialog {
  resultMessage: ResultMessage;

  constructor() {
    this.setCheckboxIndeterminate();
    this.setOnClickEventTagCheckBox();
    this.setSearchBoxEvent();

    // Remove autocomplete items on document click
    document.addEventListener("click", (event) => {
      this.removeAutocompleteItems();
    });
  }

  setSearchBoxEvent() {
    const queryInput = document.getElementById(
      "query-input"
    ) as HTMLInputElement;
    queryInput.addEventListener("input", (event) => {
      event.preventDefault();
      this.searchTag(queryInput.value);
    });
  }

  setCheckboxIndeterminate() {
    const indeterminates = document.getElementsByClassName("indeterminate");
    for (let i = 0; i < indeterminates.length; i++) {
      indeterminates[i]["indeterminate"] = true;
    }
  }

  toggleTagCheckbox(event) {
    const element = event.target;
    const tagId = element.getAttribute("tagId");
    const tagElement = document.getElementsByName(tagId)[0];
    // indeterminate checkbox
    if (element.className.indexOf("indeterminate") !== -1) {
      if (element.value == 1) {
        element.indeterminate = true;
        element.checked = false;
        element.value = 2;
        tagElement.setAttribute("value", "2");
      } else if (element.value == 2) {
        element.indeterminate = false;
        element.checked = false;
        element.value = 0;
        tagElement.setAttribute("value", "0");
      } else {
        element.indeterminate = false;
        element.checked = true;
        element.value = 1;
        tagElement.setAttribute("value", "1");
      }
    } else {
      if (element.value == 1) {
        element.checked = false;
        element.value = 0;
        tagElement.setAttribute("value", "0");
      } else {
        element.checked = true;
        element.value = 1;
        tagElement.setAttribute("value", "1");
      }
    }
    return false;
  }

  setOnClickEventTagCheckBox() {
    const tagCheckBox = document.getElementsByClassName("tagCheckBox");
    for (let i = 0; i < tagCheckBox.length; i++) {
      tagCheckBox[i].addEventListener("click", (event) => {
        this.toggleTagCheckbox(event)
      });
    }
  }

  async searchTag(query: string) {
    this.resultMessage = await webviewApi.postMessage({
      type: "tagSearch",
      query: query,
    } as TagSearch);

    this.showTagSearch();
  }

  showTagSearch() {
    const searchResults = document.getElementById("autocomplete");
    this.removeAutocompleteItems();
    if (this.resultMessage) {
      const autocompleteItems = document.createElement("div");
      autocompleteItems.setAttribute("class", "autocomplete-items");
      autocompleteItems.setAttribute("id", "autocomplete-items");
      searchResults.appendChild(autocompleteItems);
      for (const tag of this.resultMessage.result) {
        const item = document.createElement("div");
        item.setAttribute("tagId", tag.id);
        item.innerHTML = tag.title;
        item.addEventListener("click", (event) => {
          this.selectTag(event)
        });
        autocompleteItems.appendChild(item);
      }
    }
  }

  selectTag(event) {
    const element = event.target;
    const tagId = element.getAttribute("tagId");
  }

  removeAutocompleteItems() {
    const items = document.getElementsByClassName("autocomplete-items");
    for (const item of items) {
      item.parentNode.removeChild(item);
    }
  }
}

new CopytagsDialog();
