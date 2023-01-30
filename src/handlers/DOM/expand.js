import {default as parse, PSEUDO} from "./parse.js";

const expand = (tree, components, slots) => {
  if (tree.children !== undefined) {
    for (let i = 0; i < tree.children.length; i++) {
      const child = tree.children[i];
      if (components[child.tagName] !== undefined) {
        tree.children[i] = expand(parse(components[child.tagName]), components,
          tree.children[i].children);
        if (tree.children[i].attributes === undefined) {
          tree.children[i].attributes = {};
        }
        tree.children[i].attributes.class = child.tagName;
      } else {
        if (child.tagName === "slot" && slots !== undefined) {
          // insert slot
          tree.children[i] = {
            type: PSEUDO,
            children: slots,
          };
          expand(tree.children[i], components);
        } else {
          expand(tree.children[i], components, slots);
        }
      }
    }
  }
  return tree;
};

export default (html, components) =>
  expand(parse(html), components);
