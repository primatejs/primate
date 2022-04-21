import Parser from "./Parser.js";

const replacement_regex = /^\$([0-9]*)$/;
const data_regex = /\${([^}]*)}/g;
const attributes_regex = /([-a-z]*="[^"]+")/g;
const replace = (attribute, source) => {
  if (attribute.includes(".")) {
    const index = attribute.indexOf(".");
    const left = attribute.slice(0, index);
    const rest = attribute.slice(index+1);
    if (source[left] !== undefined) {
      return replace(rest, source[left]);
    }
  } else {
    return source[attribute];
  }
};
const fulfill = (attribute, source) => {
  if (source === undefined) {
    return undefined;
  }
  let value = attribute;
  const matches = [...attribute.matchAll(data_regex)];
  if (matches.length > 0) {
    for (const match of matches) {
      const [key] = match;
      const new_value = replace(match[1], source);
      if (attribute === key) {
        return new_value;
      }
      value = attribute.replace(key, new_value);
    }
  }
  return value;
};

export default class Node {
  #data;

  constructor(parent, content = "div", data) {
    if (parent !== undefined) {
      this.parent = parent;
      this.parent.attach(this);
    }
    this.#data = data;
    this.attributes = {};
    if (content !== undefined) {
      const [tag_name] = content.split(" ");
      const attributes = content.match(attributes_regex) ?? [];
      this.tag_name = tag_name;
      for (const attribute of attributes
        .map(a => a.replaceAll("\"", ""))
        .filter(a => a.includes("="))) {
        const position = attribute.indexOf("=");
        const key = attribute.slice(0, position);
        const value = attribute.slice(position+1);
        this.attributes[key] = value;
        if (this.data) {
          const result = replacement_regex.exec(value);
          if (result !== null) {
            this.attributes[key] = this.data[result[1]];
          }
        }
      }
    }
    this.children = [];
  }

  get data() {
    if (this.#data !== undefined) {
      return this.#data;
    } else {
      return this.parent?.data;
    }
  }

  set data(value) {
    this.#data = value;
  }

  attach(child) {
    this.children.push(child);
    child.parent = this;
  }

  replace(child, replacement) {
    for (let i = 0; i < this.children.length; i++) {
      if (child === this.children[i]) {
        replacement.parent = this;
        this.children.splice(i, 1, replacement);
      }
    }
  }

  async render() {
    let tag = "<" + this.tag_name;
    for (const [key, value] of Object.entries(this.attributes)) {
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
    if (this.auto_closing) {
      tag += "/>";
    } else {
      tag += ">";
      for (const child of this.children) {
        tag += await child.render();
      }
      if (this.text) {
        tag += await this.text;
      }
      tag += "</" + this.tag_name + ">";
    }
    return tag;
  }

  compose(components) {
    if (components[this.tag_name]) {
      return Parser.parse(components[this.tag_name], this.attributes);
    }
    for (let i = 0; i < this.children.length; i++) {
      this.children[i] = this.children[i].compose(components);
    }
    return this;
  }

  clone(parent, data) {
    const cloned = new Node(parent, this.tag_name, data);
    cloned.text = this.text;
    for (const attribute in this.attributes) {
      cloned.attributes[attribute] = this.attributes[attribute];
    }
    for (const child of this.children) {
      child.clone(cloned);
    }
  }

  async expand() {
    if (this.attributes["data-for"] !== undefined) {
      const key = this.attributes["data-for"];
      delete this.attributes["data-for"];
      const value = await fulfill(key, this.data);
      const arr = Array.isArray(value) ? value : [value];
      const newparent = new Node();
      for (const val of arr) {
        this.clone(newparent, val);
      }
      this.parent.replace(this, newparent);
      return newparent.expand();
    }
    for (const attribute in this.attributes) {
      if (attribute.startsWith("data-")) {
        const fulfilled = fulfill(this.attributes[attribute], this.data);
        switch(attribute) {
          case "data-value":
            if (this.tag_name === "input") {
              this.attributes.value = fulfilled;
            } else {
              this.text = fulfilled;
            }
            break;
          default:
            this.attributes[attribute.slice(5)] = fulfilled;
            break;
        }
        delete this.attributes[attribute];
      }
    }
    for (let i = 0; i < this.children.length; i++) {
      this.children[i] = await this.children[i].expand();
    }
    return this;
  }

  unfold(components) {
    return this.compose(components).expand();
  }
}
