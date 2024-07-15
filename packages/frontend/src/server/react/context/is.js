const is_client = globalThis.document?.createElement !== undefined;

export default {
  client: is_client,
  server: !is_client,
};
