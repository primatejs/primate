import base from "../../base.test.js";
import serve from "./serve.js";

export default async test => base(test, () => serve({
  username: "primate",
  database: "primate",
})());
