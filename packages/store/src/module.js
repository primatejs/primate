import crypto from "runtime-compat/crypto";
import {bold} from "runtime-compat/colors";
import {extend, inflate, transform} from "runtime-compat/object";
import {memory} from "./drivers/exports.js";
import errors from "./errors.js";
import primary from "./primary.js";

const last = -1;
const ending = -3;

const make_transaction = async env => {
  const [transaction] = await Promise.all(env.drivers.map(driver =>
    driver.transact(env.stores
      .filter(store => (store.driver ?? env.defaults.driver) === driver)
    )));

  return {
    id: crypto.randomUUID(),
    transaction,
  };
};

const valid_type = ({base, validate}) =>
  base !== undefined && typeof validate === "function";

const valid = (type, name, store) => valid_type(type)
  ? type
  : errors.InvalidType.throw(name, store);

export default ({
  /* directory for stores */
  directory = "stores",
  /* default database driver */
  driver = memory(),
  /* whether all fields should be non-empty before saving */
  strict = false,
} = {}) => {
  let env = {};

  return {
    name: "primate:store",
    async init(app, next) {
      const root = app.root.join(directory);
      !await root.exists && errors.MissingStoreDirectory.throw(root);
      const stores = await Promise.all((await root.collect(/^.*.js$/u))
        /* accept only uppercase-first files in store filename */
        .filter(path => /^[A-Z]/u.test(path.name))
        .map(path => [
          `${path}`.replace(`${root}/`, () => "").slice(0, ending),
          path,
        ])
        /* accept only lowercase-first directories in store path */
        .filter(([name]) =>
          name.split("/").slice(0, last).every(part => /^[a-z]/u.test(part)))
        .map(async ([store, path]) => {
          const exports = await import(path);
          const schema = transform(exports.default, entry => entry
            .filter(([property, type]) => valid(type, property, store)));

          exports.ambiguous !== true && schema.id === undefined
            && errors.MissingPrimaryKey.throw(primary, store,
              "export const ambiguous = true;");

          const pathed = store.replaceAll("/", ".");

          app.log.info(`loading ${bold(pathed)}`, {module: "primate/store"});

          const {default: _, ...rest} = exports;

          return [pathed, {
            ...rest,
            schema,
            name: exports.name ?? store.replaceAll("/", "_"),
          }];
        })
      );
      Object.keys(stores).length === 0
        && errors.EmptyStoreDirectory.throw(root);
      app.log.info("all stores nominal", {module: "primate/store"});

      const default_driver = await driver();

      env = {
        log: app.log,
        stores,
        defaults: {
          driver: default_driver,
          strict,
          readonly: false,
          ambiguous: false,
        },
        drivers: [...new Set(stores.map(({driver: d}) => d ?? default_driver))],
      };

      return next(app);
    },
    async route(request, next) {
      const {id, transaction} = await make_transaction(env);

      try {
        return await transaction([], stores => {
          const store = stores.reduce((base, [name, store]) =>
            extend(base, inflate(name, store))
          , {});
          return next({...request, store});
        }
        );
      } catch (error) {
        env.log.auto(error);
        errors.TransactionRolledBack.warn(env.log, id, error.name);

        // let core handle error
        throw error;
      }
    },
  };
};
