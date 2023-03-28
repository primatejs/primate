import bundle from "./bundle.js";
import config from "./config.js";
import serve from "./serve.js";
import route from "./route.js";

const extract = (modules, key) => modules.flatMap(module => module[key] ?? []);

export default async () => {
  const env = await config();
  const {paths} = env;
  const router = await route(paths.routes);
  await bundle(env);

  serve({router, ...env, modules: extract(env.modules ?? [], "serve")});
};
