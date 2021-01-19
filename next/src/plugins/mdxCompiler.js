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

/**
 * A custom remark mdx plugin that adds support for a `<PlatformContent includePath=""/>`
 * component. This component will look for a file in the `includes` directory that matches
 * the `opts.platform` string (usually determined by a url).
 *
 * @param {*} opts options (platform and frontmatter)
 */
module.exports = (opts = {}) => (tree) => {
  visit(tree, "mdxBlockElement", async (node, index, parent) => {
    if (node.name === "PlatformContent") {
      // console.log("opts", opts);

      const { value } = node.attributes.find((a) => a.name === "includePath");
      // console.log(value);
      if (!value) {
        return;
      }
      const pathsToLookFor = [
        // Lookup and then read the file in the includes directory
        // and potentially also the fallback given the value of the `includePath` prop
        ...opts.platforms.map((p) =>
          path.join(process.cwd(), "src", "includes", value, p + ".mdx")
        ),
        path.join(process.cwd(), "src", "includes", value, "_default.mdx"),
      ];

      let raw;
      let includesPath = pathsToLookFor.find((fp) => fs.existsSync(fp));

      if (includesPath) {
        raw = fs.readFileSync(includesPath, "utf8");
      }
      // console.log("path", contentPath);
      // console.log("raw", raw);

      // Now we parse the includes as MDX again, and then stitch the
      // AST so that we actually render the <PlatformContent>
      // component as well.
      if (raw) {
        node.children = parse(raw).children;
      }
    }
  });
  console.log(tree);
  return tree;
};
