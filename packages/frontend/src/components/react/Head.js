import React from "react";
import {ReactHeadContext, is} from "@primate/frontend";

const to_array = maybe => Array.isArray(maybe) ? maybe : [maybe];

const data_attribute = "data-rh";
const rh_ssr = "ssr";
const allowed = ["title", "meta", "style", "meta", "link", "script", "base"];
const allowed_string = `${allowed.map(tag => `<${tag}>`).join(", ")}`;

const make_tag = ({type, props}, id) => {
  if (is.client) {
    const element = globalThis.document.createElement(type);
    Object.entries(props).forEach(([name, value]) => {
      element.setAttribute(name, value);
    });
    element.dataset.rh = id;
    return element;
  }
  const attributes = Object.entries(props)
    .map(([key, value]) => `${key}="${value}"`)
    .concat(`${data_attribute}="${id}"`)
    .join(" ");

  return `<${type} ${attributes}/>`;
};

const render = (maybe_children, id) => {
  const children = to_array(maybe_children);
  const all_good = children.every(({type}) => allowed.includes(type));
  if (!all_good) {
    const bad = `<${children.find(({type}) => !allowed.includes(type)).type}>`;
    const error = `ReactHead may only contain ${allowed_string}, found ${bad}`;
    throw new Error(error);
  }

  const titles = children.filter(({type}) => type === "title");
  const others = children.filter(({type}) => type !== "title");

  if (is.client) {
    titles.forEach(title => {
      globalThis.document.title = title.props.children;
    });
    others.forEach(other => {
      globalThis.document.head.prepend(make_tag(other, id));
    });
  } else {
    return [
      ...titles.map(title => `<title>${title.props.children}</title>`),
      ...others.map(other => make_tag(other, rh_ssr)),
    ];
  }
};

const ReactHead = class ReactHead extends React.Component {
  // clearing after SSR and before root hydration
  static clear() {
    const selector = `[${data_attribute}="${rh_ssr}"]`;
    globalThis.document.querySelectorAll(selector).forEach(element => {
      element.remove();
    });
  }

  componentDidMount() {
    if (is.client) {
      this.id = crypto.randomUUID();
      render(this.props.children, this.id);
    }
  }

  componentDidUpdate() {
    // ignored, component hasn't changed (shared layout etc.)
  }

  componentWillUnmount() {
    if (is.client) {
      // remove managed tags
      const selector = `[${data_attribute}="${this.id}"]`;
      globalThis.document.querySelectorAll(selector).forEach(element => {
        element.remove();
      });
    }
  }

  render() {
    if (is.server) {
      this.context(render(this.props.children));
    }
  }
};

ReactHead.contextType = ReactHeadContext;

export default ReactHead;
