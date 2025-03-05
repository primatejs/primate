import FileRef from "@rcompat/fs/FileRef";
import client from "./client.js";

export default (app, extension) => ({
  name: "webc",
  setup(build) {
    build.onLoad({ filter: new RegExp(`${extension}$`, "u") }, async args => {
      // Load the file from the file system
      const source = await new FileRef(args.path).text();

      return { contents: (await client(app, extension)(source, args.path)).js };
    });
  },
});
