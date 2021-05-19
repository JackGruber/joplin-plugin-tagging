import { TagSearch, ResultMessage } from "./type";

declare const webviewApi: any;

class CopytagsDialog {
  resultMessage: ResultMessage;

  constructor() {
    this.setCheckboxIndeterminate();
    this.setOnClickEventTagCheckBox();
    this.setSearchBoxEvent();
  }

  setSearchBoxEvent() {
    const queryInput = document.getElementById('query-input') as HTMLInputElement;
    queryInput.addEventListener('input', event => {
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
      tagCheckBox[i].addEventListener("click", (event) =>
        this.toggleTagCheckbox(event)
      );
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
    const searchResults = document.getElementById('search-results');
    searchResults.innerText = '';

    if (this.resultMessage) {
      for (let i = 0; i < this.resultMessage.result.length; i++) {
          const searchResult = this.resultMessage.result[i];
          const row = document.createElement('li');
          row.setAttribute('class', 'search-result-row');
          searchResults.appendChild(row);

          const tagName = document.createElement('div');
          tagName.setAttribute('class', 'resource-name-cell');
          tagName.innerText = searchResult.title;
          row.appendChild(tagName);
      }
    }
  }
}

new CopytagsDialog();
