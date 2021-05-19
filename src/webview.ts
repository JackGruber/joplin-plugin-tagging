import { TagSearch, ResultMessage } from "./type";

declare const webviewApi: any;

class CopytagsDialog {
  resultMessage: ResultMessage;
  autocompleteCurrentFocus: number;

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

    queryInput.addEventListener("keydown", (event) => {
      this.navigateAutocompleteList(event);
    });
  }

  navigateAutocompleteList(event) {
    let autocompleteListe = document.getElementById('autocomplete-list');
    if(!autocompleteListe) return;
    let autocompleteItems = autocompleteListe.getElementsByTagName('div');
    if (event.keyCode == 40) {
      this.autocompleteCurrentFocus ++;
      this.markActive(autocompleteItems);
    } else if (event.keyCode == 38) {
      this.autocompleteCurrentFocus --;
      this.markActive(autocompleteItems);
    } else if (event.keyCode == 13) {
      event.preventDefault(); // prevent default action (submitting form)
      autocompleteItems[this.autocompleteCurrentFocus].click();
      console.log("Enter")
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
    if (this.autocompleteCurrentFocus >= x.length) this.autocompleteCurrentFocus = 0;
    if (this.autocompleteCurrentFocus < 0) this.autocompleteCurrentFocus = (x.length - 1);
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
    this.autocompleteCurrentFocus = -1;
    if (this.resultMessage) {
      const autocompleteItems = document.createElement("div");
      autocompleteItems.setAttribute("class", "autocomplete-items");
      autocompleteItems.setAttribute("id", "autocomplete-list");
      searchResults.appendChild(autocompleteItems);
      for (const tag of this.resultMessage.result) {
        const item = document.createElement("div");
        item.setAttribute("tagId", tag.id);
        item.setAttribute("tagTitle", tag.title);
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
    const tagTitle = element.getAttribute("tagTitle");
    console.log(tagId)
    console.log(tagTitle)
  }

  removeAutocompleteItems() {
    const items = document.getElementsByClassName("autocomplete-items");
    for (const item of items) {
      item.parentNode.removeChild(item);
    }
  }
}

new CopytagsDialog();
