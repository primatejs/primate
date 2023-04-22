import {File} from "runtime-compat/fs";
const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

const pre = async app => {
  const {paths} = app;

  // remove public directory in case exists
  if (await paths.public.exists) {
    await paths.public.file.remove();
  }
  await paths.public.file.create();

  if (await paths.static.exists) {
    // copy static files to public
    const filter = file => app.config.http.static.pure
      ? true
      : !file.endsWith(".js") && !file.endsWith(".css");
    await File.copy(paths.static, paths.public, filter);
  }
};

export default async (app, bundle) => {
  await pre(app);
  if (bundle) {
    app.log.info("running bundle hooks");
    await [...filter("bundle", app.modules), _ => _]
      .reduceRight((acc, handler) => input => handler(input, acc))(app);
  }
};
