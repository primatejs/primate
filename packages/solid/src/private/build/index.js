import create_root from "#client/create-root";
import expose from "#client/expose";
import name from "#name";
import build from "@primate/frontend/core/build";
import client from "./client.js";
import publish from "./publish.js";
import server from "./server.js";

export default extension => build({
  create_root,
  extension,
  name,
  actions: { compile: { client, server }, expose, publish },
});
