import header from "./header.js";
import storage from "./storage.js";

const headers = {
  [header]: "true",
};
const TEXT_PLAIN = "text/plain";
const APPLICATION_JSON = "application/json";
const MULTIPART_FORM_DATA = "multipart/form-data";
const global = globalThis;

history.scrollRestoration = "manual";

const scroll = (x, y) => global.scrollTo(x, y);
const scroll_hash = hash => {
  if (hash === "") {
    scroll(0, 0);
  } else {
    global.document.getElementsByName(hash.slice(1))[0]?.scrollIntoView();
  }
};

const handlers = {
  [TEXT_PLAIN]: async response => {
    // exit
    document.body.innerText = await response.text();
  },
  [APPLICATION_JSON]: async (response, updater) => {
    updater(await response.json());
  },
};

const handle = async (response, updater) => {
  const content_type = response.headers.get("Content-Type");
  await (handlers[content_type] ?? handlers[TEXT_PLAIN])(response, updater);
};

const goto = async ({ pathname, hash }, updater, state = false) => {
  try {
    const response = await fetch(pathname, { headers });
    // save before loading next
    const { scrollTop } = global.document.scrollingElement;
    const { pathname: currentPathname, hash: currentHash } = global.location;
    await handle(response, updater);
    if (state) {
      storage.new({ scrollTop, pathname: currentPathname, hash: currentHash });
      history.pushState({}, "", `${pathname}${hash}`);
    }
  } catch(error) {
    console.warn(error);
  }
};

const submit = async (pathname, body, method, updater) => {
  try {
    const response = await fetch(pathname, { method, body, headers });
    if (response.redirected) {
      await go(response.url, updater);
      return;
    }
    await handle(response, updater);
  } catch (error) {
    console.warn(error);
  }
};

const go = async (href, updater, event) => {
  const url = new URL(href);
  const { pathname, hash } = url;
  const current = global.location.pathname;
  // hosts must match
  if (url.host === global.location.host) {
    // prevent event
    event?.preventDefault();

    // pathname differs
    if (current !== pathname) {
      await goto(url, props => updater(props, () => scroll_hash(hash)), true);
    }
    // different hash on same page, jump to hash
    if (hash !== global.location.hash) {
      const { scrollTop } = global.document.scrollingElement;
      storage.new({
        stop: true,
        pathname: current,
        hash: global.location.hash,
        scrollTop,
      });
      history.pushState(null, "", `${current}${hash}`);
      scroll_hash(hash);
    }
  }
  // external redirect
};

export default updater => {
  global.addEventListener("beforeunload", _ => {
    history.scrollRestoration = "auto";
  });

  global.addEventListener("popstate", _ => {
    const state = storage.peek() ?? { scrollTop: 0 };
    const { pathname } = global.location;

    let { scrollTop } = state;
    if (state.stop) {
      storage.back();
      if (state.hash) {
        scroll_hash(state.hash);
      } else {
        scroll(0, state.scrollTop);
      }
      return;
    }
    const back = state.pathname === pathname;
    if (back) {
      storage.back();
    } else {
      scrollTop = storage.forward().scrollTop;
    }

    goto(global.location, props =>
      updater(props, () => scroll(0, scrollTop ?? 0)));
  });

  global.addEventListener("click", event => {
    const target = event.target.closest("a");
    if (target?.tagName === "A" && target.href !== "") {
      go(target.href, updater, event);
    }
  });

  global.addEventListener("submit", event => {
    event.preventDefault();
    const { target } = event;
    const { enctype } = target;
    const action = target.action ?? global.location.pathname;
    const url = new URL(action);
    const data = new FormData(target);
    const form = enctype === MULTIPART_FORM_DATA
      ? data
      : new URLSearchParams(data);
    submit(url.pathname, form, target.method, updater);
  });
};
