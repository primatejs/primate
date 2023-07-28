import crypto from "runtime-compat/crypto";
import {bold} from "runtime-compat/colors";
import {extend, inflate, map, transform} from "runtime-compat/object";
import {error as clientError} from "primate";
import wrap from "./wrap.js";
import {memory} from "./drivers/exports.js";
import errors from "./errors.js";

const last = -1;
const ending = -3;

const openStores = (stores, defaults) =>
  stores.map(([name, module]) =>
    [name, wrap(module.name, module.schema, {
      ...map(defaults, ([key, value]) => [key, module[key] ?? value]),
      actions: module.actions ?? (() => ({})),
    })]
  );

const makeTransaction = (env) => {
  const stores = openStores(env.stores, env.defaults);

  const drivers = [...new Set(stores.map(([, store]) => store.driver)).keys()];
  return {
    id: crypto.randomUUID(),
    transaction: Object.fromEntries(["start", "commit", "rollback", "end"]
      .map(action =>
        [action, () => Promise.all(drivers.map(driver => driver[action]()))]
      )),
    store: stores.reduce((base, [name, {actions, driver, store}]) =>
      extend(base, inflate(name, actions(driver.client, store)))
    , {}),
  };
};

const validType = ({base, validate}) =>
  base !== undefined && typeof validate === "function";

const valid = (type, name, store) => validType(type)
  ? type
  : errors.InvalidType.throw(name, store);

export default ({
  /* directory for stores */
  directory = "stores",
  /* default database driver */
  driver = memory(),
  /* default primary key */
  primary = "id",
  /* whether all fields should be non-empty before saving */
  strict = false,
} = {}) => {
  let enabled = true;
  const env = {
    defaults: {},
  };
  return {
    name: "@primate/store",
    async init(app) {
      try {
        env.log = app.log;

        const root = app.root.join(directory);
        !await root.exists && errors.MissingStoreDirectory.throw(root);
        env.defaults = {
          // start driver
          driver: await driver(),
          primary,
          strict,
          readonly: false,
          ambiguous: false,
        };
        env.stores = await Promise.all((await root.collect(/^.*.js$/u))
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
              && errors.MissingPrimaryKey.throw(primary, store, "id",
                "export const ambiguous = true;");

            const pathed = store.replaceAll("/", ".");

            env.log.info(`loading ${bold(pathed)}`, {module: "primate/store"});

            const {default: _, ...rest} = exports;

            return [pathed, {
              ...rest,
              schema,
              name: exports.name ?? store.replaceAll("/", "_"),
            }];
          })
        );
        Object.keys(env.stores).length === 0
          && errors.EmptyStoreDirectory.throw(root);
        env.log.info("all stores nominal", {module: "primate/store"});
      } catch (error) {
        enabled = false;
        return env.log.auto(error);
      }
    },
    async route(request, next) {
      if (!enabled) {
        return next(request);
      }
      const {id, transaction, store} = makeTransaction(env);
      await transaction.start();
      try {
        const response = await next({...request, transaction, store});
        await transaction.commit();
        return response;
      } catch (error) {
        env.log.auto(error);
        await transaction.rollback();
        errors.TransactionRolledBack.warn(env.log, id, error.name);

        return clientError();
      } finally {
        // some drivers do not explicitly end transactions, in which case this
        // is a noop
        await transaction.end();
      }
    },
  };
};
