import driver from "./driver.js";
import base from "../base.test.js";

const client = async () => {
  const d = await driver()();
  d.create("user", {
    firstname: "string",
    lastname: "string",
  });
  d.create("comment", {
    text: "string",
  });
  return d;
};

export default test => {
  base(test, client);
};
