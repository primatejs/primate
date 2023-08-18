import crypto from "runtime-compat/crypto";
import {Path} from "runtime-compat/fs";
import {Response, Status, MediaType} from "runtime-compat/http";
import {tryreturn} from "runtime-compat/async";

import {renderToString as render} from "solid-js/web";
import {transformAsync} from "@babel/core";
import solid from "babel-preset-solid";

import errors from "./errors.js";
import {client, create_root, rootname, hydrate} from "./client/exports.js";

const encoder = new TextEncoder();
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
const normalize = async path => `solid_${await hash(path)}`;

const import$ = async (module, app, copy_dependency) => {
  const {library, packager} = app;
  const {http: {static: {root}}} = app.config;
  const parts = module.split("/");
  const path = [library, ...parts];
  const pkg = await Path.resolve().join(...path, packager).json();
  if (copy_dependency) {
    const dependency = Path.resolve().join(...path);
    const to = app.build.paths.client.join(library, ...parts);
    await dependency.file.copy(`${to}`);
  }

  const entry = pkg.exports["."].browser.import;
  app.importmaps[module] = new Path(root, library, module, entry).path;
};

const filename = `${rootname}.js`;
const type = "module";

const load = async path =>
  tryreturn(async () => (await import(`${path}.js`)).default)
    .orelse(error => {console.log(error);return errors.MissingComponent.throw(path.name, path)});

const make_component = base => async (name, props) =>
  ({name, component: await load(base.join(name)), props});

const handler = (name, props = {}, {status = Status.OK, page} = {}) =>
  async (app, {layouts = [], as_layout} = {}, request) => {
    const options = {
      liveview: app.liveview !== undefined,
    };
    const {headers} = request;
    const {paths} = app.build;
    const make = make_component(paths.server.join(app.config.paths.components));
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
    if (options.liveview && headers.get(app.liveview.header) !== undefined) {
      return new Response(JSON.stringify({names, data}), {
        status,
        headers: {...await app.headers(),
          "Content-Type": MediaType.APPLICATION_JSON},
      });
    }

    const root = paths.server.join(filename);
    const imported = (await import(root)).default;
    const body = render(() => imported({
      components: components.map(({component}) => component),
      data,
    }));

    const code = client({names, data}, options);

    await app.publish({code, type, inline: true});
    // needs to be called before app.render
    const headers$ = await app.headers();

    return new Response(await app.render({body, page}), {
      status,
      headers: {...headers$, "Content-Type": MediaType.TEXT_HTML},
    });
  };

const options = {
  server: [solid, {
    generate: "ssr",
    hydratable: true,
  }],
  client: [solid, {
    generate: "dom",
    hydratable: true,
  }],
};

const transform = {
  async server(file) {
    return (await transformAsync(file, {presets: [options.server]})).code;
  },
  async client(file) {
    return (await transformAsync(file, {presets: [options.client]})).code;
  },
};

export default ({
  dynamicProps = "data",
  extension = "jsx",
} = {}) => {
  const env = {};
  const copy_re = new RegExp(`^.*.(?:${extension})$`, "u");
  const collect_re = new RegExp(`^.*.${extension}$`, "u");
  const extensions = {
    from: `.${extension}`,
    to: `.${extension}.js`,
  };

  return {
    name: "primate:solid",
    init(app, next) {
      env.source = app.build.paths.components;
      return next(app);
    },
    register(app, next) {
      app.register(extension, handler);
      return next(app);
    },
    async compile(app, next) {
      // copy components to build/components
      await app.copy(app.paths.components, env.source, copy_re);
      const components = await env.source.collect(collect_re);
      const target = app.build.paths.server.join(app.config.paths.components);
      await target.file.create();

      await Promise.all(components.map(async component => {
        const file = await component.file.read();
        const code = await transform.server(file);
        const to = target.join(`${component.path}.js`.replace(env.source, ""));
        await to.directory.file.create();
        await to.file.write(code.replaceAll(extensions.from, extensions.to));
      }));

      const root = await transform.server(create_root(app.layout.depth,
        dynamicProps));
      const to = app.build.paths.server.join(filename);
      await to.file.write(root);

      return next(app);
    },
    async publish(app, next) {
      // import libs
      await import$("solid-js", app, true);
      await import$("solid-js/web", app);

      // create client components
      const components = await env.source.collect(collect_re);

      await Promise.all(components.map(async component => {
        const name = component.path.replace(`${env.source}/`, _ => "");
        const file = await component.file.read();
        const code = await transform.client(file);
        const build = app.config.paths.components;
        const {path} = component;
        const file_string = `./${build}/${name}`;

        {
          const src = `${path}.js`.replace(`${env.source}`, _ => build);
          await app.publish({
            src,
            code: code.replaceAll(extensions.from, extensions.to),
            type,
          });
          const imported = await normalize(name);
          app.export({
            type: "script",
            code: `export {default as ${imported}} from "${file_string}.js";\n`,
          });
        }
      }));

      app.export({type: "script", code: hydrate});

      {
        const code = await transform.client(create_root(app.layout.depth,
          dynamicProps));
        const src = new Path(app.config.http.static.root, filename);
        await app.publish({src, code, type});
      }
      {
        const code = `export {default as ${rootname}} from "./${filename}";\n`;
        app.export({type: "script", code});
      }

      return next(app);
    },
  };
};
