import {default as tokenize, EOF, START_TAG, END_TAG, CHARACTER} from "./tokenize.js";

export const TAG = 0;
export const TEXT = 1;

const makeTag = tagName => ({type: TAG, tagName, children: []});
const makeText = data => ({type: TEXT, data});

const parse = tokens => {
  const root = makeTag("div");
  const stack = [root];

  for (const token of tokens) {
    const current = stack.at(-1);

    if (token.type === START_TAG) {
      if (current.type === TEXT) {
        stack.pop();
      }
      const node = makeTag(token.tagName);
      if (token.attributes) {
        node.attributes = {};
        for (const attribute of token.attributes) {
          node.attributes[attribute.name] = attribute.value;
        }
      }
      current.children.push(node);
      stack.push(node);
      if (token.selfClosing) {
        stack.pop();
      }
    }
    if (token.type === END_TAG) {
      if (current.type === TEXT) {
        stack.pop();
      }
      stack.pop();
    }
    if (token.type === CHARACTER) {

      // if current node is text, add to it
      if (current.type === TEXT) {
        current.data += token.value;
      } else {
        const node = makeText(token.value);
        current.children.push(node);
        stack.push(node);
      }
    }
  }
  if (stack.length > 1) {
    console.log(stack.length);
    throw new Error("unbalanced tree");
  }
  return root;
};

export default tokens => parse(tokenize(tokens));
