const Cache = class Cache {
  static #caches = [];

  static get(object, property) {
    return Cache.#caches.find(entry =>
      entry.object === object && entry.property === property)?.value;
  }

  static put(object, property, cacher) {
    const value = cacher();
    Cache.#caches.push({object, property, value});
    return value;
  }
};

export default (object, property, cacher) =>
  Cache.get(object, property) ?? Cache.put(object, property, cacher);
