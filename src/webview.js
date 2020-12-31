SetCheckboxIndeterminate()

function SetCheckboxIndeterminate(){
    const indeterminates = document.getElementsByClassName('indeterminate');
    for (i = 0; i < indeterminates.length; i++) {
        indeterminates[i].indeterminate  = true;
    }      
}

function ToggleTagCheckbox(element) {
    if(element.value == 1) {
        element.indeterminate = true;
        element.checked = false;
        element.value = 2;
    }
    else if(element.value == 2) {
        element.indeterminate = false;
        element.checked = false;
        element.value = 0;
    }
    else {
        element.indeterminate = false;
        element.checked = true
        element.value = 1;
    }
    return false;
}

