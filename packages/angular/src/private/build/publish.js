import file from "@rcompat/fs/file";
import compile from "./compile.js";
import name from "#name";

const root_filter = /^root:angular/u;

export default (app, extension) => ({
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
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await file(args.path).text();

      // Compile component.ts file to JavaScript
      return { contents: await compile(source) };
    });
  },
});
