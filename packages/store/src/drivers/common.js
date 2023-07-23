import crypto from "runtime-compat/crypto";
import {filter} from "runtime-compat/object";
const NOT_FOUND = -1;

export default db => {
  const use = name => {
    db.collections[name] = db.collections[name] ?? [];
    return db.collections[name];
  };

  const some = (collection, operation, criteria) => {
    const keys = Object.keys(criteria);
    return use(collection)[operation](document =>
      // ¬∃ = ∀
      !keys.some(criterion => document[criterion] !== criteria[criterion])
    );
  };

  const findIndex = (collection, criteria) =>
    some(collection, "findIndex", criteria);

  const filterBy = (collection, criteria) => {
    const keys = Object.keys(criteria);
    return use(collection).filter(document =>
      keys.some(criterion => document[criterion] !== criteria[criterion])
    );
  };

  const removeByNull = (document, delta) =>
    filter(document, ([key]) => delta[key] !== null);

  const removeNull = delta => filter(delta , ([, value]) => value !== null);

  const update = (collection, criteria, delta) => {
    const keys = Object.keys(criteria);
    let changed = 0;
    db.collections[collection] = use(collection).map(document => {
      // criteria satisfied
      if (!keys.some(by => document[by] !== criteria[by])) {
        changed++;
        return {...removeByNull(document, delta), ...removeNull(delta)};
      }
      return document;
    });
    return changed;
  };

  return {
    exists(collection) {
      return db.collections[collection] !== undefined;
    },
    find(collection, criteria) {
      return criteria === undefined
        ? use(collection)
        : some(collection, "filter", criteria);
    },
    async count(...args) {
      return (await this.find(...args)).length;
    },
    get(collection, key, value) {
      const index = findIndex(collection, {[key]: value});
      return index === NOT_FOUND ? undefined : use(collection)[index];
    },
    insert(collection, primary, document) {
      // generate id
      const result = {[primary]: crypto.randomUUID(), ...document};
      use(collection).push(result);
      return result;
    },
    update(collection, criteria = {}, delta) {
      return update(collection, criteria, delta);
    },
    delete(collection, criteria) {
      if (db.collections[collection]) {
        const original = db.collections[collection].length;
        db.collections[collection] = criteria === undefined
          ? []
          : filterBy(collection, criteria);
        const current = db.collections[collection].length;
        return original - current;
      }
      return 0;
    },
  };
};
