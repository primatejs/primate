import crypto from "runtime-compat/crypto";
import {bold} from "runtime-compat/colors";
import {extend, inflate} from "runtime-compat/object";
import {error as clientError} from "primate";
import Store from "./Store.js";
import {memory} from "./drivers/exports.js";
import errors from "./errors.js";

const last = -1;
const ending = -3;

const openStores = (stores, defaults) =>
  stores.map(([name, module]) =>
    [name, new Store(module.name, module.schema, {
      ...Object.fromEntries(Object.entries(defaults).map(([key, value]) =>
        [key, module[key] ?? value]
      )),
    })]
  );

const makeTransaction = ({stores, defaults}) => {
  const _stores = openStores(stores, defaults);

  const drivers = [...new Set(_stores.map(([, store]) => store.driver)).keys()];
  const store = _stores.reduce((base, [name, value]) =>
    extend(base, inflate(name, value))
  , {});
  return {
    id: crypto.randomUUID(),
    transaction: Object.fromEntries(["start", "commit", "rollback", "end"]
      .map(action =>
        [action, () => Promise.all(drivers.map(driver => driver[action]()))]
      )),
    store,
  };
};

const validType = type =>
  typeof type === "function" || typeof type?.type === "function";

const valid = (type, name, store) => validType(type)
  ? type
  : errors.InvalidType.throw({name, store});

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
    async load(app) {
      try {
        env.log = app.log;

        const root = app.root.join(directory);
        !await root.exists && errors.MissingStoreDirectory.throw({root});

        env.defaults = {
          driver: await driver,
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
          /* accept only uppercase-first directories in store path */
          .filter(([name]) =>
            name.split("/").slice(0, last).every(part => /^[A-Z]/u.test(part)))
          .map(async ([store, path]) => {
            const exports = await import(path);
            const schema = Object.fromEntries(Object.entries(exports.default)
              .filter(([property, type]) => valid(type, property, store))
              .map(([property, type]) =>
                [property, typeof type === "function" ? type : type.type])
              .map(([property, type]) => {
                const base = type?.base ?? "string";
                return [property, {type, base}];
              }));

            exports.ambiguous !== true && schema.id === undefined
              && errors.MissingPrimaryKey.throw({store, primary});

            const pathed = store.replaceAll("/", ".");

            env.log.info(`loading ${bold(pathed)}`, {module: "primate/store"});

            return [pathed, {
              ...exports,
              schema,
              name: exports.name ?? store.replaceAll("/", "_"),
            }];
          })
        );
        Object.keys(env.stores).length === 0
          && errors.EmptyStoreDirectory.throw({root});

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
        errors.TransactionRolledBack.warn(env.log, {id, name: error.name});

        return clientError();
      } finally {
        await transaction.end();
      }
    },
  };
};
