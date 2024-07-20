import name from "@primate/frontend/angular/common/name";
import depend from "@primate/frontend/common/depend";
import peerdeps from "@primate/frontend/common/peerdeps";
import * as O from "rcompat/object";
import compile from "./compile.js";

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
    server: component => compile.server(app, component, extensions),
    client: _ => _,
  });

  return next(app);
};
