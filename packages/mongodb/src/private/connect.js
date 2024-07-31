import { MongoClient } from "mongodb";

export default async ({ host, port }) => {
  const url = `mongodb://${host}:${port}?replicaSet=rs0&directConnection=true`;
  const client = new MongoClient(url);
  await client.connect();
  return client;
};
