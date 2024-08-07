import join from "@rcompat/fs/join";
import get from "@rcompat/object/get";
import valmap from "@rcompat/object/valmap";
import module_loader from "./module_loader.js";
import { web } from "./targets/exports.js";

export default async (root, config) => {
  const path = valmap(config.location, value => root.join(value));
  const error = await path.routes.join("+error.js");

  return {
    postbuild: [],
    bindings: {},
    roots: [],
    targets: { web: { target: web } },
    importmaps: {},
    assets: [],
    path,
    root,
    // pseudostatic thus arrowbound
    get: (config_key, fallback) => get(config, config_key) ?? fallback,
    set: (key, value) => {
      config[key] = value;
    },
    error: {
      default: await error.exists() ? await error.import("default") : undefined,
    },
    extensions: {},
    modules: await module_loader(root, config.modules ?? []),
    fonts: [],
    // copy files to build folder, potentially transforming them
    async stage(source, directory, apply_defines = false) {
      const { define = {} } = this.get("build", {});
      const defines = Object.entries(define);

      if (!await source.exists()) {
        return;
      }

      const target_base = this.runpath(directory);

      if (!apply_defines || defines.length === 0) {
        // copy everything
        await source.copy(target_base);
      } else {
        // copy files individually, transform them using a defines mapper
        const mapper = text =>
          defines.reduce((replaced, [key, substitution]) =>
            replaced.replaceAll(key, substitution), text);

        await Promise.all((await source.collect()).map(async abs_path => {
          const rel_path = join(directory, abs_path.debase(source));
          const target = await target_base.join(rel_path.debase(directory));
          await target.directory.create();
          await target.write(mapper(await abs_path.text()));
        }));
      }
    },
    async compile(component) {
      const { server, client, components } = this.get("location");

      const compile = this.extensions[component.fullExtension]
        ?? this.extensions[component.extension];
      if (compile === undefined) {
        const source = this.path.build.join(components);
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
    bind(extension, handler) {
      this.bindings[extension] = handler;
    },
    done(fn) {
      this.postbuild.push(fn);
    },
  };
};
