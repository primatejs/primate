import type { default as App, BindFn, TargetHandler } from "#App";
import type { Config } from "#config";
import type Mode from "#Mode";
import module_loader from "#module-loader";
import Build from "@rcompat/build";
import type { default as FileRef, Path } from "@rcompat/fs/FileRef";
import join from "@rcompat/fs/join";
import type Dictionary from "@rcompat/record/Dictionary";
import entries from "@rcompat/record/entries";
import exclude from "@rcompat/record/exclude";
import get from "@rcompat/record/get";
import { web } from "./targets/index.js";

export const symbols = {
  layout_depth: Symbol("layout.depth"),
};

type PartialDictionary<T> = Dictionary<T | undefined>;

type ExtensionCompileFunction = (component: FileRef, app: BuildApp) =>
  Promise<void>;

type ExtensionCompile = {
  client: ExtensionCompileFunction,
  server: ExtensionCompileFunction,
};

export interface BuildApp extends App {
  bind: (extension: string, handler: BindFn) => void;
  target: (name: string, target: TargetHandler) => void;
  postbuild: (() => void)[];
  bindings: PartialDictionary<BindFn>;
  roots: FileRef[];
  targets: PartialDictionary<{ forward?: string, target: TargetHandler }>;
  assets: unknown[];
  extensions: PartialDictionary<ExtensionCompile>;
  stage: (source: FileRef, directory: Path, apply_defines?: boolean) => Promise<void>;
  compile: (component: FileRef) => Promise<void>;
  register: (extension: string, compile: ExtensionCompile) => void;
  done: (fn: () => void) => void;
  server_build: string[];
  build_target: string;
  get build(): Build;
  depth(): number;
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
    bind(extension, handler) {
      this.bindings[extension] = handler;
    },
    target(name, target) {
      this.targets[name] = { target };
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
      return this.get<number>(symbols.layout_depth);
    }
  } as const satisfies BuildApp;
};
