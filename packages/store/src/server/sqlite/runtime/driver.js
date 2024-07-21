import Pool from "@primate/store/base/pool";
import Database from "@rcompat/sql/sqlite";

export const connect = ({ database }) => new Pool({
  manager: {
    new: () => new Database(database, { create: true }),
    kill: connection => connection.close(),
  },
});
