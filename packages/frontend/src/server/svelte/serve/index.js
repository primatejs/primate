import handler from "#handler";
import client from "#svelte/client";
import name from "#svelte/name";
import render from "./render.js";

export default (extension, spa) => (app, next) => {
  app.register(extension, handler({
    app,
    render,
    client,
    name,
    spa,
  }));

  return next(app);
};
