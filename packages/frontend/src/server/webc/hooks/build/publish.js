import file from "@rcompat/fs/file";
import { client } from "./compile.js";

export default (app, extension) => ({
  name: "webc",
  setup(build) {
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await file(args.path).text();

      return { contents: (await client(app, extension)(source, args.path)).js };
    });
  },
});
