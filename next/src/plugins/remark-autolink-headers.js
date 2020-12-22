/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 */

/*!
 * Based on 'gatsby-remark-autolink-headers'
 * Original Author: Kyle Mathews <mathews.kyle@gmail.com>
 * Updated by Jared Palmer;
 * Copyright (c) 2015 Gatsbyjs
 */

const toString = require("mdast-util-to-string");
const visit = require("unist-util-visit");
const slugs = require("github-slugger")();
const deburr = require("lodash.deburr");
function patch(context, key, value) {
  if (!context[key]) {
    context[key] = value;
  }
  return context[key];
}

const svgIcon = `<svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path d="M10.879 6.05L15 1.93A5.001 5.001 0 0 1 22.071 9l-4.121 4.121a1 1 0 0 1-1.414-1.414l4.12-4.121a3 3 0 1 0-4.242-4.243l-4.121 4.121a1 1 0 1 1-1.414-1.414zm2.242 11.9L9 22.07A5 5 0 1 1 1.929 15l4.121-4.121a1 1 0 0 1 1.414 1.414l-4.12 4.121a3 3 0 1 0 4.242 4.243l4.121-4.121a1 1 0 1 1 1.414 1.414zm-8.364-.122l13.071-13.07a1 1 0 0 1 1.415 1.414L6.172 19.242a1 1 0 1 1-1.415-1.414z" fill="currentColor"></path></svg>`;

module.exports = ({
  icon = svgIcon,
  className = `anchor`,
  maintainCase = false,
  removeAccents = false,
  enableCustomId = true,
  isIconAfterHeader = false,
  elements = null,
} = {}) => {
  slugs.reset();
  return function transformer(tree) {
    visit(tree, `heading`, (node) => {
      // If elements array exists, do not create links for heading types not included in array
      if (Array.isArray(elements) && !elements.includes(`h${node.depth}`)) {
        return;
      }

      let id;
      if (enableCustomId && node.children.length > 0) {
        const last = node.children[node.children.length - 1];
        // This regex matches to preceding spaces and {#custom-id} at the end of a string.
        // Also, checks the text of node won't be empty after the removal of {#custom-id}.
        const match = /^(.*?)\s*#([\w-]+)$/.exec(toString(last));
        if (match && (match[1] || node.children.length > 1)) {
          id = match[2];
          // Remove the custom ID from the original text.
          if (match[1]) {
            last.value = match[1];
          } else {
            node.children.pop();
          }
        }
      }

      if (!id) {
        const slug = slugs.slug(toString(node), maintainCase);
        id = removeAccents ? deburr(slug) : slug;
      }
      const data = patch(node, `data`, {});

      patch(data, `id`, id);
      patch(data, `htmlAttributes`, {});
      patch(data, `hProperties`, {});
      patch(data.htmlAttributes, `id`, id);
      patch(data.hProperties, `id`, id);

      if (icon !== false) {
        patch(data.hProperties, `style`, `position:relative;`);
        const label = id.split(`-`).join(` `);
        const method = isIconAfterHeader ? `push` : `unshift`;
        node.children[method]({
          type: `link`,
          url: `#${id}`,
          title: null,
          children: [],
          data: {
            hProperties: {
              "aria-label": `${label} permalink`,
              class: `${className} ${isIconAfterHeader ? `after` : `before`}`,
            },
            hChildren: [
              {
                type: `raw`,
                // The Octicon link icon is the default. But users can set their own icon via the "icon" option.
                value: icon,
              },
            ],
          },
        });
      }
      return tree;
    });
  };
};
