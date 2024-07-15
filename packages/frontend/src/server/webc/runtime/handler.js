import client from "@primate/frontend/webc/client";

export default () => (name, props = {}, options = {}) => async app => {
  const [component] = name.split(".");
  const assets = [await app.inline(client(component, props), "module")];
  const head = assets.map(asset => asset.head).join("\n");
  const script_src = assets.map(asset => asset.integrity);
  const headers = app.headers({ "script-src": script_src });

  return app.view({ head, headers, body: "", ...options });
};
