import crypto from "runtime-compat/crypto";
import {Response} from "runtime-compat/http";
import {bold} from "runtime-compat/colors";
import Store from "./Store.js";
import {memory} from "./drivers/exports.js";
import predicates from "./predicates/exports.js";
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

const extend = (base = {}, extension = {}) =>
  Object.keys(extension).reduce((result, property) => {
    const value = extension[property];
    return {
      ...result,
      [property]: value?.constructor === Object
        ? extend(base[property], value)
        : value,
    };
  }, base);

const depath = (path, initial) => path.split(".")
  .reduceRight((depathed, key) => ({[key]: depathed}), initial);

const makeTransaction = ({stores, defaults}) => {
  const _stores = openStores(stores, defaults);

  const drivers = [...new Set(_stores.map(([, store]) => store.driver)).keys()];
  const store = _stores.reduce((base, [name, value]) =>
    extend(base, depath(name, value))
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

const validPredicate = predicate =>
  typeof predicate?.validate === "function" && predicate.type !== undefined;

const valid = (predicate, name, store) => validPredicate(predicate)
  ? predicate
  : errors.InvalidPredicate.throw({name, store});

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

        const base = app.root.join(directory);
        !await base.exists && errors.MissingStoreDirectory.throw({base});

        env.defaults = {
          driver: await driver,
          primary,
          strict,
          readonly: false,
          ambiguous: false,
        };

        env.stores = await Promise.all((await base.collect(/^.*.js$/u))
          /* accept only uppercase-first files in store filename */
          .filter(path => /^[A-Z]/u.test(path.name))
          .map(path => [
            `${path}`.replace(`${base}/`, () => "").slice(0, ending),
            path,
          ])
          /* accept only uppercase-first directories in store path */
          .filter(([name]) =>
            name.split("/").slice(0, last).every(part => /^[A-Z]/u.test(part)))
          .map(async ([name, path]) => {
            const exports = await import(path);
            const schema = Object.fromEntries(Object.entries(exports.default)
              .map(([property, type]) => {
                const predicate = predicates[type] ?? valid(type, property, name);
                return [property, {...predicate, name: type.name}];
              }));

            exports.ambiguous !== true && schema.id === undefined
              && errors.MissingPrimaryKey.throw({name, primary});

            const pathed = name.replaceAll("/", ".");

            env.log.info(`loading ${bold(pathed)}`, {module: "primate/store"});

            return [pathed, {
              ...exports,
              schema,
              name: exports.name ?? name.replaceAll("/", "_"),
            }];
          })
        );
        Object.keys(env.stores).length === 0
          && errors.EmptyStoreDirectory.throw({base});

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
        errors.TransactionRolledBack.warn(env.log, {id, name});

        return new Response("Internal server error", {status: 500});
      } finally {
        await transaction.end();
      }
    },
  };
};
