import { Surreal } from "surrealdb.js";

export const connect = async ({
  host,
  port,
  path,
  username,
  password,
  namespace,
  database,
}) => {
  const auth = username !== undefined && password !== undefined ?
    {
      username,
      password,
    }
    : {};
  const url = `${host}:${port}/${path}`;
  const options = { namespace, database, auth };

  const client = new Surreal();
  await client.connect(url, options);

  return client;
};
