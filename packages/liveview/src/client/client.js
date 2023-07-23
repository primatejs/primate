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

const get = async (pathname, updater, state = false) => {
  const response = await fetch(pathname, {headers});
  await handle(response, updater);
  if (state) {
    history.pushState({}, "", pathname);
  }
};

const post = async (pathname, body, updater) => {
  try {
    const response = await fetch(pathname, {method: "POST", body, headers});
    if (response.redirected) {
      return go(response.url);
    }
    await handle(response, updater);
  } catch (error) {
    console.warn(error);
  }
};

const go = async (href, updater) => {
  const url = new URL(href);
  const next = url.pathname;
  const current = global.location.pathname;
  // hosts must match for internal get
  if (url.host === global.location.host) {
    // pathname must differ
    if (current !== next) {
      await get(next, updater, true);
      global.scrollTo(0, 0);
    }
  // external get
  } else {
    window.location = url;
  }
};

export default updater => {
  global.addEventListener("popstate", async () => {
    await get(global.location.pathname, updater);
  });

  global.addEventListener("click", event => {
    const {target} = event;
    if (target.tagName === "A") {
      event.preventDefault();
      return go(target.href, updater);
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
