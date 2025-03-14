import HeadContext from "#context/head";
import type Props from "@primate/core/frontend/Props";
import runtime from "@rcompat/runtime";
import { onCleanup, onMount, useContext } from "solid-js";

const is_client = runtime === "browser" as any;

type ServerElement = {
  t: string;
  tagName: string;
  props: Props;
};

type Tag = HTMLElement | ServerElement;

const to_array = (maybe: Tag[]) => Array.isArray(maybe) ? maybe : [maybe];

const data_attribute = "data-sh";
const data_ssr = "ssr";
const allowed = ["title", "meta", "style", "meta", "link", "script", "base"];

const make_tag = (tag: string, id: string) => {
  const parts = tag.split(" ");
  return [
    parts[0],
    `${data_attribute}="${id}"`,
    ...parts.slice(1),
  ].join(" ");
};

const get_tag = (child: string) => child.match(/^<(?<tag>[a-z]*) .*$/u)?.groups?.tag ?? "";

const render = (maybe_children: Tag[], id: string) => {
  const _children = to_array(maybe_children);

  if (is_client) {
    const children = _children as HTMLElement[]
    // DOM elements
    const titles = children.filter(({ tagName }) => tagName === "TITLE");
    const others = children.filter(({ tagName }) => tagName !== "TITLE");

    titles.forEach(title => {
      globalThis.document.title = title.innerText;
    });
    others.forEach(other => {
      other.dataset.sh = id;
      globalThis.document.head.prepend(other);
    });
  } else {
    const children = _children as ServerElement[];

    const tags = children.map(({ t: tag }) => tag);
    const all_good = tags.every(tag => allowed.includes(get_tag(tag)));
    if (!all_good) {
      const bad = get_tag(tags.find(tag => !allowed.includes(get_tag(tag))) ?? "");
      const alloweds = `${allowed.map(tag => `<${tag}>`).join(", ")}`;
      const error = `Head may only contain ${alloweds}, found <${bad}>`;
      throw new Error(error);
    }

    const titles = tags.filter(tag => get_tag(tag) === "title");
    const others = tags.filter(tag => get_tag(tag) !== "title");

    return [
      ...titles,
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

const Head = function Head(props: { children: Tag[] }) {
  let id: string;
  onMount(() => {
    if (is_client) {
      id = crypto.randomUUID();
      render(props.children, id);
    }
  });

  onCleanup(() => {
    if (is_client) {
      // remove managed tags
      clear(id);
    }
  });

  if (!is_client) {
    const context = useContext(HeadContext);
    context(render(props.children, data_ssr));
  }

  // no return, nothing rendered
};

Head.clear = (data_value = data_ssr) => clear(data_value);

export default Head;
