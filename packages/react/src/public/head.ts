import HeadContext from "#context/head";
import type Props from "@primate/core/frontend/Props";
import runtime from "@rcompat/runtime";
import React from "react";

const is_client = (runtime === "browser" as any);

type Child = {
  type: string,
  props: Props,
};

const to_array = (maybe: Child[]) => Array.isArray(maybe) ? maybe : [maybe];

const data_attribute = "data-rh";
const data_ssr = "ssr";
const allowed = ["title", "meta", "style", "meta", "link", "script", "base"];

const make_tag = ({ type, props }: Child, id: string) => {
  if (is_client) {
    const element = globalThis.document.createElement(type);
    Object.entries(props).forEach(([name, value]) => {
      element.setAttribute(name, value as string);
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

const render = (maybe_children: Child[], id: string) => {
  const children = to_array(maybe_children);
  const all_good = children.every(({ type }) => allowed.includes(type));
  if (!all_good) {
    const bad = `<${children.find(({ type }) => !allowed.includes(type))!.type}>`;
    const alloweds = `${allowed.map(tag => `<${tag}>`).join(", ")}`;
    const error = `Head may only contain ${alloweds}, found ${bad}`;
    throw new Error(error);
  }

  const titles = children.filter(({ type }) => type === "title");
  const others = children.filter(({ type }) => type !== "title");

  if (is_client) {
    titles.forEach(title => {
      globalThis.document.title = title.props.children as string;
    });
    others.forEach(other => {
      globalThis.document.head.prepend(make_tag(other, id));
    });
  } else {
    return [
      ...titles.map(title => `<title>${title.props.children}</title>`),
      ...others.map(other => make_tag(other, id)),
    ];
  }
};

const clear = (data_value: string) => {
  const selector = `[${data_attribute}="${data_value}"]`;
  globalThis.document.querySelectorAll(selector).forEach(element => {
    element.remove();
  });
};

const Head = class Head extends React.Component<{ children: Child[] }> {
  declare context: React.ContextType<React.Context<any>>;

  id?: string;
  // clearing after SSR and before root hydration
  static clear(data_value = data_ssr) {
    clear(data_value);
  }

  componentDidMount() {
    if (is_client) {
      this.id = crypto.randomUUID();
      this.props.children
      render(this.props.children, this.id);
    }
  }

  componentDidUpdate() {
    if (is_client) {
      clear(this.id!);
      render(this.props.children, this.id!);
    }
  }

  componentWillUnmount() {
    if (is_client) {
      // remove managed tags
      clear(this.id!);
    }
  }

  render() {
    if (!is_client) {
      this.context(render(this.props.children, data_ssr));
    }

    return undefined as React.ReactNode;
    // no return, nothing rendered
  }
};

Head.contextType = HeadContext;

export default Head;
