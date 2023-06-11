import copy_includes from "./copy_includes.js"

const pre = async app => {
  const {paths, config} = app;
  const build = config.build;

  // remove build directory in case exists
  if (await paths.build.exists) {
    await paths.build.file.remove();
  }
  await paths.server.file.create();

  if (await paths.components.exists) {
    await app.copy(paths.components, paths.server.join(build.app));
  }

  // copy additional subdirectories to build/server
  await copy_includes(app, "server");
};

export default async app => {
  await pre(app);
  app.log.info("running compile hooks", {module: "primate"});
  await [...app.modules.compile, _ => _]
    .reduceRight((acc, handler) => input => handler(input, acc))(app);
};
