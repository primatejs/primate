import crypto from "runtime-compat/crypto";
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

  return {
    primary() {
      return {
        validate: value => typeof value === "string",
        message: "Must be a valid UUID",
        generate: () => crypto.randomUUID(),
      };
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
    insert(collection, document) {
      use(collection).push(document);
      return document;
    },
    update(collection, criteria, document) {
      const index = findIndex(collection, criteria);
      use(collection).splice(index, 1, document);
      return document;
    },
    delete(collection, criteria) {
      const index = findIndex(collection, criteria);
      if (index !== NOT_FOUND) {
        use(collection).splice(index, 1);
      }
    },
  };
};