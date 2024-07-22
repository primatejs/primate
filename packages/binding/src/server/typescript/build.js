import { name } from "@primate/binding/typescript/common";
import { dim } from "rcompat/colors";
import compile from "./compile.js";

const module = `@primate:${name}`;

export default ({ extension }) => (app, next) => {
  app.bind(extension, async (directory, file) => {
    app.log.info(`compiling ${dim(file)} to JavaScript`, { module });

    const path = directory.join(file);
    const base = path.directory;
    const js = path.base.concat(".js");
    await base.join(js).write(await compile(await path.text()));
  });

  return next(app);
};
