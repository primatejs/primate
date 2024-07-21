import { File } from "rcompat/fs";
import { client } from "./compile.js";

export default (app, extension) => ({
  name: "webc",
  setup(build) {
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await File.text(args.path);

      return { contents: (await client(app, extension)(source, args.path)).js };
    });
  },
});
