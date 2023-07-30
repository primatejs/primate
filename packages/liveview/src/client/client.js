import header from "./header.js";
const headers = {
  [header]: "true",
};
const TEXT_PLAIN = "text/plain";
const APPLICATION_JSON = "application/json";
const MULTIPART_FORM_DATA = "multipart/form-data";
const global = globalThis;

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

const get = async ({pathname, hash}, updater, state = false) => {
  try {
    const response = await fetch(pathname, {headers});
    await handle(response, props =>
      updater(props, () => hash !== ""
        ? global.document.getElementsByName(hash.slice(1))[0]?.scrollIntoView()
        : global.scrollTo(0, 0)));
    if (state) {
      history.pushState({}, "", `${pathname}${hash}`);
    }
  } catch(error) {
    console.warn(error);
  }
};

const post = async (pathname, body, updater) => {
  try {
    const response = await fetch(pathname, {method: "POST", body, headers});
    if (response.redirected) {
      return go(response.url, updater);
    }
    await handle(response, updater);
  } catch (error) {
    console.warn(error);
  }
};

const go = async (href, updater, event) => {
  const url = new URL(href);
  const {pathname} = url;
  const current = global.location.pathname;
  // hosts must match
  if (url.host === global.location.host) {
    // pathname must differ
    if (current !== pathname) {
      event?.preventDefault();
      await get(url, updater, true);
    }
    // no hash, prevent event
    if (url.hash === "") {
      event?.preventDefault();
    }
    // let event roll, jump to hash
  }
  // external redirect
};

export default updater => {
  global.addEventListener("popstate", async () => {
    await get(global.location, updater);
  });

  global.addEventListener("click", event => {
    const target = event.target.closest("a");
    if (target?.tagName === "A") {
      return go(target.href, updater, event);
    }
  });

  global.addEventListener("submit", async event => {
    event.preventDefault();
    const {target} = event;
    const {enctype} = target;
    const action = target.action ?? global.location.pathname;
    const url = new URL(action);
    const next = url.pathname;
    const data = new FormData(target);
    const form = enctype === MULTIPART_FORM_DATA
      ? data
      : new URLSearchParams(data);
    await post(next, form, updater);
  });
};
