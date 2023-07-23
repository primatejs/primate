import driver from "./driver.js";
import base from "../base.test.js";

const client = async () => {
  const d = await driver({
    db: "test",
  })();
  return d;
};

export default test => {
  base(test, client, {
    async after() {
      const driver = (await client());
      await driver.delete("user");
      await driver.delete("comment");
    },
  });
};
