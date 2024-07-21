import serve from "./serve.js";
import base from "../../base.test.js";

export default test => base(test, () => serve()());
