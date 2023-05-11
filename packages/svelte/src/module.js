import * as compiler from "svelte/compiler";
import {File, Path} from "runtime-compat/fs";

const endings = {
  svelte: ".svelte",
  js: ".svelte.js",
};

const type = "module";

const handler = path => (component, props = {}, {status = 200} = {}) =>
  async (app, headers) => {
    const {html: body} = (await import(`${path.join(`${component}.js`)}`))
      .default.render(props);

    const name = component.slice(0, -endings.svelte.length);

    const src = new Path(app.config.http.static.root, app.config.dist);
    // create an entry point
    const entry = `import {${name} as Component} from "${src}.js";
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
export default ({directory, entryPoints} = {}) => ({
  name: "@primate/svelte",
  register(app, next) {
    app.register("svelte", handler(directory ?? app.paths.components));
    return next(app);
  },
  async compile(app, next) {
    const path = directory ?? app.paths.components;
    const options = {generate: "ssr", hydratable: true};
    const components = await path.list(filename => filename.endsWith(svelte));
    await Promise.all(components.map(async component => {
      const file = await component.file.read();
      const server = compiler.compile(file, options);
      const compiled = server.js.code.replaceAll(svelte, js);
      await File.write(`${component.path}.js`, compiled);
    }));

    return next(app);
  },
  async publish(app, next) {
    const _path = ["node_modules", "svelte", "package.json"];
    app.resolve(await Path.resolve().join(..._path).json(), "svelte");

    const path = directory ?? app.paths.components;
    const options = {
      generate: "dom",
      hydratable: true,
    };
    const components = await path.list(filename => filename.endsWith(svelte));

    await Promise.all(components.map(async component => {
      const file = await component.file.read();
      const client = compiler.compile(file, options);
      const css = client.css.code;
      const compiled = client.js.code.replaceAll(svelte, js);

      await app.publish({src: `${component.name}.js`, code: compiled, type});
      if (css !== null) {
        const name = `${component.name}.css`;
        await app.publish({src: name, code: css, type: "style"});
        app.bootstrap({type: "style", code: `import "./${name}";`});
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
});
