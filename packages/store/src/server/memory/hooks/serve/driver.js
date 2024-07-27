export const connect = () => {
  const database = {
    collections: {},
  };
  return {
    read(name) {
      return database.collections[name] ?? [];
    },
    write(name, callback) {
      // do a read
      database.collections[name] = callback(this.read(name));
    },
  };
};
