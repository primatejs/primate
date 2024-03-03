export default ({
  extension = ".ts",
} = {}) => {
  const name = "typescript";
  let transpile;

  return {
    name: `primate:${name}`,
    async init(app, next) {
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
