import {memory} from "./drivers/exports.js";
import crypto from "runtime-compat/crypto";

const ending = -3;

const Store = class {
  #collection;
  #properties;
  #driver;
  #primary;

  constructor({
    name,
    properties = {},
    driver,
    primary,
  }) {
    this.#collection = name.toLowerCase();
    this.#properties = properties;
    this.#driver = driver;
    this.#primary = primary;
  }

  get(value) {
    return this.#driver.get(this.#collection, this.#primary, value);
  }

  find(criteria) {
    return this.#driver.find(this.#collection, criteria);
  }

  insert(document) {
    return this.#driver.insert(this.#collection, document);
  }

  update(criteria, document) {
    return this.#driver.update(this.#collection, criteria, document);
  }

  delete(criteria) {
    return this.#driver.delete(this.#collection, criteria);
  }

  get driver() {
    return this.#driver;
  }
};

const openStores = (stores, {driver, primary}) =>
  Object.fromEntries(Object.entries(stores).map(([name, module]) =>
    [name, new Store({
      name,
      properies: module.default,
      driver: module.driver ?? driver,
      primary: module.primary ?? primary,
    })]
  ));

const makeTransaction = async ({stores, defaults}) => {
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

export default ({
  /* directory for stores */
  directory = "stores",
  /* default database driver */
  driver = memory(),
  /* default primary key */
  primary = "id",
} = {}) => {
  const env = {
    defaults: {},
  };
  return {
    name: "@primate/store",
    async load(app) {
      const base = app.root.join(directory);
      if (!await base.exists) {
        app.log.warn(`\`${base}\` doesn't exist, no stores were loaded`);
        return;
      }
      env.stores = Object.fromEntries(await Promise.all((await base.list())
        .map(path => [path.name.slice(0, ending), path.path])
        // accept only stores that start with a capital letter
        .filter(([name]) => /^[A-Z]/u.test(name))
        .map(async ([name, path]) => [name, await import(path)])));
      env.defaults = {
        driver: await driver,
        primary,
      };
      env.warn = message => app.log.warn(message);
    },
    async route(request, next) {
      const {id, transaction, store} = await makeTransaction(env);
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
