const operations = [
  "find",
  "count",
  "get",
  "insert",
  "update",
  "delete",
  "primary",
];

export default (name, types, manager) => ({
  /* driver name, must be unique */
  name,
  /* start transaction */
  start() {
    if (manager.started) {
      throw new Error("already in transaction, use `end` first");
    }
    manager.open();
  },
  /* rollback any uncommited changes */
  async rollback() {
    manager.assert();
    await manager.read();
  },
  /* commit changes */
  async commit() {
    manager.assert();
    await manager.write();
    manager.flush();
  },
  /* end transaction */
  end() {
    manager.assert();
    if (manager.unflushed) {
      throw new Error("uncommited changes, rollback or commit before ending");
    }
    manager.close();
  },
  types,
  ...Object.fromEntries(operations.map(operation => [operation, (...args) =>
    manager.schedule(_operations => _operations[operation](...args),
      {change: ["insert", "update", "delete"].includes(operation)}
    )])),

});
