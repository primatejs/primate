import type Publish from "@primate/core/frontend/Publish";
import FileRef from "@rcompat/fs/FileRef";
import client from "./client.js";

const css_filter = /\.sveltecss$/;
const root_filter = /^root:svelte$/;

export default ((app, extension) => ({
  name: "svelte",
  setup(build) {
    build.onResolve({ filter: css_filter }, ({ path }) => {
      return { path, namespace: "sveltecss" };
    });
    build.onResolve({ filter: root_filter }, ({ path }) => {
      return { path, namespace: "svelteroot" };
    });
    build.onLoad({ filter: css_filter }, ({ path }) => {
      const contents = app.build.load(FileRef.webpath(path));
      return contents
        ? { contents, loader: "css", resolveDir: app.root.path }
        : null;
    });
    build.onLoad({ filter: root_filter }, ({ path }) => {
      const contents = app.build.load(path);
      return contents
        ? { contents, loader: "js", resolveDir: app.root.path }
        : null;
    });
    build.onLoad({ filter: new RegExp(`${extension}$`) }, async args => {
      // Load the file from the file system
      const source = await FileRef.text(args.path);

      // Convert Svelte syntax to JavaScript
      const { js, css } = client(source);
      let contents = js;
      if (css !== null && css !== "") {
        const path = FileRef.webpath(`${args.path}css`);
        app.build.save(path, css);
        contents += `\nimport "${path}";`;
      }
      return { contents };
    });
  },
})) satisfies Publish;
