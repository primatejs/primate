import driver from "./driver.js";
import base from "../base.test.js";

export default async test =>
  base(test, () => driver({
    username: "test",
    password: "test",
    namespace: "test",
    database: "test",
  })());
