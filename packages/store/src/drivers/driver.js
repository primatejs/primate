export default manager => ({
  // start transaction
  start() {
    if (manager.started) {
      throw new Error("already in transaction, use `end` first");
    }
    manager.open();
  },
  // rollback any changes so far
  async rollback() {
    manager.assert();
    await manager.read();
  },
  // write anything in memory into file
  async commit() {
    manager.assert();
    await manager.write();
    manager.flush();
  },
  // end transaction
  end() {
    manager.assert();
    if (manager.unflushed) {
      throw new Error("uncommited changes, rollback or commit before ending");
    }
    manager.close();
  },
  ...Object.fromEntries(["find", "count", "get", "insert", "update", "delete"]
    .map(operation => [
      operation, (...args) =>
        manager.schedule(_operations => _operations[operation](...args),
          {change: ["insert", "update", "delete"].includes(operation)}
        )])),

});
