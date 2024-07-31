import build from "#build";
import name from "#solid/name";
import create_root from "#solid/client/create-root";
import expose from "#solid/client/expose";
import client from "./client.js";
import publish from "./publish.js";
import server from "./server.js";

export default extension => build({
  create_root,
  extension,
  name,
  actions: { compile: { client, server }, expose, publish },
});
