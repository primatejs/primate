import driver from "./driver.js";
import base from "../base.test.js";

export default async test => base(test, () => driver({
  user: "primate",
  database: "primate",
})());
