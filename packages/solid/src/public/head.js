import HeadContext from "#context/head";
import platform from "@rcompat/platform";
import { onCleanup, onMount, useContext } from "solid-js";

const is_client = platform === "browser";

const to_array = maybe => Array.isArray(maybe) ? maybe : [maybe];

const data_attribute = "data-sh";
const data_ssr = "ssr";
const allowed = ["title", "meta", "style", "meta", "link", "script", "base"];

const make_tag = (tag, id) => {
  const parts = tag.split(" ");
  return [
    parts[0],
    `${data_attribute}="${id}"`,
    ...parts.slice(1),
  ].join(" ");
};

const get_tag = child => child.match(/^<(?<tag>[a-z]*) .*$/u).groups.tag;

const render = (maybe_children, id) => {
  const children = to_array(maybe_children);

  if (is_client) {
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
    const tags = children.map(({ t: tag }) => tag);
    const all_good = tags.every(tag => allowed.includes(get_tag(tag)));
    if (!all_good) {
      const bad = get_tag(tags.find(tag => !allowed.includes(get_tag(tag))));
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

const clear = (data_value) => {
  const selector = `[${data_attribute}="${data_value}"]`;
  globalThis.document.querySelectorAll(selector).forEach(element => {
    element.remove();
  });
};

const Head = function Head(props) {
  let id;
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
