import bundle from "./bundle.js";
import compile from "./compile.js";
import config from "./config.js";
import serve from "./serve.js";
import register from "./register.js";
import route from "./route.js";
import * as handlers from "./handlers/exports.js";

export default async () => {
  const env = await config();
  env.handlers = {...handlers};
  // register common handlers
  await register(env);
  await compile(env);
  const {paths} = env;
  const router = await route(paths.routes, env.handlers);
  await bundle(env);

  serve({router, ...env});
};
