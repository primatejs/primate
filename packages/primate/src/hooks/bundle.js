import {File} from "runtime-compat/fs";

const pre = async app => {
  const {paths, config, build} = app;
  if (await paths.static.exists) {
    // copy static files to build/client/static
    await File.copy(paths.static, build.paths.client.join(config.build.static));
  }
};

export default async (app, bundle) => {
  await pre(app);
  if (bundle) {
    app.log.info("running bundle hooks", {module: "primate"});
    await [...app.modules.bundle, _ => _]
      .reduceRight((acc, handler) => input => handler(input, acc))(app);
  }
};
