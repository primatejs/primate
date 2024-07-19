import * as O from "rcompat/object";
import { peers } from "../common/exports.js";
import depend from "../depend.js";
import compile from "./compile.js";
import name from "./name.js";

const dependencies = [
  "@angular/compiler",
  "@angular/core",
  "@angular/platform-browser",
  "@angular/platform-server",
  "@angular/ssr",
];

export default extension => async (app, next) => {
  const extensions = {
    from: extension,
    to: ".js",
  };
  const on = O.filter(await peers(), ([key]) => dependencies.includes(key));
  await depend(on, `frontend:${name}`);

  app.register(extension, {
    server: component => compile.server(app, component, extensions),
    client: _ => _,
  });

  return next(app);
};
