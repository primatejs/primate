import Node from "./Node.js";

const open_tag = "open_tag";
const close_tag = "close_tag";
const open_and_close_tag = "open_and_close_tag";
const last_index = -1;

export default class Parser {
  constructor(html, data, children) {
    this.html = html;
    this.index = 0;
    this.result = [];
    this.buffer = "";
    this.balance = 0;
    this.reading_tag = false;
    this.node = new Node(undefined, undefined, data, children);
    this.tree = this.node;
  }

  remove_whitespace() {
    this.html = this.html.replace(/[\n\t\r]/gu, "");
  }

  get previous() {
    return this.at(this.index+last_index);
  }

  get current() {
    return this.at(this.index);
  }

  get next() {
    return this.at(this.index+1);
  }

  at(index) {
    return this.html[index];
  }

  open_tag() {
    this.node = new Node(this.node, this.buffer);
  }

  close_tag() {
    if (this.node.parent !== undefined) {
      this.node = this.node.parent;
    }
  }

  open_and_close_tag() {
    this.open_tag();
    this.node.auto_closing = true;
    this.close_tag();
  }

  // currently inside tag
  process_reading_tag() {
    if (this.current === ">") {
      // mark as outside tag
      this.reading_tag = false;
      // if the previous character is '/', it's an open and close tag
      if (this.previous === "/") {
        this.tag = open_and_close_tag;
        this.balance--;
        this.buffer = this.buffer.slice(0, last_index);
      }

      // execute the function associated with this kind of tag
      this[this.tag]();
      // empty buffer
      this.buffer = "";
    } else {
      this.buffer += this.current;
    }
  }

  try_create_text_node() {
    if (this.buffer.length > 0) {
      const child = new Node(this.node, "span");
      child.text = this.buffer;
      this.buffer = "";
    }
  }

  // currently outside of a tag
  process_not_reading_tag() {
    // encountered '<'
    if (this.current === "<") {
      this.try_create_text_node();
      // mark as inside tag
      this.reading_tag = true;
      if (this.next === "/") {
        // next character is slash, this is a close tag
        this.tag = close_tag;
        this.balance--;
      } else {
        // this is an open tag (or open-and-close)
        this.tag = open_tag;
        this.balance++;
      }
    } else {
      this.buffer += this.current;
    }
  }

  read() {
    if (this.reading_tag) {
      this.process_reading_tag();
    } else {
      this.process_not_reading_tag();
    }
    this.index++;

    return this.current !== undefined;
  }

  return_checked() {
    if (this.balance !== 0) {
      throw Error(`unbalanced DOM tree: ${this.balance}`);
    }
    // anything left at the end could be potentially a text node
    this.try_create_text_node();
    return this.tree;
  }

  parse() {
    this.remove_whitespace();
    do {} while (this.read());
    return this.return_checked();
  }

  static parse(html, data, children) {
    return new Parser(html, data, children).parse();
  }
}
