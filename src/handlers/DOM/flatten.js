import {TAG, TEXT, PSEUDO} from "./parse.js";

const flatten = node => {
  if (node.type === PSEUDO) {
    let substructure = "";
    for (const child of node.children) {
      substructure += flatten(child);
    }
    return substructure;
  }
  if (node.type === TAG) {
    let tag = "<" + node.tagName;
    if (node.attributes !== undefined) {
      for (const [key, value] of Object.entries(node.attributes)) {
        if (value === undefined) {
          continue;
        }
        tag += " " + key + "=";
        if (!value.startsWith("\"")) {
          tag += "\"";
        }
        tag += value;
        if (!value.endsWith("\"")) {
          tag += "\"";
        }
      }
    }
    if (node.selfClosing) {
      tag += "/>";
    } else {
      tag += ">";
      for (const child of node.children) {
        tag += flatten(child);
      }
      tag += "</" + node.tagName + ">";
    }
    return tag;
  }
  if (node.type === TEXT) {
    return node.data;
  }
  return node;
};

export default tree => flatten(tree);
