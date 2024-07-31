import Pool from "@primate/store/core/pool";
import Database from "@rcompat/sql/sqlite";

export default ({ database }) => new Pool({
  manager: {
    new: () => new Database(database, { create: true }),
    kill: connection => connection.close(),
  },
});
