// we won't do copy on select on text editor, otherwise you can't select and override text in the editor or text input
function checkIfElementIsEditor(element) {
	if (!element || !element.nodeName) return false;
  const isEditableElement = ['INPUT', 'TEXTAREA', 'BUTTON'].includes(element.nodeName);
	if (!isEditableElement) {
  	if (!element.className || !element.className.toLowerCase) return false;
	}
  const isTextEditor = element.className.toLowerCase().includes('codemirror');

  return isEditableElement || isTextEditor;
}
// if we start selection on editor, we prevent the following execution of this script
let copyOnSelectPreventNextCopy = false;
document.addEventListener('mousedown', function onMouseDown() {
  const elementsUnderMouse = document.querySelectorAll(':hover');

  if (!elementsUnderMouse || Array.from(elementsUnderMouse).some(checkIfElementIsEditor)) {
    copyOnSelectPreventNextCopy = true;
  }
});
// Copy on select, copy document selection when mouse button is up
document.addEventListener('mouseup', function onMouseUp() {
  const elementsUnderMouse = document.querySelectorAll(':hover');

  if (
    copyOnSelectPreventNextCopy ||
    !elementsUnderMouse ||
    Array.from(elementsUnderMouse).some(checkIfElementIsEditor)
  ) {
    copyOnSelectPreventNextCopy = false;
    return;
  }
  document.execCommand('copy');
});
