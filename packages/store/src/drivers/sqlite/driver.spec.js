import driver from "./driver.js";
import base from "../base.test.js";

const client = async () => {
  const d = await driver()();
  d.create("user", {
    id: "primary",       // primary
    name: "string",      // string
    sex: "string",
    traits: "embedded",  // object
    age: "u8",           // number
    smart: "boolean",    // boolean
    money: "i64",        // bigint
    created: "datetime", // date
    from: "string",
  });
  d.create("comment", {
    title: "string",
  });
  return d;
};

export default test => base(test, client);
