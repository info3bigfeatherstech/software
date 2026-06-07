import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../src");
const toastConfigFile = path.join(root, "Components/shared/ToastConfig.jsx");

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (e.name.endsWith(".jsx") || e.name.endsWith(".js")) files.push(p);
  }
  return files;
}

function getRelativeImport(fromFile) {
  let rel = path.relative(path.dirname(fromFile), toastConfigFile).replace(/\\/g, "/");
  if (!rel.startsWith(".")) rel = `./${rel}`;
  return rel.replace(/\.jsx$/, "");
}

let count = 0;
for (const file of walk(root)) {
  if (path.resolve(file) === path.resolve(toastConfigFile)) continue;
  const lines = fs.readFileSync(file, "utf8").split("\n");
  let changed = false;
  const next = lines.map((line) => {
    if (line.trim().startsWith("//")) return line;
    if (!line.includes('from "react-toastify"') && !line.includes("from 'react-toastify'")) {
      return line;
    }
    if (!line.includes("toast")) return line;
    const rel = getRelativeImport(file);
    changed = true;
    return `import { toast } from "${rel}";`;
  });
  if (changed) {
    fs.writeFileSync(file, next.join("\n"), "utf8");
    count++;
    console.log("updated:", path.relative(root, file));
  }
}
console.log("total:", count);
