import {identity} from "runtime-compat/function";

const actions = [
  "find",
  "count",
  "get",
  "insert",
  "update",
  "delete",
  "exists",
];
const write = ["insert", "update", "delete"];

export const ident = {in: identity, out: identity};

export default (name, types, manager) => ({
  /* driver name, must be unique */
  name,
  /* start transaction */
  start() {
    return manager.open();
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
  ...Object.fromEntries(actions.map(action => [action, (...args) =>
    manager.schedule(_actions => _actions[action](...args),
      write.includes(action)
    )])),

});
