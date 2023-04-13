import {Path} from "runtime-compat/fs";

const loadComponent = async (file) => {
  try {
    return await file.read();
  } catch (error) {
    throw new Error(`cannot load component at ${file.name}`);
  }
};

const getBody = async (app, partial, file) => {
  const body = await loadComponent(file);
  return partial ? body : app.render({body});
};

const handler = path => (name, {status = 200, partial = false} = {}) =>
  async (app, headers) => {
    const styleSrc = "style-src 'unsafe-inline';";
    const csp = `${headers["Content-Security-Policy"]}${styleSrc}`;
    const options = {
      status,
      headers: {
        ...headers,
        "Content-Type": "text/html",
        "Content-Security-Policy": csp,
      },
    };
    return [await getBody(app, partial, path.join(name).file), options];
  };

export default directory => ({
  register(app, next) {
    app.register("htmx", handler(directory ?? app.paths.components));
    return next(app);
  },
  async publish(app, next) {
    const src = "htmx.js";
    const scriptPath = ["node_modules", "htmx.org", "dist", src];
    const path = import.meta.resolve === undefined
      ? await Path.resolve().join(...scriptPath)
      : new Path(await import.meta.resolve("htmx.org"));
    const code = await path.file.read();
    await app.publish({src, code, type: "module"});
    app.bootstrap({type: "script", code: `import * as htmx from "./${src}";`});
    return next(app);
  },
});
