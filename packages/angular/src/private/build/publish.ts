import name from "#name";
import type { BuildApp } from "@primate/core/build/app";
import FileRef from "@rcompat/fs/FileRef";
import type { Plugin } from "esbuild";
import compile from "./compile.js";

const root_filter = /^root:angular/;

export default (app: BuildApp, extension: string): Plugin => ({
  name,
  setup(build) {
    const resolveDir = app.path.build.path;

    build.onResolve({ filter: root_filter }, ({ path }) => {
      return { path, namespace: `${name}-root` };
    });
    build.onLoad({ filter: root_filter }, ({ path }) => {
      const contents = app.build.load(path);
      return contents ? { contents, loader: "js", resolveDir } : null;
    });
    build.onLoad({ filter: new RegExp(`${extension}$`) }, async args => {
      // Load the file from the file system
      const source = await FileRef.text(args.path);

      // Compile component.ts file to JavaScript
      return { contents: await compile(source) };
    });
  },
});
