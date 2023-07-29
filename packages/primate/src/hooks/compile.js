import copy_includes from "./copy_includes.js";

const pre = async app => {
  const {build, paths, config} = app;

  // remove build directory in case exists
  if (await paths.build.exists) {
    await paths.build.file.remove();
  }
  await build.paths.server.file.create();
  await build.paths.components.file.create();

  if (await paths.components.exists) {
    // copy all files to build/components
    await app.copy(paths.components, build.paths.components, /^.*$/u);
    // copy .js files from components to build/server
    await app.copy(paths.components, build.paths.server.join(config.build.app));
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
