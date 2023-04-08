import {File} from "runtime-compat/fs";
const filter = (key, array) => array?.flatMap(m => m[key] ?? []) ?? [];

const makePublic = async env => {
  const {paths} = env;

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

export default async env => {
  await makePublic(env);
  [...filter("bundle", env.modules), _ => _].reduceRight((acc, handler) =>
    input => handler(input, acc))(env);
};
