import register from "./register.js";
import compile from "./compile.js";
import publish from "./publish.js";
import bundle from "./bundle.js";
import route from "./route.js";
import serve from "./serve.js";
import config from "./config.js";

export default async (env, operations = {}) => {
  // read/write configuration
  await config(env);
  // register handlers
  await register(env);
  // compile server-side code
  await compile(env);
  // publish client-side code
  await publish(env);

  // after publish hook, publish a zero assumptions app.js (no css imports)
  const code = env.entrypoints.filter(({type}) => type === "script")
    .map(({code}) => code).join("");
  await env.publish({src: `${env.dist}.js`, code, type: "module"});

  if (operations?.bundle) {
    // bundle client-side code
    await bundle(env);
  }
  // serve
  serve({router: await route(env), ...env});
};
