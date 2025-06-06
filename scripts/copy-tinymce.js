import { copyFileSync, mkdirSync, readdirSync, statSync } from "fs";
import { join } from "path";
import { fileURLToPath } from "url";

const __dirname = fileURLToPath(new URL(".", import.meta.url));
const rootDir = join(__dirname, "..");
const tinymceDir = join(rootDir, "tinymce");
const nodeModulesTinymceDir = join(rootDir, "node_modules", "tinymce");

// Tạo thư mục tinymce nếu chưa tồn tại
mkdirSync(tinymceDir, { recursive: true });

// Hàm copy đệ quy
function copyDir(src, dest) {
  const entries = readdirSync(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = join(src, entry.name);
    const destPath = join(dest, entry.name);

    if (entry.isDirectory()) {
      mkdirSync(destPath, { recursive: true });
      copyDir(srcPath, destPath);
    } else {
      copyFileSync(srcPath, destPath);
    }
  }
}

// Copy các file cần thiết
const filesToCopy = ["tinymce.min.js", "themes", "plugins", "skins"];

for (const file of filesToCopy) {
  const srcPath = join(nodeModulesTinymceDir, file);
  const destPath = join(tinymceDir, file);

  if (statSync(srcPath).isDirectory()) {
    mkdirSync(destPath, { recursive: true });
    copyDir(srcPath, destPath);
  } else {
    copyFileSync(srcPath, destPath);
  }
}

console.log("TinyMCE files copied successfully!");
