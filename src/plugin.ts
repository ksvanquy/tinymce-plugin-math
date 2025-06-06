import { Editor } from "tinymce";
import { showMathPopup, MathPopupOptions } from "./mathPopup";

declare const tinymce: any;
declare const MathJax: any;

const mathIcon =
  '<svg width="24" height="24" focusable="false"><path fill-rule="evenodd" clip-rule="evenodd" d="M9 4.8c.1-.5.5-.8 1-.8h10a1 1 0 1 1 0 2h-9.2L8.3 19.2a1 1 0 0 1-1.7.4l-3.4-4.2a1 1 0 0 1 1.6-1.2l2 2.5L9 4.8Zm9.7 5.5c.4.4.4 1 0 1.4L17 13.5l1.8 1.8a1 1 0 1 1-1.4 1.4L15.5 15l-1.8 1.8a1 1 0 0 1-1.4-1.4l1.8-1.8-1.8-1.8a1 1 0 0 1 1.4-1.4l1.8 1.8 1.8-1.8a1 1 0 0 1 1.4 0Z"></path></svg>';

function stripLatexWrappers(latex: string) {
  return latex
    .replace(/^\\\[(.*)\\\]$/s, "$1")
    .replace(/^\\\((.*)\\\)$/s, "$1")
    .replace(/^\$\$(.*)\$\$$/s, "$1")
    .trim();
}

function insertMath(editor: any, latex: string, mode: "block" | "inline") {
  const cleanLatex = stripLatexWrappers(latex).replace(/\r?\n/g, "\n");
  let html = "";
  if (mode === "block") {
    html = `<div class="math-tex math-tex-block" contenteditable="false" data-latex="${encodeURIComponent(
      latex
    )}">\\[${cleanLatex}\\]</div>`;
    // Luôn tách block thành 1 dòng riêng biệt
    editor.insertContent("</p>" + html + "<p><br></p>");
  } else {
    html = `<span class="math-tex" contenteditable="false" data-latex="${encodeURIComponent(
      latex
    )}">\\(${cleanLatex}\\)</span>`;
    editor.insertContent(html);
  }
  setTimeout(() => {
    const lastMath = editor.getBody().querySelectorAll(".math-tex");
    if (
      lastMath.length &&
      typeof MathJax !== "undefined" &&
      MathJax.typesetPromise
    ) {
      MathJax.typesetPromise([lastMath[lastMath.length - 1]]);
    }
    // Xóa các <p> rỗng liền kề block math
    const blocks = editor.getBody().querySelectorAll(".math-tex-block");
    blocks.forEach((block: Element) => {
      const prev = block.previousSibling as Element | null;
      const next = block.nextSibling as Element | null;
      if (prev && prev.nodeName === "P" && prev.textContent?.trim() === "")
        prev.remove();
      if (next && next.nodeName === "P" && next.textContent?.trim() === "")
        next.remove();
    });
    // Tách block math ra khỏi <p> nếu bị TinyMCE bọc lại
    const ps = Array.from(editor.getBody().querySelectorAll("p")) as Element[];
    ps.forEach((p) => {
      if (
        p.childElementCount === 1 &&
        p.firstElementChild?.classList.contains("math-tex-block")
      ) {
        const block = p.firstElementChild;
        // Chèn <p><br></p> trước/sau nếu cần
        const parent = p.parentNode;
        if (parent) {
          parent.insertBefore(document.createElement("p"), p);
          parent.insertBefore(block, p);
          const afterP = document.createElement("p");
          afterP.innerHTML = "<br>";
          parent.insertBefore(afterP, p.nextSibling);
          p.remove();
        }
      }
    });
  }, 0);
}

const register = (editor: any) => {
  console.log("Math plugin loaded!");
  editor.ui.registry.addIcon("math-custom", mathIcon);
  editor.ui.registry.addButton("math", {
    icon: "math-custom",
    tooltip: "Math",
    onAction: () => {
      showMathPopup({
        latex: "",
        mode: "inline",
        onSubmit: (latex, mode) => insertMath(editor, latex, mode),
        onCancel: () => {},
      });
    },
  });

  // Double click để sửa công thức
  editor.on("dblclick", (e: any) => {
    const mathEl = e.target.closest(".math-tex");
    if (mathEl) {
      let latex = "";
      let mode: "block" | "inline" = "inline";
      if (mathEl.classList.contains("math-tex-block")) {
        mode = "block";
      }
      // Lấy latex gốc từ data-latex nếu có
      if (mathEl.getAttribute("data-latex")) {
        latex = decodeURIComponent(mathEl.getAttribute("data-latex") || "");
      } else {
        latex = mathEl.textContent || "";
        latex = stripLatexWrappers(latex);
      }
      showMathPopup({
        latex,
        mode,
        onSubmit: (newLatex, newMode) => {
          const cleanLatex = stripLatexWrappers(newLatex);
          if (newMode === "block") {
            mathEl.outerHTML = `<div class="math-tex math-tex-block" contenteditable="false" data-latex="${encodeURIComponent(
              newLatex
            )}">\\[${cleanLatex}\\]</div>`;
          } else {
            mathEl.outerHTML = `<span class="math-tex" contenteditable="false" data-latex="${encodeURIComponent(
              newLatex
            )}">\\(${cleanLatex}\\)</span>`;
          }
          if (typeof MathJax !== "undefined" && MathJax.typesetPromise) {
            setTimeout(() => MathJax.typesetPromise([editor.getBody()]), 0);
          }
        },
        onCancel: () => {},
      });
    }
  });
};

tinymce.PluginManager.add("math", register);
