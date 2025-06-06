export interface MathPopupOptions {
    latex?: string;
    mode?: "block" | "inline";
    onSubmit: (latex: string, mode: "block" | "inline") => void;
    onCancel?: () => void;
}
export declare function showMathPopup(options: MathPopupOptions): void;
export declare function removeMathPopup(): void;
