import driver from "./driver.js";
import base from "../base.test.js";

const client = async () => {
  const d = await driver()();
  d.create("user", {
    id: "primary",
    name: "string",
    sex: "string",
    traits: "embedded",
  });
  d.create("comment", {
    title: "string",
  });
  return d;
};

export default test => {
  base(test, client);
};
