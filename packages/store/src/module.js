import crypto from "runtime-compat/crypto";
import Store from "./Store.js";
import {memory} from "./drivers/exports.js";
import types from "./types.js";

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

const depath = (path, initial) => path.split("/")
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

const fail = message => `@primate/store -- ${message} (stores disabled)`;
const valid = (type, name, store) =>
  typeof type?.validate === "function" ? type : (() => {
    throw new Error(
      fail(`field \`${name}\` in store \`${store}\` has no validator`)
    );
  })();

export default ({
  /* directory for stores */
  directory = "stores",
  /* default database driver */
  driver = memory(),
  /* default primary key */
  primary = "id",
  /* whether properies should be validated before saving */
  validate = false,
} = {}) => {
  const env = {
    defaults: {},
  };
  return {
    name: "@primate/store",
    async load(app) {
      const base = app.root.join(directory);
      if (!await base.exists) {
        app.log.warn(fail(`\`${base}\` doesn't exist`));
        return;
      }
      env.defaults = {
        driver: await driver,
        primary,
        validate,
        readonly: false,
      };
      try {
        env.stores = await Promise.all((await base.collect(/^.*.js$/u))
          /* accept only uppercase-first files in store filename */
          .filter(path => /^[A-Z]/u.test(path.name))
          .map(path => [
            `${path}`.replace(`${base}/`, () => "").slice(0, ending),
            path,
          ])
          /* accept only lowercase-first directories in store path */
          .filter(([name]) =>
            name.split("/").slice(0, last).every(part => /^[a-z]/u.test(part)))
          .map(async ([name, path]) => {
            const exports = await import(path);
            const schema = Object.fromEntries(Object.entries(exports.default)
              .map(([property, type]) => {
                const predicate = types[type] ?? valid(type, property, name);
                return [property, predicate];
              }));

            return [name, {
              ...exports,
              schema,
              name: exports.name ?? name.replaceAll("/", "_"),
            }];
          })
        );
      } catch (error) {
        app.log.error(error.message);
        return;
      }

      env.warn = message => app.log.warn(message);
    },
    async route(request, next) {
      const {id, transaction, store} = makeTransaction(env);
      await transaction.start();
      try {
        const response = await next({...request, transaction, store});
        await transaction.commit();
        return response;
      } catch (error) {
        await transaction.rollback();
        env.warn(`transaction ${id} rolled back due to error`);
        // rethrow
        throw error;
      } finally {
        await transaction.end();
      }
    },
  };
};
