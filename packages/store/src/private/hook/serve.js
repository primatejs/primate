import no_primary_key from "#error/no-primary-key";
import empty_store_directory from "#error/empty-store-directory";
import invalid_type from "#error/invalid-type";
import module from "#name";
import primary from "#primary";
import log from "@primate/core/log";
import empty from "@rcompat/array/empty";
import dim from "@rcompat/cli/color/dim";
import exclude from "@rcompat/object/exclude";
import transform from "@rcompat/object/transform";

const valid_type = ({ base, validate }) =>
  base !== undefined && typeof validate === "function";

const valid = (type, name, store) =>
  valid_type(type) ? type : invalid_type(name, store);

export default (directory, mode, driver_serve, env) => async (app, next) => {
  const root = app.runpath(directory);

  const defaults = {
    mode,
    readonly: false,
    ambiguous: false,
  };

  const loaded = [];

  const stores = app.files.stores.map(([name, definition]) => {
    const schema = transform(definition.default ?? {}, entry => entry
      .filter(([property, type]) => valid(type, property, name)));

    definition.ambiguous !== true && schema.id === undefined
      && no_primary_key(primary, name, "export const ambiguous = true;");

    const pathed = name.replaceAll("/", ".");

    loaded.push(pathed);

    return [pathed, {
      ...exclude(definition, ["default"]),
      schema,
      name: definition.name ?? name.replaceAll("/", "_"),
      defaults,
    }];
  });

  log.info(`loaded ${loaded.map(l => dim(l)).join(" ")}`, { module });

  if (empty(stores)) {
    empty_store_directory(root);
    return next(app);
  }

  const default_driver = await driver_serve();

  env.root = root;
  env.stores = stores;
  env.defaults = {
    driver: default_driver,
    ...defaults,
  };
  env.drivers = [...new Set(stores.map(({ driver }) =>
    driver ?? default_driver))];
  env.active = true;

  return next({ ...app, stores });
};
