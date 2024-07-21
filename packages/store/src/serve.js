import EmptyStoreDirectory from "@primate/store/errors/empty-store-directory";
import InvalidType from "@primate/store/errors/invalid-type";
import NoPrimaryKey from "@primate/store/errors/no-primary-key";
import * as A from "rcompat/array";
import { dim } from "rcompat/colors";
import * as O from "rcompat/object";
import primary from "./primary.js";

const last = -1;
const ending = -3;

const valid_type = ({ base, validate }) =>
  base !== undefined && typeof validate === "function";

const valid = (type, name, store) =>
  valid_type(type) ? type : InvalidType.throw(name, store);

export default (directory, mode, driver, env) => async (app, next) => {
  const root = app.runpath(directory);
  const module = "primate/store";

  const defaults = {
    mode,
    readonly: false,
    ambiguous: false,
  };

  const loaded = [];

  const stores = app.files.stores.map(([name, definition]) => {
    const schema = O.transform(definition.default, entry => entry
      .filter(([property, type]) => valid(type, property, name)));

    definition.ambiguous !== true && schema.id === undefined
      && NoPrimaryKey.throw(primary, name,
        "export const ambiguous = true;");

    const pathed = name.replaceAll("/", ".");

    loaded.push(pathed);

    return [pathed, {
      ...O.exclude(definition, ["default"]),
      schema,
      name: definition.name ?? name.replaceAll("/", "_"),
      defaults,
    }];
  });

  app.log.info(`loading ${loaded.map(l => dim(l)).join(" ")}`, { module });

  if (A.empty(stores)) {
    EmptyStoreDirectory.warn(app.log, root);
    return next(app);
  }

  app.log.info("all stores nominal", { module });

  const default_driver = await driver();

  env.root = root;
  env.log = app.log;
  env.stores = stores;
  env.defaults = {
    driver: default_driver,
    ...defaults,
  };
  env.drivers = [...new Set(stores.map(({ driver: $driver }) =>
    $driver ?? default_driver))];
  env.active = true;

  return next({ ...app, stores });
};
