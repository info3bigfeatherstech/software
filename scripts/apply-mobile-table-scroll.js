import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "../src/Components");
const TABLE_MIN = "min-w-[720px] lg:min-w-0";
const SCROLL_WRAP_OPEN =
  '<div className="w-full overflow-x-auto overflow-y-hidden overscroll-x-contain">';
const SCROLL_WRAP_CLOSE = "</div>";

function walk(dir, files = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, files);
    else if (e.name.endsWith(".jsx")) files.push(p);
  }
  return files;
}

for (const file of walk(root)) {
  const original = fs.readFileSync(file, "utf8");
  if (!original.includes("<table")) continue;

  const lines = original.split("\n");
  let changed = false;

  const withMinWidth = lines.map((line) => {
    if (!line.includes("<table") || line.trim().startsWith("//")) return line;
    const m = line.match(/<table className="([^"]*)"/);
    if (!m) return line;
    const cls = m[1];
    if (cls.includes("min-w-[") || cls.includes("min-w-max")) return line;
    const newCls = cls.includes("w-full")
      ? cls.replace("w-full", `w-full ${TABLE_MIN}`)
      : `${TABLE_MIN} ${cls}`;
    changed = true;
    return line.replace(/<table className="[^"]*"/, `<table className="${newCls}"`);
  });

  const out = [];
  for (let i = 0; i < withMinWidth.length; i++) {
    const line = withMinWidth[i];
    if (line.includes("<table") && !line.trim().startsWith("//")) {
      const lookback = withMinWidth.slice(Math.max(0, i - 12), i).join("\n");
      const prev = withMinWidth[i - 1] || "";
      const needsWrap =
        !lookback.includes("overflow-x-auto") &&
        !prev.includes("overflow-x-auto") &&
        !prev.includes(SCROLL_WRAP_OPEN);
      if (needsWrap) {
        const indent = (line.match(/^(\s*)/) || ["", ""])[1];
        out.push(indent + SCROLL_WRAP_OPEN);
        changed = true;
        out.push(line);
        let depth = 0;
        for (let j = i + 1; j < withMinWidth.length; j++) {
          out.push(withMinWidth[j]);
          if (withMinWidth[j].includes("<table") && !withMinWidth[j].trim().startsWith("//")) {
            depth++;
          }
          if (withMinWidth[j].includes("</table>")) {
            if (depth === 0) {
              out.push(indent + SCROLL_WRAP_CLOSE);
              i = j;
              break;
            }
            depth--;
          }
        }
        continue;
      }
    }
    out.push(line);
  }

  if (changed) {
    fs.writeFileSync(file, out.join("\n"), "utf8");
    console.log("updated:", path.relative(root, file));
  }
}
