import log from "#log";
import cascade from "@rcompat/async/cascade";
import tryreturn from "@rcompat/async/tryreturn";
import dim from "@rcompat/cli/color/dim";
import Router from "@rcompat/fs/router";
import serve from "@rcompat/http/serve";
import Status from "@rcompat/http/Status";
import handle from "./handle.js";
import { s_server } from "#symbols";
import { type RuntimeApp } from "../app.js";
import parse from "./parse.js";

const post = async (app: RuntimeApp) => {
  const types = Object.fromEntries(app.files.types.map(([key, value]) =>
    [key, value.default]));

  try {
    app.router = Router.init({
        specials: {
          guard: { recursive: true },
          error: { recursive: false },
          layout: { recursive: true },
        },
        predicate(route, request) {
          return (route as { default: Record<string, unknown> })
            .default[request.method.toLowerCase()] !== undefined;
        },
      }, app.files.routes);
  } catch {}

  app.create_csp();

  app.types = types;
  const $handle = handle(app);

  const server = await serve(async request =>
    tryreturn(async _ => $handle(parse(request)))
      .orelse(error => {
        log.auto(error);
        return new Response(null, { status: Status.INTERNAL_SERVER_ERROR });
      }), app.get("http"));
  const { host, port } = app.get("http");
  const address = `http${app.secure ? "s" : ""}://${host}:${port}`;
  log.system(`started ${dim("->")} ${dim(address)}`);

  app.set(s_server, server);

  return $app;
};

export default async app => {
  log.system("in startup");
  return post(await (await cascade(app.modules.serve))(app));
};
