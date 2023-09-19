import {onMount, onCleanup, useContext} from "solid-js";
import {SolidHeadContext, is} from "@primate/frontend";

const to_array = maybe => Array.isArray(maybe) ? maybe : [maybe];

const data_attribute = "data-rh";
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

  if (is.client) {
    // DOM elements
    const titles = children.filter(({tagName}) => tagName === "TITLE");
    const others = children.filter(({tagName}) => tagName !== "TITLE");

    titles.forEach(title => {
      globalThis.document.title = title.innerText;
    });
    others.forEach(other => {
      other.dataset.rh = id;
      globalThis.document.head.prepend(other);
    });
  } else {
    const tags = children.map(({t: tag}) => tag);
    const all_good = tags.every(tag => allowed.includes(get_tag(tag)));
    if (!all_good) {
      const name = "SolidHead";
      const bad = get_tag(tags.find(tag => !allowed.includes(get_tag(tag))));
      const alloweds = `${allowed.map(tag => `<${tag}>`).join(", ")}`;
      const error = `${name} may only contain ${alloweds}, found <${bad}>`;
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

const SolidHead = function SolidHead(props) {
  let id;
  onMount(() => {
    if (is.client) {
      id = crypto.randomUUID();
      render(props.children, id);
    }
  });

  onCleanup(() => {
    if (is.client) {
      // remove managed tags
      clear(id);
    }
  });

  if (is.server) {
    const context = useContext(SolidHeadContext);
    context(render(props.children, data_ssr));
  }

  // no return, nothing rendered
};

SolidHead.clear = (data_value = data_ssr) => clear(data_value);

export default SolidHead;
