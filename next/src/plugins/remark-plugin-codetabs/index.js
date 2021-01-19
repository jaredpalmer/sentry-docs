const visit = require("unist-util-visit");

function getFullMeta(node) {
  if (node.lang && node.meta) {
    return node.lang + node.meta;
  }
  return node.lang || node.meta;
}

function getFilename(node) {
  const meta = getFullMeta(node);
  const match = (meta || "").match(/\{filename:\s*([^}]+)\}/);
  return (match && match[1]) || "";
}

function getTabTitle(node) {
  const meta = getFullMeta(node);
  const match = (meta || "").match(/\{tabTitle:\s*([^}]+)\}/);
  return (match && match[1]) || "";
}

function createTabs(tabs) {
  // For v1, you might be able to create to do this:
  // return {type: 'jsx', value: '<Whatever />'}
  // For the last beta, i’m not 100%, maybe those `mdxBlockElement` that you have now.
  // For the `main` branch, it would be building an actual AST:

  return {
    type: "mdxBlockElement",
    name: "CodeTabs",
    attributes: [],
    children: tabs.map((tab) => ({
      ...tab,
      type: "mdxBlockElement",
      name: `CodeBlock`,
      attributes: [
        {
          type: "mdxBlockAttribute",
          name: "language",
          value: tab.lang || "",
        },
        {
          type: "mdxBlockAttribute",
          name: "children",
          value: tab.value,
        },
        {
          type: "mdxBlockAttribute",
          name: "title",
          value: getTabTitle(tab),
        },
        {
          type: "mdxBlockAttribute",
          name: "filename",
          value: getFilename(tab),
        },
      ],
    })),
  };
}

function onnode(node) {
  var index = -1;
  var result = [];
  var tabs;

  if (!node.children) return;

  node.children.forEach(function (child, index) {
    // `child.type === 'code'` would work on remark.
    // It might be better to be in a rehype plugin, where you’re dealing with HTML,
    // Then it would be `child.type === 'element' && child.tagName === 'pre'` (which has a single `code` child).
    if (child.type === "code") {
      if (!tabs) tabs = [];
      tabs.push(child);
      return;
    }

    if (tabs) {
      result.push(createTabs(tabs));
      tabs = undefined;
    }

    result.push(child);
  });

  if (tabs) {
    result.push(createTabs(tabs));
  }

  node.children = result;
}
// TODO(dcramer): this should only operate on MDX
module.exports = ({ className = "code-tabs-wrapper" } = {}) => (
  markdownAST
) => {
  visit(markdownAST, () => true, onnode);
  return markdownAST;
};
// toRemove.forEach(([node, parent]) => {
//   parent.children = parent.children.filter((n) => n !== node);
// });

// console.log(markdownAST);
