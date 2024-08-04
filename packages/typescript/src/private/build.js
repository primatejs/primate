import compile from "#compile";
import pkgname from "#pkgname";
import log from "@primate/core/log";
import dim from "@rcompat/cli/color/dim";

export default ({ extension }) => (app, next) => {
  app.bind(extension, async (directory, file) => {
    log.info(`compiling ${dim(file)} to JavaScript`, { module: pkgname });

    const path = directory.join(file);
    const base = path.directory;
    const js = path.base.concat(".js");
    await base.join(js).write(await compile(await path.text()));
  });

  return next(app);
};
