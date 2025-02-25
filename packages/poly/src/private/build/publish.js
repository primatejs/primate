import file from "@rcompat/fs/file";
import webpath from "@rcompat/fs/webpath";
import client from "./client.js";

const css_filter = /\.polycss$/u;
const root_filter = /^root:poly$/u;

export default (app, extension) => ({
  name: "poly",
  setup(build) {
    build.onResolve({ filter: css_filter }, ({ path }) => {
      return { path, namespace: "polycss" };
    });
    build.onResolve({ filter: root_filter }, ({ path }) => {
      return { path, namespace: "polyroot" };
    });
    build.onLoad({ filter: css_filter }, ({ path }) => {
      const contents = app.build.load(webpath(path));
      return contents ? { contents, loader: "css", resolveDir: app.root.path } : null;
    });
    build.onLoad({ filter: root_filter }, ({ path }) => {
      const contents = app.build.load(path);
      return contents ? { contents, loader: "js", resolveDir: app.root.path } : null;
    });
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await file(args.path).text();

      // Convert Poly syntax to JavaScript
      const { js, css } = client(source);
      let contents = js;
      if (css !== null && css !== "") {
        const path = webpath(`${args.path}css`);
        app.build.save(path, css);
        contents += `\nimport "${path}";`;
      }
      return { contents };
    });
  },
});
