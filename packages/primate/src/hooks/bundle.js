import {File} from "runtime-compat/fs";

const pre = async app => {
  const {paths} = app;

  if (await paths.static.exists) {
    paths.client.file.create();

    // copy static files to build/client
    const filter = file => app.config.http.static.pure
      ? true
      : !file.endsWith(".js") && !file.endsWith(".css");
    await File.copy(paths.static, paths.client, filter);
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
