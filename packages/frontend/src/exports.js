export * from "./frontends/exports.js";

const is_client = globalThis.document?.createElement !== undefined;
const is = {
  client: is_client,
  server: !is_client,
};

export { is };

export { default as WebComponent } from "./client/WebComponent.js";
