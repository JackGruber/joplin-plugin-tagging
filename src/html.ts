export function htmlToElem(html) {
  let temp = document.createElement('template');
  temp.innerHTML = html;
  return temp.content.firstChild;
}

export function createTagHTML(
    tagId: string,
    status: number,
    title: string
  ): string {
    const domTagDiv = document.createElement("div");
    const domCheckbox = document.createElement("input");
    const domMark = document.createElement("span");
    const domInput = document.createElement("input");
    const domLabel = document.createElement("label");

    domTagDiv.setAttribute("class", "tag");
    domLabel.innerHTML = title;

    domCheckbox.setAttribute("type", "checkbox");
    domCheckbox.setAttribute("tagId", tagId);
    domCheckbox.setAttribute("value", status.toString());
    domCheckbox.classList.add("tagcheckbox");
    if (status == 1) {
      domCheckbox.defaultChecked = true;
    } else if(status == 2) {
      domCheckbox.classList.add("indeterminate");
    }

    domMark.setAttribute("class", "checkmark");

    domInput.setAttribute("type", "hidden");
    domInput.setAttribute("name", tagId);
    domInput.setAttribute("value", status.toString());

    domTagDiv.appendChild(domCheckbox);
    domTagDiv.appendChild(domMark);
    domTagDiv.appendChild(domLabel);
    domTagDiv.appendChild(domInput);

    return domTagDiv.outerHTML;
  }