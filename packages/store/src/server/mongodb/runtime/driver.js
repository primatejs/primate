import { Decimal128, MongoClient, ObjectId } from "mongodb";

export const connect = async ({ host, port }) => {
  const url = `mongodb://${host}:${port}?replicaSet=rs0&directConnection=true`;
  const client = new MongoClient(url);
  await client.connect();
  return client;
};

export { Decimal128, ObjectId };

