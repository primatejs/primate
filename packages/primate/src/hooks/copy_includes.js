const system = ["routes", "components", "build"];

export default async (app, type, post = () => undefined) => {
  const {paths, config} = app;
  const {build} = config;
  const {includes} = build;

  const reserved = system.concat(build.static, build.app, build.modules);

  if (Array.isArray(includes)) {
    await Promise.all(includes
      .filter(include => !reserved.includes(include))
      .filter(include => /^[^/]*$/u.test(include))
      .map(async include => {
        const path = app.root.join(include);
        if (await path.exists) {
          const to = paths[type].join(include);
          await to.file.create();
          await app.copy(path, to);
          await post(to);
        }
      }));
  }
};
