import type { editor } from "monaco-editor";
import type * as Monaco from "monaco-editor";
import type { RemoteCursorState } from "@/hooks/useSharedEditor";
import { getUserHue } from "@/lib/user-color";

const LABEL_BG_ALPHA = 0.55; /* ~55% opaque in requested 40–70% band */
/** Hover shows the collaborator name briefly (then auto-hide). */
const LABEL_SHOW_MS = 1500;

function clampPosition(
  model: editor.ITextModel,
  lineNumber: number,
  column: number,
): { lineNumber: number; column: number } {
  const lc = model.getLineCount();
  const ln = Math.min(Math.max(1, lineNumber), lc);
  const maxCol = Math.max(1, model.getLineMaxColumn(ln));
  const col = Math.min(Math.max(1, column), maxCol);
  return { lineNumber: ln, column: col };
}

let blinkKeyframesInjected = false;

function ensureCaretBlinkKeyframes(): void {
  if (blinkKeyframesInjected || typeof document === "undefined") return;
  blinkKeyframesInjected = true;
  const el = document.createElement("style");
  el.textContent = `
@keyframes innerviewRemoteCaretBlink {
  0%, 45% { opacity: 1; }
  50%, 95% { opacity: 0.22; }
  100% { opacity: 1; }
}`;
  document.head.appendChild(el);
}

export type RemoteCursorWidgetHandle = {
  widget: editor.IContentWidget;
  update: (state: RemoteCursorState, model: editor.ITextModel) => void;
  dispose: () => void;
};

/**
 * Google-Docs–style remote caret: carets aligns with Monaco’s insertion line/column.
 * Label is floated above via absolute positioning so it does not push the bar to the next line.
 * Protocol: 0-based line/column → Monaco 1-based.
 */
export function createRemoteCursorContentWidget(
  monaco: typeof Monaco,
  initial: RemoteCursorState,
  model: editor.ITextModel,
): RemoteCursorWidgetHandle {
  ensureCaretBlinkKeyframes();

  const hue = getUserHue(initial.userId);
  const color = `hsl(${hue} 72% 58%)`;

  const root = document.createElement("div");
  root.setAttribute("data-remote-cursor", initial.userId);
  root.style.pointerEvents = "none";

  const hoverZone = document.createElement("div");
  hoverZone.style.position = "relative";
  hoverZone.style.display = "inline-flex";
  hoverZone.style.flexDirection = "column";
  hoverZone.style.alignItems = "flex-start";
  hoverZone.style.pointerEvents = "auto";

  const label = document.createElement("div");
  label.style.position = "absolute";
  label.style.left = "0";
  label.style.bottom = "100%";
  label.style.marginBottom = "3px";
  label.style.opacity = "0";
  label.style.transition = "opacity 0.15s ease-out";
  label.style.pointerEvents = "none";
  label.style.fontSize = "10px";
  label.style.lineHeight = "13px";
  label.style.padding = "2px 6px";
  label.style.borderRadius = "5px";
  label.style.whiteSpace = "nowrap";
  label.style.maxWidth = "168px";
  label.style.overflow = "hidden";
  label.style.textOverflow = "ellipsis";
  label.style.backgroundColor = `rgba(12, 12, 18, ${LABEL_BG_ALPHA})`;
  label.style.color = "#fafafa";
  label.style.border = `1px solid ${color}`;
  label.style.boxShadow = "0 1px 4px rgba(0,0,0,0.35)";
  label.style.fontWeight = "500";
  label.style.backdropFilter = "blur(6px)";
  label.style.setProperty("-webkit-backdrop-filter", "blur(6px)");

  const caretBar = document.createElement("div");
  caretBar.style.width = "2px";
  caretBar.style.height = "1.05em";
  caretBar.style.minHeight = "15px";
  caretBar.style.maxHeight = "19px";
  caretBar.style.alignSelf = "flex-start";
  caretBar.style.backgroundColor = color;
  caretBar.style.borderRadius = "1px";
  caretBar.style.boxShadow = `0 0 0 1px rgba(0,0,0,0.2)`;
  caretBar.style.animation =
    "innerviewRemoteCaretBlink 1.06s step-end infinite";

  const hitPad = document.createElement("div");
  hitPad.style.display = "flex";
  hitPad.style.alignItems = "stretch";
  hitPad.style.padding = "6px 8px";
  hitPad.style.margin = "-6px -8px";
  hitPad.appendChild(caretBar);

  hoverZone.appendChild(label);
  hoverZone.appendChild(hitPad);
  root.appendChild(hoverZone);

  let hideLabelTimer: ReturnType<typeof setTimeout> | null = null;

  const setLabelShown = (shown: boolean) => {
    label.style.opacity = shown ? "1" : "0";
    label.style.pointerEvents = shown ? "auto" : "none";
  };

  const onHoverZoneEnter = () => {
    setLabelShown(true);
    if (hideLabelTimer !== null) {
      clearTimeout(hideLabelTimer);
    }
    hideLabelTimer = setTimeout(() => {
      setLabelShown(false);
      hideLabelTimer = null;
    }, LABEL_SHOW_MS);
  };

  hoverZone.addEventListener("mouseenter", onHoverZoneEnter);

  const dispose = () => {
    hoverZone.removeEventListener("mouseenter", onHoverZoneEnter);
    if (hideLabelTimer !== null) {
      clearTimeout(hideLabelTimer);
      hideLabelTimer = null;
    }
  };

  let lineNumber = initial.line + 1;
  let column = initial.column + 1;
  const sync = (s: RemoteCursorState, m: editor.ITextModel) => {
    const p = clampPosition(m, s.line + 1, s.column + 1);
    lineNumber = p.lineNumber;
    column = p.column;
    const id = s.userId;
    const display =
      s.name?.trim() ||
      (id.length > 10 ? `${id.slice(0, 8)}…` : id);
    label.textContent = display;
  };

  sync(initial, model);

  const widget: editor.IContentWidget = {
    allowEditorOverflow: true,
    suppressMouseDown: true,
    getId: () =>
      `innerview-remote-cursor-${initial.userId.toLowerCase().replace(/[^a-z0-9-]/gi, "")}`,
    getDomNode: () => root,
    getPosition: () => ({
      position: { lineNumber, column },
      /** EXACT anchors the widget to the caret; avoid BELOW/ABOVE snapping to next/previous row */
      preference: [monaco.editor.ContentWidgetPositionPreference.EXACT],
    }),
  };

  return {
    widget,
    update: (state, m) => {
      sync(state, m);
    },
    dispose,
  };
}
