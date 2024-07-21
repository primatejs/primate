import { name } from "@primate/frontend/angular/common";
import depend from "@primate/frontend/base/depend";
import peerdeps from "@primate/frontend/base/peerdeps";
import * as O from "rcompat/object";
import { server } from "./compile.js";

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
  const on = O.filter(await peerdeps(), ([key]) => dependencies.includes(key));
  await depend(on, `frontend:${name}`);

  app.register(extension, {
    server: component => server(app, component, extensions),
    client: _ => _,
  });

  return next(app);
};
