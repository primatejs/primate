import mysql from "mysql2/promise";

export const connect = ({ host, port, database, username, password }) =>
  mysql.createPool({
    host,
    port,
    database,
    user: username,
    password,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    enableKeepAlive: true,
    keepAliveInitialDelay: 0,
    namedPlaceholders: true,
  });
