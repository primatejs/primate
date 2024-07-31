import Driver from "postgres";

export default ({ host, port, database, username, password }) =>
  new Driver({
    host,
    port,
    db: database,
    user: username,
    pass: password,
  });
