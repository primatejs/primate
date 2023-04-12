import {File} from "runtime-compat/fs";
const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

const makePublic = async app => {
  const {paths} = app;

  // remove public directory in case exists
  if (await paths.public.exists) {
    await paths.public.file.remove();
  }
  await paths.public.file.create();

  if (await paths.static.exists) {
    // copy static files to public
    await File.copy(paths.static, paths.public);
  }
};

export default async app => {
  await makePublic(app);
  [...filter("bundle", app.modules), _ => _].reduceRight((acc, handler) =>
    input => handler(input, acc))(app);
};
