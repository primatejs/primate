const pre = async paths => {
  // remove build directory in case exists
  if (await paths.build.exists) {
    await paths.build.file.remove();
  }
  await paths.build.file.create();

  if (await paths.components.exists) {
    await paths.server.file.create();
  }
};

export default async app => {
  await pre(app.paths);
  app.log.info("running compile hooks", {module: "primate"});
  await [...app.modules.compile, _ => _]
    .reduceRight((acc, handler) => input => handler(input, acc))(app);
};
