import {Path} from "runtime-compat/fs";
import * as compiler from "svelte/compiler";
import {tryreturn} from "runtime-compat/flow";
import errors from "./errors.js";

const endings = {
  svelte: ".svelte",
  js: ".svelte.js",
};

const hash = async (string, algorithm = "sha-256") => {
  const base = 16;
  const target_pad_length = 2;
  const target_slice = 12;
  const bytes = await crypto.subtle.digest(algorithm, encoder.encode(string));
  return Array.from(new Uint8Array(bytes))
    .map(byte => byte.toString(base).padStart(target_pad_length, "0"))
    .join("")
    .slice(0, target_slice);
};
const normalize = async path => `_${await hash(path)}`;

const rootname = "root";
const filename = `${rootname}.js`;

const options = {
  server: {generate: "ssr", hydratable: true},
  client: {generate: "dom", hydratable: true},
};

const type = "module";

const load = async path =>
  tryreturn(async () => (await import(`${path}.js`)).default)
    .orelse(() => errors.MissingComponent.throw(path.name, path));

const make_component = base => async (name, props) =>
  ({name, component: await load(base.join(name)), props});

const encoder = new TextEncoder();

const handler = ({path}) => (name, props = {}, {status = 200, page} = {}) =>
  async (app, {layouts = [], as_layout} = {}) => {
    const make = make_component(path);
    if (as_layout) {
      return make(name, props);
    }
    const headers = app.headers();
    const components = (await Promise.all(layouts.map(layout =>
      layout(app, {as_layout: true})
    )))
      /* set the actual page as the last component */
      .concat(await make(name, props));

    const data = components.map(component => component.props);

    const root = app.paths.server.join(filename);
    const imported = (await import(root)).default;
    const {html} = imported.render({
      components: components.map(({component}) => component),
      data,
    });

    const names = (await Promise.all(components.map(component =>
      normalize(component.name)))).join(", ");
    const code = `
      import {${rootname}, ${names}} from "app";
      new ${rootname}({
        target: document.body,
        hydrate: true,
        props: {
          components: [${names}],
          data: JSON.parse(${JSON.stringify(JSON.stringify(data))}),
        },
      });
    `;

    const integrity = await app.publish({code, type, inline: true});
    // hacky, CSP should be a map that gets flattened in the end
    headers["Content-Security-Policy"] = headers["Content-Security-Policy"]
      .replace("script-src 'self' ", `script-src 'self' '${integrity}' `);

    // -> spread into new Response()
    return [await app.render({body: html, page}), {
      status,
      headers: {...headers, "Content-Type": "text/html"},
    }];
  };

const create_root = (length, data) => {
  const n = length - 1;
  const body = Array.from({length: n}, (_, i) => i - 1)
    .reduceRight((child, _, i) => `
      {#if components[${i + 1}]}
        <svelte:component this={components[${i}]} ${data}={data[${i}]}>
          ${child}
        </svelte:component>
      {:else}
        <svelte:component this={components[${i}]} ${data}={data[${i}]} />
      {/if}
    `, `<svelte:component this={components[${n}]} ${data}={data[${n}]} />`);

  return `
    <script>
      export let components;
      export let data;
    </script>
    ${body}
  `;
};

const {svelte, js} = endings;
export default ({
  directory,
  dynamicProps = "data",
} = {}) => {
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
      app.register("svelte", handler({path: env.paths.server}));
      return next(app);
    },
    async compile(app, next) {
      const target = env.paths.server;
      await target.file.create();
      // copy any JS files from an alternative components directory
      if (env.copyJS) {
        await app.copy(env.source, env.paths.server);
        await app.copy(env.source, env.paths.client);
      }

      await Promise.all(env.components.map(async component => {
        const file = await component.file.read();
        const server = compiler.compile(file, options.server);
        const to = target.join(`${component.path}.js`.replace(env.source, ""));
        await to.directory.file.create();
        await to.file.write(server.js.code.replaceAll(svelte, js));
      }));

      const root = create_root(app.layoutDepth, dynamicProps);
      const server = compiler.compile(root, options.server).js.code;
      const to = app.paths.server.join(filename);
      await to.file.write(server);

      return next(app);
    },
    async publish(app, next) {
      await app.import("svelte");
      const {source, build} = env;

      const target = env.paths.client;
      await target.file.create();

      await Promise.all(env.components.map(async component => {
        const name = component.path.replace(`${source}/`, "");
        const file = await component.file.read();
        const client = compiler.compile(file, options.client);
        {
          {
            const code = client.js.code.replaceAll(svelte, js);
            const src = `${component.path}.js`.replace(`${source}`, build);
            await app.publish({src, code, type});
          }
          const imported = await normalize(name);
          app.bootstrap({
            type: "script",
            code: `export {default as ${imported}} from "./${name}.js";\n`,
          });
        }
        if (client.css.code !== null) {
          {
            const {code} = client.css;
            const src = `${component.path}.css`.replace(`${source}`, build);
            await app.publish({src, code, type: "style"});
          }
          {
            const src = `${component.path}.css`.replace(`${source}`, "");
            app.bootstrap({type: "style", code: `import ".${src}";`});
          }
        }
      }));

      {
        const root = create_root(app.layoutDepth, dynamicProps);
        const client = compiler.compile(root, options.client);
        const code = client.js.code.replaceAll(svelte, js);
        const src = new Path(app.config.http.static.root, filename);
        await app.publish({src, code, type});
      }
      {
        const code = `export {default as ${rootname}} from "../${filename}";\n`;
        app.bootstrap({type: "script", code});
      }

      return next(app);
    },
  };
};
