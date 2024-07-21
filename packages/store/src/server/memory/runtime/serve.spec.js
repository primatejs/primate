import base from "@primate/store/base/test";
import serve from "./serve.js";

export default test => base(test, () => serve()());
