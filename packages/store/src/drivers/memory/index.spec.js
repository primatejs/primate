import memory from "./driver.js";
import base from "../base.test.js";

export default test => base(test, () => memory()());
