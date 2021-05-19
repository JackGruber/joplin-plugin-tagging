import { TagSearch, ResultMessage } from "./type";

declare const webviewApi: any;

class CopytagsDialog {
  resultMessage: ResultMessage;
  debounce(func: Function, timeout = 300) {
    let timer: any;
    return (...args: any[]) => {
        clearTimeout(timer);
        console.log("clear")
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

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

    document.addEventListener("input",(this.debounce(function (event) {
      this.searchTag(queryInput.value);
    }, 250)));

    queryInput.addEventListener("keydown", (event) => {
      this.navigateAutocompleteList(event);
    });
  }

  navigateAutocompleteList(event: KeyboardEvent) {
    let autocompleteListe = document.getElementById('autocomplete-list');
    if(!autocompleteListe) return;
    let autocompleteItems = autocompleteListe.getElementsByTagName('div');
    console.log(event.key)
    switch (event.key) {
      case 'Up':
      case 'Down':
      case 'ArrowUp':
      case 'ArrowDown':
        this.autocompleteCurrentFocus = event.key === 'ArrowUp' || event.key === 'Up' ? this.autocompleteCurrentFocus - 1 : this.autocompleteCurrentFocus + 1;
        this.markActive(autocompleteItems);
        break;
      case 'Enter':
        autocompleteItems[this.autocompleteCurrentFocus].click();
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
