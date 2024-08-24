import empty_store_directory from "#error/empty-store-directory";
import module from "#name";
import log from "@primate/core/log";
import empty from "@rcompat/array/empty";
import dim from "@rcompat/cli/color/dim";
import exclude from "@rcompat/object/exclude";

export default (directory, mode, driver_serve, env) => async (app, next) => {
  const root = app.runpath(directory);

  const defaults = {
    mode,
    readonly: false,
    ambiguous: false,
  };

  const loaded = [];

  const stores = app.files.stores.map(([name, definition]) => {
    const schema = definition.default ?? {};
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
