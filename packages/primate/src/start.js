import {register, compile, publish, bundle, route, serve}
  from "./hooks/exports.js";

export default async (app, operations = {}) => {
  // register handlers
  await register(app);
  // compile server-side code
  await compile(app);
  // publish client-side code
  await publish(app);

  // after publish hook, publish a zero assumptions app.js (no css imports)
  const code = app.entrypoints.filter(({type}) => type === "script")
    .map(({code}) => code).join("");
  await app.publish({src: `${app.dist}.js`, code, type: "module"});

  if (operations?.bundle) {
    // bundle client-side code
    await bundle(app);
  }
  // serve
  serve({router: await route(app), ...app});
};
