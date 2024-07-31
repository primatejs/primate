import base from "@primate/store/core/test";
import serve from "#serve";

export default async test =>
  base(test, () => serve({
    username: "primate",
    password: "primate",
    namespace: "primate",
    database: "primate",
  })());
