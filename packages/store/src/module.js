import crypto from "runtime-compat/crypto";
import {inconstructible_function} from "runtime-compat/dyndef";
import Store from "./Store.js";
import {memory} from "./drivers/exports.js";
import types from "./types.js";

const ending = -3;

const openStores = (stores, defaults) =>
  Object.fromEntries(Object.entries(stores).map(([name, module]) =>
    [name, new Store(name, module.schema, {
      ...Object.fromEntries(Object.entries(defaults).map(([key, value]) =>
        [key, module[key] ?? value]
      )),
    })]
  ));

const makeTransaction = ({stores, defaults}) => {
  const store = openStores(stores, defaults);
  const drivers =
    [...new Set(Object.values(store).map(({driver}) => driver)).values()];
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
  inconstructible_function(type) ? type : (() => {
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
      try {
        env.stores = Object.fromEntries(await Promise.all((await base.list())
          .map(path => [path.name.slice(0, ending), path.path])
          // accept only stores that start with a capital letter
          .filter(([name]) => /^[A-Z]/u.test(name))
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
            }];
          })
        ));
      } catch (error) {
        app.log.error(error.message);
        return;
      }

      env.defaults = {
        driver: await driver,
        primary,
        validate,
      };
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
