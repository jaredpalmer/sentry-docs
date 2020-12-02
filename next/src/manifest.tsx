import path from "path";
import dataDir from "@github-docs/data-directory";
import fm from "gray-matter";
import fs from "fs-extra";

export function getPlatformData() {
  const platformData = dataDir(path.join(process.cwd(), "src", "platforms"), {
    process: (raw, extension) => {
      if (extension === ".mdx") {
        console.log(extension);
        const { content } = fm(raw);
        return content;
      }
      return raw;
    },
    extensions: [".json", ".md", ".mdx", ".markdown", ".yaml", ".yml"],
  });

  fs.writeJsonSync(path.join(process.cwd(), "src", "data.json"), platformData);
  return platformData;
}
