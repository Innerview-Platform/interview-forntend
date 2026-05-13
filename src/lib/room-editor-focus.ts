/** When the shared Monaco editor takes focus, tldraw should blur so tool shortcuts do not fire. */
export const CODE_EDITOR_FOCUS_EVENT = "innerview:code-editor-focus";

export function emitCodeEditorFocused(): void {
  if (typeof window === "undefined") return;
  window.dispatchEvent(new CustomEvent(CODE_EDITOR_FOCUS_EVENT));
}

export function onCodeEditorFocused(fn: () => void): () => void {
  if (typeof window === "undefined") return () => {};
  window.addEventListener(CODE_EDITOR_FOCUS_EVENT, fn);
  return () => window.removeEventListener(CODE_EDITOR_FOCUS_EVENT, fn);
}
