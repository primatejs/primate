import { cascade, tryreturn } from "rcompat/async";
import { dim } from "rcompat/colors";
import { Router } from "rcompat/fs";
import { serve, Status } from "rcompat/http";
import * as hooks from "./exports.js";

const post = async app => {
  const types = Object.fromEntries(app.files.types.map(([key, value]) =>
    [key, value.default]));
  let router;

  try {
    router = await Router.init({
        specials: {
          guard: { recursive: true },
          error: { recursive: false },
          layout: { recursive: true },
        },
        predicate(route, request) {
          return route.default[request.method.toLowerCase()] !== undefined;
        },
      }, app.files.routes);
  } catch (error) {
    //console.log(error);
  }

  app.create_csp();

  const $app = { ...app, types, router };
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
