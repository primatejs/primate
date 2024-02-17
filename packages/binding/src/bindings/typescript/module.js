import o from "rcompat/object";
import { peers } from "../common/exports.js";
import depend from "../depend.js";

export default ({
  extension = ".ts",
} = {}) => {
  const name = "typescript";
  const dependencies = ["@swc/core"];
  const on = o.filter(peers, ([key]) => dependencies.includes(key));
  let transpile;

  return {
    name: `primate:${name}`,
    async init(app, next) {
      await depend(on, `binding:${name}`);

      transpile = (await import("./imports.js")).default;

      return next(app);
    },
    async stage(app, next) {
      app.register(extension, {
        route: async (directory, file) => {
          const path = directory.join(file);
          const base = path.directory;
          const js = path.base.concat(".js");
          await base.join(js).write(await transpile(await path.text()));
        },
      });
      return next(app);
    },
  };
};
