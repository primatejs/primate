import type { default as BaseApp, BindFn, TargetHandler } from "#BaseApp";
import type { PrimateConfiguration } from "#config";
import module_loader from "#module-loader";
import type Build from "@rcompat/build";
import type { FileRef, Path } from "@rcompat/fs/file";
import join from "@rcompat/fs/join";
import get from "@rcompat/record/get";
import entries from "@rcompat/record/entries";
import { web } from "./targets/index.js";

export const symbols = {
  layout_depth: Symbol("layout.depth"),
};

type ExtensionCompileFunction = (component: FileRef, app: PrimateBuildApp) =>
  Promise<undefined>;

type ExtensionCompile = {
  client: ExtensionCompileFunction,
  server: ExtensionCompileFunction,
};

export interface PrimateBuildApp extends BaseApp {
  postbuild: (() => undefined)[];
  bindings: Record<string, undefined | BindFn>;
  roots: FileRef[];
  targets: Record<string, undefined | { forward?: string, target: TargetHandler }>;
  assets: unknown[];
  extensions: Record<string, ExtensionCompile | undefined>;
  stage: (source: FileRef, directory: Path, apply_defines?: boolean) => Promise<undefined>;
  compile: (component: FileRef) => Promise<undefined>;
  register: (extension: string, compile: ExtensionCompile) => undefined;
  done: (fn: () => undefined) => undefined;
  server_build: string[];
  build_target: string;
  build?: Build;
  depth(): string;
};


export default async (root: FileRef, config: PrimateConfiguration): Promise<PrimateBuildApp> => {
  const path = entries(config.location).valmap(([, value]) => root.join(value))
    .get();
  const error = path.routes.join("+error.js");
  const kv_storage = new Map<symbol, unknown>();

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
    depth() {
      return this.get(symbols.layout_depth);
    }
  } as const satisfies PrimateBuildApp;
};
