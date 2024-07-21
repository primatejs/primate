import { client } from "./compile.js";
import { File } from "rcompat/fs";

const root_filter = /^root:react/u;

export default (app, extension) => ({
  name: "react",
  setup(build) {
    const resolveDir = app.path.build.path;

    build.onResolve({ filter: root_filter }, ({ path }) => {
      return { path, namespace: "reactroot" };
    });
    build.onLoad({ filter: root_filter }, ({ path }) => {
      const contents = app.build.load(path);
      return contents ? { contents, loader: "js", resolveDir } : null;
    });
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await File.text(args.path);

      // Convert JSX syntax to JavaScript
      return { contents: (await client(source)).js };
    });
  },
});
