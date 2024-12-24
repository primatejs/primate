import type { PrimateConfiguration } from "#config";
import module_loader from "#module-loader";
import { FileRef } from "@rcompat/fs/file";
import join from "@rcompat/fs/join";
import get from "@rcompat/object/get";
import valmap from "@rcompat/object/valmap";
import { web } from "./targets/index.js";

type R = Record<string, unknown>;

type ExtensionCompileFunction = (component: FileRef, app: PrimateBuildApp) =>
  Promise<undefined>;

type ExtensionCompile = {
  client: ExtensionCompileFunction,
  server: ExtensionCompileFunction,
};

export type PrimateBuildApp = {
  postbuild: unknown[],
  bindings: R,
  roots: unknown[],
  targets: R,
  importmaps: R,
  assets: unknown[],
  path: Record<string, FileRef>,
  root: FileRef,
  get: <P extends string>(key: P) => ReturnType<typeof get<PrimateConfiguration, P>>,
  set: (key: keyof PrimateConfiguration, value: any) => undefined,
  error: R,
  extensions: Record<string, ExtensionCompile | undefined>,
  modules: Awaited<ReturnType<typeof module_loader>>,
  fonts: unknown[],
  stage: (source: FileRef, directory: FileRef, apply_defines: boolean) => Promise<undefined>,
  compile: (component: FileRef) => Promise<undefined>,
  register: (extension: string, compile: ExtensionCompile) => undefined,
  runpath: (...directories: string[]) => FileRef,
  target: (name: string, handler: (app: PrimateBuildApp) => undefined) => undefined,
  bind: (extension: string, handler: (directory: FileRef, file: FileRef) => undefined) => undefined,
  done: (fn: () => undefined) => undefined,
};

export default async (root: FileRef, config: PrimateConfiguration): Promise<PrimateBuildApp> => {
  const path = valmap(config.location, value => root.join(value));
  const error = path.routes.join("+error.js");

  return {
    postbuild: [],
    bindings: {},
    roots: [],
    targets: { web: { target: web } },
    importmaps: {},
    assets: [],
    path,
    root,
    get: <P extends string>(key: P) => get(config, key),
    set: (key, value) => {
      config[key] = value;
    },
    error: {
      default: await error.exists() ? await error.import("default") : undefined,
    },
    extensions: {},
    modules: await module_loader(root, config.modules ?? []),
    fonts: [],
    async stage(source, directory, apply_defines = false) {
      const { define = {} } = this.get("build");
      const defines = Object.entries(define);

      if (!await source.exists()) {
        return;
      }

      const target_base = this.runpath(directory.toString());

      if (!apply_defines || defines.length === 0) {
        // copy everything
        await source.copy(target_base);
      } else {
        // copy files individually, transform them using a defines mapper
        const mapper = (text: string) =>
          defines.reduce((replaced, [key, substitution]) =>
            replaced.replaceAll(key, substitution as string), text);

        await Promise.all((await source.collect()).map(async abs_path => {
          const rel_path = join(directory, abs_path.debase(source));
          const target = target_base.join(rel_path.debase(directory));
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
        const debased = `${component.path}`.replace(source.toString(), "");

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
  } as const satisfies PrimateBuildApp;
};
