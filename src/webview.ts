import { TagSearch, ResultMessage } from "./type";

declare const webviewApi: any;

class CopytagsDialog {
  resultMessage: ResultMessage;
  autocompleteCurrentFocus: number = -1;
  searchText: string;

  debounce(func: Function, timeout = 300) {
    let timer: any;
    return (...args: any[]) => {
        clearTimeout(timer);
        timer = setTimeout(() => { func.apply(this, args); }, timeout);
    };
  }

  constructor() {
    this.setCheckboxIndeterminate();
    this.setOnClickEventTagAllCheckBox();
    this.setSearchBoxEvent();
    this.setFocus();

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
      if(queryInput.value.trim() === '') {
        this.clearSearchField();
      } else {
        this.searchTag(queryInput.value);
      }
    }, 250)));

    queryInput.addEventListener("keydown", (event) => {
      this.navigateAutocompleteList(event);
    });
  }

  navigateAutocompleteList(event: KeyboardEvent) {
    let autocompleteListe = document.getElementById('autocomplete-list');
    if(!autocompleteListe) return;
    let autocompleteItems = autocompleteListe.getElementsByTagName('div');
    switch (event.key) {
      case 'Up':
      case 'Down':
      case 'ArrowUp':
      case 'ArrowDown':
        this.autocompleteCurrentFocus = event.key === 'ArrowUp' || event.key === 'Up' ? this.autocompleteCurrentFocus - 1 : this.autocompleteCurrentFocus + 1;
        this.markActive(autocompleteItems);
        break;
      case 'Enter':
        event.preventDefault();
        if(this.autocompleteCurrentFocus === -1) {
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

  setOnClickEventTagAllCheckBox() {
    const tagCheckBox = document.getElementsByClassName("tagCheckBox");
    for (let i = 0; i < tagCheckBox.length; i++) {
      this.setOnClickEventTagCheckBox(tagCheckBox[i]);
    }
  }

  setOnClickEventTagCheckBox(checkBox: Element) {
    checkBox.addEventListener("click", (event) => {
      this.toggleTagCheckbox(event)
    });
  }

  async searchTag(query: string) {
    this.searchText = query;
    this.resultMessage = await webviewApi.postMessage({
      type: "tagSearch",
      query: this.searchText,
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
        const searchEscaped = this.searchText.trim().replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
        const regex = new RegExp("(" + searchEscaped + ")", "i");
        const htmlTitle = tag.title.replace(regex, "<b>$1</b>");

        item.setAttribute("tagId", tag.id);
        item.setAttribute("tagTitle", tag.title);
        item.innerHTML = htmlTitle;
        item.addEventListener("click", (event) => {
          this.selectTag(event)
        });
        autocompleteItems.appendChild(item);
        if(tag.title.toLowerCase() === this.searchText.trim().toLowerCase()) createTag = false;
      }

      if(createTag === true) {
        const createTag = document.createElement("div");
        const title = this.searchText.trim();
        createTag.setAttribute("tagId", "new");
        createTag.setAttribute("tagTitle", title);
        createTag.innerHTML = "<strong>Create tag:</strong> " + title;
        createTag.addEventListener("click", (event) => {
          this.selectTag(event)
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

    this.addTag(tagId, tagTitle)
  }

  clearSearchField() {
    this.removeAutocompleteItems();
    const searchResults = <HTMLInputElement>document.getElementById("query-input");
    searchResults.value = '';
    this.searchText = '';
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
    const assignedTags = document.getElementById("assignedTags")
    const label = document.createElement("label");
    label.innerHTML = tagTitle;

    if(tagId == 'new') {
      tagId = "new_" + tagTitle
    }
    
    const tagCheckbox = document.createElement("input");
    tagCheckbox.setAttribute("type", "checkbox");
    tagCheckbox.setAttribute("value", "1");
    tagCheckbox.checked = true;
    tagCheckbox.setAttribute("tagId", tagId);
    tagCheckbox.setAttribute("class", "tagCheckBox");
    
    const hiddenInput = document.createElement("input");
    hiddenInput.setAttribute("type", "hidden");
    hiddenInput.setAttribute("name", tagId);
    hiddenInput.setAttribute("value", "1");
    
    const tagDiv = document.createElement("div");  
    tagDiv.appendChild(hiddenInput);
    tagDiv.appendChild(tagCheckbox);
    tagDiv.appendChild(label);
    this.setOnClickEventTagCheckBox(tagCheckbox);
    assignedTags.appendChild(tagDiv);
  }
}

new CopytagsDialog();
