// we won't do copy on select on text editor, otherwise you can't select and override text in the editor or text input
function checkIfElementIsEditor(element) {
  if (!element || !element.className || !element.className.toLowerCase || !element.nodeName) return false;
  const isEditableElement = ['INPUT', 'TEXTAREA'].includes(element.nodeName);

  const isTextEditor = element.className.toLowerCase().includes('codemirror');

  return isEditableElement || isTextEditor;
}
// Copy on select, copy document selection when mouse button is up
document.addEventListener('mouseup', function onMouseUp() {
  const elementsUnderMouse = document.querySelectorAll(':hover');

  if (!elementsUnderMouse || Array.from(elementsUnderMouse).some(checkIfElementIsEditor)) return;
  document.execCommand('copy');
});
