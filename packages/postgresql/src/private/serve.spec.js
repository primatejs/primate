import serve from "#serve";
import base from "@primate/store/core/test";

export default async test => base(test, () => serve({
  username: "primate",
  database: "primate",
})());
