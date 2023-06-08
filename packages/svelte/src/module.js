import * as compiler from "svelte/compiler";
import errors from "./errors.js";

const endings = {
  svelte: ".svelte",
  js: ".svelte.js",
};

const type = "module";

const load = async path => {
  try {
    return (await import(`${path}.js`)).default;
  } catch (error) {
    return errors.MissingComponent.throw(path.name, path);
  }
};

const handler = path => (component, props = {}, {status = 200} = {}) =>
  async (app, headers) => {
    const {html: body} = await load(path.join(component));

    const name = component.slice(0, -endings.svelte.length);

    // create an entry point
    const entry = `import {${name} as Component} from "app";
      const props = JSON.parse(${JSON.stringify(JSON.stringify(props))});
      new Component({
        target: document.body,
        hydrate: true,
        props,
      });
    `;
    const inline = true;
    const integrity = await app.publish({code: entry, type, inline});
    // hacky, CSP should be a map that gets flattened in the end
    headers["Content-Security-Policy"] = headers["Content-Security-Policy"]
      .replace("script-src 'self' ", `script-src 'self' '${integrity}' `);

    // -> spread into new Response()
    return [await app.render({body}), {
      status,
      headers: {...headers, "Content-Type": "text/html"},
    }];
  };

const {svelte, js} = endings;
export default ({directory, entryPoints} = {}) => {
  const env = {};
  return {
    name: "@primate/svelte",
    async init(app) {
      const source = directory ?? app.paths.components;
      env.copyJS = source !== app.paths.components;
      env.copy = app.copy;
      env.source = source;
      env.components = await source.collect(/^.*.svelte$/u);
      env.build = app.config.build.app;
      env.paths = {
        server: app.paths.server.join(env.build),
        client: app.paths.client.join(env.build),
      };
    },
    register(app, next) {
      app.register("svelte", handler(env.paths.server));
      return next(app);
    },
    async compile(app, next) {
      const options = {generate: "ssr", hydratable: true};
      const target = env.paths.server;
      await target.file.create();
      // copy any JS files from an alternative components directory
      if (env.copyJS) {
        await app.copy(env.source, env.paths.server);
        await app.copy(env.source, env.paths.client);
      }

      await Promise.all(env.components.map(async component => {
        const file = await component.file.read();
        const server = compiler.compile(file, options);
        const to = await target.join(`${component.path}.js`.replace(env.source, ""));
        await to.directory.file.create();
        await to.file.write(server.js.code.replaceAll(svelte, js));
      }));

      return next(app);
    },
    async publish(app, next) {
      await app.import("svelte");

      const options = {generate: "dom", hydratable: true};
      const target = env.paths.client;
      await target.file.create();

      await Promise.all(env.components.map(async component => {
        const file = await component.file.read();
        const client = compiler.compile(file, options);
        {
          const code = client.js.code.replaceAll(svelte, js);
          const src = `${component.path}.js`.replace(`${env.source}`, env.build);
          await app.publish({src, code, type});
        }
        if (client.css.code !== null) {
          {
            const {code} = client.css;
            const src = `${component.path}.css`.replace(`${env.source}`, env.build);
            await app.publish({src, code, type: "style"});
          }
          {
            const src = `${component.path}.css`.replace(`${env.source}`, "");
            app.bootstrap({type: "style", code: `import ".${src}";`});
          }
        }
      }));

      if (entryPoints !== undefined) {
        entryPoints.forEach(entry => {
          const name = entry.slice(0, -endings.svelte.length);
          const code = `export {default as ${name}} from "./${entry}.js";`;
          app.bootstrap({type: "script", code});
        });
      }
      return next(app);
    },
  };
};
