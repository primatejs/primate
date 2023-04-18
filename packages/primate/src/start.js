import {register, compile, publish, bundle, route, handle}
  from "./hooks/exports.js";

export default async (app, operations = {}) => {
  // register handlers
  await register({...app, register(name, handler) {
    app.handlers[name] = handler;
  }});

  // compile server-side code
  await compile(app);
  // publish client-side code
  await publish(app);

  // bundle client-side code
  await bundle(app, operations?.bundle);

  // handle
  await handle({router: await route(app), ...app});
};
