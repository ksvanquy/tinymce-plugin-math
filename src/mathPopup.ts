declare const MathJax: any;

export interface MathPopupOptions {
  latex?: string;
  mode?: "block" | "inline";
  onSubmit: (latex: string, mode: "block" | "inline") => void;
  onCancel?: () => void;
}

export function showMathPopup(options: MathPopupOptions) {
  removeMathPopup();
  const { latex = "", mode = "inline", onSubmit, onCancel } = options;
  let currentMode: "block" | "inline" = mode;

  const popup = document.createElement("div");
  popup.className = "mathjax-popup";

  // Header
  const header = document.createElement("div");
  header.className = "mathjax-popup-header";

  const title = document.createElement("div");
  title.className = "mathjax-popup-title";
  title.textContent = "Insert Math Equation";

  const closeBtn = document.createElement("button");
  closeBtn.className = "mathjax-popup-close";
  closeBtn.innerHTML = "×";
  closeBtn.onclick = () => {
    onCancel && onCancel();
    removeMathPopup();
  };

  header.appendChild(title);
  header.appendChild(closeBtn);

  // Content
  const content = document.createElement("div");
  content.className = "mathjax-popup-content";

  // Input
  const inputLabel = document.createElement("label");
  inputLabel.className = "mathjax-popup-label";
  inputLabel.textContent = "LaTeX Equation";

  const input = document.createElement("textarea");
  input.className = "mathjax-popup-input";
  input.value = latex;
  input.autofocus = true;
  input.wrap = "soft";

  // Auto-resize textarea
  function autoResize() {
    input.style.height = "auto";
    input.style.height = input.scrollHeight + "px";
  }
  input.addEventListener("input", autoResize);
  setTimeout(autoResize, 0);

  // Mode toggle
  const modeContainer = document.createElement("div");
  modeContainer.className = "mathjax-popup-mode-container";

  const modeLabel = document.createElement("span");
  modeLabel.className = "mathjax-popup-label";
  modeLabel.textContent = "Mode:";

  const modeBtn = document.createElement("button");
  modeBtn.type = "button";
  modeBtn.className = "mathjax-popup-mode-btn";
  modeBtn.textContent =
    currentMode === "block" ? "Display mode" : "Inline mode";
  modeBtn.onmouseover = () => {
    modeBtn.classList.add("hover");
  };
  modeBtn.onmouseout = () => {
    modeBtn.classList.remove("hover");
  };
  modeBtn.onclick = () => {
    currentMode = currentMode === "block" ? "inline" : "block";
    modeBtn.textContent =
      currentMode === "block" ? "Display mode" : "Inline mode";
    renderPreview();
  };

  modeContainer.appendChild(modeLabel);
  modeContainer.appendChild(modeBtn);

  // Preview
  const previewLabel = document.createElement("label");
  previewLabel.className = "mathjax-popup-preview-label";
  previewLabel.textContent = "Preview";

  const preview = document.createElement("div");
  preview.className = "mathjax-popup-preview";

  // Footer
  const footer = document.createElement("div");
  footer.className = "mathjax-popup-footer";

  const cancelBtn = document.createElement("button");
  cancelBtn.type = "button";
  cancelBtn.className = "mathjax-popup-cancel";
  cancelBtn.textContent = "Cancel";
  cancelBtn.onclick = () => {
    onCancel && onCancel();
    removeMathPopup();
  };

  const okBtn = document.createElement("button");
  okBtn.type = "button";
  okBtn.className = "mathjax-popup-insert";
  okBtn.textContent = "Insert";
  okBtn.onclick = () => {
    onSubmit(input.value, currentMode);
    removeMathPopup();
  };

  // Resize handle
  const resizeHandle = document.createElement("div");
  resizeHandle.className = "mathjax-popup-resize-handle";

  // Compose
  content.appendChild(inputLabel);
  content.appendChild(input);
  content.appendChild(modeContainer);
  content.appendChild(previewLabel);
  content.appendChild(preview);
  footer.appendChild(cancelBtn);
  footer.appendChild(okBtn);
  popup.appendChild(header);
  popup.appendChild(content);
  popup.appendChild(footer);
  popup.appendChild(resizeHandle);
  document.body.appendChild(popup);

  // Drag functionality
  let isDragging = false;
  let startX: number;
  let startY: number;
  let initialLeft: number;
  let initialTop: number;

  function dragStart(e: MouseEvent) {
    if (e.target === closeBtn || e.target === resizeHandle) return;

    isDragging = true;
    popup.classList.add("dragging");

    // Get initial position
    const rect = popup.getBoundingClientRect();
    initialLeft = rect.left;
    initialTop = rect.top;

    // Get mouse position
    startX = e.clientX;
    startY = e.clientY;
  }

  function drag(e: MouseEvent) {
    if (!isDragging) return;

    e.preventDefault();

    // Calculate new position
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Update position
    popup.style.left = `${initialLeft + deltaX}px`;
    popup.style.top = `${initialTop + deltaY}px`;
    popup.style.transform = "none";
  }

  function dragEnd() {
    isDragging = false;
    popup.classList.remove("dragging");
  }

  // Resize functionality
  let isResizing = false;
  let startWidth: number;
  let startHeight: number;

  function resizeStart(e: MouseEvent) {
    if (e.target !== resizeHandle) return;

    isResizing = true;
    popup.classList.add("resizing");

    // Get initial size
    const rect = popup.getBoundingClientRect();
    startWidth = rect.width;
    startHeight = rect.height;

    // Get mouse position
    startX = e.clientX;
    startY = e.clientY;
  }

  function resize(e: MouseEvent) {
    if (!isResizing) return;

    e.preventDefault();

    // Calculate new size
    const deltaX = e.clientX - startX;
    const deltaY = e.clientY - startY;

    // Update size
    const newWidth = Math.max(400, startWidth + deltaX);
    const newHeight = Math.max(300, startHeight + deltaY);

    popup.style.width = `${newWidth}px`;
    popup.style.height = `${newHeight}px`;
  }

  function resizeEnd() {
    isResizing = false;
    popup.classList.remove("resizing");
  }

  header.addEventListener("mousedown", dragStart);
  document.addEventListener("mousemove", drag);
  document.addEventListener("mouseup", dragEnd);

  resizeHandle.addEventListener("mousedown", resizeStart);
  document.addEventListener("mousemove", resize);
  document.addEventListener("mouseup", resizeEnd);

  // Preview render
  function stripLatexWrappers(latex: string) {
    return latex
      .replace(/^\\\[(.*)\\\]$/s, "$1")
      .replace(/^\\\((.*)\\\)$/s, "$1")
      .replace(/^\$\$(.*)\$\$$/s, "$1")
      .trim();
  }
  function wrapLatex(latex: string, mode: "block" | "inline") {
    const clean = stripLatexWrappers(latex);
    if (mode === "block") return `\\[${clean}\\]`;
    return `\\(${clean}\\)`;
  }
  function renderPreview() {
    preview.innerHTML = wrapLatex(input.value, currentMode);
    if (typeof MathJax !== "undefined" && MathJax.typesetPromise) {
      MathJax.typesetPromise([preview]);
    }
  }
  input.oninput = renderPreview;
  renderPreview();

  // Keyboard shortcuts
  input.onkeydown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      onSubmit(input.value, currentMode);
      removeMathPopup();
    } else if (e.key === "Escape") {
      e.preventDefault();
      onCancel && onCancel();
      removeMathPopup();
    }
  };
}

export function removeMathPopup() {
  const old = document.querySelector(".mathjax-popup");
  if (old) old.remove();
}
