import serve from "./serve.js";
import base from "../../base.test.js";

export default async test =>
  base(test, () => serve({
    username: "primate",
    password: "primate",
    namespace: "primate",
    database: "primate",
  })());
