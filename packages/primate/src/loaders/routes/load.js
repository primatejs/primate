import { Path } from "rcompat/fs";
import errors from "../../errors.js";
import to_sorted from "../../to_sorted.js";

export default type => async (log, directory, load) => {
  const filter = path => new RegExp(`^\\+${type}.js$`, "u").test(path.name);

  const replace = new RegExp(`\\+${type}`, "u");
  const objects = to_sorted((await load({ log, directory, filter, warn: false }))
    .map(([name, object]) => [name.replace(replace, () => ""), object]),
  ([a], [b]) => a.length - b.length);

  const resolve = name => new Path(directory, name, `+${type}.js`);
  objects.some(([name, value]) => typeof value.default !== "function"
    && errors.InvalidDefaultExport.throw(resolve(name)));

  return objects;
};
