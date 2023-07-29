import crypto from "runtime-compat/crypto";
import {Path} from "runtime-compat/fs";
import {Response, Status, MediaType} from "runtime-compat/http";
import * as compiler from "svelte/compiler";
import {tryreturn} from "runtime-compat/async";
import errors from "./errors.js";

const endings = {
  svelte: ".svelte",
  js: ".svelte.js",
};
const rootname = "root";

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

const filename = `${rootname}.js`;

const options = {
  server: {generate: "ssr", hydratable: true},
  client: {generate: "dom", hydratable: true},
};

const type = "module";

const load = async path =>
  tryreturn(async () => (await import(`${path}.js`)).default)
    .orelse(_ => errors.MissingComponent.throw(path.name, path));

const make_component = base => async (name, props) =>
  ({name, component: await load(base.join(name)), props});

const encoder = new TextEncoder();

const handler = (name, props = {}, {status = Status.OK, page} = {}) =>
  async (app, {layouts = [], as_layout} = {}, request) => {
    const {paths} = app.build;
    const make = make_component(paths.server.join(app.config.build.app));
    if (as_layout) {
      return make(name, props);
    }
    const components = (await Promise.all(layouts.map(layout =>
      layout(app, {as_layout: true}, request)
    )))
      /* set the actual page as the last component */
      .concat(await make(name, props));

    const data = components.map(component => component.props);
    const names = await Promise.all(components.map(component =>
      normalize(component.name)));

    const liveview = app.liveview !== undefined;
    if (liveview && request.headers.get(app.liveview.header) !== undefined) {
      return new Response(JSON.stringify({names, data}), {
        status,
        headers: {...await app.headers(),
          "Content-Type": MediaType.APPLICATION_JSON},
      });
    }
    const root = paths.server.join(filename);
    const imported = (await import(root)).default;
    const {html} = imported.render({
      components: components.map(({component}) => component),
      data,
    });

    const code = `
      import * as components from "app";
      const getComponents = names =>
        Object.entries(components).filter(([name, component]) =>
          names.includes(name))
          .map(([, component]) => component);
      let root = new components.${rootname}({
        target: document.body,
        hydrate: true,
        props: {
          components: getComponents([${names.map(name => `"${name}"`)}]),
          data: JSON.parse(${JSON.stringify(JSON.stringify(data))}),
        },
      });

      ${liveview ? `
      const {liveview} = components;
      window.addEventListener("DOMContentLoaded", _ => liveview(props => {
        root.$destroy();
        root = new components.${rootname}({
          target: document.body,
          hydrate: true,
          props: {
            components: getComponents(props.names),
            data: props.data,
          },
        });
      }));
      ` : ""}
    `;

    await app.publish({code, type, inline: true});

    const headers = await app.headers();

    return new Response(await app.render({body: html, page}), {
      status,
      headers: {...headers, "Content-Type": MediaType.TEXT_HTML},
    });
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
export default ({dynamicProps = "data"} = {}) => ({
  name: "@primate/svelte",
  register(app, next) {
    app.register("svelte", handler);
    return next(app);
  },
  async compile(app, next) {
    const source = app.build.paths.components;
    // copy components to build/components
    await app.copy(app.paths.components, source, /^.*.(?:js|svelte)$/u);
    const components = await source.collect(/^.*.svelte$/u);
    const target = app.build.paths.server.join(app.config.build.app);
    await target.file.create();

    await Promise.all(components.map(async component => {
      const file = await component.file.read();
      const server = compiler.compile(file, options.server);
      const to = target.join(`${component.path}.js`.replace(source, ""));
      await to.directory.file.create();
      await to.file.write(server.js.code.replaceAll(svelte, js));
    }));

    const root = create_root(app.layoutDepth, dynamicProps);
    const server = compiler.compile(root, options.server).js.code;
    const to = app.build.paths.server.join(filename);
    await to.file.write(server);

    return next(app);
  },
  async publish(app, next) {
    const source = app.build.paths.components;
    const components = await source.collect(/^.*.svelte$/u);
    await app.import("svelte");

    // liveview
    if (app.liveview !== undefined) {
      app.bootstrap({
        type: "script",
        code: "export {default as liveview} from \"@primate/liveview\";\n",
      });
    }
    await Promise.all(components.map(async component => {
      const name = component.path.replace(`${source}/`, "");
      const file = await component.file.read();
      const client = compiler.compile(file, options.client);
      const build = app.config.build.app;
      const {path} = component;

      {
        {
          const code = client.js.code.replaceAll(svelte, js);
          const src = `${path}.js`.replace(`${source}`, _ => build);
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
          const src = `${path}.css`.replace(`${source}`, _ => build);
          await app.publish({src, code, type: "style"});
        }
        {
          // sans app.config.build.app removal, for a bundler to resolve,
          // irrelevant without bundling
          const src = `${path}.css`.replace(`${source}`, "");
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
});
