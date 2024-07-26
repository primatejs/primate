import base from "@primate/store/base/test";
import serve from "./serve.js";

export default async test =>
  base(test, () => serve({
    username: "primate",
    password: "primate",
    namespace: "primate",
    database: "primate",
  })());