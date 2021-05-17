SetCheckboxIndeterminate();

function SetCheckboxIndeterminate() {
  const indeterminates = document.getElementsByClassName("indeterminate");
  for (i = 0; i < indeterminates.length; i++) {
    indeterminates[i].indeterminate = true;
  }
}

function ToggleTagCheckbox(element, tag) {
  const tag_element = document.getElementsByName(tag)[0];
  if (element.className.indexOf("indeterminate") != -1) {
    if (element.value == 1) {
      element.indeterminate = true;
      element.checked = false;
      element.value = 2;
      tag_element.value = 2;
    } else if (element.value == 2) {
      element.indeterminate = false;
      element.checked = false;
      element.value = 0;
      tag_element.value = 0;
    } else {
      element.indeterminate = false;
      element.checked = true;
      element.value = 1;
      tag_element.value = 1;
    }
  } else {
    if (element.value == 1) {
      element.checked = false;
      element.value = 0;
      tag_element.value = 0;
    } else {
      element.checked = true;
      element.value = 1;
      tag_element.value = 1;
    }
  }
  return false;
}
