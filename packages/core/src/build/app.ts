import type { default as App, BindFn, TargetHandler } from "#App";
import type { Config } from "#config";
import type Mode from "#Mode";
import module_loader from "#module-loader";
import Build from "@rcompat/build";
import type { default as FileRef, Path } from "@rcompat/fs/FileRef";
import join from "@rcompat/fs/join";
import entries from "@rcompat/record/entries";
import exclude from "@rcompat/record/exclude";
import get from "@rcompat/record/get";
import { web } from "./targets/index.js";

export const symbols = {
  layout_depth: Symbol("layout.depth"),
};

type ExtensionCompileFunction = (component: FileRef, app: BuildApp) =>
  Promise<void>;

type ExtensionCompile = {
  client: ExtensionCompileFunction,
  server: ExtensionCompileFunction,
};

export interface BuildApp extends App {
  postbuild: (() => undefined)[];
  bindings: Record<string, undefined | BindFn>;
  roots: FileRef[];
  targets: Record<string, undefined | { forward?: string, target: TargetHandler }>;
  assets: unknown[];
  extensions: Record<string, ExtensionCompile | undefined>;
  stage: (source: FileRef, directory: Path, apply_defines?: boolean) => Promise<undefined>;
  compile: (component: FileRef) => Promise<undefined>;
  register: (extension: string, compile: ExtensionCompile) => void;
  done: (fn: () => undefined) => undefined;
  server_build: string[];
  build_target: string;
  get build(): Build;
  depth(): string;
  get mode(): Mode;
};

export default async (root: FileRef, config: Config, mode: Mode = "development"): Promise<BuildApp> => {
  const path = entries(config.location).valmap(([, value]) => root.join(value))
    .get();
  const error = path.routes.join("+error.js");
  const kv_storage = new Map<symbol, unknown>();
  let _build: Build | undefined = undefined;

  return {
    postbuild: [],
    bindings: {},
    roots: [],
    targets: { web: { target: web } },
    importmaps: {},
    assets: [],
    path,
    root,
    config: <P extends string>(key: P) => get(config, key),
    get mode() {
      return mode;
    },
    get<T>(key: symbol) {
      return kv_storage.get(key) as T;
    },
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
    server_build: ["routes"],
    build_target: "web",
    get build() {
      if (_build === undefined) {
        _build = new Build({
          ...exclude(this.config("build"), ["includes"]),
          outdir: this.runpath(this.config("location.client")).path,
          stdin: {
            contents: "",
            resolveDir: this.root.path,
          },
        }, mode);
      }
      return _build;
    },
    depth() {
      return this.get(symbols.layout_depth);
    }
  } as const satisfies BuildApp;
};
