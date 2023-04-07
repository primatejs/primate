import config from "./config.js";
import register from "./register.js";
import compile from "./compile.js";
import bundle from "./bundle.js";
import route from "./route.js";
import serve from "./serve.js";

export default async () => {
  const env = await config();
  await register(env);
  await compile(env);
  await bundle(env);
  serve({router: await route(env.paths.routes, env.handlers), ...env});
};
