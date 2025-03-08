import create_root from "#client/create-root";
import expose from "#client/expose";
import name from "#name";
import build from "@primate/core/frontend/build";
import client from "./client.js";
import publish from "./publish.js";
import server from "./server.js";

export default (extension: string, ssr: boolean) => build({
  create_root,
  extension,
  name,
  compile: { client, server },
  expose,
  publish,
  ssr,
});
