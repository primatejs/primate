import { File } from "rcompat/fs";
import { identity } from "rcompat/function";
import { is } from "rcompat/invariant";
import * as O from "rcompat/object";
import { globify } from "rcompat/string";
import * as loaders from "./loaders/exports.js";
import { web } from "./targets/exports.js";

export default async (log, root, config) => {
  const path = O.valmap(config.location, value => root.join(value));
  const error = await path.routes.join("+error.js");

  return {
    targets: { web },
    importmaps: {},
    assets: [],
    path,
    root,
    log,
    // pseudostatic thus arrowbound
    get: (config_key, fallback) => O.get(config, config_key) ?? fallback,
    set: (key, value) => {
      config[key] = value;
    },
    error: {
      default: await error.exists() ? await error.import("default") : undefined,
    },
    extensions: {},
    modules: await loaders.modules(log, root, config.modules ?? []),
    fonts: [],
    // copy files to build folder, potentially transforming them
    async stage(source, directory, filter) {
      const { paths = [], mapper = identity } = this.get("build.transform", {});
      is(paths).array();
      is(mapper).function();

      if (!await source.exists()) {
        return;
      }

      const regexs = paths.map(file => globify(file));
      const target_base = this.runpath(directory);

      // first, copy everything
 //     console.log(source.path, target_base.path);
      await source.copy(target_base);

      const location = this.get("location");
      const client_location = File.join(location.client, location.static).path;

      // then, copy and transform whitelisted paths using mapper
      await Promise.all((await source.collect(filter)).map(async abs_path => {
        const debased = abs_path.debase(this.root).path.slice(1);
        const rel_path = File.join(directory, abs_path.debase(source));
        if (directory.path === client_location && rel_path.path.endsWith(".css")) {
          const contents = await abs_path.text();
          const font_regex = /@font-face\s*\{.+?url\("(.+?\.woff2)"\).+?\}/gus;
          this.fonts.push(...[...contents.matchAll(font_regex)].map(match => match[1]));
        }
        const target = await target_base.join(rel_path.debase(directory));
        await target.directory.create();

        regexs.some(regex => regex.test(debased)) &&
          await target.write(mapper(await abs_path.text()));
      }));
    },
    async compile(component) {
      const { server, client, components } = this.get("location");

      const source = this.path.components;
      const compile = this.extensions[component.fullExtension]
        ?? this.extensions[component.extension];
      if (compile === undefined) {
        const debased = `${component.path}`.replace(source, "");

        const server_target = this.runpath(server, components, debased);
        await server_target.directory.create();
        await component.copy(server_target);

        const client_target = this.runpath(client, components, debased);
        await client_target.directory.create();
        await component.copy(client_target);
      } else {
        // compile server components
        await compile.server(component, this);

        // compile client components
        await compile.client(component, this);
      }
    },
    register(extension, compile) {
      this.extensions[extension] = compile;
    },
    runpath(...directories) {
      return this.path.build.join(...directories);
    },
    target(name, handler) {
      this.targets[name] = handler;
    },
  };
};
