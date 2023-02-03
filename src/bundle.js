import {File} from "runtime-compat/filesystem";

export default async conf => {
  const {paths} = conf;
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
