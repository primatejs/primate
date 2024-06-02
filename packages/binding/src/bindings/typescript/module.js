import { dim } from "rcompat/colors";

export default ({
  extension = ".ts",
} = {}) => {
  const module = "primate:binding";
  const name = `${module}/typescript`;
  let transpile;

  return {
    name,
    async init(app, next) {
      transpile = (await import("./imports.js")).default;

      return next(app);
    },
    async build(app, next) {
      app.register(extension, {
        route: async (directory, file) => {
          app.log.info(`compiling ${dim(file)} to JavaScript`, { module });
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
