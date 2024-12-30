import type { PrimateConfiguration } from "#config";
import module_loader from "#module-loader";
import type Build from "@rcompat/build";
import { FileRef } from "@rcompat/fs/file";
import join from "@rcompat/fs/join";
import get from "@rcompat/object/get";
import valmap from "@rcompat/object/valmap";
import type { MaybePromise } from "pema/MaybePromise";
import { web } from "./targets/index.js";

type R = Record<string, unknown>;

type ExtensionCompileFunction = (component: FileRef, app: PrimateBuildApp) =>
  Promise<undefined>;

type ExtensionCompile = {
  client: ExtensionCompileFunction,
  server: ExtensionCompileFunction,
};

type TargetHandler = (app: PrimateBuildApp) => MaybePromise<undefined>;
type BindFn = (directory: FileRef, file: FileRef) => MaybePromise<undefined>;

export type PrimateBuildApp = {
  postbuild: (() => undefined)[],
  bindings: Record<string, undefined | BindFn>,
  bind: (extension: string, handler: BindFn) => undefined,
  roots: FileRef[],
  targets: Record<string, undefined | { forward?: string, target: TargetHandler }>,
  target: (name: string, target: TargetHandler) => undefined,
  importmaps: R,
  assets: unknown[],
  path: Record<string, FileRef>,
  root: FileRef,
  config: <P extends string>(path: P) => ReturnType<typeof get<PrimateConfiguration, P>>,
  get: (key: symbol) => unknown,
  set: (key: symbol, value: unknown) => undefined,
  error: R,
  extensions: Record<string, ExtensionCompile | undefined>,
  modules: Awaited<ReturnType<typeof module_loader>>,
  fonts: unknown[],
  stage: (source: FileRef, directory: FileRef | string, apply_defines?: boolean) => Promise<undefined>,
  compile: (component: FileRef) => Promise<undefined>,
  register: (extension: string, compile: ExtensionCompile) => undefined,
  runpath: (...directories: string[]) => FileRef,
  done: (fn: () => undefined) => undefined,
  server_build: string[],
  build_target: string,
  build?: Build,
};


export default async (root: FileRef, config: PrimateConfiguration): Promise<PrimateBuildApp> => {
  const path = valmap(config.location, value => root.join(value));
  const error = path.routes.join("+error.js");
  const kv_storage = new Map();

  return {
    postbuild: [],
    bindings: {},
    roots: [],
    targets: { web: { target: web } },
    importmaps: {},
    assets: [],
    path,
    root,
    config: <P extends string>(path: P) => get(config, path),
    get: key => kv_storage.get(key),
    set: (key, value) => {
      if (kv_storage.has(key)) {
        // throw erro
      }
      kv_storage.set(key, value);
    },
    error: {
      default: await error.exists() ? await error.import("default") : undefined,
    },
    extensions: {},
    modules: await module_loader(root, config.modules ?? []),
    fonts: [],
    async stage(source, directory, apply_defines = false) {
      const { define = {} } = this.config("build");
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
      const { server, client, components } = this.config("location");

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
    target(name, target) {
      this.targets[name] = { target };
    },
    bind(extension, handler) {
      this.bindings[extension] = handler;
    },
    done(fn) {
      this.postbuild.push(fn);
    },
    server_build: ["routes", "types"],
    build_target: "web",
  } as const satisfies PrimateBuildApp;
};
