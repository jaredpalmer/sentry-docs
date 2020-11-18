const unified = require("unified");
const remarkParse = require("remark-parse");
const remarkMdx = require("remark-mdx");
const remarkMdxJs = require("remark-mdxjs");
const visit = require("unist-util-visit");
const fs = require("fs-extra");
const path = require("path");
const u = unified().use(remarkParse).use(remarkMdx).use(remarkMdxJs);

const parse = (mdx) => {
  const ast = u.parse(mdx);
  // console.log(ast);
  return ast;
};

module.exports = (opts = {}) => (tree) => {
  visit(tree, "mdxBlockElement", async (node, index, parent) => {
    if (node.name === "PlatformContent") {
      // console.log("opts", opts);

      const { value } = node.attributes.find((a) => a.name === "foo");

      if (!value) {
        return;
      }
      const includesPath = path.join(
        process.cwd(),
        "src",
        "includes",
        value,
        opts.platform + ".mdx"
      );
      const fallbackPath = path.join(
        process.cwd(),
        "src",
        "includes",
        value,
        "_default.mdx"
      );

      // console.log("path", contentPath);

      const raw = await fs.readFile(includesPath);

      // console.log("raw", raw);

      node.children = parse(raw);
      // parent.children.splice(index, 1, ...newNode);
    }
  });

  return tree;
};
