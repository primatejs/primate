import FileRef from "@rcompat/fs/FileRef";
import client from "./client.js";
import type { BuildApp } from "@primate/core/build/app";
import type { Plugin } from "esbuild";

export default (app: BuildApp, extension: string): Plugin => ({
  name: "webc",
  setup(build) {
    build.onLoad({ filter: new RegExp(`${extension}$`) }, async args => {
      // Load the file from the file system
      const file = new FileRef(args.path);
      const source = await file.text();

      return { contents: (await client(app, extension)(source, file)).js };
    });
  },
});
