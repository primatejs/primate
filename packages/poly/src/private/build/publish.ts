import FileRef from "@rcompat/fs/FileRef";
import client from "./client.js";
import type Publish from "@primate/core/frontend/Publish";

const css_filter = /\.polycss$/u;
const root_filter = /^root:poly$/u;

export default ((app, extension) => ({
  name: "poly",
  setup(build) {
    build.onResolve({ filter: css_filter }, ({ path }) => {
      return { path, namespace: "polycss" };
    });
    build.onResolve({ filter: root_filter }, ({ path }) => {
      return { path, namespace: "polyroot" };
    });
    build.onLoad({ filter: css_filter }, ({ path }) => {
      const contents = app.build.load(FileRef.webpath(path));
      console.log("load", path, contents);
      return contents ? { contents, loader: "css", resolveDir: app.root.path } : null;
    });
    build.onLoad({ filter: root_filter }, ({ path }) => {
      const contents = app.build.load(path);
      return contents ? { contents, loader: "js", resolveDir: app.root.path } : null;
    });
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await FileRef.text(args.path);

      // Convert Poly syntax to JavaScript
      const { js, css } = client(source);
      let contents = js;
      if (css !== "" && css !== null) {
        const path = FileRef.webpath(`${args.path}css`);
        app.build.save(path, css);
        console.log("save", path, css);
        contents += `\nimport "${path}";`;
      }
      return { contents };
    });
  },
})) as Publish;
