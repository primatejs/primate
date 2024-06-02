import { serve, Status } from "rcompat/http";
import FS from "rcompat/fs";
import { cascade, tryreturn } from "rcompat/async";
import { dim } from "rcompat/colors";
import * as loaders from "../loaders/exports.js";
import * as hooks from "./exports.js";
import $router from "./router.js";
import dispatch from "../dispatch.js";

const post = async app => {
  const location = app.get("location");
  const http = app.get("http");
  const client = app.runpath(app.get("location.client"));
  const re = new RegExp(`${location.client}/app..*(?:js|css)$`, "u");
  const user_types = await loaders.types(app.log, app.runpath(location.types));
  const types = { ...app.types, ...user_types };
  const router = await $router(app.runpath(location.routes));

  for (const path of await client.collect(re, { recursive: false })) {
    const src = path.name;
    const type = path.extension === ".css" ? "style" : "module";
    await app.publish({ src, type });
    if (path.extension === ".js") {
      const imports = { app: FS.File.join(http.static.root, src).path };
      await app.publish({
        inline: true,
        code: JSON.stringify({ imports }, null, 2),
        type: "importmap",
      });
    }
  }

  const $app = { ...app, types, dispatch: dispatch(types), router };
  $app.route = hooks.route($app);
  $app.parse = hooks.parse($app);
  const $handle = await hooks.handle($app);

  $app.server = await serve(async request =>
    tryreturn(async _ => $handle(await $app.parse(request)))
      .orelse(error => {
        $app.log.auto(error);
        return new Response(null, { status: Status.INTERNAL_SERVER_ERROR });
      }), $app.get("http"));
  const { host, port } = $app.get("http");
  const address = `http${$app.secure ? "s" : ""}://${host}:${port}`;
  $app.log.system(`started ${dim("->")} ${dim(address)}`);

  return $app;
};

export default async app => {
  app.log.system("in startup");
  return post(await (await cascade(app.modules.serve))(app));
};
