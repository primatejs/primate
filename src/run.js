import serve from "./serve.js";
import route from "./route.js";
import bundle from "./bundle.js";

const extract = (modules, key) => modules.flatMap(module => module[key] ?? []);

export default async env => {
  const {paths} = env;
  const router = await route(paths.routes);
  await bundle(env);

  await serve({router, ...env, modules: extract(env.modules ?? [], "serve")});
};
